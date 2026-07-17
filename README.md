##### 影视书籍盲盒全栈实训项目

技术栈

1.前端：Next.js 16+TypeScript

2.后端：Python Flask

3.数据库：Supabase PostgreSQL

4\.版本管理：Git+GitHub

5.线上部署：Vercel（前端自动部署）

项目功能

1.素材筛选：按「全部/电影/书籍」素材类型、「治愈/解压/励志/悬疑/温暖/热血」情绪标签筛选

2.盲盒抽取：根据筛选条件随机抽取单部影视/书籍作品展示，已移除封面图片模块，仅文字信息展示

3.收藏功能：作品收藏、取消收藏、个人收藏列表查询

4.打卡功能：作品打卡、个人全部打卡记录查询

5.用户系统：账号登录、用户名长度校验、头像上传、退出登录

6.UI配套：导航高亮、暗夜烟灰紫全局主题、表单校验、加载异常兜底

数据库说明

使用Supabase云端PostgreSQL数据库，三张核心数据表：

1.public.movies：影视/书籍素材表（id、title、type、description、mood\_tag、created\_at）

2.public.favorites：用户收藏关联表，记录用户与素材收藏关系

3.public.checkins：用户打卡记录表，存储打卡作品与用户关联数据

后端接口清单

1.GET /api/hello 后端服务连通性测试

2.POST /api/get-blindbox 按素材类型、情绪标签随机抽取盲盒素材

3.POST /api/favorite/status 查询作品是否被当前用户收藏

4.POST /api/favorite 新增/取消作品收藏

5.GET /api/favorite/list 查询当前用户全部收藏列表

6.POST /api/checkin/add 新增作品打卡记录

7.GET /api/checkin/list 查询当前用户全部打卡记录

8.配套登录、头像上传、用户信息相关接口



###### 本地项目启动说明

后端启动步骤

1.终端进入项目backend目录

cd backend

2.安装全部Python依赖

pip install -r requirements.txt

3.启动Flask后端服务，运行在127.0.0.1:5000

python app.py

前端启动步骤

1.新开终端进入frontend目录

cd frontend

2.安装前端依赖包

npm install

3.启动Next开发服务，本地访问地址http://localhost:3000

npm run dev



线上演示地址

https://movie-book-blind-box-j76zfw1hl-hhl-300s-projects.vercel.app



仓库交付文档索引

1\.详细接口文档：docs/api\_doc.md

2\.AI开发Prompt日志：prompt\_shturl

3\.个人实训总结报告：个人实训总结报告.md

4\.数据库、接口、AI代码审查截图：docs/screenshot/

5\.项目完整演示录屏：docs/demo.mp4

