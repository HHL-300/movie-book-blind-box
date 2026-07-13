import pymysql
from db_connect import get_db_conn, close_conn

# 获取全部影视书籍素材
def get_media_data():
    conn = get_db_conn()
    cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)
    sql = "SELECT * FROM media"
    cursor.execute(sql)
    data = cursor.fetchall()
    close_conn(conn, cursor)
    return data

# 根据情绪标签筛选素材
def filter_by_mood(tag):
    conn = get_db_conn()
    cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)
    sql = "SELECT * FROM media WHERE mood_tag = %s"
    cursor.execute(sql, tag)
    data = cursor.fetchall()
    close_conn(conn, cursor)
    return data