import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import Tooth from './Tooth';
import TreatmentModal from './TreatmentModal';
import { Card, Spinner } from './ui';

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

export default function Odontogram({ patientId, onToothSelect, disableModal, selectedTeeth = [] }) {
    const [chartData, setChartData] = useState({});
    const [selectedTooth, setSelectedTooth] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchChartData = async () => {
        if (!patientId) return;
        try {
            setLoading(true);
            const res = await api.get(`/api/chart/${patientId}`);
            setChartData(Object.fromEntries(res.data.map((e) => [e.tooth_id, e])));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (patientId) fetchChartData();
        else setChartData({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    const handleClick = (number) => {
        if (onToothSelect) onToothSelect(number);
        if (!disableModal) { setSelectedTooth(number); setIsModalOpen(true); }
    };

    const save = async (data) => {
        try {
            await api.post('/api/chart', { patient_id: patientId, tooth_id: selectedTooth, ...data });
            setIsModalOpen(false);
            fetchChartData();
        } catch (e) { console.error(e); }
    };

    const upperTeeth = range(1, 16);
    const lowerTeeth = range(17, 32).reverse();

    return (
        <Card>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Odontogram</h2>
            <p className="text-xs text-slate-400 mb-4">Universal Numbering System</p>

            {loading ? <Spinner /> : (
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {upperTeeth.map((id) => (
                            <Tooth key={id} number={id} status={chartData[id]?.status || 'Healthy'} isSelected={selectedTeeth.includes(id)} onClick={handleClick} />
                        ))}
                    </div>
                    <div className="w-full border-t border-dashed border-slate-200" />
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {lowerTeeth.map((id) => (
                            <Tooth key={id} number={id} status={chartData[id]?.status || 'Healthy'} isSelected={selectedTeeth.includes(id)} onClick={handleClick} />
                        ))}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <TreatmentModal
                    isOpen={isModalOpen}
                    toothNumber={selectedTooth}
                    onClose={() => setIsModalOpen(false)}
                    onSave={save}
                    currentData={chartData[selectedTooth]}
                />
            )}
        </Card>
    );
}
