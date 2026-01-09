import React, { useState } from 'react';

const StockInModal = ({ item, isOpen, onClose, onSave }) => {
    const [batchNumber, setBatchNumber] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expirationDate, setExpirationDate] = useState('');

    if (!isOpen || !item) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            item_id: item.id,
            batch_number: batchNumber,
            quantity: parseInt(quantity),
            expiration_date: expirationDate
        });
        // Reset
        setBatchNumber('');
        setQuantity('');
        setExpirationDate('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Stock In: {item.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Batch Number</label>
                        <input
                            className="w-full border p-2 rounded"
                            value={batchNumber}
                            onChange={e => setBatchNumber(e.target.value)}
                            placeholder="e.g. BATCH-001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Quantity</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Expiration Date</label>
                        <input
                            type="date"
                            className="w-full border p-2 rounded"
                            value={expirationDate}
                            onChange={e => setExpirationDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Stock</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockInModal;
