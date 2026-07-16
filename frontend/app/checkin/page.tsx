'use client'
import { useEffect, useState } from 'react'
import { Card, Tag, message, Spin, Empty, List } from 'antd'
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons'
import { getCheckinList, type ApiResponse } from '../../src/api'
import Navbar from '../../src/components/Navbar'

export default function CheckinPage() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeType, setActiveType] = useState<string>('全部打卡')

  const fetchList = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('请先登录')
      return
    }
    setLoading(true)
    try {
      const res: ApiResponse<any[]> = await getCheckinList(activeType)
      if (res.code === 200) {
        setList(res.data)
      } else {
        message.error(res.msg)
      }
    } catch (err: any) {
      if (err.message.includes('后端') || err.message.includes('Network')) {
        message.error('请先启动后端python app.py')
      } else {
        message.error('获取打卡记录失败')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [activeType])

  return (
    <div>
      <Navbar />

      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarOutlined style={{ color: '#6366F1', fontSize: '28px' }} />
            打卡记录
          </h1>

          <div style={{ marginBottom: '24px' }}>
            <div className="tag-group">
              {['全部打卡', '仅电影', '仅书籍'].map((item) => (
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

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin description="加载中..." size="large" />
            </div>
          )}

          {!loading && list.length === 0 && (
            <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Empty description="暂无打卡记录" />
            </Card>
          )}

          {!loading && list.length > 0 && (
            <List
              dataSource={list}
              renderItem={(item, index) => (
                <Card
                  key={index}
                  variant="borderless"
                  style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Tag style={{ borderRadius: '4px', backgroundColor: '#EEF2FF', color: '#6366F1', borderColor: '#6366F1' }}>{item.title}</Tag>
                          <Tag color="cyan" style={{ borderRadius: '4px' }}>{item.type}</Tag>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#999', fontSize: '13px' }}>
                          <ClockCircleOutlined />
                          {new Date(item.check_in_date).toLocaleString()}
                        </div>
                      </div>
                      <p style={{ color: '#666', lineHeight: '1.7', fontSize: '15px' }}>{item.remark}</p>
                    </div>
                  </div>
                </Card>
              )}
              bordered={false}
              split={false}
              className="space-y-4"
            />
          )}
        </div>
      </div>
    </div>
  )
}
