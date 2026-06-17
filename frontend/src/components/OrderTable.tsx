import React, { useState } from 'react';
import OrderRow from './OrderRow';
import EditModal from './EditModal';

interface OrderTableProps {
    orders: any[];
    loading: boolean;
    onSort: (column: string) => void;
    sortBy: string;
}

const columns = ['_id', 'name', 'surname', 'email', 'phone', 'age', 'course', 'course_format', 'course_type', 'status', 'sum', 'already_paid', 'created_at', 'manager', 'group'];

export const OrderTable: React.FC<OrderTableProps> = ({ orders, loading, onSort, sortBy }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingOrder, setEditingOrder] = useState<any>(null);

    if (loading) return <div>Loading orders...</div>;

    return (
        <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                    {columns.map(col => (
                        <th key={col} onClick={() => onSort(col)} style={{ cursor: 'pointer', border: '1px solid #ddd', padding: 8 }}>
                            {col} {sortBy === col && '↑'} {sortBy === `-${col}` && '↓'}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <OrderRow
                        key={order._id}
                        order={order}
                        expanded={expandedId === order._id}
                        onToggle={() => setExpandedId(expandedId === order._id ? null : order._id)}
                        onEdit={() => setEditingOrder(order)}
                    />
                ))}
                </tbody>
            </table>
            {editingOrder && <EditModal order={editingOrder} onClose={() => setEditingOrder(null)} />}
        </>
    );
};