import React, { useState, useEffect } from 'react';
import { Field, Input, Textarea, Modal, Button } from './ui';

const empty = {
    name: '', age: '', phone: '', email: '', address: '',
    first_visit_date: new Date().toISOString().split('T')[0],
    allergies: '', medical_conditions: '', medications: '', notes: '',
};

export default function PatientModal({ isOpen, onClose, onSave, initialData }) {
    const [form, setForm] = useState(empty);

    useEffect(() => {
        if (initialData) {
            setForm({
                ...empty,
                ...initialData,
                first_visit_date: initialData.first_visit_date ? String(initialData.first_visit_date).split('T')[0] : '',
            });
        } else {
            setForm(empty);
        }
    }, [initialData, isOpen]);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Patient' : 'New Patient'} size="lg">
            <form onSubmit={submit} className="space-y-5">
                {/* Demographics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" required>
                        <Input value={form.name} onChange={set('name')} required />
                    </Field>
                    <Field label="Age">
                        <Input type="number" min="0" max="130" value={form.age} onChange={set('age')} />
                    </Field>
                    <Field label="Phone">
                        <Input value={form.phone} onChange={set('phone')} />
                    </Field>
                    <Field label="Email">
                        <Input type="email" value={form.email} onChange={set('email')} />
                    </Field>
                    <Field label="Address">
                        <Input value={form.address} onChange={set('address')} />
                    </Field>
                    <Field label="First Visit">
                        <Input type="date" value={form.first_visit_date} onChange={set('first_visit_date')} />
                    </Field>
                </div>

                {/* Medical history */}
                <div>
                    <p className="text-sm font-semibold text-slate-700 border-t border-slate-100 pt-4 mb-3">Medical History</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Allergies">
                            <Textarea rows={2} value={form.allergies} onChange={set('allergies')} placeholder="e.g. Penicillin, Latex" />
                        </Field>
                        <Field label="Medical Conditions">
                            <Textarea rows={2} value={form.medical_conditions} onChange={set('medical_conditions')} placeholder="e.g. Diabetes, Hypertension" />
                        </Field>
                        <Field label="Current Medications">
                            <Textarea rows={2} value={form.medications} onChange={set('medications')} />
                        </Field>
                        <Field label="Clinical Notes">
                            <Textarea rows={2} value={form.notes} onChange={set('notes')} />
                        </Field>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{initialData ? 'Save Changes' : 'Create Patient'}</Button>
                </div>
            </form>
        </Modal>
    );
}
