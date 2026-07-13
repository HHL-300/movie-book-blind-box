from flask import Flask, jsonify, request, g
from flask_cors import CORS
import random
import pymysql
import re
import bcrypt
import jwt
from datetime import datetime, timedelta
from data_util import get_media_data, filter_by_mood
from db_connect import get_db_conn, close_conn

app = Flask(__name__)
CORS(app, origins='http://localhost:3000', supports_credentials=True)

SECRET_KEY = 'movie_blind_box_secret_key_2024'
JWT_EXPIRE_HOURS = 24


def response(code, msg, data=None):
    return jsonify({"code": code, "msg": msg, "data": data})


def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    token = auth_header[7:]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        exp = datetime.fromtimestamp(payload['exp'])
        if exp < datetime.now():
            return None
        return payload.get('user_id')
    except jwt.InvalidTokenError:
        return None


@app.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "")
        avatar = data.get("avatar", "")

        if not username:
            return response(400, "用户名不能为空")
        if len(username) < 4 or len(username) > 16:
            return response(400, "用户名长度需在4-16个字符之间")
        if not re.match(r'^[\u4e00-\u9fa5a-zA-Z0-9]+$', username):
            return response(400, "用户名只能包含中英文和数字")
        if len(password) < 6:
            return response(400, "密码长度至少6位")
        if not re.search(r'[a-zA-Z]', password) or not re.search(r'[0-9]', password):
            return response(400, "密码必须包含字母和数字")

        conn = get_db_conn()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM user WHERE username = %s", (username,))
        if cursor.fetchone():
            close_conn(conn, cursor)
            return response(400, "用户名已存在")

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute("INSERT INTO user(username, password, avatar) VALUES(%s, %s, %s)", (username, hashed_password, avatar))
        conn.commit()
        user_id = cursor.lastrowid

        close_conn(conn, cursor)
        return response(200, "注册成功", {"user_id": user_id, "username": username, "avatar": avatar})

    except Exception as e:
        return response(500, f"注册失败：{str(e)}")


@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return response(400, "用户名或密码不能为空")

        conn = get_db_conn()
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        cursor.execute("SELECT id, username, password, avatar FROM user WHERE username = %s", (username,))
        user = cursor.fetchone()
        close_conn(conn, cursor)

        if not user:
            return response(401, "用户名或密码错误")

        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return response(401, "用户名或密码错误")

        payload = {
            'user_id': user['id'],
            'exp': datetime.now() + timedelta(hours=JWT_EXPIRE_HOURS)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        return response(200, "登录成功", {
            "token": token,
            "user_id": user['id'],
            "username": user['username'],
            "avatar": user.get('avatar', '')
        })

    except Exception as e:
        return response(500, f"登录失败：{str(e)}")


@app.route("/api/hello", methods=["GET"])
def hello():
    return response(200, "影视书籍盲盒后端服务运行正常", {"database": "MySQL"})


@app.route("/api/random-all", methods=["GET"])
def random_all():
    try:
        user_id = get_current_user()
        if not user_id:
            return response(401, "请先登录")

        all_list = get_media_data()
        if not all_list:
            return response(404, "暂无素材数据")
        item = random.choice(all_list)
        return response(200, "获取成功", item)
    except Exception as e:
        return response(500, f"获取失败：{str(e)}")


@app.route("/api/random-mood", methods=["GET"])
def random_mood():
    try:
        user_id = get_current_user()
        if not user_id:
            return response(401, "请先登录")

        mood = request.args.get("mood")
        list_data = filter_by_mood(mood)
        if not list_data:
            return response(404, "暂无该情绪标签的作品")
        item = random.choice(list_data)
        return response(200, "获取成功", item)
    except Exception as e:
        return response(500, f"获取失败：{str(e)}")


@app.route("/api/favorite/add", methods=["POST"])
def add_favorite():
    try:
        user_id = get_current_user()
        if not user_id:
            return response(401, "请先登录")

        data = request.get_json()
        media_id = data.get("media_id")

        if not media_id:
            return response(400, "参数缺失")

        conn = get_db_conn()
        cursor = conn.cursor()
        try:
            sql = "INSERT INTO favorites(user_id, media_id) VALUES(%s, %s)"
            cursor.execute(sql, (user_id, media_id))
            conn.commit()
            return response(200, "收藏成功")
        except Exception as e:
            conn.rollback()
            return response(400, "已收藏或素材不存在")
        finally:
            close_conn(conn, cursor)
    except Exception as e:
        return response(500, f"操作失败：{str(e)}")


@app.route("/api/favorite/del", methods=["POST"])
def del_favorite():
    try:
        user_id = get_current_user()
        if not user_id:
            return response(401, "请先登录")

        data = request.get_json()
        media_id = data.get("media_id")

        if not media_id:
            return response(400, "参数缺失")

        conn = get_db_conn()
        cursor = conn.cursor()
        sql = "DELETE FROM favorites WHERE user_id=%s AND media_id=%s"
        cursor.execute(sql, (user_id, media_id))
        conn.commit()
        close_conn(conn, cursor)
        return response(200, "取消收藏成功")
    except Exception as e:
        return response(500, f"操作失败：{str(e)}")


@app.route("/api/favorite/list", methods=["GET"])
def fav_list():
    try:
        user_id = get_current_user()
        if not user_id:
            return response(401, "请先登录")

        conn = get_db_conn()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        sql = """
        SELECT m.* FROM favorites f
        LEFT JOIN media m ON f.media_id = m.id
        WHERE f.user_id = %s
        """
        cursor.execute(sql, user_id)
        list_data = cursor.fetchall()
        close_conn(conn, cursor)
        return response(200, "获取成功", list_data)
    except Exception as e:
        return response(500, f"获取失败：{str(e)}")


@app.route("/api/checkin/add", methods=["POST"])
def add_checkin():
    try:
        user_id = get_current_user()
        if not user_id:
            return response(401, "请先登录")

        data = request.get_json()
        media_id = data.get("media_id")
        checkin_date = data.get("checkin_date")
        remark = data.get("remark", "")

        if not all([media_id, checkin_date]):
            return response(400, "参数缺失")

        conn = get_db_conn()
        cursor = conn.cursor()
        sql = """
        INSERT INTO checkins(user_id, media_id, checkin_date, remark)
        VALUES(%s, %s, %s, %s)
        """
        cursor.execute(sql, (user_id, media_id, checkin_date, remark))
        conn.commit()
        close_conn(conn, cursor)
        return response(200, "打卡成功")
    except Exception as e:
        return response(500, f"操作失败：{str(e)}")


@app.route("/api/checkin/list", methods=["GET"])
def checkin_list():
    try:
        user_id = get_current_user()
        if not user_id:
            return response(401, "请先登录")

        conn = get_db_conn()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        sql = """
        SELECT c.*, m.title FROM checkins c
        LEFT JOIN media m ON c.media_id = m.id
        WHERE c.user_id = %s
        ORDER BY c.checkin_date DESC
        """
        cursor.execute(sql, user_id)
        list_data = cursor.fetchall()
        close_conn(conn, cursor)
        return response(200, "获取成功", list_data)
    except Exception as e:
        return response(500, f"获取失败：{str(e)}")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
