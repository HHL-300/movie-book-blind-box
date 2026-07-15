'use client'
import { useEffect, useState } from 'react'
import { Card, Tag, message, Spin, Empty, List } from 'antd'
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons'
import { getCheckinList, type ApiResponse } from '../../src/api'
import Navbar from '../../src/components/Navbar'

export default function CheckinPage() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchList = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('请先登录')
      return
    }
    setLoading(true)
    try {
      const res: ApiResponse<any[]> = await getCheckinList()
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
  }, [])

  return (
    <div>
      <Navbar />

      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarOutlined style={{ color: '#1677ff', fontSize: '28px' }} />
            打卡记录
          </h1>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <Tag color="blue" style={{ borderRadius: '4px' }}>{item.title}</Tag>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#999', fontSize: '13px' }}>
                      <ClockCircleOutlined />
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                  <p style={{ color: '#666', lineHeight: '1.7', fontSize: '15px' }}>{item.remark}</p>
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
