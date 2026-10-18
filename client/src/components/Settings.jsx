import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, PageHeader, Button, Field, Input, Badge } from './ui';

export default function Settings() {
    const { user } = useAuth();
    const [tab, setTab] = useState('condition');
    const [conditions, setConditions] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [newItem, setNewItem] = useState({ code: '', label: '' });

    const fetchData = () => {
        Promise.all([api.get('/api/lookups?category=condition'), api.get('/api/lookups?category=status')])
            .then(([c, s]) => { setConditions(c.data); setStatuses(s.data); })
            .catch(console.error);
    };

    useEffect(() => { fetchData(); }, []);

    const add = async (e) => {
        e.preventDefault();
        if (!newItem.label) return;
        try {
            await api.post('/api/lookups', { ...newItem, category: tab, sort_order: 0 });
            setNewItem({ code: '', label: '' });
            fetchData();
        } catch (err) { alert('Error adding item'); }
    };

    const remove = async (id) => {
        if (!confirm('Delete this item?')) return;
        await api.delete(`/api/lookups/${id}`);
        fetchData();
    };

    const list = tab === 'condition' ? conditions : statuses;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <PageHeader title="Settings" subtitle="Manage clinical catalogs and your account." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Account card */}
                <Card className="h-fit">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Account</p>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-lg font-bold uppercase">
                            {user?.full_name?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{user?.full_name}</p>
                            <p className="text-sm text-slate-500">@{user?.username}</p>
                        </div>
                    </div>
                    <Badge color="brand">{user?.role}</Badge>
                </Card>

                {/* Catalog management */}
                <Card className="lg:col-span-2">
                    <div className="flex gap-1 border-b border-slate-200 mb-4">
                        <TabBtn active={tab === 'condition'} onClick={() => setTab('condition')}>Conditions</TabBtn>
                        <TabBtn active={tab === 'status'} onClick={() => setTab('status')}>Statuses</TabBtn>
                    </div>

                    <form onSubmit={add} className="flex gap-3 items-end mb-5">
                        <Field label="Label">
                            <Input
                                value={newItem.label}
                                onChange={(e) => setNewItem({ label: e.target.value, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                placeholder={`New ${tab} label`}
                                required
                            />
                        </Field>
                        <Button type="submit"><Plus size={16} /> Add</Button>
                    </form>

                    <div className="space-y-2">
                        {list.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No {tab}s defined.</p>}
                        {list.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5">
                                <div>
                                    <span className="font-medium text-slate-800">{item.label}</span>
                                    <span className="text-xs text-slate-400 ml-2">{item.code}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => remove(item.id)}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

const TabBtn = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${active ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
        {children}
    </button>
);
