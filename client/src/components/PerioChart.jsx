import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Helper to generate teeth numbers
const teethNumbers = [
    ...Array.from({ length: 16 }, (_, i) => i + 1), // 1-16
    ...Array.from({ length: 16 }, (_, i) => 32 - i) // 32-17
];

const InputCell = ({ value, onChange, type }) => {
    const num = parseInt(value) || 0;
    let bgClass = "bg-white";

    // Highlight logic for Pocket Depth
    if (type === 'PD' && num > 4) {
        bgClass = "bg-red-200 text-red-900 font-bold";
    }

    return (
        <input
            type="number"
            min="0"
            max="15"
            className={`w-12 h-8 border text-center text-sm ${bgClass}`}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    );
};

const DisplayCell = ({ value }) => (
    <div className={`w-12 h-8 flex items-center justify-center text-sm bg-gray-100 font-medium`}>
        {value}
    </div>
);

const PerioToothRow = ({ toothNumber, data, onUpdate }) => {

    const safeData = {
        pocket_depths: data?.pocket_depths || ['', '', '', '', '', ''],
        gingival_margins: data?.gingival_margins || ['', '', '', '', '', ''],
        bleeding_points: data?.bleeding_points || [false, false, false, false, false, false]
    };

    const updateField = (field, index, val) => {
        const newArr = [...safeData[field]];
        newArr[index] = val;

        onUpdate(toothNumber, {
            ...safeData,
            [field]: newArr
        });
    };

    const getCAL = (index) => {
        const pd = parseInt(safeData.pocket_depths[index]) || 0;
        const gm = parseInt(safeData.gingival_margins[index]) || 0;
        return pd + gm;
    };

    const renderTriplet = (startIndex, labelPrefix) => {
        // startIndex 0 for Facial (0,1,2), 3 for Lingual (3,4,5)
        const labels = ['Dist', 'Mid', 'Mes'];

        return labels.map((site, i) => {
            const idx = startIndex + i;
            return (
                <td key={`${labelPrefix}-${site}`} className="p-1 border-r">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-[10px] text-gray-500 uppercase">{site}</div>
                        <div className="flex gap-1">
                            <div className='flex flex-col items-center'>
                                <label className='text-[8px] text-gray-400'>PD</label>
                                <InputCell
                                    type="PD"
                                    value={safeData.pocket_depths[idx]}
                                    onChange={(v) => updateField('pocket_depths', idx, v)}
                                />
                            </div>
                            <div className='flex flex-col items-center'>
                                <label className='text-[8px] text-gray-400'>GM</label>
                                <InputCell
                                    type="GM"
                                    value={safeData.gingival_margins[idx]}
                                    onChange={(v) => updateField('gingival_margins', idx, v)}
                                />
                            </div>
                            <div className='flex flex-col items-center'>
                                <label className='text-[8px] text-gray-400'>CAL</label>
                                <DisplayCell value={getCAL(idx)} />
                            </div>
                        </div>
                    </div>
                </td>
            );
        });
    };

    return (
        <tr className="border-b">
            <td className="p-2 font-bold text-center border-r bg-gray-50">{toothNumber}</td>
            {renderTriplet(0, 'facial')}
            {renderTriplet(3, 'lingual')}
        </tr>
    );
};

const PerioChart = ({ patientId }) => {
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (patientId) fetchPerioData();
    }, [patientId]);

    const fetchPerioData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5001/api/chart/periodontal/${patientId}`);
            // Transform rows to map { tooth_id: data }
            const map = {};
            res.data.forEach(row => {
                map[row.tooth_id] = row;
            });
            setChartData(map);
        } catch (err) {
            console.error("Error fetching perio data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (toothId, newData) => {
        setChartData(prev => ({
            ...prev,
            [toothId]: newData
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const promises = Object.keys(chartData).map(toothId => {
                const data = chartData[toothId];
                return axios.post('http://localhost:5001/api/chart/periodontal', {
                    patient_id: patientId,
                    tooth_id: toothId,
                    pocket_depths: data.pocket_depths,
                    gingival_margins: data.gingival_margins,
                    bleeding_points: data.bleeding_points
                });
            });

            await Promise.all(promises);
            alert('Saved successfully!');
            fetchPerioData(); // Refresh to ensure we have latest IDs if needed
        } catch (err) {
            console.error("Error saving perio data", err);
            alert('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading Perio Chart...</div>;

    return (
        <div className="overflow-x-auto p-4 bg-white shadow rounded flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Periodontal Charting</h2>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-blue-100">
                        <th className="p-2 border">Tooth</th>
                        <th className="p-2 border text-center" colSpan="3">Facial (Buccal)</th>
                        <th className="p-2 border text-center" colSpan="3">Lingual</th>
                    </tr>
                </thead>
                <tbody>
                    {teethNumbers.map(num => (
                        <PerioToothRow
                            key={num}
                            toothNumber={num}
                            data={chartData[num]}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PerioChart;
