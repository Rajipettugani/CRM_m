import { getUserFromToken, clearToken } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

export default function Header(){
  const nav = useNavigate()
  const user = getUserFromToken()
  return (
    <div className="w-full bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-lg">SkyCRM</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.name} · <span className="font-medium">{user?.roleName}</span></span>
          <button
            onClick={() => { clearToken(); nav('/login'); }}
            className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm"
          >Logout</button>
        </div>
      </div>
    </div>
  )
}
