import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type {RootState} from "../store";

const AdminRoute = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    return isAuthenticated && user?.role === 'admin' ? <Outlet /> : <Navigate to="/orders" />;
};

export default AdminRoute;