import os

print("=" * 60)
print("Supabase 数据库连通性测试")
print("=" * 60)

os.environ["HTTP_PROXY"] = ""
os.environ["HTTPS_PROXY"] = ""
os.environ["NO_PROXY"] = "127.0.0.1,localhost,hlrnolfwepywveclkfmg.supabase.co"
print("[1/5] 已清空系统代理环境变量")

SUPABASE_URL = "https://hlrnolfwepywveclkfmg.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhscm5vbGZ3ZXB5d3ZlY2xrZm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDM0OTcsImV4cCI6MjA5OTYxOTQ5N30.l0B1VHUDEoUZO5fXdk58hnWwCXYt-hYioNqFtTu5vzI"
ADMIN_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhscm5vbGZ3ZXB5d3ZlY2xrZm1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0MzQ5NywiZXhwIjoyMDk5NjE5NDk3fQ.EMCxIIYsp38Tyon-O9fv_z4SsC4BSR59a6QfB4ZvLMg"

print(f"[2/5] 项目URL: {SUPABASE_URL}")
print(f"[3/5] ANON_KEY: {ANON_KEY[:20]}...")
print(f"[3/5] ADMIN_SECRET: {ADMIN_SECRET[:20]}...")

try:
    from supabase import create_client, Client
    
    supabase: Client = create_client(SUPABASE_URL, ANON_KEY)
    print("[4/5] supabase客户端初始化成功（使用ANON公钥）")
    
    supabase.postgrest.auth(ADMIN_SECRET)
    print("[5/5] 已追加管理员权限")
    
    print("\n" + "=" * 60)
    print("开始查询 users 表...")
    print("=" * 60)
    
    res = supabase.table("users").select("id, username, avatar").limit(1).execute()
    
    if res.data and len(res.data) > 0:
        print(f"✓ 查询成功! 第一条用户数据:")
        print(f"  id: {res.data[0]['id']}")
        print(f"  username: {res.data[0]['username']}")
        print(f"  avatar: {res.data[0]['avatar'][:30]}..." if res.data[0]['avatar'] else "  avatar: (空)")
    else:
        print("✓ 查询成功! users 表当前无数据")
    
    print("\n" + "=" * 60)
    print("✓ Supabase 数据库连通性测试通过!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n✗ 连接失败! 错误信息: {str(e)}")
    print("=" * 60)
    import traceback
    traceback.print_exc()