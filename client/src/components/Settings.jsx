import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Pencil, X } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('treatments');
    const [treatments, setTreatments] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // Form States
    const [newTreatment, setNewTreatment] = useState({ name: '', cost: '', cdt_code: '', description: '' });
    const [newLookup, setNewLookup] = useState({ code: '', label: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tRes, cRes, sRes] = await Promise.all([
                axios.get('http://localhost:5001/api/treatments'),
                axios.get('http://localhost:5001/api/lookups?category=condition'),
                axios.get('http://localhost:5001/api/lookups?category=status')
            ]);
            setTreatments(tRes.data);
            setConditions(cRes.data);
            setStatuses(sRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveTreatment = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5001/api/treatments/${editingId}`, newTreatment);
            } else {
                await axios.post('http://localhost:5001/api/treatments', newTreatment);
            }
            setNewTreatment({ name: '', cost: '', cdt_code: '', description: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert('Error saving treatment');
        }
    };

    const handleStartEdit = (treatment) => {
        setNewTreatment(treatment);
        setEditingId(treatment.id);
    };

    const handleCancelEdit = () => {
        setNewTreatment({ name: '', cost: '', cdt_code: '', description: '' });
        setEditingId(null);
    };

    const handleDeleteTreatment = async (id) => {
        if (!confirm('Delete this treatment?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/treatments/${id}`);
            fetchData();
        } catch (err) {
            alert('Error deleting treatment');
        }
    };

    const handleAddLookup = async (e, category) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/lookups', { ...newLookup, category });
            setNewLookup({ code: '', label: '' });
            fetchData();
        } catch (err) {
            alert('Error adding item');
        }
    };

    const handleDeleteLookup = async (id) => {
        if (!confirm('Delete this item?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/lookups/${id}`);
            fetchData();
        } catch (err) {
            alert('Error deleting item');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <div className="flex border-b mb-6">
                {['treatments', 'conditions', 'statuses'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 capitalize font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'treatments' && (
                <div>
                    <form onSubmit={handleSaveTreatment} className="bg-white p-4 rounded shadow mb-6 flex gap-4 items-end">
                        <div>
                            <label className="block text-xs mb-1">Name</label>
                            <input className="border p-2 rounded" value={newTreatment.name} onChange={e => setNewTreatment({ ...newTreatment, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs mb-1">Code (CDT)</label>
                            <input className="border p-2 rounded w-24" value={newTreatment.cdt_code} onChange={e => setNewTreatment({ ...newTreatment, cdt_code: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs mb-1">Cost</label>
                            <input type="number" className="border p-2 rounded w-24" value={newTreatment.cost} onChange={e => setNewTreatment({ ...newTreatment, cost: e.target.value })} required />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className={`${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded flex items-center gap-2`}>
                                {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                                {editingId ? 'Update' : 'Add'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2">
                                    <X size={16} /> Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="bg-white rounded shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3 text-left">Code</th>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Cost</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {treatments.map(t => (
                                    <tr key={t.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 text-gray-500 text-sm">{t.cdt_code}</td>
                                        <td className="p-3 font-medium">{t.name}</td>
                                        <td className="p-3">${t.cost}</td>
                                        <td className="p-3 text-right flex justify-end gap-2">
                                            <button onClick={() => handleStartEdit(t)} className="text-blue-500 hover:text-blue-700">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteTreatment(t.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {(activeTab === 'conditions' || activeTab === 'statuses') && (
                <div>
                    <form onSubmit={(e) => handleAddLookup(e, activeTab === 'conditions' ? 'condition' : 'status')} className="bg-white p-4 rounded shadow mb-6 flex gap-4 items-end">
                        <div>
                            <label className="block text-xs mb-1">Label (Display Name)</label>
                            <input className="border p-2 rounded" value={newLookup.label} onChange={e => setNewLookup({ ...newLookup, label: e.target.value, code: e.target.value.toLowerCase().replace(/\s/g, '_') })} required />
                        </div>
                        <div>
                            <label className="block text-xs mb-1">System Code</label>
                            <input className="border p-2 bg-gray-100 rounded" value={newLookup.code} readOnly />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                            <Plus size={16} /> Add {activeTab === 'conditions' ? 'Condition' : 'Status'}
                        </button>
                    </form>

                    <div className="bg-white rounded shadow overflow-hidden w-full md:w-1/2">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3 text-left">Label</th>
                                    <th className="p-3 text-left">Code</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'conditions' ? conditions : statuses).map(item => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium">{item.label}</td>
                                        <td className="p-3 text-gray-500 text-sm">{item.code}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleDeleteLookup(item.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
