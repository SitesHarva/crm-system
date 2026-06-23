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
        age: order.age !== null && order.age !== undefined ? String(order.age) : '',
        course: order.course || '',
        course_format: order.course_format || '',
        course_type: order.course_type || '',
        status: order.status || '',
        sum: order.sum !== null && order.sum !== undefined ? String(order.sum) : '',
        already_paid: order.already_paid !== null && order.already_paid !== undefined ? String(order.already_paid) : '',
        group: order.group || '',
    });
    const [groups, setGroups] = useState<string[]>([]);
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [groupError, setGroupError] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        setErrors(prev => ({ ...prev, [name]: '' }));
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
        const newErrors: Record<string, string> = {};

        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (form.age !== '') {
            const ageNum = Number(form.age);
            if (isNaN(ageNum) || ageNum < 0 || !Number.isInteger(ageNum)) {
                newErrors.age = 'Age must be a positive integer';
            }
        }
        if (form.sum !== '') {
            const sumNum = Number(form.sum);
            if (isNaN(sumNum) || sumNum < 0) {
                newErrors.sum = 'Sum must be a positive number';
            }
        }
        if (form.already_paid !== '') {
            const paidNum = Number(form.already_paid);
            if (isNaN(paidNum) || paidNum < 0) {
                newErrors.already_paid = 'Paid amount must be a positive number';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

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

    const labelStyle = {
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: 600,
        marginBottom: '4px',
        color: '#475569',
        textAlign: 'left' as const
    };

    const errorStyle = {
        color: '#ef4444',
        fontSize: '0.75rem',
        marginTop: '-6px',
        marginBottom: '10px',
        textAlign: 'left' as const
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>Edit Order</h3>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={labelStyle}>Name</label>
                        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
                    </div>

                    <div>
                        <label style={labelStyle}>Surname</label>
                        <input name="surname" placeholder="Surname" value={form.surname} onChange={handleChange} />
                    </div>

                    <div>
                        <label style={labelStyle}>Email</label>
                        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                        {errors.email && <div style={errorStyle}>{errors.email}</div>}
                    </div>

                    <div>
                        <label style={labelStyle}>Phone</label>
                        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
                    </div>

                    <div>
                        <label style={labelStyle}>Age</label>
                        <input name="age" placeholder="Age" value={form.age} onChange={handleChange} type="number" />
                        {errors.age && <div style={errorStyle}>{errors.age}</div>}
                    </div>

                    <div>
                        <label style={labelStyle}>Course</label>
                        <select name="course" value={form.course} onChange={handleChange}>
                            <option value="">Course</option>
                            {courses.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Course Format</label>
                        <select name="course_format" value={form.course_format} onChange={handleChange}>
                            <option value="">Format</option>
                            {courseFormats.map(f => <option key={f}>{f}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Course Type</label>
                        <select name="course_type" value={form.course_type} onChange={handleChange}>
                            <option value="">Type</option>
                            {courseTypes.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Status</label>
                        <select name="status" value={form.status} onChange={handleChange}>
                            <option value="">Status</option>
                            {statuses.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Sum</label>
                        <input name="sum" placeholder="Sum" value={form.sum} onChange={handleChange} type="number" />
                        {errors.sum && <div style={errorStyle}>{errors.sum}</div>}
                    </div>

                    <div>
                        <label style={labelStyle}>Already Paid</label>
                        <input name="already_paid" placeholder="Already paid" value={form.already_paid} onChange={handleChange} type="number" />
                        {errors.already_paid && <div style={errorStyle}>{errors.already_paid}</div>}
                    </div>

                    <div>
                        <label style={labelStyle}>Group</label>
                        <div className="group-row">
                            <select name="group" value={form.group} onChange={handleChange}>
                                <option value="">Group</option>
                                {groups.map(g => <option key={g}>{g}</option>)}
                            </select>
                            <button type="button" onClick={() => setShowAddGroup(true)}>+ ADD GROUP</button>
                        </div>
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