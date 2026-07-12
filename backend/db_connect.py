import pymysql

# 小皮面板MySQL配置
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "123123",
    "database": "movie_blind_box",
    "charset": "utf8mb4"
}

# 获取数据库连接
def get_db_conn():
    conn = pymysql.connect(**DB_CONFIG)
    return conn

# 关闭游标与连接
def close_conn(conn, cursor):
    if cursor:
        cursor.close()
    if conn:
        conn.close()