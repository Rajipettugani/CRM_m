import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'

export default function LeadDetailPage(){
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['lead',id], queryFn: async () => (await api.get(`/leads/${id}`)).data })
  const { data: statuses } = useQuery({ queryKey:['statuses'], queryFn: async() => (await api.get('/statuses')).data })

  const changeStatus = useMutation({
    mutationFn: async (payload) => (await api.post(`/leads/${id}/status`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead',id] });
      qc.invalidateQueries({ queryKey: ['leads'] }); // Refresh leads table in dashboard
    }
  })

  const [editForm, setEditForm] = useState({
    name: data?.name || '',
    phone: data?.phone || '',
    email: data?.email || '',
    city: data?.city || '',
    source: data?.source || ''
  });
  useEffect(() => {
    setEditForm({
      name: data?.name || '',
      phone: data?.phone || '',
      email: data?.email || '',
      city: data?.city || '',
      source: data?.source || ''
    });
  }, [data]);
  const updateLead = useMutation({
    mutationFn: async (payload) => (await api.put(`/leads/${id}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead',id] });
      qc.invalidateQueries({ queryKey: ['leads'] });
    }
  });
  if(!data) return <div className="p-4">Loading...</div>
  return (
    <div className="space-y-4">
      <Card title={`Lead: ${data.name}`}>
        <div className="space-y-2">
          <div>
            <label>Name: </label>
            <input className="border rounded px-2 py-1" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} />
          </div>
          <div>
            <label>Phone: </label>
            <input className="border rounded px-2 py-1" value={editForm.phone} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} />
          </div>
          <div>
            <label>Email: </label>
            <input className="border rounded px-2 py-1" value={editForm.email} onChange={e=>setEditForm(f=>({...f,email:e.target.value}))} />
          </div>
          <div>
            <label>City: </label>
            <input className="border rounded px-2 py-1" value={editForm.city} onChange={e=>setEditForm(f=>({...f,city:e.target.value}))} />
          </div>
          <div>
            <label>Source: </label>
            <input className="border rounded px-2 py-1" value={editForm.source} onChange={e=>setEditForm(f=>({...f,source:e.target.value}))} />
          </div>
          <div>Status: <StatusBadge name={data.status?.name}/></div>
          <div className="flex gap-2 mt-2">
            <select className="border rounded px-2 py-1" onChange={(e)=>changeStatus.mutate({ statusName: e.target.value })}>
              <option>Change status...</option>
              {statuses?.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
            <button className="ml-4 px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>{
              updateLead.mutate(editForm, {
                onSuccess: () => {
                  qc.invalidateQueries({ queryKey: ['leads'] });
                  navigate('/manager');
                },
                onError: () => {
                  // Always navigate to manager even if update fails
                  navigate('/manager');
                }
              });
            }}>Done</button>
          </div>
        </div>
      </Card>

      <Card title="History">
        <ul className="text-sm space-y-1">
          {data.history?.slice().reverse().map((h,i)=>(
            <li key={i}>→ {new Date(h.at).toLocaleString()} set to <b>{h.status?.name || h.status}</b></li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
