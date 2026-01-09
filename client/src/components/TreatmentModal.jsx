import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TreatmentModal = ({ isOpen, toothNumber, onClose, onSave, currentData }) => {
    const [condition, setCondition] = useState('');
    const [treatmentId, setTreatmentId] = useState('');
    const [status, setStatus] = useState('planned');
    const [treatmentsList, setTreatmentsList] = useState([]);
    const [conditionsList, setConditionsList] = useState([]);
    const [statusesList, setStatusesList] = useState([]);

    useEffect(() => {
        // Load treatments, conditions, and statuses catalog
        const fetchData = async () => {
            try {
                const [tRes, cRes, sRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/treatments'),
                    axios.get('http://localhost:5001/api/lookups?category=condition'),
                    axios.get('http://localhost:5001/api/lookups?category=status')
                ]);
                setTreatmentsList(tRes.data);
                setConditionsList(cRes.data);
                setStatusesList(sRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();

        if (currentData) {
            setCondition(currentData.condition_description || '');
            setTreatmentId(currentData.treatment_id || '');
            setStatus(currentData.status || 'planned');
        }
    }, [currentData, isOpen]); // Reload when opening to ensure fresh data

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            condition_description: condition,
            treatment_id: treatmentId || null,
            status
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
                <h3 className="text-lg font-bold mb-4">Tooth #{toothNumber} Details</h3>
                <form onSubmit={handleSubmit}>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Condition</label>
                        <select
                            className="w-full border border-gray-300 rounded p-2"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                        >
                            <option value="">Select Condition</option>
                            {conditionsList.map(c => (
                                <option key={c.id} value={c.code}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Treatment</label>
                        <select
                            className="w-full border border-gray-300 rounded p-2"
                            value={treatmentId}
                            onChange={(e) => setTreatmentId(e.target.value)}
                        >
                            <option value="">Select Treatment</option>
                            {treatmentsList.map(t => (
                                <option key={t.id} value={t.id}>{t.name} (${t.cost})</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            className="w-full border border-gray-300 rounded p-2"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            {statusesList.map(s => (
                                <option key={s.id} value={s.code}>{s.label}</option>
                            ))}
                        </select>
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
                            Save
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default TreatmentModal;
