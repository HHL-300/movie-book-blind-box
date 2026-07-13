'use client'
import { useEffect, useState } from 'react'
import { getCheckinList, addCheckin } from '../../src/api'

const userId = 1

export default function CheckinPage() {
  const [list, setList] = useState<any[]>([])
  const [mediaId, setMediaId] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await getCheckinList(userId)
      setList(res as unknown as any[])
    } catch (err) {
      console.error('获取打卡记录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!mediaId || !content) {
      alert('请填写完整信息')
      return
    }
    try {
      await addCheckin(userId, Number(mediaId), content)
      alert('打卡成功')
      setMediaId('')
      setContent('')
      fetchList()
    } catch (err) {
      alert('打卡失败')
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">打卡记录</h1>

      {/* 新增打卡表单 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-medium mb-3">新增打卡</h3>
        <div className="mb-3">
          <label className="text-sm text-gray-600 block mb-1">素材ID</label>
          <input
            type="number"
            value={mediaId}
            onChange={e => setMediaId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            placeholder="请输入素材ID"
          />
        </div>
        <div className="mb-3">
          <label className="text-sm text-gray-600 block mb-1">打卡心得</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            rows={3}
            placeholder="写下你的观看心得..."
          />
        </div>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          提交打卡
        </button>
      </div>

      {/* 打卡列表 */}
      {loading && <p className="text-gray-500">加载中...</p>}

      {!loading && list.length === 0 && (
        <p className="text-gray-500 text-center py-12">暂无打卡记录</p>
      )}

      <div className="space-y-4">
        {list.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">素材ID：{item.media_id}</span>
              <span className="text-sm text-gray-400">
                {new Date(item.create_time).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-700 text-sm">{item.content}</p>
          </div>
        ))}
      </div>
    </main>
  )
}