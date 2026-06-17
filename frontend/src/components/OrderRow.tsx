import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment } from '../store/ordersSlice';
import type { AppDispatch, RootState } from "../store";

interface OrderRowProps {
    order: any;
    expanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
}

const OrderRow = ({ order, expanded, onToggle, onEdit }: OrderRowProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [commentText, setCommentText] = useState('');
    const canInteract = !order.manager || order.manager?._id === user?.id;

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        await dispatch(addComment({ id: order._id, text: commentText }));
        setCommentText('');
    };

    return (
        <>
            <tr onClick={onToggle} style={{ cursor: 'pointer' }}>
                <td>{order._id}</td>
                <td>{order.name}</td>
                <td>{order.surname}</td>
                <td>{order.email}</td>
                <td>{order.phone}</td>
                <td>{order.age}</td>
                <td>{order.course}</td>
                <td>{order.course_format}</td>
                <td>{order.course_type}</td>
                <td>{order.status}</td>
                <td>{order.sum}</td>
                <td>{order.already_paid}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>{order.manager ? `${order.manager.name} ${order.manager.surname}` : '-'}</td>
                <td>{order.group}</td>
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={15} style={{ background: '#f5f5f5', padding: 10 }}>
                        <div><strong>Message:</strong> {order.msg}</div>
                        <div><strong>UTM:</strong> {order.utm}</div>
                        <div><strong>Comments:</strong></div>
                        <ul>
                            {order.comments?.map((c: any, idx: number) => (
                                <li key={idx}>
                                    <b>{c.author?.name} {c.author?.surname}</b> ({new Date(c.createdAt).toLocaleString()}): {c.text}
                                </li>
                            ))}
                        </ul>
                        {canInteract && (
                            <div>
                                <textarea
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows={2}
                                    style={{ width: '80%' }}
                                />
                                <button onClick={handleAddComment}>Add comment</button>
                            </div>
                        )}
                        {canInteract && <button onClick={onEdit}>Edit order</button>}
                    </td>
                </tr>
            )}
        </>
    );
};

export default OrderRow;