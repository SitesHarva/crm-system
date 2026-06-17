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
        <header className="header">
            <div className="header-left">
                <span className="logo">📋 CRM</span>
            </div>
            <div className="header-right">
                <span className="role-badge">
                    {user?.role === 'admin' ? 'Admin' : 'Manager'}: {user?.name} {user?.surname}
                </span>
                {user?.role === 'admin' && (
                    <button onClick={() => navigate('/admin')}>Admin Panel</button>
                )}
                <button onClick={handleLogout}>Logout</button>
            </div>
        </header>
    );
};

export default Header;