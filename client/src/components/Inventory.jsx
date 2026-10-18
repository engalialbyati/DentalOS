import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, DollarSign, CalendarClock, Plus } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/format';
import StockInModal from './StockInModal';
import { Button, Card, PageHeader, StatCard, Badge, Modal, Field, Input, Select, EmptyState, Spinner } from './ui';

export default function Inventory() {
    const [tab, setTab] = useState('items');
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [stats, setStats] = useState({ totalValue: 0, lowStockCount: 0, expiringCount: 0 });
    const [loading, setLoading] = useState(true);
    const [stockModal, setStockModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemModal, setItemModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [supplierModal, setSupplierModal] = useState(false);

    const fetchData = () => {
        Promise.all([
            api.get('/api/inventory/items'),
            api.get('/api/inventory/suppliers'),
            api.get('/api/inventory/dashboard/stats'),
        ])
            .then(([i, s, st]) => { setItems(i.data); setSuppliers(s.data); setStats(st.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const addStock = async (data) => {
        try {
            await api.post('/api/inventory/batches', data);
            setStockModal(false);
            fetchData();
        } catch (e) { alert('Failed to add stock'); }
    };

    const saveItem = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = Object.fromEntries(fd.entries());
        try {
            if (editItem) await api.put(`/api/inventory/items/${editItem.id}`, payload);
            else await api.post('/api/inventory/items', payload);
            setItemModal(false);
            setEditItem(null);
            fetchData();
        } catch (e) { alert(e.response?.data?.error || 'Failed to save item'); }
    };

    const saveSupplier = async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target).entries());
        try {
            await api.post('/api/inventory/suppliers', payload);
            setSupplierModal(false);
            fetchData();
        } catch (e) { alert('Failed to add supplier'); }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <PageHeader title="Inventory" subtitle="Manage materials, stock batches, and suppliers." />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard icon={DollarSign} label="Total Value" value={formatCurrency(stats.totalValue)} color="green" />
                <StatCard icon={AlertTriangle} label="Low Stock" value={stats.lowStockCount} color="red" />
                <StatCard icon={CalendarClock} label="Expiring (30d)" value={stats.expiringCount} color="amber" />
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 border-b border-slate-200">
                    <TabBtn active={tab === 'items'} onClick={() => setTab('items')}>Items</TabBtn>
                    <TabBtn active={tab === 'suppliers'} onClick={() => setTab('suppliers')}>Suppliers</TabBtn>
                </div>
                {tab === 'items'
                    ? <Button onClick={() => { setEditItem(null); setItemModal(true); }}><Plus size={18} /> Add Item</Button>
                    : <Button onClick={() => setSupplierModal(true)}><Plus size={18} /> Add Supplier</Button>}
            </div>

            {tab === 'items' && (
                <Card className="p-0 overflow-hidden">
                    {loading ? <Spinner /> : items.length === 0 ? (
                        <EmptyState icon={Package} title="No inventory items" message="Add materials you use in the clinic." />
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>{['Item', 'Category', 'Supplier', 'Stock', 'Price', 'Status', ''].map((h, i) => (
                                    <th key={i} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i >= 3 ? 'text-right' : ''}`}>{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item) => {
                                    const low = item.total_quantity <= item.threshold_limit;
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/70">
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-800">{item.name}</p>
                                                <p className="text-xs text-slate-400">{item.sku || 'No SKU'}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{item.category || '—'}</td>
                                            <td className="px-4 py-3 text-slate-600">{item.supplier_name || '—'}</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-700">{item.total_quantity}</td>
                                            <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.unit_price)}</td>
                                            <td className="px-4 py-3 text-right">{low && <Badge color="red">Low</Badge>}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setStockModal(true); }}>+ Stock</Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </Card>
            )}

            {tab === 'suppliers' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suppliers.map((s) => (
                        <Card key={s.id}>
                            <p className="font-bold text-slate-800">{s.name}</p>
                            <p className="text-sm text-slate-600 mt-1">{s.contact_name || '—'}</p>
                            <p className="text-sm text-slate-500">{s.phone || '—'}</p>
                            <p className="text-sm text-slate-500">{s.email || '—'}</p>
                        </Card>
                    ))}
                    {suppliers.length === 0 && !loading && (
                        <Card className="col-span-full"><EmptyState icon={Package} title="No suppliers yet" /></Card>
                    )}
                </div>
            )}

            <StockInModal item={selectedItem} isOpen={stockModal} onClose={() => setStockModal(false)} onSave={addStock} />

            {/* Add/Edit item modal */}
            <Modal isOpen={itemModal} onClose={() => setItemModal(false)} title={editItem ? 'Edit Item' : 'New Item'}>
                <ItemForm item={editItem} suppliers={suppliers} onSubmit={saveItem} onCancel={() => setItemModal(false)} />
            </Modal>

            {/* Supplier modal */}
            <Modal isOpen={supplierModal} onClose={() => setSupplierModal(false)} title="New Supplier">
                <form onSubmit={saveSupplier} className="space-y-4">
                    <Field label="Name" required><Input name="name" required /></Field>
                    <Field label="Contact Name"><Input name="contact_name" /></Field>
                    <Field label="Phone"><Input name="phone" /></Field>
                    <Field label="Email"><Input name="email" type="email" /></Field>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setSupplierModal(false)}>Cancel</Button>
                        <Button type="submit">Add Supplier</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function ItemForm({ item, suppliers, onSubmit, onCancel }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Item Name" required><Input name="name" defaultValue={item?.name} required /></Field>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Category"><Input name="category" defaultValue={item?.category} /></Field>
                <Field label="SKU"><Input name="sku" defaultValue={item?.sku} /></Field>
                <Field label="Unit Price"><Input name="unit_price" type="number" step="0.01" min="0" defaultValue={item?.unit_price} /></Field>
                <Field label="Low-stock Threshold"><Input name="threshold_limit" type="number" min="0" defaultValue={item?.threshold_limit || 10} /></Field>
            </div>
            <Field label="Supplier">
                <Select name="supplier_id" defaultValue={item?.supplier_id || ''}>
                    <option value="">None</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{item ? 'Save' : 'Add Item'}</Button>
            </div>
        </form>
    );
}

const TabBtn = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${active ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
        {children}
    </button>
);
