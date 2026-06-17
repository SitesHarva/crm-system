import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateOrder } from '../store/ordersSlice';
import api from '../api/axios';
import type { AppDispatch } from '../store';

const statuses = ['New', 'In work', 'Aggre', 'Disaggre', 'Dubbing'];
const courses = ['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX'];
const courseFormats = ['static', 'online'];
const courseTypes = ['pro', 'minimal', 'premium', 'incubator', 'vip'];

type FormData = {
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: string;
    course: string;
    course_format: string;
    course_type: string;
    status: string;
    sum: string;
    already_paid: string;
    group: string;
};

const EditModal = ({ order, onClose }: { order: any; onClose: () => void }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [form, setForm] = useState<FormData>({
        name: order.name || '',
        surname: order.surname || '',
        email: order.email || '',
        phone: order.phone || '',
        age: order.age || '',
        course: order.course || '',
        course_format: order.course_format || '',
        course_type: order.course_type || '',
        status: order.status || '',
        sum: order.sum || '',
        already_paid: order.already_paid || '',
        group: order.group || '',
    });
    const [groups, setGroups] = useState<string[]>([]);
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [groupError, setGroupError] = useState('');

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.get('/groups');
                setGroups(res.data.map((g: any) => g.name));
            } catch (e) {
                console.error('Failed to fetch groups', e);
            }
        };
        fetchGroups();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'group') {
            setGroupError('');
        }
    };

    const handleAddGroup = async () => {
        if (!newGroupName.trim()) {
            setGroupError('Group name cannot be empty');
            return;
        }
        try {
            await api.post('/groups', { name: newGroupName.trim() });
            setGroups(prev => [...prev, newGroupName.trim()]);
            setForm(prev => ({ ...prev, group: newGroupName.trim() }));
            setNewGroupName('');
            setShowAddGroup(false);
            setGroupError('');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to add group';
            setGroupError(msg);
            alert(msg);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSend: any = {};
        (Object.keys(form) as (keyof FormData)[]).forEach((key) => {
            const val = form[key];
            if (key === 'age' || key === 'sum' || key === 'already_paid') {
                dataToSend[key] = val ? Number(val) : null;
            } else {
                dataToSend[key] = val === '' ? null : val;
            }
        });
        await dispatch(updateOrder({ id: order._id, data: dataToSend }));
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>Edit Order</h3>
                <form onSubmit={handleSubmit}>
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
                    <input name="surname" placeholder="Surname" value={form.surname} onChange={handleChange} />
                    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                    <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
                    <input name="age" placeholder="Age" value={form.age} onChange={handleChange} type="number" />

                    <select name="course" value={form.course} onChange={handleChange}>
                        <option value="">Course</option>
                        {courses.map(c => <option key={c}>{c}</option>)}
                    </select>

                    <select name="course_format" value={form.course_format} onChange={handleChange}>
                        <option value="">Format</option>
                        {courseFormats.map(f => <option key={f}>{f}</option>)}
                    </select>

                    <select name="course_type" value={form.course_type} onChange={handleChange}>
                        <option value="">Type</option>
                        {courseTypes.map(t => <option key={t}>{t}</option>)}
                    </select>

                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="">Status</option>
                        {statuses.map(s => <option key={s}>{s}</option>)}
                    </select>

                    <input name="sum" placeholder="Sum" value={form.sum} onChange={handleChange} type="number" />
                    <input name="already_paid" placeholder="Already paid" value={form.already_paid} onChange={handleChange} type="number" />

                    <div className="group-row">
                        <select name="group" value={form.group} onChange={handleChange}>
                            <option value="">Group</option>
                            {groups.map(g => <option key={g}>{g}</option>)}
                        </select>
                        <button type="button" onClick={() => setShowAddGroup(true)}>+ ADD GROUP</button>
                    </div>
                    {showAddGroup && (
                        <div className="group-add">
                            <input
                                placeholder="New group name"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                            <button type="button" onClick={handleAddGroup}>Add</button>
                            <button type="button" className="secondary" onClick={() => { setShowAddGroup(false); setGroupError(''); }}>Cancel</button>
                            {groupError && <div className="error-text">{groupError}</div>}
                        </div>
                    )}

                    <div className="actions">
                        <button type="button" className="secondary" onClick={onClose}>Cancel</button>
                        <button type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;