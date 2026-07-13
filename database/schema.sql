-- 用户表
CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(bcrypt加密)',
    avatar VARCHAR(500) DEFAULT '' COMMENT '头像地址',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 作品表：影视、书籍盲盒素材
CREATE TABLE IF NOT EXISTS media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '作品名称',
    type VARCHAR(20) NOT NULL COMMENT '分类 movie/book',
    mood_tag VARCHAR(50) NOT NULL COMMENT '情绪标签 治愈/悬疑/热血/放松',
    cover VARCHAR(500) DEFAULT '' COMMENT '封面图链接',
    description TEXT COMMENT '简介',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
    media_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_media (user_id, media_id)
);

-- 用户打卡记录表
CREATE TABLE IF NOT EXISTS checkins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
    media_id INT NOT NULL,
    checkin_date DATE NOT NULL,
    remark VARCHAR(500) DEFAULT '' COMMENT '打卡心得',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);