import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:5000/api'

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

let isServerChecked = false
let isServerOnline = false

const checkServerConnection = async (): Promise<boolean> => {
  if (isServerChecked) {
    return isServerOnline
  }
  try {
    await axios.get(`${BASE_URL}/hello`, { timeout: 3000 })
    isServerOnline = true
  } catch {
    isServerOnline = false
  }
  isServerChecked = true
  return isServerOnline
}

request.interceptors.request.use(
  async (config) => {
    await checkServerConnection()
    if (!isServerOnline) {
      alert('后端服务未启动，请先在终端执行：python app.py')
      return Promise.reject(new Error('后端服务未启动'))
    }
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => response.data,
  error => {
    let errorMsg = '请求失败'
    
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          errorMsg = data?.msg || '请求参数错误'
          break
        case 401:
          errorMsg = data?.msg || '未登录或登录已过期'
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          break
        case 404:
          errorMsg = data?.msg || '请求的资源不存在'
          break
        case 500:
          errorMsg = data?.msg || '服务器内部错误'
          break
        default:
          errorMsg = data?.msg || `请求失败，状态码：${status}`
      }
    } else if (error.request) {
      errorMsg = '请先启动后端服务（python app.py），并确保运行在 5000 端口'
    } else {
      errorMsg = `请求配置错误：${error.message}`
    }

    console.error('请求错误:', error)
    return Promise.reject(new Error(errorMsg))
  }
)

export default request