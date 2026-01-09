import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TreatmentPlanBuilder = () => {
    const [availableTreatments, setAvailableTreatments] = useState([]);
    const [plan, setPlan] = useState([]);
    const [insurancePercent, setInsurancePercent] = useState(0);

    useEffect(() => {
        // Fetch treatments
        axios.get('http://localhost:5001/api/treatments')
            .then(res => setAvailableTreatments(res.data))
            .catch(err => console.error("Err fetching treatments", err));
    }, []);

    const addToPlan = (treatment) => {
        // Default to Phase 1
        setPlan([...plan, { ...treatment, phase: 1, tempId: Date.now() }]);
    };

    const removeFromPlan = (tempId) => {
        setPlan(plan.filter(item => item.tempId !== tempId));
    };

    const updatePhase = (tempId, phase) => {
        setPlan(plan.map(item => item.tempId === tempId ? { ...item, phase: parseInt(phase) } : item));
    };

    // Calculations
    const calculateTotals = (phase) => {
        return plan
            .filter(item => item.phase === phase)
            .reduce((acc, curr) => acc + Number(curr.cost), 0);
    };

    const phase1Total = calculateTotals(1);
    const phase2Total = calculateTotals(2);
    const grandTotal = phase1Total + phase2Total;
    const insuranceCoverage = (grandTotal * (insurancePercent / 100));
    const patientPortion = grandTotal - insuranceCoverage;

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Dental Implementation Plan", 14, 22);

        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 32);

        // Phase 1 Table
        const phase1Rows = plan
            .filter(i => i.phase === 1)
            .map(i => [i.name, i.cdt_code || 'N/A', `$${i.cost}`]);

        if (phase1Rows.length > 0) {
            doc.text("Phase 1: Urgent Care", 14, 45);
            autoTable(doc, {
                startY: 50,
                head: [['Procedure', 'Code', 'Cost']],
                body: phase1Rows,
            });
        }

        // Phase 2 Table (position depends on previous table)
        let finalY = doc.lastAutoTable.finalY || 45;

        const phase2Rows = plan
            .filter(i => i.phase === 2)
            .map(i => [i.name, i.cdt_code || 'N/A', `$${i.cost}`]);

        if (phase2Rows.length > 0) {
            doc.text("Phase 2: Restorative / Elective", 14, finalY + 15);
            autoTable(doc, {
                startY: finalY + 20,
                head: [['Procedure', 'Code', 'Cost']],
                body: phase2Rows,
            });
            finalY = doc.lastAutoTable.finalY;
        }

        // Summary
        doc.text("Financial Summary", 14, finalY + 15);
        doc.setFontSize(10);
        doc.text(`Total Treatment Cost: $${grandTotal.toFixed(2)}`, 14, finalY + 25);
        doc.text(`Estimated Insurance (${insurancePercent}%): -$${insuranceCoverage.toFixed(2)}`, 14, finalY + 32);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Patient Responsibility: $${patientPortion.toFixed(2)}`, 14, finalY + 42);

        doc.save("treatment_plan_quote.pdf");
    };

    return (
        <div className="p-4 flex gap-4">
            {/* Left: Treatment Catalog */}
            <div className="w-1/3 border-r pr-4">
                <h3 className="font-bold mb-2">Catalog</h3>
                <div className="space-y-2 h-[500px] overflow-y-auto">
                    {availableTreatments.map(t => (
                        <div key={t.id} className="p-2 border rounded flex justify-between items-center hover:bg-gray-50">
                            <div>
                                <div className="font-bold text-sm">{t.name}</div>
                                <div className="text-xs text-gray-500">{t.cdt_code} - ${t.cost}</div>
                            </div>
                            <button
                                onClick={() => addToPlan(t)}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                            >
                                Add
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Plan Builder */}
            <div className="w-2/3">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Proposed Treatment Plan</h2>
                    <button
                        onClick={generatePDF}
                        disabled={plan.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:bg-gray-300"
                    >
                        Download Quote PDF
                    </button>
                </div>

                <div className="mb-4">
                    <label className="text-sm mr-2">Est. Insurance Coverage (%):</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        className="border rounded p-1 w-16"
                        value={insurancePercent}
                        onChange={e => setInsurancePercent(e.target.value)}
                    />
                </div>

                {/* Plan List */}
                <div className="space-y-4">
                    {/* Items */}
                    {plan.length === 0 && <div className="text-gray-400 italic">No treatments added.</div>}

                    {plan.map(item => (
                        <div key={item.tempId} className={`p-3 border rounded flex justify-between items-center ${item.phase === 1 ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                            <div>
                                <div className="font-bold">{item.name}</div>
                                <div className="text-sm">Cost: ${item.cost}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={item.phase}
                                    onChange={(e) => updatePhase(item.tempId, e.target.value)}
                                    className="border rounded p-1 text-sm bg-white"
                                >
                                    <option value={1}>Phase 1: Urgent</option>
                                    <option value={2}>Phase 2: Restorative</option>
                                </select>
                                <button onClick={() => removeFromPlan(item.tempId)} className="text-red-500 hover:text-red-700">
                                    &times;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-8 border-t pt-4">
                    <div className="flex justify-between font-bold text-gray-600">
                        <span>Phase 1 Total:</span>
                        <span>${phase1Total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-600">
                        <span>Phase 2 Total:</span>
                        <span>${phase2Total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-2">
                        <span>Grand Total:</span>
                        <span>${grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Insurance (-{insurancePercent}%):</span>
                        <span>-${insuranceCoverage.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold mt-2 text-blue-800">
                        <span>Patient Portion:</span>
                        <span>${patientPortion.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreatmentPlanBuilder;
