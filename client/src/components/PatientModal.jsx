import React, { useState } from 'react';

const PatientModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        phone: '',
        email: '',
        address: '',
        first_visit_date: new Date().toISOString().split('T')[0]
    });

    // Populate form if editing
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                age: initialData.age || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                address: initialData.address || '',
                first_visit_date: initialData.first_visit_date ? initialData.first_visit_date.split('T')[0] : ''
            });
        } else {
            // Reset for new
            setFormData({
                name: '',
                age: '',
                phone: '',
                email: '',
                address: '',
                first_visit_date: new Date().toISOString().split('T')[0]
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Patient' : 'New Patient'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            className="w-full border p-2 rounded"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2 mb-3">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium mb-1">Age</label>
                            <input
                                type="number"
                                className="w-full border p-2 rounded"
                                required
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium mb-1">First Visit</label>
                            <input
                                type="date"
                                className="w-full border p-2 rounded"
                                value={formData.first_visit_date}
                                onChange={e => setFormData({ ...formData, first_visit_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                            className="w-full border p-2 rounded"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border p-2 rounded"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <textarea
                            className="w-full border p-2 rounded h-20"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientModal;
