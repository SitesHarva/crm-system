import {useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Orders from './pages/Orders';
import AdminRoute from './components/AdminRoute';
import AdminPanel from './pages/AdminPanel';
import SetPassword from './pages/SetPassword';
import type { RootState } from './store';

function App() {
    const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

    // const dispatch = useDispatch<AppDispatch>();
    // useEffect(() => {
    //     dispatch(checkAuth());
    // }, [dispatch]);

    if (loading) return <div>Loading...</div>;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/orders" />} />
                <Route path="/set-password" element={<SetPassword />} />  {/* публічний маршрут */}
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