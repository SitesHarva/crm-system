import { useState } from 'react';

interface FiltersProps {
    filters: any;
    onChange: (key: string, value: any) => void;
    onClear: () => void;
}

const Filters = ({ filters, onChange, onClear }: FiltersProps) => {
    const [myChecked, setMyChecked] = useState(filters.my);

    const handleMyCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setMyChecked(checked);
        onChange('my', checked);
    };

    return (
        <div style={{ padding: '10px', background: '#f9f9f9', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <input placeholder="Name" value={filters.name} onChange={e => onChange('name', e.target.value)} />
            <input placeholder="Surname" value={filters.surname} onChange={e => onChange('surname', e.target.value)} />
            <input placeholder="Email" value={filters.email} onChange={e => onChange('email', e.target.value)} />
            <input placeholder="Phone" value={filters.phone} onChange={e => onChange('phone', e.target.value)} />
            <input placeholder="Group" value={filters.group} onChange={e => onChange('group', e.target.value)} />

            <select value={filters.status} onChange={e => onChange('status', e.target.value)}>
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="In work">In work</option>
                <option value="Aggre">Aggre</option>
                <option value="Disagre">Disagre</option>
                <option value="Dubbing">Dubbing</option>
            </select>

            <select value={filters.course} onChange={e => onChange('course', e.target.value)}>
                <option value="">All Courses</option>
                <option value="FS">FS</option>
                <option value="QACX">QACX</option>
                <option value="JCX">JCX</option>
                <option value="JSCX">JSCX</option>
                <option value="FE">FE</option>
                <option value="PCX">PCX</option>
            </select>

            <select value={filters.course_format} onChange={e => onChange('course_format', e.target.value)}>
                <option value="">All Formats</option>
                <option value="static">static</option>
                <option value="online">online</option>
            </select>

            <select value={filters.course_type} onChange={e => onChange('course_type', e.target.value)}>
                <option value="">All Types</option>
                <option value="pro">pro</option>
                <option value="minimal">minimal</option>
                <option value="premium">premium</option>
                <option value="incubator">incubator</option>
                <option value="vip">vip</option>
            </select>

            <input type="date" placeholder="Start Date" value={filters.startDate} onChange={e => onChange('startDate', e.target.value)} />
            <input type="date" placeholder="End Date" value={filters.endDate} onChange={e => onChange('endDate', e.target.value)} />

            <label>
                <input type="checkbox" checked={myChecked} onChange={handleMyCheckbox} /> My orders only
            </label>

            <button onClick={onClear}>Clear filters</button>
            <button onClick={() => {
                const baseUrl = import.meta.env.VITE_API_URL;
                const url = `${baseUrl}/orders/excel?${new URLSearchParams(filters as any).toString()}`;
                window.open(url, '_blank');
            }}>
                Export Excel
            </button>
        </div>
    );
};

export default Filters;