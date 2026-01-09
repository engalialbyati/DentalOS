import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LabCaseModal = ({ isOpen, onClose, onSave, patients, initialData }) => {
    const [patientId, setPatientId] = useState('');
    const [labName, setLabName] = useState('');
    const [toothNumber, setToothNumber] = useState('');
    const [instructionNotes, setInstructionNotes] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('Sent');

    useEffect(() => {
        if (initialData) {
            setPatientId(initialData.patient_id);
            setLabName(initialData.lab_name);
            setToothNumber(initialData.tooth_number || '');
            setInstructionNotes(initialData.instruction_notes || '');
            setDueDate(initialData.due_date ? initialData.due_date.split('T')[0] : '');
            setStatus(initialData.status);
        } else {
            // Reset for new
            setPatientId('');
            setLabName('');
            setToothNumber('');
            setInstructionNotes('');
            setDueDate('');
            setStatus('Sent');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...(initialData && { id: initialData.id }),
            patient_id: patientId,
            lab_name: labName,
            tooth_number: toothNumber,
            instruction_notes: instructionNotes,
            due_date: dueDate,
            status: status
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-[500px]">
                <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Lab Case' : 'New Lab Case'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Patient Select */}
                    <div>
                        <label className="block text-sm font-medium">Patient</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={patientId}
                            onChange={e => setPatientId(e.target.value)}
                            required
                            disabled={!!initialData} // Lock patient on edit usually
                        >
                            <option value="">Select Patient</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Lab Name */}
                    <div>
                        <label className="block text-sm font-medium">Lab Name</label>
                        <input
                            className="w-full border p-2 rounded"
                            value={labName}
                            onChange={e => setLabName(e.target.value)}
                            placeholder="e.g. Apex Dental Lab"
                            required
                        />
                    </div>

                    {/* Tooth & Due Date Row */}
                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <label className="block text-sm font-medium">Tooth #</label>
                            <input
                                type="number"
                                className="w-full border p-2 rounded"
                                value={toothNumber}
                                onChange={e => setToothNumber(e.target.value)}
                            />
                        </div>
                        <div className="w-2/3">
                            <label className="block text-sm font-medium">Due Date</label>
                            <input
                                type="date"
                                className="w-full border p-2 rounded"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <label className="block text-sm font-medium">Instructions</label>
                        <textarea
                            className="w-full border p-2 rounded h-24"
                            value={instructionNotes}
                            onChange={e => setInstructionNotes(e.target.value)}
                            placeholder="Material, shade, specifics..."
                        />
                    </div>

                    {/* Status (Only on Edit) */}
                    {initialData && (
                        <div>
                            <label className="block text-sm font-medium">Status</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                            >
                                <option value="Sent">Sent</option>
                                <option value="In Production">In Production</option>
                                <option value="Received">Received</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Case</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LabCaseModal;
