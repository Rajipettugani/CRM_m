import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../services/api'
import Card from '../../components/Card'
import AddTeamModal from '../../components/AddTeamModal'
import LeadTable from '../../components/LeadTable'

export default function ManagerDashboard() {
  const qc = useQueryClient();
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', source: '' });
  const [filter, setFilter] = useState('');

  const teams = useQuery({ queryKey:['teams'], queryFn: async()=> (await api.get('/team')).data });
  const leadsQuery = useQuery({
    queryKey: ['leads', filter],
    queryFn: async () => {
      // Pass status name for filtering
      const params = filter ? { status: filter } : {};
      const { data } = await api.get('/leads', { params });
      return data;
    }
  });
  const statusesQuery = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => (await api.get('/statuses')).data
  });
  const [successMsg, setSuccessMsg] = useState('');
  const createLead = useMutation({
    mutationFn: async (payload) => (await api.post('/leads', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      setForm({ name: '', email: '', phone: '', city: '' });
      setSuccessMsg('Lead added successfully!');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
  });
  const handleTeamAdded = () => teams.refetch();
  const onOpen = (lead) => window.location.href = `/leads/${lead._id}`;
  const deleteLead = useMutation({
    mutationFn: async (id) => await api.delete(`/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] })
  });
  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this lead?')) {
      deleteLead.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="My Teams" actions={<button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={()=>setShowAddTeam(true)}>Add Team</button>}>
        <ul className="text-sm space-y-1">
          {teams.data?.map(t => <li key={t._id}>{t.name} — Lead: {t.lead?.name||'-'} · Members: {t.members?.length||0}</li>)}
        </ul>
      </Card>
      <Card title="All Leads">
        {/* Filter + Refresh */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <select
            onChange={e => setFilter(e.target.value)}
            defaultValue=""
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          >
            <option value="">All Statuses</option>
            {statusesQuery.data?.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
          <button
            style={{
              padding: '8px 14px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
            onClick={() => qc.invalidateQueries({ queryKey: ['leads'] })}
          >
            Refresh
          </button>
        </div>

        {/* Add Lead Form */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 20,
            background: 'white',
            padding: 16,
            borderRadius: 8,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          {successMsg && <div style={{color:'#10b981',fontWeight:'bold',alignSelf:'center'}}>{successMsg}</div>}
          <input
            placeholder="Name"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
          />
          <input
            placeholder="City"
            value={form.city}
            onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
          />
          <input
            placeholder="Source"
            value={form.source}
            onChange={e => setForm(prev => ({ ...prev, source: e.target.value }))}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
          />

          <button
            style={{
              padding: '8px 14px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
            onClick={() => createLead.mutate(form)}
          >
            Add Lead
          </button>

          <button
            style={{
              padding: '8px 14px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
            onClick={() => alert('Assign Lead feature coming soon!')}
          >
            Assign Lead
          </button>
        </div>

        {/* Table */}
        <div
          style={{
            background: 'white',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          {leadsQuery.isLoading
            ? <p>Loading...</p>
            : <LeadTable leads={leadsQuery.data} onOpen={onOpen} onDelete={handleDelete} />}
        </div>
      </Card>
      <AddTeamModal open={showAddTeam} onClose={()=>setShowAddTeam(false)} onTeamAdded={handleTeamAdded} />
    </div>
  )
}

