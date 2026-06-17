import { useEffect, useState } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';

interface Manager {
    _id: string;
    name: string;
    surname: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

const AdminPanel = () => {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [newManager, setNewManager] = useState({ name: '', surname: '', email: '' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchManagers = async () => {
        const res = await api.get(`/users?page=${page}&limit=10`);
        setManagers(res.data.data);
        setTotalPages(res.data.totalPages);
    };

    const fetchStats = async () => {
        const res = await api.get('/orders/stats');
        setStats(res.data);
    };

    useEffect(() => {
        fetchManagers();
        fetchStats();
    }, [page]);

    const createManager = async () => {
        await api.post('/users', newManager);
        setNewManager({ name: '', surname: '', email: '' });
        fetchManagers();
    };

    const generateActivationLink = async (id: string) => {
        const res = await api.post(`/users/${id}/activation-link`, { frontendBaseUrl: window.location.origin });
        await navigator.clipboard.writeText(res.data.link);
        alert('Activation link copied');
    };

    const generateRecoveryLink = async (id: string) => {
        const res = await api.post(`/users/${id}/recovery-link`, { frontendBaseUrl: window.location.origin });
        await navigator.clipboard.writeText(res.data.link);
        alert('Recovery link copied');
    };

    const toggleBan = async (id: string, currentStatus: boolean) => {
        await api.patch(`/users/${id}/status`, { is_active: !currentStatus });
        fetchManagers();
    };

    return (
        <div>
            <h1>Admin Panel</h1>
            <h2>Create Manager</h2>
            <input placeholder="Name" value={newManager.name} onChange={e => setNewManager({...newManager, name: e.target.value})} />
            <input placeholder="Surname" value={newManager.surname} onChange={e => setNewManager({...newManager, surname: e.target.value})} />
            <input placeholder="Email" value={newManager.email} onChange={e => setNewManager({...newManager, email: e.target.value})} />
            <button onClick={createManager}>Create</button>

            <h2>Global Statistics</h2>
            {stats && <pre>{JSON.stringify(stats, null, 2)}</pre>}

            <h2>Managers</h2>
            <table border={1}>
                <thead>
                <tr><th>Name</th><th>Email</th><th>Active</th><th>Actions</th></tr>
                </thead>
                <tbody>
                {managers.map(m => (
                    <tr key={m._id}>
                        <td>{m.name} {m.surname}</td>
                        <td>{m.email}</td>
                        <td>{m.is_active ? 'Yes' : 'No'}</td>
                        <td>
                            {!m.is_active && <button onClick={() => generateActivationLink(m._id)}>Activate</button>}
                            <button onClick={() => generateRecoveryLink(m._id)}>Recovery</button>
                            <button onClick={() => toggleBan(m._id, m.is_active)}>{m.is_active ? 'Ban' : 'Unban'}</button>
                            <button onClick={async () => {
                                const res = await api.get(`/users/${m._id}/stats`);
                                alert(`Stats: ${JSON.stringify(res.data)}`);
                            }}>Stats</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
};

export default AdminPanel;