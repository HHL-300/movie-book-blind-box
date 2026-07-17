影视书籍盲盒后端接口文档



基础说明

\- 后端本地服务地址：`http://127.0.0.1:5000`

\- 请求数据格式：统一JSON

\- 通用返回格式如下：

{

&#x20; "code": 200,

&#x20; "msg": "操作提示",

&#x20; "data": {}

}

code=200代表请求成功，非200为操作异常。



1\. 服务连通测试

接口地址：GET /api/hello

入参：无

返回示例

{

&#x20; "code": 200,

&#x20; "msg": "后端服务正常运行",

&#x20; "data": "hello movie blind box"

}

2\. 按条件抽取盲盒素材

接口地址：POST /api/get-blindbox

请求入参

{

&#x20; "type": "全部",

&#x20; "mood\_tag": "治愈"

}

参数说明：

type：素材类型，可选值 全部/电影/书籍

mood\_tag：情绪标签，可选值 治愈/解压/励志/悬疑/温暖/热血

返回示例

{

&#x20; "code": 200,

&#x20; "msg": "随机抽取成功",

&#x20; "data": {

&#x20;   "id": 5,

&#x20;   "title": "小森林 夏秋篇",

&#x20;   "type": "电影",

&#x20;   "description": "乡下四季温柔日常，慢节奏治愈生活焦虑",

&#x20;   "mood\_tag": "治愈"

&#x20; }

}

3\. 查询作品收藏状态

接口地址：POST /api/favorite/status

请求示例：

{

&#x20; "user\_id": 1,

&#x20; "media\_id": 5

}

返回示例：

{

&#x20; "code": 200,

&#x20; "msg": "查询成功",

&#x20; "data": {

&#x20;   "is\_favorite": false

&#x20; }

}

4\. 新增/取消收藏

接口地址：POST /api/favorite

请求示例：

{

&#x20; "user\_id": 1,

&#x20; "media\_id": 5,

&#x20; "action": "add"

}

参数说明：action传add为新增收藏，传del为取消收藏。

返回示例：

{

&#x20; "code": 200,

&#x20; "msg": "收藏成功",

&#x20; "data": null

}

5\. 获取用户收藏列表

接口地址：GET /api/favorite/list?user\_id=1

入参：query参数user\_id

返回示例：

{

&#x20; "code": 200,

&#x20; "msg": "查询收藏列表成功",

&#x20; "data": \[

&#x20;   {

&#x20;     "id": 3,

&#x20;     "title": "流浪地球",

&#x20;     "type": "电影",

&#x20;     "description": "国产硬核科幻灾难片",

&#x20;     "mood\_tag": "解压"

&#x20;   }

&#x20; ]

}

6\. 新增打卡记录

接口地址：POST /api/checkin/add

请求示例：

{

&#x20; "user\_id": 1,

&#x20; "media\_id": 5,

&#x20; "note": "平淡的乡村生活治愈内心焦虑"

}

返回示例：

{

&#x20; "code": 200,

&#x20; "msg": "打卡成功",

&#x20; "data": null

}

7\. 查询用户打卡记录

接口地址：GET /api/checkin/list?user\_id=1

入参：query参数user\_id

返回示例：

{

&#x20; "code": 200,

&#x20; "msg": "查询打卡记录成功",

&#x20; "data": \[

&#x20;   {

&#x20;     "media\_title": "小森林 夏秋篇",

&#x20;     "note": "平淡的乡村生活治愈内心焦虑",

&#x20;     "create\_time": "2026-07-15 18:20:10"

&#x20;   }

&#x20; ]

}

8\. 用户登录接口

接口地址：POST /api/login

请求示例：

{

&#x20; "username": "test001",

&#x20; "password": "123456"

}

返回示例：

{

&#x20; "code": 200,

&#x20; "msg": "登录成功",

&#x20; "data": {

&#x20;   "user\_id": 1,

&#x20;   "username": "test001",

&#x20;   "avatar": ""

&#x20; }

}

