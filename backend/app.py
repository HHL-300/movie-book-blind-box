from flask import Flask, jsonify, request
from flask_cors import CORS
import random
from data_util import get_media_data, filter_by_mood
from db_connect import get_db_conn, close_conn

app = Flask(__name__)
CORS(app)

# 测试接口
@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify({
        "msg": "影视书籍盲盒后端服务运行正常,已对接MySQL持久化数据库"
    })

# 随机抽取全部盲盒
@app.route("/api/random-all", methods=["GET"])
def random_all():
    all_list = get_media_data()
    if not all_list:
        return jsonify({"msg": "暂无素材数据"}), 404
    item = random.choice(all_list)
    return jsonify(item)

# 根据情绪标签抽取盲盒
@app.route("/api/random-mood", methods=["GET"])
def random_mood():
    mood = request.args.get("mood")
    list_data = filter_by_mood(mood)
    if not list_data:
        return jsonify({"msg": "暂无该情绪标签的作品"}), 404
    item = random.choice(list_data)
    return jsonify(item)

# 新增收藏接口
@app.route("/api/favorite/add", methods=["POST"])
def add_favorite():
    data = request.get_json()
    user_id = data.get("user_id")
    media_id = data.get("media_id")
    if not user_id or not media_id:
        return jsonify({"msg": "参数缺失"}), 400

    conn = get_db_conn()
    cursor = conn.cursor()
    try:
        sql = "INSERT INTO favorites(user_id, media_id) VALUES(%s, %s)"
        cursor.execute(sql, (user_id, media_id))
        conn.commit()
        res = {"msg": "收藏成功"}
    except Exception as e:
        conn.rollback()
        res = {"msg": "已收藏或素材不存在"}
    finally:
        close_conn(conn, cursor)
    return jsonify(res)

# 取消收藏接口
@app.route("/api/favorite/del", methods=["POST"])
def del_favorite():
    data = request.get_json()
    user_id = data.get("user_id")
    media_id = data.get("media_id")
    conn = get_db_conn()
    cursor = conn.cursor()
    sql = "DELETE FROM favorites WHERE user_id=%s AND media_id=%s"
    cursor.execute(sql, (user_id, media_id))
    conn.commit()
    close_conn(conn, cursor)
    return jsonify({"msg": "取消收藏成功"})

# 查询用户收藏列表
@app.route("/api/favorite/list/<user_id>", methods=["GET"])
def fav_list(user_id):
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
    return jsonify(list_data)

# 新增打卡接口
@app.route("/api/checkin/add", methods=["POST"])
def add_checkin():
    data = request.get_json()
    user_id = data.get("user_id")
    media_id = data.get("media_id")
    checkin_date = data.get("checkin_date")
    remark = data.get("remark", "")
    if not all([user_id, media_id, checkin_date]):
        return jsonify({"msg": "参数缺失"}), 400

    conn = get_db_conn()
    cursor = conn.cursor()
    sql = """
    INSERT INTO checkins(user_id, media_id, checkin_date, remark)
    VALUES(%s, %s, %s, %s)
    """
    cursor.execute(sql, (user_id, media_id, checkin_date, remark))
    conn.commit()
    close_conn(conn, cursor)
    return jsonify({"msg": "打卡成功"})

# 查询用户全部打卡记录
@app.route("/api/checkin/list/<user_id>", methods=["GET"])
def checkin_list(user_id):
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
    return jsonify(list_data)

if __name__ == "__main__":
    app.run(debug=True, port=5000)