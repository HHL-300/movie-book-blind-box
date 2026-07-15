'use client'
import { useState, useEffect } from 'react'
import { Button, Avatar, Dropdown, message, Modal } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import { usePathname } from 'next/navigation'

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

interface UserInfo {
  user_id: number
  username: string
  avatar: string
}

export default function Navbar() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [token, setToken] = useState('')
  const pathname = usePathname()

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

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/favorites', label: '我的收藏' },
    { path: '/checkin', label: '打卡记录' }
  ]

  return (
    <nav className="navbar">
      <div className="nav-wrap">
        <a href="/" className="nav-logo" style={{ fontSize: '18px', fontWeight: '700' }}>
          影视书籍盲盒
        </a>
        {navLinks.map((link) => (
          <a
            key={link.path}
            href={link.path}
            className={`nav-link ${pathname === link.path ? 'nav-active' : ''}`}
          >
            {link.label}
          </a>
        ))}
        <div className="nav-user">
          {token ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <div className="user-trigger">
                <Avatar src={userInfo?.avatar || DEFAULT_AVATAR} size={32} />
                <span className="user-name">{userInfo?.username}</span>
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
