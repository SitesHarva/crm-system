import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const SetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('No activation token provided');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        try {
            await api.post('/auth/set-password', { token, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to set password');
        }
    };

    if (error && !token) {
        return <div className="auth-container" style={{ textAlign: 'center' }}>Invalid or missing token</div>;
    }

    return (
        <div className="auth-container">
            <h2>Set your password</h2>
            {success ? (
                <div style={{ color: 'green' }}>Password set successfully! Redirecting to login...</div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
                    <input
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />
                    <button type="submit">Set Password</button>
                </form>
            )}
        </div>
    );
};

export default SetPassword;