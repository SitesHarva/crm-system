import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

interface Order {
    _id: string;
    name: string | null;
    surname: string | null;
    email: string | null;
    phone: string | null;
    age: number | null;
    course: string | null;
    course_format: string | null;
    course_type: string | null;
    status: string | null;
    sum: number | null;
    already_paid: number | null;
    created_at: string;
    msg: string | null;
    utm: string | null;
    group: string | null;
    manager: { _id: string; name: string; surname: string } | null;
    comments: Array<{
        text: string;
        author: { _id: string; name: string; surname: string };
        createdAt: string;
    }>;
}

interface OrdersState {
    orders: Order[];
    totalPages: number;
    currentPage: number;
    loading: boolean;
    error: string | null;
}

const initialState: OrdersState = {
    orders: [],
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null,
};

export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (params: Record<string, any>) => {
        const response = await api.get('/orders', { params });
        return response.data;
    }
);

export const updateOrder = createAsyncThunk(
    'orders/updateOrder',
    async ({ id, data }: { id: string; data: any }) => {
        const response = await api.patch(`/orders/${id}`, data);
        return response.data;
    }
);

export const addComment = createAsyncThunk(
    'orders/addComment',
    async ({ id, text }: { id: string; text: string }) => {
        const response = await api.post(`/orders/${id}/comments`, { text });
        return response.data;
    }
);

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                // Захист від undefined відповіді
                if (action.payload && action.payload.data && action.payload.meta) {
                    state.orders = action.payload.data;
                    state.totalPages = action.payload.meta.total_pages;
                    state.currentPage = action.payload.meta.current_page;
                } else {
                    state.orders = [];
                    state.totalPages = 0;
                    state.currentPage = 1;
                }
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch orders';
                console.error('fetchOrders failed:', action.error);
                state.orders = [];
                state.totalPages = 0;
            })
            .addCase(updateOrder.fulfilled, (state, action) => {
                const index = state.orders.findIndex((o) => o._id === action.payload._id);
                if (index !== -1) state.orders[index] = action.payload;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                const index = state.orders.findIndex((o) => o._id === action.payload._id);
                if (index !== -1) state.orders[index] = action.payload;
            });
    },
});

export default ordersSlice.reducer;