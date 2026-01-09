import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, Plus, AlertTriangle, Trash2, Pencil, Layers, X, Calendar } from 'lucide-react';

const Inventory = () => {
    const [activeTab, setActiveTab] = useState('items');
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedItemBatches, setSelectedItemBatches] = useState(null); // Item object if viewing batches
    const [batches, setBatches] = useState([]);

    // Forms
    const [newItem, setNewItem] = useState({ name: '', category: '', supplier_id: '', threshold_limit: 10, unit_price: '', sku: '' });
    const [newSupplier, setNewSupplier] = useState({ name: '', contact_name: '', phone: '', email: '' });
    const [newBatch, setNewBatch] = useState({ batch_number: '', quantity: '', expiration_date: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [iRes, sRes] = await Promise.all([
                axios.get('http://localhost:5001/api/inventory/items'),
                axios.get('http://localhost:5001/api/inventory/suppliers')
            ]);
            setItems(iRes.data);
            setSuppliers(sRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ITEM ACTIONS
    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/inventory/items', newItem);
            setNewItem({ name: '', category: '', supplier_id: '', threshold_limit: 10, unit_price: '', sku: '' });
            fetchData();
        } catch (err) { alert('Error creating item'); }
    };

    const handleDeleteItem = async (id) => {
        if (!confirm('Delete Item?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/inventory/items/${id}`);
            fetchData();
        } catch (err) { alert('Error deleting item'); }
    };

    // SUPPLIER ACTIONS
    const handleCreateSupplier = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/inventory/suppliers', newSupplier);
            setNewSupplier({ name: '', contact_name: '', phone: '', email: '' });
            fetchData();
        } catch (err) { alert('Error creating supplier'); }
    };

    // BATCH ACTIONS
    const openBatches = async (item) => {
        setSelectedItemBatches(item);
        try {
            const res = await axios.get(`http://localhost:5001/api/inventory/items/${item.id}/batches`);
            setBatches(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddBatch = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/inventory/batches', {
                ...newBatch,
                item_id: selectedItemBatches.id
            });
            setNewBatch({ batch_number: '', quantity: '', expiration_date: '' });
            openBatches(selectedItemBatches); // Refresh batches
            fetchData(); // Refresh main list totals
        } catch (err) { alert('Error adding batch'); }
    };

    return (
        <div className="p-6 relative">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Package className="text-blue-600" /> Inventory Control
            </h1>

            <div className="flex border-b mb-6">
                <button onClick={() => setActiveTab('items')} className={`px-6 py-3 font-medium flex gap-2 ${activeTab === 'items' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                    <Layers size={18} /> Master List
                </button>
                <button onClick={() => setActiveTab('suppliers')} className={`px-6 py-3 font-medium flex gap-2 ${activeTab === 'suppliers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                    <Truck size={18} /> Suppliers
                </button>
            </div>

            {/* ITEMS TAB */}
            {activeTab === 'items' && (
                <div>
                    <div className="bg-white p-4 rounded shadow mb-6">
                        <h3 className="font-bold mb-4">Add New Item Definition</h3>
                        <form onSubmit={handleCreateItem} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-xs mb-1">Item Name</label>
                                <input className="border p-2 rounded w-full" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-xs mb-1">Category</label>
                                <input className="border p-2 rounded w-full" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs mb-1">Supplier</label>
                                <select className="border p-2 rounded w-full" value={newItem.supplier_id} onChange={e => setNewItem({ ...newItem, supplier_id: e.target.value })}>
                                    <option value="">Select...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs mb-1">Min Threshold</label>
                                <input type="number" className="border p-2 rounded w-full" value={newItem.threshold_limit} onChange={e => setNewItem({ ...newItem, threshold_limit: e.target.value })} />
                            </div>
                            <div className="md:col-span-1">
                                <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded flex justify-center gap-2">
                                    <Plus size={16} /> Create
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3 text-left">SKU</th>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Category</th>
                                    <th className="p-3 text-left">Supplier</th>
                                    <th className="p-3 text-left">Total Stock</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => {
                                    const isLow = item.total_quantity <= item.threshold_limit;
                                    return (
                                        <tr key={item.id} className={`border-b hover:bg-gray-50 ${isLow ? 'bg-red-50' : ''}`}>
                                            <td className="p-3 text-xs text-gray-500">{item.sku || '-'}</td>
                                            <td className="p-3 font-medium">{item.name}</td>
                                            <td className="p-3 text-sm">{item.category}</td>
                                            <td className="p-3 text-sm">{item.supplier_name}</td>
                                            <td className="p-3">
                                                <span className={`font-bold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
                                                    {item.total_quantity}
                                                </span>
                                                {isLow && <span className="text-xs text-red-500 ml-2">(Low)</span>}
                                            </td>
                                            <td className="p-3 flex gap-2">
                                                <button onClick={() => openBatches(item)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs border border-gray-300">
                                                    Manage Stock
                                                </button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SUPPLIERS TAB */}
            {activeTab === 'suppliers' && (
                <div>
                    <form onSubmit={handleCreateSupplier} className="bg-white p-4 rounded shadow mb-6 flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs mb-1">Company Name</label>
                            <input className="border p-2 rounded w-full" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} required />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs mb-1">Rep Name</label>
                            <input className="border p-2 rounded w-full" value={newSupplier.contact_name} onChange={e => setNewSupplier({ ...newSupplier, contact_name: e.target.value })} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs mb-1">Phone</label>
                            <input className="border p-2 rounded w-full" value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                            Add Supplier
                        </button>
                    </form>
                    <div className="bg-white rounded shadow w-full md:w-3/4">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3 text-left">Company</th>
                                    <th className="p-3 text-left">Contact</th>
                                    <th className="p-3 text-left">Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map(s => (
                                    <tr key={s.id} className="border-b">
                                        <td className="p-3 font-medium">{s.name}</td>
                                        <td className="p-3">{s.contact_name}</td>
                                        <td className="p-3 text-gray-600">{s.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* BATCH MANAGER MODAL */}
            {selectedItemBatches && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl h-3/4 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Manage Stock: {selectedItemBatches.name}</h2>
                            <button onClick={() => setSelectedItemBatches(null)}><X /></button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded mb-4 border">
                            <h4 className="text-sm font-bold mb-2">Receive New Stock</h4>
                            <form onSubmit={handleAddBatch} className="flex gap-2 items-end">
                                <div>
                                    <label className="block text-xs mb-1">Batch/Lot #</label>
                                    <input className="border p-1 rounded" value={newBatch.batch_number} onChange={e => setNewBatch({ ...newBatch, batch_number: e.target.value })} required placeholder="LOT123" />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1">Quantity</label>
                                    <input type="number" className="border p-1 rounded w-20" value={newBatch.quantity} onChange={e => setNewBatch({ ...newBatch, quantity: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1">Expiration</label>
                                    <input type="date" className="border p-1 rounded" value={newBatch.expiration_date} onChange={e => setNewBatch({ ...newBatch, expiration_date: e.target.value })} required />
                                </div>
                                <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded h-8">Receive</button>
                            </form>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">Batch #</th>
                                        <th className="p-2 text-left">Qty On Hand</th>
                                        <th className="p-2 text-left">Expiry</th>
                                        <th className="p-2 text-left">Received</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batches.map(b => (
                                        <tr key={b.id} className="border-b">
                                            <td className="p-2 font-mono">{b.batch_number}</td>
                                            <td className="p-2 font-bold">{b.quantity_on_hand}</td>
                                            <td className="p-2">{new Date(b.expiration_date).toLocaleDateString()}</td>
                                            <td className="p-2 text-gray-500">{new Date(b.received_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {batches.length === 0 && <tr><td colSpan="4" className="p-4 text-center">No active batches.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Inventory;
