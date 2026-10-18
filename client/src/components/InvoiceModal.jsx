import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import api from '../lib/api';
import { Modal, Button, Field, Input, Select, Textarea } from './ui';
import { formatCurrency } from '../lib/format';

const emptyItem = { description: '', quantity: 1, unit_price: 0 };

export default function InvoiceModal({ isOpen, onClose, onSaved }) {
    const [patients, setPatients] = useState([]);
    const [patientId, setPatientId] = useState('');
    const [items, setItems] = useState([{ ...emptyItem }]);
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) api.get('/api/patients?limit=1000').then((r) => setPatients(r.data));
    }, [isOpen]);

    const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
    const total = Math.max(0, subtotal - (Number(discount) || 0) + (subtotal - (Number(discount) || 0)) * ((Number(tax) || 0) / 100));

    const setItem = (i, key, val) => setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
    const addItem = () => setItems((a) => [...a, { ...emptyItem }]);
    const removeItem = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));

    const submit = async (e) => {
        e.preventDefault();
        if (!patientId) return alert('Select a patient');
        if (items.length === 0 || items.every((it) => !it.description)) return alert('Add at least one item');
        setSaving(true);
        try {
            await api.post('/api/invoices', {
                patient_id: patientId,
                items: items.filter((it) => it.description),
                tax, discount, due_date: dueDate || null, notes,
            });
            onSaved();
            onClose();
            // reset
            setPatientId(''); setItems([{ ...emptyItem }]); setTax(0); setDiscount(0); setDueDate(''); setNotes('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create invoice');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Invoice" size="xl">
            <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Patient" required>
                        <Select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                            <option value="">Select patient</option>
                            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                    </Field>
                    <Field label="Tax %">
                        <Input type="number" min="0" value={tax} onChange={(e) => setTax(e.target.value)} />
                    </Field>
                    <Field label="Due Date">
                        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </Field>
                </div>

                {/* Line items */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-700">Line Items</p>
                        <Button type="button" variant="secondary" size="sm" onClick={addItem}><Plus size={15} /> Add</Button>
                    </div>
                    <div className="space-y-2">
                        {items.map((it, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                <Input className="col-span-6" placeholder="Description" value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} />
                                <Input className="col-span-2" type="number" min="0" step="any" placeholder="Qty" value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
                                <Input className="col-span-3" type="number" min="0" step="0.01" placeholder="Unit price" value={it.unit_price} onChange={(e) => setItem(i, 'unit_price', e.target.value)} />
                                <div className="col-span-1 flex justify-end">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 size={16} className="text-red-500" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Notes">
                        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </Field>
                    <div className="rounded-xl bg-slate-50 p-4 space-y-1.5 text-sm">
                        <Row label="Subtotal" value={formatCurrency(subtotal)} />
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Discount</span>
                            <Input type="number" min="0" step="0.01" className="w-28 text-right py-1" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                        </div>
                        <Row label={`Tax (${tax || 0}%)`} value={formatCurrency((subtotal - (discount || 0)) * ((tax || 0) / 100))} />
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold text-slate-800">
                            <span>Total</span><span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create Invoice'}</Button>
                </div>
            </form>
        </Modal>
    );
}

const Row = ({ label, value }) => (
    <div className="flex items-center justify-between text-slate-500">
        <span>{label}</span><span>{value}</span>
    </div>
);
