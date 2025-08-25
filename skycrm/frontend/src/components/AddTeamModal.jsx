import { useState, useEffect } from 'react';
import api from '../services/api';

function AddTeamModal({ open, onClose, onTeamAdded }) {
  const [name, setName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); // array of lead IDs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    if (open) {
      api.get('/leads').then(res => setLeads(res.data)).catch(() => setLeads([]));
    }
  }, [open]);

  if (!open) return null;

  const handleMemberToggle = (id) => {
    setSelectedMembers(members => {
      return members.includes(id)
        ? members.filter(m => m !== id)
        : [...members, id];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Creating team with members:', selectedMembers);
    try {
      await api.post('/team', { name, memberIds: selectedMembers });
      setName('');
      setSelectedMembers([]);
      onTeamAdded && onTeamAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Add Team</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Team Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select Team Members</label>
            <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
              {leads.length === 0 && <div className="text-gray-500 text-sm">No leads found.</div>}
              {leads.map(lead => (
                <label key={lead._id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(lead._id)}
                    onChange={() => handleMemberToggle(lead._id)}
                  />
                  <span className="text-sm">{lead.name} ({lead.email})</span>
                </label>
              ))}
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-gray-200">Cancel</button>
            <button type="submit" disabled={loading} className="px-3 py-1 rounded bg-blue-600 text-white">{loading ? 'Adding...' : 'Add Team'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTeamModal;
// ...existing code...
