import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tooth from './Tooth';
import TreatmentModal from './TreatmentModal';

// Helper to generate range
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

const Odontogram = ({ patientId, onToothSelect, disableModal, selectedTeeth = [] }) => {
    const [chartData, setChartData] = useState({});
    const [selectedTooth, setSelectedTooth] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch chart data
    const fetchChartData = async () => {
        if (!patientId) return; // Skip if no patient
        try {
            setLoading(true);
            // Ensure backend URL is configured. Assuming proxy or direct URL for now.
            const res = await axios.get(`http://localhost:5001/api/chart/${patientId}`);
            // Transform array to object { tooth_id: { status, condition_description, ... } }
            const dataMap = {};
            res.data.forEach(entry => {
                dataMap[entry.tooth_id] = entry;
            });
            setChartData(dataMap);
        } catch (err) {
            console.error("Error fetching chart data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patientId) {
            fetchChartData();
        } else {
            setChartData({}); // Clear data if no patient
        }
    }, [patientId]);

    const handleToothClick = (number) => {
        if (onToothSelect) onToothSelect(number);

        if (!disableModal) {
            setSelectedTooth(number);
            setIsModalOpen(true);
        }
    };

    const handleSaveTreatment = async (data) => {
        try {
            await axios.post('http://localhost:5001/api/chart', {
                patient_id: patientId,
                tooth_id: selectedTooth,
                ...data
            });
            setIsModalOpen(false);
            fetchChartData(); // Refresh
        } catch (err) {
            console.error("Error saving treatment", err);
        }
    };

    // Universal Numbering System Layout
    // Upper Arch: 1-16 (Right to Left in patient view implies 1 is Top Right, 16 Top Left)
    // Rendering: usually 1-16 in a row, or arch.
    // Standard chart: 1-16 (top), 32-17 (bottom, reverse order to match mouth) or 17-32 left-to-right?
    // Let's stick to standard graphical representation:
    // Top Row: 1 - 16
    // Bottom Row: 32 - 17 (so 32 is under 1, 17 under 16)

    const upperTeeth = range(1, 16);
    const lowerTeeth = range(17, 32).reverse(); // 32 down to 17

    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Patient Odontogram</h2>

            {loading ? (
                <div>Loading chart...</div>
            ) : (
                <div className="flex flex-col items-center gap-8">
                    {/* Upper Arch */}
                    <div className="flex gap-2">
                        {upperTeeth.map(id => (
                            <Tooth
                                key={id}
                                number={id}
                                status={chartData[id]?.status || 'Healthy'}
                                isSelected={selectedTeeth.includes(id)}
                                onClick={handleToothClick}
                            />
                        ))}
                    </div>

                    <div className="w-full border-t border-gray-300"></div>

                    {/* Lower Arch */}
                    <div className="flex gap-2">
                        {lowerTeeth.map(id => (
                            <Tooth
                                key={id}
                                number={id}
                                status={chartData[id]?.status || 'Healthy'}
                                isSelected={selectedTeeth.includes(id)}
                                onClick={handleToothClick}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <TreatmentModal
                    isOpen={isModalOpen}
                    toothNumber={selectedTooth}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTreatment}
                    currentData={chartData[selectedTooth]}
                />
            )}
        </div>
    );
};

export default Odontogram;
