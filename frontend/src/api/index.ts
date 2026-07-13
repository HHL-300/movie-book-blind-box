import request from '../utils/request'

// 素材类型定义
export interface MediaItem {
  id: number
  title: string
  type: string
  mood_tag: string
  cover: string
  intro: string
}

// 随机全量盲盒
export const getRandomAll = () => {
  return request.get<MediaItem>('/random-all')
}

// 按情绪标签抽取盲盒
export const getRandomByMood = (mood: string) => {
  return request.get<MediaItem>(`/random-mood?mood=${mood}`)
}

// 新增收藏
export const addFavorite = (userId: number, mediaId: number) => {
  return request.post('/favorite/add', { user_id: userId, media_id: mediaId })
}

// 取消收藏
export const delFavorite = (userId: number, mediaId: number) => {
  return request.post('/favorite/del', { user_id: userId, media_id: mediaId })
}

// 查询用户收藏列表
export const getFavoriteList = (userId: number) => {
  return request.get<MediaItem[]>(`/favorite/list/${userId}`)
}

// 新增打卡
export const addCheckin = (userId: number, mediaId: number, content: string) => {
  return request.post('/checkin/add', { user_id: userId, media_id: mediaId, content })
}

// 查询用户打卡记录
export const getCheckinList = (userId: number) => {
  return request.get<any[]>(`/checkin/list/${userId}`)
}