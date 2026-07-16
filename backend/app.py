from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import re
import bcrypt
import jwt
import traceback
from datetime import datetime, timedelta
import sys

# 导入真实数据库操作函数
from db_connect import (
    get_user_by_username,
    insert_user,
    insert_favorite,
    get_favorite_by_user_and_movie,
    delete_favorite,
    get_favorites_by_user,
    insert_checkin,
    get_checkins_by_user,
    get_all_movies,
    insert_movie,
    get_movie_by_id,
    get_movies_by_mood,
    get_movies_by_mood_and_type
)

# 初始化Flask应用
app = Flask(__name__)

# 全局配置跨域，允许前端3000端口访问
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'], supports_credentials=True)

# JWT配置
SECRET_KEY = 'movie_blind_box_secret_key_2024'
JWT_EXPIRE_HOURS = 24


def success(msg='操作成功', data=None):
    """成功响应工具函数"""
    return jsonify({"code": 200, "msg": msg, "data": data})


def fail(msg='操作失败', code=400, data=None):
    """失败响应工具函数"""
    return jsonify({"code": code, "msg": msg, "data": data})


def log_request():
    """简易日志打印，记录每一条接口请求"""
    method = request.method
    path = request.path
    ip = request.remote_addr
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] {method} {path} - {ip}", flush=True)


def get_current_user():
    """从请求头Authorization读取token，解析出user_id"""
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


@app.before_request
def before_request():
    """请求前钩子：打印日志"""
    log_request()


@app.errorhandler(Exception)
def global_error_handler(e):
    """全局异常捕获，统一500错误返回"""
    print(f"Global error: {str(e)}", flush=True)
    traceback.print_exc(file=sys.stdout)
    return fail(f"服务器内部错误：{str(e)}", 500)


@app.route("/api/hello", methods=["GET"])
def hello():
    """健康检查接口"""
    return success("影视书籍盲盒后端服务运行正常", {"database": "Supabase"})


@app.route("/api/register", methods=["POST"])
def register():
    """注册接口"""
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "")
        avatar = data.get("avatar", "")

        # 参数校验：账号/密码非空、长度1-20位
        if not username:
            return fail("用户名不能为空")
        if len(username) > 20:
            return fail("用户名长度不能超过20个字符")
        if not re.match(r'^[\u4e00-\u9fa5a-zA-Z0-9]+$', username):
            return fail("用户名只能包含中英文和数字")
        if not password:
            return fail("密码不能为空")
        if len(password) < 6 or len(password) > 20:
            return fail("密码长度需在6-20个字符之间")
        if not re.search(r'[a-zA-Z]', password) or not re.search(r'[0-9]', password):
            return fail("密码必须包含字母和数字")

        # 查询用户名是否已存在
        existing = get_user_by_username(username)
        if existing:
            return fail("用户名已存在")

        # 密码加密
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # 插入用户
        user = insert_user(username, hashed_password, avatar)

        if not user:
            return fail("注册失败，用户信息写入失败", 500)

        return success("注册成功", {
            "user_id": user['id'],
            "username": user['username'],
            "avatar": user.get('avatar', '')
        })

    except Exception as e:
        print(f"Register error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        return fail(f"注册失败：{str(e)}", 500)


@app.route("/api/login", methods=["POST"])
def login():
    """登录接口"""
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "")

        # 参数校验：账号/密码非空、用户名长度1-20位、密码长度6-20位
        if not username:
            return fail("用户名不能为空")
        if len(username) > 20:
            return fail("用户名长度不能超过20个字符")
        if not password:
            return fail("密码不能为空")
        if len(password) < 6 or len(password) > 20:
            return fail("密码长度需在6-20个字符之间")

        # 查询用户
        user = get_user_by_username(username)
        if not user:
            return fail("用户名或密码错误", 401)

        # 校验密码
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return fail("用户名或密码错误", 401)

        # 生成JWT token
        payload = {
            'user_id': user['id'],
            'exp': datetime.now() + timedelta(hours=JWT_EXPIRE_HOURS)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        return success("登录成功", {
            "token": token,
            "user_id": user['id'],
            "username": user['username'],
            "avatar": user.get('avatar', '')
        })

    except Exception as e:
        print(f"Login error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        return fail(f"登录失败：{str(e)}", 500)


@app.route("/api/random-all", methods=["GET"])
def random_all():
    """随机抽取盲盒接口"""
    try:
        user_id = get_current_user()
        if not user_id:
            return fail("请先登录", 401)

        all_list = get_all_movies()
        if not all_list:
            return fail("暂无素材数据", 404)
        item = random.choice(all_list)

        # 字段映射：description -> intro
        res_item = {
            "id": item["id"],
            "title": item["title"],
            "type": item["type"],
            "cover": item["cover"],
            "intro": item["description"]
        }
        return success("获取成功", res_item)
    except Exception as e:
        print(f"Random-all error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        return fail(f"获取失败：{str(e)}", 500)


@app.route("/api/random-mood", methods=["GET"])
def random_mood():
    """情绪筛选接口（保留兼容）"""
    return success("情绪筛选功能暂未配置素材", None)


@app.route("/api/get-blindbox", methods=["POST"])
def get_blindbox():
    """根据情绪标签获取盲盒接口"""
    try:
        user_id = get_current_user()
        if not user_id:
            return fail("请先登录", 401)

        data = request.get_json()
        mood_tag = data.get("mood_tag", "").strip()
        select_type = data.get("selectType", "").strip() or "全部"

        valid_moods = ['治愈', '解压', '励志', '悬疑', '温暖', '热血']
        valid_types = ['全部', '电影', '书籍']

        if not mood_tag:
            return fail("请选择情绪标签")
        if mood_tag not in valid_moods:
            return fail(f"无效的情绪标签，可选标签：{valid_moods}")
        if select_type not in valid_types:
            return fail(f"无效的类型筛选，可选：{valid_types}")

        from db_connect import supabase

        query = supabase.table("movies").select("id, title, type, cover, description, mood_tag").eq("mood_tag", mood_tag)

        if select_type == "电影":
            query = query.eq("type", "电影")
        elif select_type == "书籍":
            query = query.eq("type", "书籍")

        res = query.execute()
        movies_list = res.data if res.data else []

        if not movies_list:
            type_text = select_type if select_type != '全部' else ''
            return fail(f"暂未收录'{mood_tag}'{type_text}类别的影视素材")

        import random
        item = random.choice(movies_list)

        res_item = {
            "id": item["id"],
            "title": item["title"],
            "type": item["type"],
            "cover": item.get("cover", ""),
            "intro": item["description"],
            "mood_tag": item["mood_tag"]
        }
        return success("获取成功", res_item)
    except Exception as e:
        print(f"Get blindbox error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        return fail(f"获取失败：{str(e)}", 500)


@app.route("/api/favorite/add", methods=["POST"])
def add_favorite():
    """新增收藏接口"""
    try:
        user_id = get_current_user()
        if not user_id:
            return fail("请先登录", 401)

        data = request.get_json()
        movie_id = data.get("media_id")

        if not movie_id:
            return fail("参数缺失")

        # 检查是否已收藏
        existing = get_favorite_by_user_and_movie(user_id, movie_id)
        if existing:
            return fail("已收藏过该素材")

        # 获取影视信息，确保movie_id有效
        movie = get_movie_by_id(movie_id)
        if not movie:
            return fail("影视素材不存在")

        # 获取type值
        media_type = movie.get("type", "")

        # 插入收藏记录，同步写入type字段
        insert_favorite(user_id, movie_id, media_type)

        return success("收藏成功")

    except Exception as e:
        print(f"Add favorite error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        return fail(f"操作失败：{str(e)}", 500)


@app.route("/api/favorite/del", methods=["POST"])
def del_favorite():
    """删除收藏接口"""
    try:
        user_id = get_current_user()
        if not user_id:
            return fail("请先登录", 401)

        data = request.get_json()
        movie_id = data.get("media_id")

        if not movie_id:
            return fail("参数缺失")

        # 删除收藏记录
        delete_favorite(user_id, movie_id)

        return success("取消收藏成功")

    except Exception as e:
        print(f"Delete favorite error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        return fail(f"操作失败：{str(e)}", 500)


@app.route("/api/favorite/list", methods=["GET"])
def fav_list():
    """收藏列表接口"""
    try:
        user_id = get_current_user()
        if not user_id:
            return fail("请先登录", 401)

        filter_type = request.args.get("filterType", "").strip() or "全部收藏"
        valid_types = ['全部收藏', '仅电影', '仅书籍']

        if filter_type not in valid_types:
            return fail(f"无效的类型筛选，可选：{valid_types}")

        from db_connect import supabase
        
        query = (
            supabase.table("favorites")
            .select("movie_id, movies!inner(id, title, type, cover, description, mood_tag)")
            .eq("user_id", user_id)
        )
        
        if filter_type == "仅电影":
            query = query.eq("type", "电影")
        elif filter_type == "仅书籍":
            query = query.eq("type", "书籍")
        
        res = query.order("created_at", desc=True).execute()
        fav_list_data = res.data if res.data else []

        list_data = []
        for fav in fav_list_data:
            movie = fav.get("movies", {})
            if movie:
                temp = {
                    "id": movie.get("id", 0),
                    "title": movie.get("title", ""),
                    "type": movie.get("type", ""),
                    "cover": movie.get("cover", ""),
                    "intro": movie.get("description", ""),
                    "mood_tag": movie.get("mood_tag", "")
                }
                list_data.append(temp)

        return success("获取成功", list_data)

    except Exception as e:
        print(f"Favorite list error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        return fail(f"获取失败：{str(e)}", 500)


@app.route("/api/favorite/status", methods=["POST"])
def fav_status():
    """查询单作品收藏状态接口"""
    try:
        user_id = get_current_user()
        if not user_id:
            return fail("请先登录", 401)

        data = request.get_json()
        movie_id = data.get("media_id")

        if not movie_id:
            return fail("参数缺失")

        existing = get_favorite_by_user_and_movie(user_id, movie_id)
        return success("查询成功", {"is_favorited": existing is not None})

    except Exception as e:
        print(f"Favorite status error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        return fail(f"查询失败：{str(e)}", 500)


@app.route("/api/checkin/add", methods=["POST"])
def add_checkin():
    """新增打卡接口"""
    try:
        user_id = get_current_user()
        if not user_id:
            return fail("请先登录", 401)

        data = request.get_json()
        movie_id = data.get("media_id")
        check_in_date = data.get("checkin_date")
        remark = data.get("remark", "")

        if not all([movie_id, check_in_date]):
            return fail("参数缺失")

        # 获取影视信息，确保movie_id有效
        movie = get_movie_by_id(movie_id)
        if not movie:
            return fail("影视素材不存在")

        # 获取type值
        media_type = movie.get("type", "")

        # 插入打卡记录，同步写入type字段
        insert_checkin(user_id, movie_id, check_in_date, remark, media_type)

        return success("打卡成功")

    except Exception as e:
        print(f"Add checkin error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        return fail(f"操作失败：{str(e)}", 500)


@app.route("/api/checkin/list", methods=["GET"])
def checkin_list():
    """打卡列表接口"""
    try:
        user_id = get_current_user()
        if not user_id:
            return fail("请先登录", 401)

        filter_type = request.args.get("filterType", "").strip() or "全部打卡"
        valid_types = ['全部打卡', '仅电影', '仅书籍']

        if filter_type not in valid_types:
            return fail(f"无效的类型筛选，可选：{valid_types}")

        from db_connect import supabase
        
        query = (
            supabase.table("check_ins")
            .select("id, movie_id, check_in_date, remark, movies!inner(id, title, type, cover, mood_tag)")
            .eq("user_id", user_id)
        )
        
        if filter_type == "仅电影":
            query = query.eq("type", "电影")
        elif filter_type == "仅书籍":
            query = query.eq("type", "书籍")
        
        res = query.order("check_in_date", desc=True).execute()
        checkin_list_data = res.data if res.data else []

        list_data = []
        for checkin in checkin_list_data:
            movie = checkin.get("movies", {})
            if movie:
                list_data.append({
                    "id": checkin.get("id", 0),
                    "movie_id": checkin.get("movie_id", 0),
                    "check_in_date": checkin.get("check_in_date", ""),
                    "remark": checkin.get("remark", ""),
                    "title": movie.get("title", ""),
                    "type": movie.get("type", ""),
                    "cover": movie.get("cover", ""),
                    "mood_tag": movie.get("mood_tag", "")
                })

        return success("获取成功", list_data)

    except Exception as e:
        print(f"Checkin list error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        return fail(f"获取失败：{str(e)}", 500)


if __name__ == "__main__":
    print("Starting Flask server on http://127.0.0.1:5000", flush=True)
    app.run(debug=False, port=5000)
