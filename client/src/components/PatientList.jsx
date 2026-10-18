import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Users, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import api from '../lib/api';
import { formatDate, initials } from '../lib/format';
import PatientModal from './PatientModal';
import { Button, Card, PageHeader, Input, Badge, EmptyState, Spinner } from './ui';

const PAGE_SIZE = 10;

export default function PatientList() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => {
            api.get('/api/patients', { params: query ? { search: query, limit: 1000 } : { limit: 1000 } })
                .then((res) => setPatients(res.data))
                .catch((e) => console.error(e))
                .finally(() => setLoading(false));
        }, 250); // debounce search
        return () => clearTimeout(t);
    }, [query]);

    const totalPages = Math.max(1, Math.ceil(patients.length / PAGE_SIZE));
    const pageItems = useMemo(
        () => patients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [patients, page]
    );

    const handleSave = async (data) => {
        try {
            if (editing) {
                await api.put(`/api/patients/${editing.id}`, data);
            } else {
                await api.post('/api/patients', data);
            }
            setModalOpen(false);
            setQuery(''); // refresh
            api.get('/api/patients', { params: { limit: 1000 } }).then((r) => setPatients(r.data));
        } catch (e) {
            alert(e.response?.data?.error || 'Failed to save patient');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <PageHeader
                title="Patients"
                subtitle={`${patients.length} patient${patients.length !== 1 ? 's' : ''} in your records`}
                actions={
                    <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
                        <UserPlus size={18} /> New Patient
                    </Button>
                }
            />

            <div className="relative mb-4 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                    className="pl-10"
                    placeholder="Search by name, phone, or email…"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                />
            </div>

            <Card className="p-0 overflow-hidden">
                {loading ? (
                    <Spinner />
                ) : patients.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No patients found"
                        message={query ? 'Try a different search term.' : 'Add your first patient to get started.'}
                        action={!query && <Button onClick={() => { setEditing(null); setModalOpen(true); }}><UserPlus size={18} /> Add Patient</Button>}
                    />
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">First Visit</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pageItems.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/70 cursor-pointer transition-colors">
                                    <td className="px-5 py-3" onClick={() => navigate(`/patients/${p.id}`)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm uppercase">
                                                {initials(p.name)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{p.name}</p>
                                                <p className="text-xs text-slate-400">Age {p.age || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3" onClick={() => navigate(`/patients/${p.id}`)}>
                                        <span className="flex items-center gap-1.5 text-slate-600 text-sm">
                                            <Phone size={14} className="text-slate-400" /> {p.phone || '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-slate-600 text-sm" onClick={() => navigate(`/patients/${p.id}`)}>
                                        {formatDate(p.first_visit_date)}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditing(p); setModalOpen(true); }}>
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {!loading && patients.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-sm">
                        <span className="text-slate-500">
                            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, patients.length)} of {patients.length}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                                <ChevronLeft size={16} />
                            </Button>
                            <span className="text-slate-600 px-1">{page} / {totalPages}</span>
                            <Button variant="secondary" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <PatientModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialData={editing}
            />
        </div>
    );
}
