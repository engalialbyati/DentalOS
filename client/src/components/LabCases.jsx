import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const LabCases = () => {
    const [cases, setCases] = useState([]);
    const [patients, setPatients] = useState([]);

    // Quick Add Form
    const [newCase, setNewCase] = useState({ patient_id: '', lab_name: '', tooth_number: '', instruction_notes: '', due_date: '' });

    useEffect(() => {
        fetchData();
        loadPatients();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/lab-cases');
            setCases(res.data);
        } catch (err) { console.error(err); }
    };

    const loadPatients = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/patients');
            setPatients(res.data);
        } catch (err) { console.error(err); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/lab-cases', newCase);
            setNewCase({ patient_id: '', lab_name: '', tooth_number: '', instruction_notes: '', due_date: '' });
            fetchData();
        } catch (err) { alert('Error creating lab case'); }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5001/api/lab-cases/${id}`, { status });
            fetchData();
        } catch (err) { alert('Error updating status'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this case record?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/lab-cases/${id}`);
            fetchData();
        } catch (err) { alert('Error deleting case'); }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Received': return 'bg-green-100 text-green-800';
            case 'Delivered': return 'bg-blue-100 text-blue-800';
            case 'In Production': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Truck className="text-purple-600" /> Lab Case Tracker
            </h1>

            {/* ADD FORM */}
            <div className="bg-white p-4 rounded shadow mb-8 border-l-4 border-purple-600">
                <h3 className="font-bold mb-4">New Lab Case</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs mb-1">Patient</label>
                        <select className="border p-2 rounded w-full" value={newCase.patient_id} onChange={e => setNewCase({ ...newCase, patient_id: e.target.value })} required>
                            <option value="">Select Patient...</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs mb-1">Lab Name</label>
                        <input className="border p-2 rounded w-full" value={newCase.lab_name} onChange={e => setNewCase({ ...newCase, lab_name: e.target.value })} required placeholder="e.g. Modern Dental Lab" />
                    </div>
                    <div>
                        <label className="block text-xs mb-1">Tooth #</label>
                        <input className="border p-2 rounded w-full" value={newCase.tooth_number} onChange={e => setNewCase({ ...newCase, tooth_number: e.target.value })} placeholder="e.g. 19" />
                    </div>
                    <div>
                        <label className="block text-xs mb-1">Due Date</label>
                        <input type="date" className="border p-2 rounded w-full" value={newCase.due_date} onChange={e => setNewCase({ ...newCase, due_date: e.target.value })} required />
                    </div>
                    <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Create Case</button>
                    <div className="md:col-span-5">
                        <label className="block text-xs mb-1">Instructions / Notes</label>
                        <input className="border p-2 rounded w-full" value={newCase.instruction_notes} onChange={e => setNewCase({ ...newCase, instruction_notes: e.target.value })} placeholder="e.g. PFM Crown, Shade A2" />
                    </div>
                </form>
            </div>

            {/* LIST */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">Patient</th>
                            <th className="p-3">Lab</th>
                            <th className="p-3">Details</th>
                            <th className="p-3">Sent</th>
                            <th className="p-3">Due</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.map(c => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{c.patient_name}</td>
                                <td className="p-3 text-sm">{c.lab_name}</td>
                                <td className="p-3 text-sm">
                                    {c.tooth_number && <span className="font-bold mr-2">#{c.tooth_number}</span>}
                                    {c.instruction_notes}
                                </td>
                                <td className="p-3 text-sm text-gray-500">{new Date(c.sent_date).toLocaleDateString()}</td>
                                <td className="p-3 text-sm font-bold">{new Date(c.due_date).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(c.status)}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {c.status !== 'Received' && c.status !== 'Delivered' && (
                                        <button onClick={() => updateStatus(c.id, 'Received')} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mr-2">
                                            Mark Received
                                        </button>
                                    )}
                                    {c.status === 'Received' && (
                                        <button onClick={() => updateStatus(c.id, 'Delivered')} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2">
                                            Mark Delivered
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 text-xs text-right ml-2">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {cases.length === 0 && <div className="p-6 text-center text-gray-400">No active lab cases.</div>}
            </div>
        </div>
    );
};

export default LabCases;
