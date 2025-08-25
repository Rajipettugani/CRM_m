import axios from 'axios'
import { getToken, clearToken } from '../utils/auth'

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
})

api.interceptors.request.use(cfg => {
  const t = getToken()
  if(t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if(err.response && err.response.status === 401){
      clearToken()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
