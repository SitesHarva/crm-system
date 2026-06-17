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

interface Stats {
    total: number;
    byStatus: Record<string, number>;
}

const AdminPanel = () => {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
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
        try {
            await api.post('/users', newManager);
            setNewManager({ name: '', surname: '', email: '' });
            fetchManagers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create manager');
        }
    };

    const generateActivationLink = async (id: string) => {
        try {
            const res = await api.post(`/users/${id}/activation-link`, { frontendBaseUrl: window.location.origin });
            await navigator.clipboard.writeText(res.data.link);
            alert('Activation link copied to clipboard');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to generate activation link');
        }
    };

    const generateRecoveryLink = async (id: string) => {
        try {
            const res = await api.post(`/users/${id}/recovery-link`, { frontendBaseUrl: window.location.origin });
            await navigator.clipboard.writeText(res.data.link);
            alert('Recovery link copied to clipboard');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to generate recovery link');
        }
    };

    const toggleBan = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/users/${id}/status`, { is_active: !currentStatus });
            fetchManagers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const getStatusClass = (status: string) => {
        const map: Record<string, string> = {
            'null': 'status-badge-null',
            'New': 'status-badge-new',
            'In work': 'status-badge-inwork',
            'Aggre': 'status-badge-aggre',
            'Disaggre': 'status-badge-disaggre',
            'Dubbing': 'status-badge-dubbing',
        };
        return map[status] || 'status-badge-total';
    };

    return (
        <div className="admin-container">
            <h1>Admin Panel</h1>

            <div className="admin-actions">
                <h3>Create Manager</h3>
                <div className="flex-row">
                    <input
                        placeholder="Name"
                        value={newManager.name}
                        onChange={e => setNewManager({ ...newManager, name: e.target.value })}
                    />
                    <input
                        placeholder="Surname"
                        value={newManager.surname}
                        onChange={e => setNewManager({ ...newManager, surname: e.target.value })}
                    />
                    <input
                        placeholder="Email"
                        value={newManager.email}
                        onChange={e => setNewManager({ ...newManager, email: e.target.value })}
                    />
                    <button onClick={createManager}>Create</button>
                </div>
            </div>

            <h3>Global Statistics</h3>
            {stats && (
                <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                    <table className="stats-table">
                        <thead>
                        <tr>
                            <th>Status</th>
                            <th>Count</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                <span className="status-badge status-badge-total">Total</span>
                            </td>
                            <td><strong>{stats.total}</strong></td>
                        </tr>
                        {Object.entries(stats.byStatus).map(([status, count]) => (
                            <tr key={status}>
                                <td>
                                        <span className={`status-badge ${getStatusClass(status)}`}>
                                            {status === 'null' ? 'No Status' : status}
                                        </span>
                                </td>
                                <td>{count}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <h3>Managers</h3>
            <div className="table-wrapper">
                <table>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {managers.map(m => (
                        <tr key={m._id}>
                            <td>{m.name} {m.surname}</td>
                            <td>{m.email}</td>
                            <td>
                                    <span className={`active-badge ${m.is_active ? 'active-badge-true' : 'active-badge-false'}`}>
                                        {m.is_active ? 'Active' : 'Inactive'}
                                    </span>
                            </td>
                            <td>
                                {!m.is_active && (
                                    <button onClick={() => generateActivationLink(m._id)}>Activate</button>
                                )}
                                <button onClick={() => generateRecoveryLink(m._id)}>Recovery</button>
                                <button
                                    className={m.is_active ? 'danger' : 'success'}
                                    onClick={() => toggleBan(m._id, m.is_active)}
                                >
                                    {m.is_active ? 'Ban' : 'Unban'}
                                </button>
                                <button className="secondary" onClick={async () => {
                                    try {
                                        const res = await api.get(`/users/${m._id}/stats`);
                                        alert(`Stats for ${m.name} ${m.surname}:\n${JSON.stringify(res.data, null, 2)}`);
                                    } catch (error: any) {
                                        alert('Failed to fetch stats');
                                    }
                                }}>Stats</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
};

export default AdminPanel;