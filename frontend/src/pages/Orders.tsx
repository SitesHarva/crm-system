import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchOrders } from '../store/ordersSlice';
import Filters from '../components/Filters';
import Pagination from '../components/Pagination';
import Header from '../components/Header';
import useDebounce from '../hooks/useDebounce';
import type { AppDispatch, RootState } from '../store';
import { useEffect, useState, useRef } from 'react';
import { OrderTable } from '../components/OrderTable';

const Orders = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { orders, totalPages, currentPage, loading } = useSelector((state: RootState) => state.orders);
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        page: parseInt(searchParams.get('page') || '1'),
        sort: searchParams.get('sort') || '-created_at',
        my: searchParams.get('my') === 'true',
        name: searchParams.get('name') || '',
        surname: searchParams.get('surname') || '',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        status: searchParams.get('status') || '',
        course: searchParams.get('course') || '',
        course_format: searchParams.get('course_format') || '',
        course_type: searchParams.get('course_type') || '',
        group: searchParams.get('group') || '',
        startDate: searchParams.get('startDate') || '',
        endDate: searchParams.get('endDate') || '',
    });

    const debouncedFilters = useDebounce(filters, 500);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(debouncedFilters).forEach(([key, val]) => {
            if (val) params.set(key, val.toString());
        });
        setSearchParams(params);
        if (isAuthenticated) {
            dispatch(fetchOrders(debouncedFilters));
        }
    }, [debouncedFilters, dispatch, setSearchParams, isAuthenticated]);

    const prevPageRef = useRef(filters.page);
    useEffect(() => {
        if (prevPageRef.current !== filters.page) {
            prevPageRef.current = filters.page;
            const params = new URLSearchParams(searchParams);
            params.set('page', filters.page.toString());
            setSearchParams(params);
            if (isAuthenticated) {
                dispatch(fetchOrders({ ...filters, page: filters.page }));
            }
        }
    }, [filters.page, isAuthenticated, dispatch, searchParams, setSearchParams]);

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => {
            if (key === 'page') {
                return { ...prev, page: value };
            }
            return { ...prev, [key]: value, page: 1 };
        });
    };

    const handleSort = (column: string) => {
        const currentSort = filters.sort;
        let newSort = column;
        if (currentSort === column) newSort = `-${column}`;
        else if (currentSort === `-${column}`) newSort = column;
        setFilters(prev => ({ ...prev, sort: newSort, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            page: 1, sort: '-created_at', my: false, name: '', surname: '',
            email: '', phone: '', status: '', course: '', course_format: '',
            course_type: '', group: '', startDate: '', endDate: '',
        });
    };

    return (
        <div className="container">
            <Header />
            <Filters filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
            <OrderTable orders={orders} loading={loading} onSort={handleSort} sortBy={filters.sort} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => handleFilterChange('page', page)} />
        </div>
    );
};

export default Orders;