import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Calendar, CheckSquare, Clock, Plus } from 'lucide-react';
import LabCaseModal from './LabCaseModal';
import moment from 'moment';

const StatusBadge = ({ status }) => {
    const colors = {
        'Sent': 'bg-yellow-100 text-yellow-800',
        'In Production': 'bg-blue-100 text-blue-800',
        'Received': 'bg-green-100 text-green-800',
        'Delivered': 'bg-gray-100 text-gray-800',
        'Quality Checked': 'bg-purple-100 text-purple-800'
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

const LabCases = () => {
    const [cases, setCases] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);

    useEffect(() => {
        fetchData();
        fetchPatients();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5001/api/lab-cases');
            setCases(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/patients');
            setPatients(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (caseData) => {
        try {
            if (caseData.id) {
                // Update
                await axios.put(`http://localhost:5001/api/lab-cases/${caseData.id}`, caseData);
            } else {
                // Create
                await axios.post('http://localhost:5001/api/lab-cases', caseData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Error saving lab case');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`http://localhost:5001/api/lab-cases/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleQuickStatus = async (item, newStatus) => {
        try {
            await axios.put(`http://localhost:5001/api/lab-cases/${item.id}`, {
                status: newStatus,
                received_date: newStatus === 'Received' ? new Date() : item.received_date
            });
            fetchData();
        } catch (err) {
            alert('Update failed');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Lab Cases Tracker</h1>
                <button
                    onClick={() => { setSelectedCase(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
                >
                    <Plus size={18} /> New Lab Case
                </button>
            </div>

            <div className="bg-white rounded shadow text-sm">
                {loading ? <div className="p-4 text-center">Loading...</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3">Due Date</th>
                                    <th className="p-3">Patient</th>
                                    <th className="p-3">Lab</th>
                                    <th className="p-3">Tooth</th>
                                    <th className="p-3">Instructions</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cases.map(c => (
                                    <tr key={c.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium flex items-center gap-2">
                                            {moment(c.due_date).format('MMM D')}
                                            {moment(c.due_date).isBefore(moment(), 'day') && c.status !== 'Delivered' && (
                                                <span className="text-red-500" title="Overdue"><AlertCircle size={14} /></span>
                                            )}
                                        </td>
                                        <td className="p-3">{c.patient_name}</td>
                                        <td className="p-3 text-gray-600">{c.lab_name}</td>
                                        <td className="p-3 font-bold">#{c.tooth_number}</td>
                                        <td className="p-3 text-gray-500 max-w-[200px] truncate">{c.instruction_notes}</td>
                                        <td className="p-3"><StatusBadge status={c.status} /></td>
                                        <td className="p-3 text-right">
                                            {c.status === 'Sent' && (
                                                <button onClick={() => handleQuickStatus(c, 'Received')} className="text-green-600 hover:underline mr-2 text-xs">Mark Received</button>
                                            )}
                                            <button onClick={() => { setSelectedCase(c); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800 mr-2 text-xs">Edit</button>
                                            <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {cases.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-6 text-center text-gray-400">No active lab cases</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <LabCaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                patients={patients}
                initialData={selectedCase}
            />
        </div>
    );
};

// Simple Alert Icon component since I missed importing only one icon
const AlertCircle = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

export default LabCases;
