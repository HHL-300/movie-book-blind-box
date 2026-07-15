'use client'
import { useState, useEffect, useRef } from 'react'
import { Form, Input, Button, Avatar, Card, Tag, message, Modal, Dropdown } from 'antd'
import { UserOutlined, LockOutlined, UploadOutlined, StarOutlined, StarFilled, CalendarOutlined, LogoutOutlined } from '@ant-design/icons'
import { getBlindbox, addFavorite, delFavorite, getFavoriteStatus, addCheckin, register, login, type MediaItem, type ApiResponse } from '../src/api'
import CoverImage from '../src/components/CoverImage'

const moodList = ['治愈', '解压', '励志', '悬疑', '温暖', '热血']

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

export default function Home() {
  const [userInfo, setUserInfo] = useState<{ user_id: number; username: string; avatar: string } | null>(null)
  const [token, setToken] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [uploadedAvatar, setUploadedAvatar] = useState('')
  const [activeMood, setActiveMood] = useState<string>('治愈')
  const [activeType, setActiveType] = useState<string>('全部')
  const [result, setResult] = useState<MediaItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [checkinModalOpen, setCheckinModalOpen] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [checkinContent, setCheckinContent] = useState('')
  const [checkinLoading, setCheckinLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = localStorage.getItem('token') || ''
    setToken(t)
    const userStr = localStorage.getItem('userInfo')
    if (userStr) {
      try {
        setUserInfo(JSON.parse(userStr))
      } catch {
        localStorage.removeItem('userInfo')
      }
    }
  }, [])

  const handleAvatarUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      message.error('仅支持jpg、png、webp格式图片')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      message.error('图片大小不能超过2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 200
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
          setUploadedAvatar(compressedDataUrl)
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleAuth = async () => {
    try {
      const values = await form.validateFields()
      const { username, password, confirmPassword } = values

      setLoading(true)

      let res
      const avatar = uploadedAvatar || DEFAULT_AVATAR
      if (isLogin) {
        res = await login(username, password)
      } else {
        if (password !== confirmPassword) {
          message.error('两次输入的密码不一致')
          setLoading(false)
          return
        }
        res = await register(username, password, avatar)
      }

      if (res.code === 200) {
        if (isLogin) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('userInfo', JSON.stringify({
            user_id: res.data.user_id,
            username: res.data.username,
            avatar: res.data.avatar || DEFAULT_AVATAR
          }))
          setToken(res.data.token)
          setUserInfo({
            user_id: res.data.user_id,
            username: res.data.username,
            avatar: res.data.avatar || DEFAULT_AVATAR
          })
          message.success(res.msg)
          setShowAuth(false)
          form.resetFields()
        } else {
          message.success(res.msg)
          setIsLogin(true)
          form.resetFields()
          setUploadedAvatar('')
        }
      } else {
        message.error(res.msg)
      }
    } catch (err: any) {
      if (err.errorFields) {
        err.errorFields.forEach((field: any) => {
          message.error(field.errors[0])
        })
      } else {
        message.error(isLogin ? '登录失败' : '注册失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      onOk: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        setToken('')
        setUserInfo(null)
        setResult(null)
        message.success('已退出登录')
      }
    })
  }

  const handleDraw = async () => {
    if (!token) {
      setShowAuth(true)
      return
    }
    setLoading(true)
    try {
      const res: ApiResponse<MediaItem> = await getBlindbox(activeMood, activeType)
      if (res.code === 200) {
        setResult(res.data)
        setIsFavorited(false)
        const statusRes = await getFavoriteStatus(res.data.id)
        if (statusRes.code === 200) {
          setIsFavorited(statusRes.data.is_favorited)
        }
      } else {
        message.error(res.msg)
      }
    } catch (err: any) {
      if (err.message.includes('后端') || err.message.includes('Network')) {
        message.error('请先启动后端python app.py')
      } else {
        message.error('抽取失败，请检查后端服务')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!result || !token) return
    try {
      let res
      if (isFavorited) {
        res = await delFavorite(result.id)
      } else {
        res = await addFavorite(result.id)
      }
      if (res.code === 200) {
        message.success(res.msg)
        setIsFavorited(!isFavorited)
      } else {
        message.error(res.msg)
      }
    } catch (err: any) {
      if (err.message.includes('后端') || err.message.includes('Network')) {
        message.error('请先启动后端python app.py')
      } else {
        message.error(isFavorited ? '取消收藏失败' : '收藏失败')
      }
    }
  }

  const handleCheckin = () => {
    if (!result || !token) return
    setCheckinContent('')
    setCheckinModalOpen(true)
  }

  const handleCheckinSubmit = async () => {
    if (!result || !checkinContent.trim()) {
      message.error('请填写打卡心得')
      return
    }

    setCheckinLoading(true)
    try {
      const res = await addCheckin(result.id, checkinContent.trim())
      if (res.code === 200) {
        message.success(res.msg)
        setCheckinModalOpen(false)
        setCheckinContent('')
      } else {
        message.error(res.msg)
      }
    } catch (err: any) {
      if (err.message.includes('后端') || err.message.includes('Network')) {
        message.error('请先启动后端python app.py')
      } else {
        message.error('打卡失败')
      }
    } finally {
      setCheckinLoading(false)
    }
  }

  return (
    <div>
      <nav className="navbar">
        <div className="nav-wrap">
          <a href="/" className="nav-logo" style={{ fontSize: '18px', fontWeight: '700' }}>
            影视书籍盲盒
          </a>
          <a href="/" className="nav-link nav-active">首页</a>
          <a href="/favorites" className="nav-link">我的收藏</a>
          <a href="/checkin" className="nav-link">打卡记录</a>
          <div className="nav-user">
            {token ? (
              <Dropdown menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }] }} placement="bottomRight">
                <div className="user-trigger">
                  <Avatar src={userInfo?.avatar || DEFAULT_AVATAR} size={32} />
                  <span className="user-name">{userInfo?.username}</span>
                </div>
              </Dropdown>
            ) : (
              <Button
                onClick={() => setShowAuth(true)}
                type="primary"
                size="middle"
              >
                登录/注册
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 className="page-title">影视书籍盲盒</h1>

          <div style={{ marginBottom: '32px', color: '#666', lineHeight: '1.7', fontSize: '15px' }}>
            <p>欢迎来到影视书籍盲盒！在这里，你可以根据情绪标签随机抽取一部影视作品或书籍，开启一段未知的精彩旅程。</p>
            <p>选择你当前的心情，让我们为你推荐最适合的作品。无论是治愈、解压、励志还是悬疑，总有一款适合你。</p>
          </div>

          {!token && showAuth && (
            <Card title={isLogin ? '登录' : '注册'} style={{ marginBottom: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Form form={form} layout="vertical">
                {!isLogin && (
                  <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>头像</p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Avatar
                        src={uploadedAvatar || DEFAULT_AVATAR}
                        size={90}
                        style={{ cursor: 'pointer', border: '2px solid #6366F1', borderRadius: '50%' }}
                        onClick={handleAvatarUpload}
                        icon={<UploadOutlined />}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <p style={{ color: '#999', fontSize: '12px', marginTop: '10px' }}>点击头像可更换，仅支持jpg/png/webp，最大2MB</p>
                  </div>
                )}

                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[
                    { required: true, message: '用户名不能为空' },
                    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/, message: '用户名只能包含中英文和数字' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '密码不能为空' },
                    { min: 6, message: '密码长度至少6位' },
                    { pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])/, message: '密码必须包含字母和数字' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
                </Form.Item>

                {!isLogin && (
                  <Form.Item
                    name="confirmPassword"
                    label="确认密码"
                    rules={[
                      { required: true, message: '请确认密码' }
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
                  </Form.Item>
                )}

                <Form.Item style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={handleAuth}
                      loading={loading}
                      style={{ flex: 1, borderRadius: '8px' }}
                    >
                      {isLogin ? '登录' : '注册'}
                    </Button>
                    <Button
                      htmlType="button"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        form.resetFields()
                        setUploadedAvatar('')
                      }}
                      style={{ borderRadius: '8px' }}
                    >
                      {isLogin ? '去注册' : '去登录'}
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </Card>
          )}

          {token && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#666', marginBottom: '12px', fontSize: '15px' }}>选择素材类型：</p>
                <div className="tag-group">
                  {['全部', '电影', '书籍'].map(item => (
                    <Tag
                      key={item}
                      onClick={() => setActiveType(item)}
                      style={{ cursor: 'pointer', padding: '10px 24px', fontSize: '14px', borderRadius: '20px', backgroundColor: activeType === item ? '#6366F1' : undefined, color: activeType === item ? 'white' : undefined }}
                    >
                      {item}
                    </Tag>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ color: '#666', marginBottom: '12px', fontSize: '15px' }}>选择情绪标签：</p>
                <div className="tag-group">
                  {moodList.map(item => (
                    <Tag
                      key={item}
                      onClick={() => setActiveMood(item)}
                      style={{ cursor: 'pointer', padding: '10px 20px', fontSize: '14px', borderRadius: '20px', backgroundColor: activeMood === item ? '#6366F1' : undefined, color: activeMood === item ? 'white' : undefined }}
                    >
                      {item}
                    </Tag>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleDraw}
                  loading={loading}
                  style={{ fontSize: '18px', padding: '16px 56px', borderRadius: '8px' }}
                >
                  开启盲盒
                </Button>
              </div>

              {result && (
                <Card title={result.title} style={{ marginTop: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0 }}>
                      <CoverImage
                        src={result.cover}
                        alt={result.title}
                        style={{ width: '150px', height: '200px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <Tag style={{ fontSize: '13px', borderRadius: '4px', backgroundColor: '#EEF2FF', color: '#6366F1', borderColor: '#6366F1' }}>{result.type}</Tag>
                        <Tag color="cyan" style={{ fontSize: '13px', borderRadius: '4px' }}>{result.mood_tag}</Tag>
                      </div>
                      <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '16px', fontSize: '15px' }}>{result.intro}</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Button
                          type={isFavorited ? 'default' : 'default'}
                          onClick={handleFavorite}
                          icon={isFavorited ? <StarFilled /> : <StarOutlined />}
                          style={{ borderRadius: '6px', color: isFavorited ? '#6366F1' : undefined }}
                        >
                          {isFavorited ? '已收藏' : '收藏'}
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleCheckin}
                          icon={<CalendarOutlined />}
                          style={{ borderRadius: '6px' }}
                        >
                          打卡
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {!token && !showAuth && (
            <div className="empty-tip">
              <p>请先登录后开启盲盒之旅</p>
              <Button
                type="primary"
                onClick={() => setShowAuth(true)}
                style={{ margin: '20px 0 0', borderRadius: '8px' }}
              >
                立即登录
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="打卡"
        open={checkinModalOpen}
        onCancel={() => setCheckinModalOpen(false)}
        onOk={handleCheckinSubmit}
        okText="提交"
        cancelText="取消"
        confirmLoading={checkinLoading}
        style={{ borderRadius: '12px' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#666', fontSize: '14px', marginBottom: '8px' }}>作品名称</label>
          <div style={{ padding: '10px 14px', background: '#f5f7fa', borderRadius: '8px', color: '#333', fontSize: '15px' }}>
            {result?.title}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', color: '#666', fontSize: '14px', marginBottom: '8px' }}>打卡心得</label>
          <textarea
            value={checkinContent}
            onChange={(e) => setCheckinContent(e.target.value)}
            placeholder="写下你的观看心得..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px 14px',
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              resize: 'vertical',
              fontSize: '15px'
            }}
          />
        </div>
      </Modal>
    </div>
  )
}
