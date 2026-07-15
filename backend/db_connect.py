import os
from supabase import create_client, Client

os.environ["HTTP_PROXY"] = ""
os.environ["HTTPS_PROXY"] = ""
os.environ["NO_PROXY"] = "127.0.0.1,localhost,hlrnolfwepywveclkfmg.supabase.co"

SUPABASE_URL = "https://hlrnolfwepywveclkfmg.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhscm5vbGZ3ZXB5d3ZlY2xrZm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDM0OTcsImV4cCI6MjA5OTYxOTQ5N30.l0B1VHUDEoUZO5fXdk58hnWwCXYt-hYioNqFtTu5vzI"
ADMIN_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhscm5vbGZ3ZXB5d3ZlY2xrZm1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0MzQ5NywiZXhwIjoyMDk5NjE5NDk3fQ.EMCxIIYsp38Tyon-O9fv_z4SsC4BSR59a6QfB4ZvLMg"

supabase: Client = create_client(SUPABASE_URL, ANON_KEY)
supabase.postgrest.auth(ADMIN_SECRET)


def get_user_by_username(username: str):
    try:
        res = supabase.table("users").select("id, username, password_hash, avatar").eq("username", username).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        print(f"get_user_by_username error: {str(e)}", flush=True)
        return None


def insert_user(username: str, password_hash: str, avatar: str):
    try:
        res = supabase.table("users").insert({
            "username": username,
            "password_hash": password_hash,
            "avatar": avatar
        }).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        print(f"insert_user error: {str(e)}", flush=True)
        return None


def insert_favorite(user_id: int, movie_id: int, media_type: str = ""):
    try:
        data = {
            "user_id": user_id,
            "movie_id": movie_id
        }
        if media_type:
            data["type"] = media_type
        res = supabase.table("favorites").insert(data).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        print(f"insert_favorite error: {str(e)}", flush=True)
        return None


def get_favorite_by_user_and_movie(user_id: int, movie_id: int):
    try:
        res = supabase.table("favorites").select("id").eq("user_id", user_id).eq("movie_id", movie_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        print(f"get_favorite_by_user_and_movie error: {str(e)}", flush=True)
        return None


def delete_favorite(user_id: int, movie_id: int):
    try:
        supabase.table("favorites").delete().eq("user_id", user_id).eq("movie_id", movie_id).execute()
    except Exception as e:
        print(f"delete_favorite error: {str(e)}", flush=True)


def get_favorites_by_user(user_id: int):
    try:
        res = supabase.table("favorites").select("movie_id").eq("user_id", user_id).execute()
        return res.data if res.data else []
    except Exception as e:
        print(f"get_favorites_by_user error: {str(e)}", flush=True)
        return []


def insert_checkin(user_id: int, movie_id: int, check_in_date: str, remark: str, media_type: str = ""):
    try:
        data = {
            "user_id": user_id,
            "movie_id": movie_id,
            "check_in_date": check_in_date,
            "remark": remark
        }
        if media_type:
            data["type"] = media_type
        res = supabase.table("check_ins").insert(data).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        print(f"insert_checkin error: {str(e)}", flush=True)
        return None


def get_checkins_by_user(user_id: int):
    try:
        res = supabase.table("check_ins").select("id, movie_id, check_in_date, remark").eq("user_id", user_id).order("check_in_date", desc=True).execute()
        return res.data if res.data else []
    except Exception as e:
        print(f"get_checkins_by_user error: {str(e)}", flush=True)
        return []


def get_all_movies():
    try:
        res = supabase.table("movies").select("id, title, type, cover, description").execute()
        return res.data if res.data else []
    except Exception as e:
        print(f"get_all_movies error: {str(e)}", flush=True)
        return []


def insert_movie(title: str, type: str, cover: str, description: str):
    try:
        res = supabase.table("movies").insert({
            "title": title,
            "type": type,
            "cover": cover,
            "description": description
        }).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        print(f"insert_movie error: {str(e)}", flush=True)
        return None


def get_movie_by_id(movie_id: int):
    try:
        res = supabase.table("movies").select("id, title, type, cover, description, mood_tag").eq("id", movie_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        print(f"get_movie_by_id error: {str(e)}", flush=True)
        return None


def get_movies_by_mood(mood_tag: str):
    try:
        res = supabase.table("movies").select("id, title, type, cover, description, mood_tag").eq("mood_tag", mood_tag).execute()
        return res.data if res.data else []
    except Exception as e:
        print(f"get_movies_by_mood error: {str(e)}", flush=True)
        return []


def get_movies_by_mood_and_type(mood_tag: str, media_type: str):
    try:
        query = supabase.table("movies").select("id, title, type, cover, description, mood_tag").eq("mood_tag", mood_tag)
        if media_type and media_type != '全部':
            query = query.eq("type", media_type)
        res = query.execute()
        return res.data if res.data else []
    except Exception as e:
        print(f"get_movies_by_mood_and_type error: {str(e)}", flush=True)
        return []