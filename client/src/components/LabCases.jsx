import React, { useState, useEffect } from 'react';
import { Truck, Plus, AlertCircle, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { dayjs, formatDate } from '../lib/format';
import LabCaseModal from './LabCaseModal';
import { Button, Card, PageHeader, Badge, EmptyState, Spinner } from './ui';

const statusColor = {
    'Sent': 'yellow', 'In Production': 'blue', 'Received': 'green',
    'Delivered': 'gray', 'Quality Checked': 'purple',
};

export default function LabCases() {
    const [cases, setCases] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        Promise.all([api.get('/api/lab-cases'), api.get('/api/patients?limit=1000')])
            .then(([c, p]) => { setCases(c.data); setPatients(p.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const fetchData = () => api.get('/api/lab-cases').then((r) => setCases(r.data)).catch(console.error);

    const save = async (data) => {
        try {
            if (data.id) await api.put(`/api/lab-cases/${data.id}`, data);
            else await api.post('/api/lab-cases', data);
            setModalOpen(false);
            fetchData();
        } catch (e) { alert('Error saving lab case'); }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this lab case?')) return;
        await api.delete(`/api/lab-cases/${id}`);
        fetchData();
    };

    const quickStatus = async (item, status) => {
        await api.put(`/api/lab-cases/${item.id}`, { status, received_date: status === 'Received' ? new Date() : item.received_date });
        fetchData();
    };

    const overdue = (c) => dayjs(c.due_date).isBefore(dayjs(), 'day') && !['Delivered', 'Received'].includes(c.status);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <PageHeader
                title="Lab Cases"
                subtitle="Track external lab orders and deliveries."
                actions={<Button onClick={() => { setSelected(null); setModalOpen(true); }}><Plus size={18} /> New Lab Case</Button>}
            />

            <Card className="p-0 overflow-hidden">
                {loading ? <Spinner /> : cases.length === 0 ? (
                    <EmptyState icon={Truck} title="No lab cases" message="Create a lab case to track an external order." />
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                {['Due Date', 'Patient', 'Lab', 'Tooth', 'Instructions', 'Status', ''].map((h, i) => (
                                    <th key={i} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i >= 5 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cases.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50/70">
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                            {formatDate(c.due_date, 'MMM D')}
                                            {overdue(c) && <AlertCircle size={14} className="text-red-500" />}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 font-medium">{c.patient_name}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.lab_name}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">#{c.tooth_number || '—'}</td>
                                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{c.instruction_notes || '—'}</td>
                                    <td className="px-4 py-3"><Badge color={statusColor[c.status] || 'gray'}>{c.status}</Badge></td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {c.status === 'Sent' && (
                                                <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => quickStatus(c, 'Received')} title="Mark received">
                                                    <CheckCircle2 size={16} />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => { setSelected(c); setModalOpen(true); }}><Pencil size={15} /></Button>
                                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => remove(c.id)}><Trash2 size={15} /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            <LabCaseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={save} patients={patients} initialData={selected} />
        </div>
    );
}
