import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type {RootState} from "../store";

const PrivateRoute = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;