import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import PatientModal from './PatientModal';

const AppointmentModal = ({ isOpen, slot, event, dentists, onClose, onSave }) => {
    const [patientId, setPatientId] = useState('');
    const [dentistId, setDentistId] = useState('');
    const [notes, setNotes] = useState('');
    const [patients, setPatients] = useState([]);

    // Quick Add Patient State
    const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

    const fetchPatients = () => {
        axios.get('http://localhost:5001/api/patients')
            .then(res => setPatients(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchPatients();
        // Pre-fill if editing existing event or just slot
        if (event) {
            setDentistId(event.resourceId);
            setNotes(event.title.split(' - ')[1] || ''); // Hacky parse for demo
            // Ideally we fetch full event details or pass them
        } else {
            // New slot
            setDentistId(dentists.length > 0 ? dentists[0].id : '');
        }
    }, [event, dentists]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            patient_id: patientId,
            dentist_id: dentistId,
            notes
        });
    };

    const handleNewPatientSave = (data) => {
        axios.post('http://localhost:5001/api/patients', data)
            .then(res => {
                // Refresh list and select the new patient
                fetchPatients();
                setPatientId(res.data.id);
                setIsPatientModalOpen(false);
            })
            .catch(err => console.error("Error creating patient from calendar", err));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96 transform transition-all">
                <h3 className="text-lg font-bold mb-4">{event ? 'Edit Appointment' : 'New Appointment'}</h3>
                <div className="mb-4 text-sm text-gray-600">
                    {moment(slot.start).format('LLL')} - {moment(slot.end).format('LT')}
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Patient</label>
                        <div className="flex gap-2">
                            <select
                                className="w-full border border-gray-300 rounded p-2"
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                required={!event}
                                disabled={!!event}
                            >
                                <option value="">Select Patient</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {!event && (
                                <button
                                    type="button"
                                    onClick={() => setIsPatientModalOpen(true)}
                                    className="bg-green-600 text-white px-3 rounded hover:bg-green-700 font-bold"
                                    title="Add New Patient"
                                >
                                    +
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Dentist</label>
                        <select
                            className="w-full border border-gray-300 rounded p-2"
                            value={dentistId}
                            onChange={(e) => setDentistId(e.target.value)}
                            required
                        >
                            <option value="">Select Dentist</option>
                            {dentists.map(d => (
                                <option key={d.id} value={d.id}>{d.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                            className="w-full border border-gray-300 rounded p-2"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Save Appointment
                        </button>
                    </div>
                </form>
            </div>

            {/* Reuse PatientModal for Quick Add */}
            <PatientModal
                isOpen={isPatientModalOpen}
                onClose={() => setIsPatientModalOpen(false)}
                onSave={handleNewPatientSave}
            />
        </div>
    );
};

export default AppointmentModal;
