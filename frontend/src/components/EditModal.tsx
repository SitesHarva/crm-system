import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateOrder } from '../store/ordersSlice';
import type { AppDispatch } from "../store";

const statuses = ['New', 'In work', 'Aggre', 'Disagre', 'Dubbing'];
const courses = ['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX'];
const courseFormats = ['static', 'online'];
const courseTypes = ['pro', 'minimal', 'premium', 'incubator', 'vip'];

type FormFields = {
    name: any;
    surname: any;
    email: any;
    phone: any;
    age: any;
    course: any;
    course_format: any;
    course_type: any;
    status: any;
    sum: any;
    already_paid: any;
    group: any;
};

const EditModal = ({ order, onClose }: { order: any; onClose: () => void }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [form, setForm] = useState<FormFields>({
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSend: any = {};
        (Object.keys(form) as (keyof FormFields)[]).forEach(key => {
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'white', padding: 20, borderRadius: 8, width: 500 }}>
                <h3>Edit Order</h3>
                <form onSubmit={handleSubmit}>
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} /><br />
                    <input name="surname" placeholder="Surname" value={form.surname} onChange={handleChange} /><br />
                    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} /><br />
                    <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} /><br />
                    <input name="age" placeholder="Age" value={form.age} onChange={handleChange} type="number" /><br />

                    <select name="course" value={form.course} onChange={handleChange}>
                        <option value="">Course</option>
                        {courses.map(c => <option key={c}>{c}</option>)}
                    </select><br />

                    <select name="course_format" value={form.course_format} onChange={handleChange}>
                        <option value="">Format</option>
                        {courseFormats.map(f => <option key={f}>{f}</option>)}
                    </select><br />

                    <select name="course_type" value={form.course_type} onChange={handleChange}>
                        <option value="">Type</option>
                        {courseTypes.map(t => <option key={t}>{t}</option>)}
                    </select><br />

                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="">Status</option>
                        {statuses.map(s => <option key={s}>{s}</option>)}
                    </select><br />

                    <input name="sum" placeholder="Sum" value={form.sum} onChange={handleChange} type="number" /><br />
                    <input name="already_paid" placeholder="Already paid" value={form.already_paid} onChange={handleChange} type="number" /><br />
                    <input name="group" placeholder="Group" value={form.group} onChange={handleChange} /><br />

                    <button type="submit">Save</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default EditModal;