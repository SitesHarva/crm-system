import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { checkAuth } from './store/authSlice';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Orders from './pages/Orders';
import AdminRoute from './components/AdminRoute';
import AdminPanel from './pages/AdminPanel';
import SetPassword from './pages/SetPassword';
import type { AppDispatch, RootState } from './store';

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    if (loading) return <div>Loading...</div>;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/orders" />} />
                <Route path="/set-password" element={<SetPassword />} />
                <Route path="/orders" element={<PrivateRoute />}>
                    <Route index element={<Orders />} />
                </Route>
                <Route path="/admin" element={<AdminRoute />}>
                    <Route index element={<AdminPanel />} />
                </Route>
                <Route path="*" element={<Navigate to="/orders" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;