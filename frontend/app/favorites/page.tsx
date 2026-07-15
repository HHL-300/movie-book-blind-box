'use client'
import { useEffect, useState } from 'react'
import { Card, Button, Modal, Tag, message, Spin, Empty } from 'antd'
import { DeleteOutlined, StarOutlined, CalendarOutlined } from '@ant-design/icons'
import { getFavoriteList, delFavorite, addCheckin, type MediaItem, type ApiResponse } from '../../src/api'
import Navbar from '../../src/components/Navbar'
import CoverImage from '../../src/components/CoverImage'

export default function FavoritesPage() {
  const [list, setList] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [checkinModalOpen, setCheckinModalOpen] = useState(false)
  const [checkinContent, setCheckinContent] = useState('')
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null)
  const [activeType, setActiveType] = useState<string>('全部收藏')

  const fetchList = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('请先登录')
      return
    }
    setLoading(true)
    try {
      const res: ApiResponse<MediaItem[]> = await getFavoriteList(activeType)
      if (res.code === 200) {
        setList(res.data)
      } else {
        message.error(res.msg)
      }
    } catch (err: any) {
      if (err.message.includes('后端') || err.message.includes('Network')) {
        message.error('请先启动后端python app.py')
      } else {
        message.error('获取收藏列表失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDel = async (mediaId: number) => {
    Modal.confirm({
      title: '确认取消收藏',
      content: '确定要取消收藏这个作品吗？',
      okText: '确认取消',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await delFavorite(mediaId)
          if (res.code === 200) {
            message.success(res.msg)
            fetchList()
          } else {
            message.error(res.msg)
          }
        } catch (err: any) {
          if (err.message.includes('后端') || err.message.includes('Network')) {
            message.error('请先启动后端python app.py')
          } else {
            message.error('操作失败')
          }
        }
      }
    })
  }

  const handleCheckin = (item: MediaItem) => {
    setCurrentMedia(item)
    setCheckinContent('')
    setCheckinModalOpen(true)
  }

  const handleCheckinSubmit = async () => {
    if (!currentMedia || !checkinContent.trim()) {
      message.error('请填写打卡心得')
      return
    }

    setCheckinLoading(true)
    try {
      const res = await addCheckin(currentMedia.id, checkinContent.trim())
      if (res.code === 200) {
        message.success(res.msg)
        setCheckinModalOpen(false)
        setCheckinContent('')
        setCurrentMedia(null)
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

  useEffect(() => {
    fetchList()
  }, [activeType])

  return (
    <div>
      <Navbar />
      
      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StarOutlined style={{ color: '#6366F1', fontSize: '28px' }} />
            我的收藏
          </h1>

          <div style={{ marginBottom: '24px' }}>
            <div className="tag-group">
              {['全部收藏', '仅电影', '仅书籍'].map((item) => (
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
              <Empty description="暂无收藏内容" />
            </Card>
          )}

          <div className="space-y-4">
            {list.map(item => (
              <Card
                key={item.id}
                hoverable
                variant="borderless"
                style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div className="w-24 h-32 flex-shrink-0">
                    <CoverImage
                      src={item.cover}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 className="font-bold mb-2 text-lg" style={{ fontSize: '18px' }}>{item.title}</h3>
                    <div style={{ marginBottom: '10px' }}>
                      <Tag style={{ marginRight: '8px', borderRadius: '4px', backgroundColor: '#EEF2FF', color: '#6366F1', borderColor: '#6366F1' }}>{item.type}</Tag>
                      <Tag color="cyan" style={{ borderRadius: '4px' }}>{item.mood_tag}</Tag>
                    </div>
                    <p className="text-gray-600 line-clamp-2 mb-4" style={{ lineHeight: '1.7', fontSize: '14px' }}>{item.intro}</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Button
                        type="primary"
                        onClick={() => handleCheckin(item)}
                        icon={<CalendarOutlined />}
                        style={{ borderRadius: '6px' }}
                      >
                        打卡
                      </Button>
                      <Button
                        type="text"
                        danger
                        onClick={() => handleDel(item.id)}
                        icon={<DeleteOutlined />}
                      >
                        取消收藏
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Modal
        title="打卡"
        open={checkinModalOpen}
        onCancel={() => {
          setCheckinModalOpen(false)
          setCurrentMedia(null)
        }}
        onOk={handleCheckinSubmit}
        okText="提交"
        cancelText="取消"
        confirmLoading={checkinLoading}
        style={{ borderRadius: '12px' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#666', fontSize: '14px', marginBottom: '8px' }}>作品名称</label>
          <div style={{ padding: '10px 14px', background: '#f5f7fa', borderRadius: '8px', color: '#333', fontSize: '15px' }}>
            {currentMedia?.title}
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
