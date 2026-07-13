import request from '../utils/request'

export interface MediaItem {
  id: number
  title: string
  type: string
  mood_tag: string
  cover: string
  intro: string
}

export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

export interface LoginResult {
  token: string
  user_id: number
  username: string
  avatar: string
}

export const register = async (username: string, password: string, avatar: string): Promise<ApiResponse<LoginResult>> => {
  return request.post('/register', { username, password, avatar })
}

export const login = async (username: string, password: string): Promise<ApiResponse<LoginResult>> => {
  return request.post('/login', { username, password })
}

export const getRandomAll = async (): Promise<ApiResponse<MediaItem>> => {
  return request.get('/random-all')
}

export const getRandomByMood = async (mood: string): Promise<ApiResponse<MediaItem>> => {
  return request.get(`/random-mood?mood=${mood}`)
}

export const addFavorite = async (mediaId: number): Promise<ApiResponse> => {
  return request.post('/favorite/add', { media_id: mediaId })
}

export const delFavorite = async (mediaId: number): Promise<ApiResponse> => {
  return request.post('/favorite/del', { media_id: mediaId })
}

export const getFavoriteList = async (): Promise<ApiResponse<MediaItem[]>> => {
  return request.get('/favorite/list')
}

export const addCheckin = async (mediaId: number, content: string): Promise<ApiResponse> => {
  const today = new Date().toISOString().split('T')[0]
  return request.post('/checkin/add', { media_id: mediaId, checkin_date: today, remark: content })
}

export const getCheckinList = async (): Promise<ApiResponse<any[]>> => {
  return request.get('/checkin/list')
}
