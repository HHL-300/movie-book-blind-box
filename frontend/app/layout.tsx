'use client'
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const navList = [
    { path: '/', label: '首页' },
    { path: '/favorites', label: '我的收藏' },
    { path: '/checkin', label: '打卡记录' }
  ]

  return (
    <html lang="zh-CN">
      <body>
        <nav className="navbar">
          <div className="nav-wrap">
            {navList.map(item => (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  )
}