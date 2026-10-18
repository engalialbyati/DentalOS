import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { formatDateTime, formatTime } from '../lib/format';
import PatientModal from './PatientModal';
import { Modal, Button, Field, Select, Textarea } from './ui';

export default function AppointmentModal({ isOpen, slot, event, dentists, onClose, onSave }) {
    const [patientId, setPatientId] = useState('');
    const [dentistId, setDentistId] = useState('');
    const [notes, setNotes] = useState('');
    const [patients, setPatients] = useState([]);
    const [patientModalOpen, setPatientModalOpen] = useState(false);

    useEffect(() => {
        api.get('/api/patients?limit=1000').then((r) => setPatients(r.data)).catch(console.error);
        if (event) {
            setDentistId(event.resourceId || '');
            setNotes(event.title?.split(' - ')[1] || '');
        } else {
            setDentistId(dentists.length > 0 ? dentists[0].id : '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event, dentists]);

    const submit = (e) => {
        e.preventDefault();
        onSave({ patient_id: patientId, dentist_id: dentistId, notes });
    };

    const newPatient = async (data) => {
        const res = await api.post('/api/patients', data);
        const r = await api.get('/api/patients?limit=1000');
        setPatients(r.data);
        setPatientId(res.data.id);
        setPatientModalOpen(false);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={event ? 'Edit Appointment' : 'New Appointment'}>
                <div className="mb-4 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                    {formatDateTime(slot.start)} — {formatTime(slot.end)}
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Patient" required={!event}>
                        <div className="flex gap-2">
                            <Select value={patientId} onChange={(e) => setPatientId(e.target.value)} required disabled={!!event}>
                                <option value="">Select patient</option>
                                {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Select>
                            {!event && (
                                <Button type="button" variant="success" size="icon" onClick={() => setPatientModalOpen(true)} title="Quick add patient">
                                    <Plus size={18} />
                                </Button>
                            )}
                        </div>
                    </Field>
                    <Field label="Dentist" required>
                        <Select value={dentistId} onChange={(e) => setDentistId(e.target.value)} required>
                            <option value="">Select dentist</option>
                            {dentists.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                        </Select>
                    </Field>
                    <Field label="Notes">
                        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </Field>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{event ? 'Update' : 'Save Appointment'}</Button>
                    </div>
                </form>
            </Modal>

            <PatientModal isOpen={patientModalOpen} onClose={() => setPatientModalOpen(false)} onSave={newPatient} />
        </>
    );
}
