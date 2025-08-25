import { useState } from 'react'
import api from '../services/api'
import { setToken } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

export default function LoginPage(){
  const nav = useNavigate()
  const [email,setEmail] = useState('admin@test.com')
  const [password,setPassword] = useState('password@123')
  const [err,setErr] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    try{
      const { data } = await api.post('/auth/login',{ email, password })
      setToken(data.token)
      if(email === 'salesmanager@test.com') {
        nav('/manager')
      } else {
        nav('/')
      }
    }catch(e){
      setErr(e.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl shadow w-[360px] space-y-3">
        <h1 className="text-xl font-semibold text-center">SkyCRM Login</h1>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input className="w-full border rounded-lg px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input type="password" className="w-full border rounded-lg px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button className="w-full py-2 bg-gray-900 text-white rounded-lg">Login</button>
      </form>
    </div>
  )
}
