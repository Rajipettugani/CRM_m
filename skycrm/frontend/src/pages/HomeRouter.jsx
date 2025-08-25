import { Routes, Route, Navigate } from 'react-router-dom'
import { getUserFromToken } from '../utils/auth'
import Header from '../components/Header'
import AdminDashboard from './dashboards/AdminDashboard.jsx'
import ManagerDashboard from './dashboards/ManagerDashboard.jsx'
import TeamLeadDashboard from './dashboards/TeamLeadDashboard.jsx'
import SalesRepDashboard from './dashboards/SalesRepDashboard.jsx'
import LeadDetailPage from './LeadDetailPage.jsx'

export default function HomeRouter(){
  const user = getUserFromToken()
  const role = user?.roleName
  const base = role === 'Admin' ? '/admin' : role === 'Sales Head' ? '/manager' : role === 'Sales Team Lead' ? '/teamlead' : '/rep'
  return (
    <div>
      <Header/>
      <div className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to={base} replace/>} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/manager" element={<ManagerDashboard/>} />
          <Route path="/teamlead" element={<TeamLeadDashboard/>} />
          <Route path="/rep" element={<SalesRepDashboard/>} />
          <Route path="/leads/:id" element={<LeadDetailPage/>} />
        </Routes>
      </div>
    </div>
  )
}
