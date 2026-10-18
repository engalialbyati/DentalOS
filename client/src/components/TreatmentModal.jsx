import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Modal, Button, Field, Select, Textarea } from './ui';

export default function TreatmentModal({ isOpen, toothNumber, onClose, onSave, currentData }) {
    const [condition, setCondition] = useState('');
    const [status, setStatus] = useState('planned');
    const [conditions, setConditions] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        if (isOpen) {
            api.get('/api/lookups?category=condition').then((r) => setConditions(r.data)).catch(() => {});
            api.get('/api/lookups?category=status').then((r) => setStatuses(r.data)).catch(() => {});
            setCondition(currentData?.condition_description || '');
            setStatus(currentData?.status || 'planned');
        }
    }, [currentData, isOpen]);

    const submit = (e) => {
        e.preventDefault();
        onSave({ condition_description: condition, status });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Tooth #${toothNumber}`}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Condition">
                    <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
                        <option value="">Select condition</option>
                        {conditions.map((c) => <option key={c.id} value={c.code}>{c.label}</option>)}
                    </Select>
                </Field>
                <Field label="Status">
                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                        {statuses.length === 0 && (
                            <>
                                <option value="planned">Planned</option>
                                <option value="completed">Completed</option>
                            </>
                        )}
                        {statuses.map((s) => <option key={s.id} value={s.code}>{s.label}</option>)}
                    </Select>
                </Field>
                <Field label="Notes">
                    <Textarea rows={2} value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Optional notes…" />
                </Field>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
}
