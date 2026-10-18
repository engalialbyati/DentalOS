import React, { useState, useEffect } from 'react';
import { Modal, Button, Field, Input, Select, Textarea } from './ui';

const STATUSES = ['Sent', 'In Production', 'Received', 'Delivered', 'Quality Checked'];

export default function LabCaseModal({ isOpen, onClose, onSave, patients, initialData }) {
    const [form, setForm] = useState({ patient_id: '', lab_name: '', tooth_number: '', instruction_notes: '', due_date: '', status: 'Sent' });

    useEffect(() => {
        setForm(initialData
            ? {
                patient_id: initialData.patient_id || '',
                lab_name: initialData.lab_name || '',
                tooth_number: initialData.tooth_number || '',
                instruction_notes: initialData.instruction_notes || '',
                due_date: initialData.due_date ? String(initialData.due_date).split('T')[0] : '',
                status: initialData.status || 'Sent',
            }
            : { patient_id: '', lab_name: '', tooth_number: '', instruction_notes: '', due_date: '', status: 'Sent' }
        );
    }, [initialData, isOpen]);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        onSave({ ...(initialData && { id: initialData.id }), ...form });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Lab Case' : 'New Lab Case'}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Patient" required>
                    <Select value={form.patient_id} onChange={set('patient_id')} required disabled={!!initialData}>
                        <option value="">Select patient</option>
                        {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                </Field>
                <Field label="Lab Name" required>
                    <Input value={form.lab_name} onChange={set('lab_name')} placeholder="e.g. Apex Dental Lab" required />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Tooth #">
                        <Input type="number" min="1" max="32" value={form.tooth_number} onChange={set('tooth_number')} />
                    </Field>
                    <Field label="Due Date" required>
                        <Input type="date" value={form.due_date} onChange={set('due_date')} required />
                    </Field>
                </div>
                <Field label="Instructions">
                    <Textarea rows={3} value={form.instruction_notes} onChange={set('instruction_notes')} placeholder="Material, shade, specifics…" />
                </Field>
                {initialData && (
                    <Field label="Status">
                        <Select value={form.status} onChange={set('status')}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </Field>
                )}
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{initialData ? 'Save Changes' : 'Create Case'}</Button>
                </div>
            </form>
        </Modal>
    );
}
