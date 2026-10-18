import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus } from 'lucide-react';
import api from '../lib/api';
import Odontogram from './Odontogram';
import { Card, PageHeader, Button, Field, Input, Select, Textarea, Spinner } from './ui';

export default function TreatmentSession() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTeeth, setSelectedTeeth] = useState([]);
    const [description, setDescription] = useState('');
    const [inventoryItems, setInventoryItems] = useState([]);
    const [usedMaterials, setUsedMaterials] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        Promise.all([api.get('/api/patients?limit=1000'), api.get('/api/inventory/items')])
            .then(([p, i]) => { setPatients(p.data); setInventoryItems(i.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleTooth = (n) => setSelectedTeeth((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
    const addMaterial = () => {
        const sel = document.getElementById('inv-select');
        const qty = document.getElementById('inv-qty');
        if (!sel.value || !qty.value) return;
        setUsedMaterials((p) => [...p, { inventory_item_id: sel.value, quantity: qty.value }]);
        sel.value = ''; qty.value = '';
    };
    const removeMaterial = (i) => setUsedMaterials((p) => p.filter((_, idx) => idx !== i));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true); setMessage('');
        try {
            const teeth = selectedTeeth.length > 0 ? selectedTeeth : [null];
            for (let i = 0; i < teeth.length; i++) {
                const toothNum = teeth[i];
                const isPrimary = i === 0;
                const fd = new FormData();
                fd.append('patient_id', selectedPatient);
                fd.append('date', date);
                if (toothNum) fd.append('tooth_number', toothNum);
                fd.append('description', selectedTeeth.length > 1 ? `[${selectedTeeth.join(', ')}] ${description}` : description);
                fd.append('materials', JSON.stringify(isPrimary ? usedMaterials : []));
                if (isPrimary && selectedImages.length) {
                    for (const img of selectedImages) fd.append('images', img);
                }
                await api.post('/api/treatments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            setMessage('Treatment saved successfully!');
            setDescription(''); setSelectedTeeth([]); setUsedMaterials([]); setSelectedImages([]);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Error saving treatment.');
        } finally { setSaving(false); }
    };

    if (loading) return <Spinner className="min-h-[60vh]" />;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <PageHeader title="New Treatment Session" subtitle="Record a procedure, materials used, and clinical images." />
            <Card>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Patient" required>
                            <Select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required>
                                <option value="">Select patient</option>
                                {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Select>
                        </Field>
                        <Field label="Date" required>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </Field>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                        <p className="text-sm font-medium text-slate-700 mb-3">Dental Chart</p>
                        {selectedPatient ? (
                            <>
                                <Odontogram selectedTeeth={selectedTeeth} onToothSelect={toggleTooth} disableModal />
                                <p className="mt-2 text-sm text-brand-600 font-medium">
                                    {selectedTeeth.length ? `Selected: ${selectedTeeth.join(', ')}` : 'Click teeth to select (toggle)'}
                                </p>
                            </>
                        ) : <p className="text-slate-400 italic text-sm py-8 text-center">Select a patient to view the chart.</p>}
                    </div>

                    <Field label="Clinical Notes" required>
                        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Procedure details, observations…" required />
                    </Field>

                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                        <p className="text-sm font-medium text-slate-700 mb-3">Materials Used</p>
                        <div className="flex gap-2 mb-3">
                            <Select id="inv-select" className="flex-1">
                                <option value="">Select item</option>
                                {inventoryItems.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.total_quantity} left)</option>)}
                            </Select>
                            <Input id="inv-qty" type="number" min="1" className="w-24" placeholder="Qty" />
                            <Button type="button" variant="success" size="icon" onClick={addMaterial}><Plus size={18} /></Button>
                        </div>
                        {usedMaterials.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {usedMaterials.map((m, idx) => {
                                    const item = inventoryItems.find((i) => String(i.id) === String(m.inventory_item_id));
                                    return (
                                        <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-sm">
                                            {item?.name || m.inventory_item_id} ×{m.quantity}
                                            <button type="button" onClick={() => removeMaterial(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <Field label="Images (X-Rays, Photos)">
                        <Input type="file" multiple accept="image/*" onChange={(e) => setSelectedImages([...e.target.files])} />
                    </Field>

                    <Button type="submit" size="lg" className="w-full" disabled={saving}>
                        <Save size={18} /> {saving ? 'Saving…' : 'Save Treatment Session'}
                    </Button>

                    {message && (
                        <div className={`rounded-lg px-4 py-3 text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
}
