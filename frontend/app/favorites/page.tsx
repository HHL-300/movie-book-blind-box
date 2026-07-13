'use client'
import { useEffect, useState } from 'react'
import { getFavoriteList, delFavorite, type MediaItem } from '../../src/api'

const userId = 1

export default function FavoritesPage() {
  const [list, setList] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await getFavoriteList(userId)
      setList(res as unknown as MediaItem[])
    } catch (err) {
      console.error('获取收藏列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDel = async (mediaId: number) => {
    if (!confirm('确定取消收藏？')) return
    try {
      await delFavorite(userId, mediaId)
      alert('已取消收藏')
      fetchList()
    } catch (err) {
      alert('操作失败')
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">我的收藏</h1>

      {loading && <p className="text-gray-500">加载中...</p>}

      {!loading && list.length === 0 && (
        <p className="text-gray-500 text-center py-12">暂无收藏内容</p>
      )}

      <div className="space-y-4">
        {list.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
            <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
              封面
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-2">
                {item.type} · {item.mood_tag}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.intro}</p>
              <button
                onClick={() => handleDel(item.id)}
                className="text-sm text-red-500 hover:text-red-600"
              >
                取消收藏
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}