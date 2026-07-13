'use client'
import { useState } from 'react'
import { getRandomAll, getRandomByMood, addFavorite, type MediaItem } from '../src/api'
const moodList = ['治愈', '解压', '励志', '悬疑', '温暖', '热血']
const userId = 1

export default function Home() {
  const [activeMood, setActiveMood] = useState<string>('')
  const [result, setResult] = useState<MediaItem | null>(null)
  const [loading, setLoading] = useState(false)

  // 抽取盲盒
  const handleDraw = async () => {
    setLoading(true)
    try {
      let res
      if (activeMood) {
        res = await getRandomByMood(activeMood)
      } else {
        res = await getRandomAll()
      }
      setResult(res as unknown as MediaItem)
    } catch (err) {
      alert('抽取失败，请检查后端服务')
    } finally {
      setLoading(false)
    }
  }

  // 收藏
  const handleFavorite = async () => {
    if (!result) return
    try {
      await addFavorite(userId, result.id)
      alert('收藏成功')
    } catch (err) {
      alert('收藏失败')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">影视书籍盲盒</h1>

      {/* 情绪标签选择 */}
      <div className="mb-8">
        <p className="text-gray-600 mb-3">选择情绪标签（可选）：</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveMood('')}
            className={`px-4 py-2 rounded-full border transition ${!activeMood ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
          >
            全部
          </button>
          {moodList.map(item => (
            <button
              key={item}
              onClick={() => setActiveMood(item)}
              className={`px-4 py-2 rounded-full border transition ${activeMood === item ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 抽取按钮 */}
      <div className="text-center mb-8">
        <button
          onClick={handleDraw}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? '抽取中...' : '开启盲盒'}
        </button>
      </div>

      {/* 抽取结果 */}
      {result && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex gap-4">
            <div className="w-32 h-44 bg-gray-200 rounded flex items-center justify-center text-gray-400">
              封面
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">{result.title}</h2>
              <p className="text-sm text-gray-500 mb-2">
                类型：{result.type} · 标签：{result.mood_tag}
              </p>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {result.intro}
              </p>
              <button
                onClick={handleFavorite}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
              >
                收藏
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}