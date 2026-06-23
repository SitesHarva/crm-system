import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

interface User {
    id: string;
    role: 'admin' | 'manager';
    name: string;
    surname: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: true,
};

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }) => {
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, refreshToken, user } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        return user;
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) await api.post('/auth/logout', { refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common.Authorization;
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
    try {
        let token = localStorage.getItem('accessToken');
        if (!token) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                const response = await api.post('/auth/refresh', { refreshToken });
                const { accessToken: newAccess, refreshToken: newRefresh, user } = response.data;
                localStorage.setItem('accessToken', newAccess);
                localStorage.setItem('refreshToken', newRefresh);
                api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
                return user;
            }
            return rejectWithValue(null);
        }
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await api.get('/users/me');
        return response.data;
    } catch {
        return rejectWithValue(null);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.loading = false;
            })
            .addCase(login.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
            })
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.loading = false;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
            });
    },
});

export default authSlice.reducer;