'use client'
import { useState, useEffect } from 'react'
import { Button, Avatar, Dropdown, message, Modal } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

interface UserInfo {
  user_id: number
  username: string
  avatar: string
}

export default function Navbar() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [token, setToken] = useState('')

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

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      onOk: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        setToken('')
        setUserInfo(null)
        message.success('已退出登录')
        window.location.href = '/'
      }
    })
  }

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <nav className="navbar">
      <div className="nav-wrap">
        <a href="/" className="nav-link active" style={{ fontSize: '18px', fontWeight: '700' }}>
          影视书籍盲盒
        </a>
        <a href="/" className="nav-link">首页</a>
        <a href="/favorites" className="nav-link">我的收藏</a>
        <a href="/checkin" className="nav-link">打卡记录</a>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {token ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Avatar src={userInfo?.avatar || DEFAULT_AVATAR} size={32} />
                <span style={{ color: '#666' }}>{userInfo?.username}</span>
              </div>
            </Dropdown>
          ) : (
            <Button
              onClick={() => window.location.href = '/'}
              type="primary"
              size="middle"
            >
              登录/注册
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
