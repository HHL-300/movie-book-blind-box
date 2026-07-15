from db_connect import supabase, ADMIN_SECRET

admin_header = {"apikey": ADMIN_SECRET}

def get_media_data():
    res = supabase.table("movies").select("*").headers(admin_header).execute()
    return res.data

def filter_by_mood(tag):
    return []
