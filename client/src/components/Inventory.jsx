import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertTriangle, DollarSign, Calendar, Truck } from 'lucide-react';
import StockInModal from './StockInModal';

// --- SUB-COMPONENTS (Inline for speed, can check if too large) ---

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded shadow flex items-center gap-4">
        <div className={`p-3 rounded-full ${color} text-white`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const InventoryList = ({ items, onStockIn, onRefresh }) => {
    return (
        <div className="bg-white rounded shadow text-sm"> {/* text-sm for density */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3 font-medium">SKU</th>
                            <th className="p-3 font-medium">Item Name</th>
                            <th className="p-3 font-medium">Category</th>
                            <th className="p-3 font-medium">Supplier</th>
                            <th className="p-3 font-medium text-right">In Stock</th>
                            <th className="p-3 font-medium text-right">Unit Price</th>
                            <th className="p-3 font-medium text-center">Status</th>
                            <th className="p-3 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => {
                            const isLow = item.total_quantity <= item.threshold_limit;
                            return (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 text-gray-500">{item.sku || '-'}</td>
                                    <td className="p-3 font-medium text-slate-800">{item.name}</td>
                                    <td className="p-3 text-gray-600">{item.category}</td>
                                    <td className="p-3 text-gray-600">{item.supplier_name || 'N/A'}</td>
                                    <td className={`p-3 text-right font-bold ${isLow ? 'text-red-500' : 'text-slate-700'}`}>
                                        {item.total_quantity}
                                    </td>
                                    <td className="p-3 text-right">${item.unit_price}</td>
                                    <td className="p-3 text-center">
                                        {isLow && (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Low Stock</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => onStockIn(item)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 px-2 py-1 rounded bg-blue-50"
                                        >
                                            + Stock In
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SupplierList = ({ suppliers, onAdd }) => {
    return (
        <div className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Suppliers</h3>
                <button
                    onClick={onAdd}
                    className="bg-slate-800 text-white px-3 py-2 rounded text-sm hover:bg-slate-700"
                >
                    Add Supplier
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map(s => (
                    <div key={s.id} className="border p-4 rounded hover:border-blue-300">
                        <div className="font-bold text-lg">{s.name}</div>
                        <div className="text-sm text-gray-600 mt-1">Contact: {s.contact_name}</div>
                        <div className="text-sm text-gray-600">Phone: {s.phone}</div>
                        <div className="text-sm text-gray-600">Email: {s.email}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const Inventory = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [stats, setStats] = useState({ totalValue: 0, lowStockCount: 0, expiringCount: 0 });

    // Modals
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedItemForStock, setSelectedItemForStock] = useState(null);

    // Initial Load
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [itemRes, supRes, statRes] = await Promise.all([
                axios.get('http://localhost:5001/api/inventory/items'),
                axios.get('http://localhost:5001/api/inventory/suppliers'),
                axios.get('http://localhost:5001/api/inventory/dashboard/stats')
            ]);
            setItems(itemRes.data);
            setSuppliers(supRes.data);
            setStats(statRes.data);
        } catch (err) {
            console.error("Failed to load inventory data", err);
        }
    };

    const handleStockIn = async (data) => {
        try {
            await axios.post('http://localhost:5001/api/inventory/batches', data);
            setIsStockModalOpen(false);
            fetchData(); // Refresh everything
        } catch (err) {
            alert('Failed to add stock');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Inventory Value"
                    value={`$${Number(stats.totalValue).toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.lowStockCount}
                    icon={AlertTriangle}
                    color="bg-red-500"
                />
                <StatCard
                    title="Expiring Soon (30 Days)"
                    value={stats.expiringCount}
                    icon={Calendar}
                    color="bg-orange-500"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    className={`pb-2 px-4 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Stock List
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'suppliers' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('suppliers')}
                >
                    Suppliers
                </button>
            </div>

            {/* Content */}
            {activeTab === 'dashboard' && (
                <InventoryList
                    items={items}
                    onStockIn={(item) => {
                        setSelectedItemForStock(item);
                        setIsStockModalOpen(true);
                    }}
                    onRefresh={fetchData}
                />
            )}

            {activeTab === 'suppliers' && (
                <SupplierList
                    suppliers={suppliers}
                    onAdd={() => alert('Add Supplier Modal Implementation needed')}
                />
            )}

            {/* Modals */}
            <StockInModal
                item={selectedItemForStock}
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onSave={handleStockIn}
            />

        </div>
    );
};

export default Inventory;
