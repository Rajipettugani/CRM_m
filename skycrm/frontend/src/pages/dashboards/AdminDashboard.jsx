import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import Card from '../../components/Card'
import StatusBadge from '../../components/StatusBadge'
import { Link } from 'react-router-dom'

export default function AdminDashboard(){
  const users = useQuery({ queryKey:['users'], queryFn: async()=> (await api.get('/auth/users')).data })
  const leads = useQuery({ queryKey:['leads'], queryFn: async()=> (await api.get('/leads')).data })
  const teams = useQuery({ queryKey:['teams'], queryFn: async()=> (await api.get('/team')).data })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Users">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Name</th><th>Email</th><th>Role</th></tr></thead>
          <tbody>{users.data?.map(u => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.roleName}</td></tr>)}</tbody>
        </table>
      </Card>
      <Card title="Teams">
        <ul className="text-sm space-y-1">
          {teams.data?.map(t => <li key={t._id}>{t.name} — Lead: {t.lead?.name||'-'} · Members: {t.members?.length||0}</li>)}
        </ul>
      </Card>
      <Card title="All Leads">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Name</th><th>Phone</th><th>Status</th></tr></thead>
          <tbody>
            {leads.data?.map(l => (
              <tr key={l._id}>
                <td><Link className="text-blue-600" to={`/leads/${l._id}`}>{l.name}</Link></td>
                <td>{l.phone}</td>
                <td><StatusBadge name={l.status?.name}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
