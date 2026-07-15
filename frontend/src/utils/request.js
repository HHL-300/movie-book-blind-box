/**
 * axios 请求工具封装
 * 统一处理请求、响应拦截器
 * 固定后端基础地址 http://127.0.0.1:5000/api
 */

import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  // 固定后端基础地址
  baseURL: 'http://127.0.0.1:5000/api',
  // 请求超时时间
  timeout: 10000,
  // 请求头设置
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 * 在请求发送前做处理，如添加 token
 */
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      // 添加 Authorization 请求头
      config.headers.Authorization = `Bearer ${token}`
    }
    // 打印请求日志（开发调试用）
    console.log(`[Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    // 请求错误处理
    console.error('[Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 在响应返回后做处理，如统一错误处理
 */
request.interceptors.response.use(
  (response) => {
    // 直接返回 response.data，业务代码无需再取一层 data
    const res = response.data
    console.log(`[Response] ${response.config.method.toUpperCase()} ${response.config.url}`, res)
    return res
  },
  (error) => {
    // 网络错误或服务器错误处理
    let errorMsg = '网络请求失败，请检查网络连接'
    
    if (error.response) {
      // HTTP 状态码错误
      const { status, data } = error.response
      console.error(`[Response Error] Status: ${status}`, data)
      
      switch (status) {
        case 400:
          errorMsg = data?.msg || '请求参数错误'
          break
        case 401:
          errorMsg = data?.msg || '未登录或登录已过期'
          // 清除本地存储的 token 和用户信息
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          // 跳转到登录页（如果需要）
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
      // 请求已发送但未收到响应
      console.error('[Response Error] No response received')
      errorMsg = '请求超时，请稍后重试'
    } else {
      // 请求配置错误
      console.error('[Response Error]', error.message)
      errorMsg = `请求配置错误：${error.message}`
    }

    // 弹出错误提示（使用原生 alert，如需自定义组件可替换）
    alert(errorMsg)
    
    // 返回错误 Promise，业务代码可继续处理
    return Promise.reject(error)
  }
)

/**
 * 封装常用请求方法
 */

// GET 请求
export const get = (url, params = {}) => {
  return request.get(url, { params })
}

// POST 请求
export const post = (url, data = {}) => {
  return request.post(url, data)
}

// PUT 请求
export const put = (url, data = {}) => {
  return request.put(url, data)
}

// DELETE 请求
export const del = (url, data = {}) => {
  return request.delete(url, { data })
}

// 默认导出 axios 实例
export default request
