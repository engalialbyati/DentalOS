import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Odontogram from './Odontogram';

const TreatmentSession = () => {
    // State
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [selectedTooth, setSelectedTooth] = useState(null);
    const [description, setDescription] = useState('');

    const [inventoryItems, setInventoryItems] = useState([]);
    const [usedMaterials, setUsedMaterials] = useState([]); // [{ inventory_item_id, quantity }]

    const [selectedImages, setSelectedImages] = useState([]); // FileList

    // Status
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch Patients and Inventory
        const fetchData = async () => {
            try {
                const patRes = await axios.get('http://localhost:5001/api/patients');
                setPatients(patRes.data);

                const invRes = await axios.get('http://localhost:5001/api/inventory/items');
                setInventoryItems(invRes.data);
            } catch (err) {
                console.error("Error fetching data", err);
            }
        };
        fetchData();
    }, []);

    const handleToothClick = (number) => {
        setSelectedTooth(number);
    };

    const addMaterial = (itemId, qty) => {
        if (!itemId || !qty) return;
        setUsedMaterials(prev => [...prev, { inventory_item_id: itemId, quantity: qty }]);
    };

    const removeMaterial = (index) => {
        setUsedMaterials(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageChange = (e) => {
        setSelectedImages(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('patient_id', selectedPatient);
            formData.append('date', date);
            if (selectedTooth) formData.append('tooth_number', selectedTooth);
            formData.append('description', description);
            formData.append('materials', JSON.stringify(usedMaterials));

            if (selectedImages) {
                for (let i = 0; i < selectedImages.length; i++) {
                    formData.append('images', selectedImages[i]);
                }
            }

            await axios.post('http://localhost:5001/api/treatments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Treatment saved successfully!');
            // Reset form
            setDescription('');
            setSelectedTooth(null);
            setUsedMaterials([]);
            setSelectedImages([]);
            // Keep patient selected for convenience?
        } catch (err) {
            console.error(err);
            setMessage('Error saving treatment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">New Treatment Session</h1>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Context */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Patient</label>
                        <select
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={selectedPatient}
                            onChange={e => setSelectedPatient(e.target.value)}
                            required
                        >
                            <option value="">Select Patient</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* 2. Charting */}
                <div className="border p-4 rounded bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dental Chart (Select Tooth)</label>
                    <div className="flex justify-center">
                        {/* We reuse Odontogram but need to handle click differently. 
                            Currently Odontogram opens modal. We can pass a `onSelect` prop if we modify it, 
                            or just wrapper it. Let's assume we modify Odontogram to accept 'interactiveMode' prop. 
                            If 'interactiveMode' is 'select', it calls onSelect instead of opening modal.
                            For now, passing patientId null might clear chart data but allow clicking? 
                            Odontogram expects patientId to load data. 
                            If selectedPatient is set, we pass it. If null, it shows empty.
                        */}
                        {selectedPatient ? (
                            <div className="relative">
                                <Odontogram
                                    patientId={selectedPatient}
                                    onToothSelect={handleToothClick}
                                    disableModal={true} // New prop we need to add
                                />
                                {selectedTooth && (
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white p-2 rounded shadow">
                                        Selected: #{selectedTooth}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Select a patient to view chart.</p>
                        )}
                    </div>
                </div>

                {/* 3. Details */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Clinical Notes</label>
                    <textarea
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe the procedure, observations, etc."
                        required
                    />
                </div>

                {/* 4. Inventory Usage */}
                <div className="border p-4 rounded bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Materials Used</label>
                    <div className="flex gap-2 mb-2 items-end">
                        <select id="inv-select" className="border p-2 rounded flex-1">
                            <option value="">Select Item</option>
                            {inventoryItems.map(i => (
                                <option key={i.id} value={i.id}>{i.name} (Stock: ?)</option> // Ideal to show stock
                            ))}
                        </select>
                        <input id="inv-qty" type="number" className="border p-2 rounded w-20" placeholder="Qty" />
                        <button type="button"
                            className="bg-green-600 text-white px-3 py-2 rounded"
                            onClick={() => {
                                const sel = document.getElementById('inv-select');
                                const qty = document.getElementById('inv-qty');
                                addMaterial(sel.value, qty.value);
                                sel.value = "";
                                qty.value = "";
                            }}
                        >
                            Add
                        </button>
                    </div>
                    <ul className="list-disc pl-5">
                        {usedMaterials.map((m, idx) => {
                            const item = inventoryItems.find(i => String(i.id) === String(m.inventory_item_id));
                            return (
                                <li key={idx} className="flex justify-between w-64 text-sm">
                                    <span>{item?.name || m.inventory_item_id} (x{m.quantity})</span>
                                    <button type="button" onClick={() => removeMaterial(idx)} className="text-red-500 text-xs">Remove</button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* 5. Imaging */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Images (X-Rays, Photos)</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={handleImageChange}
                    />
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-bold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Saving Session...' : 'Save Treatment Session'}
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default TreatmentSession;
