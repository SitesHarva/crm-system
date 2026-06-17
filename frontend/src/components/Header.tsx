import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import type { AppDispatch, RootState } from '../store';

const Header = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#f0f0f0' }}>
            <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📋 CRM</span>
            </div>
            <div>
                <span>{user?.role === 'admin' ? 'Admin' : 'Manager'}: {user?.name} {user?.surname}</span>
                {user?.role === 'admin' && (
                    <button onClick={() => navigate('/admin')} style={{ marginLeft: 10 }}>Admin Panel</button>
                )}
                <button onClick={handleLogout} style={{ marginLeft: 10 }}>Logout</button>
            </div>
        </header>
    );
};

export default Header;