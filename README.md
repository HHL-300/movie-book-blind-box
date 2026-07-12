# 影视书籍盲盒全栈实训项目
## 技术栈
前端：Next.js TS
后端：Python Flask
数据库：MySQL5.7
版本管理：Git+GitHub

## 项目功能
1. 随机抽取影视/书籍盲盒，支持情绪标签筛选
2. 用户素材收藏、取消收藏、收藏列表查询
3. 作品打卡、打卡记录查询，支持填写心得

## 数据库说明
database/schema.sql 为完整建库建表脚本，包含media素材表、favorites收藏表、checkins打卡表；
本地使用小皮面板MySQL，库名movie_blind_box，持久化存储，重启数据不丢失。

## 后端接口清单
GET /api/hello 服务测试
GET /api/random-all 随机全量盲盒
GET /api/random-mood?mood=xxx 按情绪抽取盲盒
POST /api/favorite/add 新增收藏
POST /api/favorite/del 取消收藏
GET /api/favorite/list/<user_id> 查询用户收藏
POST /api/checkin/add 新增打卡
GET /api/checkin/list/<user_id> 查询打卡记录

## 项目启动说明
后端启动步骤：
1. 进入backend目录，执行 pip install -r requirements.txt
2. 启动服务 python app.py，端口5000
前端启动步骤：
1. 进入frontend目录，执行 npm install
2. 执行 npm run dev，本地3000端口访问