import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Odontogram from './Odontogram';
// Removed PerioChart import

const PatientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('chart');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/patients/${id}`);
                setPatient(res.data);
            } catch (err) { console.error(err); }
        };
        fetchPatient();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'history') {
            const fetchHistory = async () => {
                try {
                    const res = await axios.get(`http://localhost:5001/api/treatments/patient/${id}`);
                    setHistory(res.data);
                } catch (err) { console.error(err); }
            };
            fetchHistory();
        }
    }, [id, activeTab]);

    if (!patient) return <div className="p-4">Loading patient...</div>;

    return (
        <div className="p-6 h-screen flex flex-col">
            <button key="back-btn" onClick={() => navigate('/patients')} className="text-gray-500 mb-2 hover:underline w-fit">
                &larr; Back to Patients
            </button>

            {/* 1. Simplified Header */}
            <div className="bg-white p-4 rounded shadow mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{patient.name}</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Age: {patient.age} | Phone: {patient.phone} | First Visit: {new Date(patient.first_visit_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 text-sm">{patient.address}</p>
                        <p className="text-gray-500 text-sm">{patient.email}</p>
                    </div>
                    {/* Medical history/allergies removed from header per "Simplified" instruction, 
                        or displayed if needed. Prompt said "Display only the basic info". */}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-4">
                <button
                    className={`px-4 py-2 ${activeTab === 'chart' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('chart')}
                >
                    Dental Chart
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('history')}
                >
                    Treatment History
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-gray-50 p-4 border rounded">
                {activeTab === 'chart' && (
                    <div className="flex justify-center">
                        <Odontogram patientId={id} />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {history.length === 0 ? <p className="text-gray-500 italic">No treatment history found.</p> : null}
                        {history.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-lg">{new Date(item.date).toLocaleDateString()}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Tooth: {item.tooth_number || 'General'}</span>
                                </div>
                                <p className="text-gray-700 mb-2">{item.description}</p>

                                {item.materials && item.materials.length > 0 && (
                                    <div className="text-sm text-gray-600 mb-2">
                                        <strong>Materials:</strong> {item.materials.map(m => `${m.name} (${m.qty})`).join(', ')}
                                    </div>
                                )}

                                {item.images && item.images.length > 0 && (
                                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                        {item.images.map((img, idx) => (
                                            <a key={idx} href={`http://localhost:5001/${img}`} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={`http://localhost:5001/${img}`}
                                                    alt="Treatment"
                                                    className="h-20 w-20 object-cover rounded border hover:opacity-75 transition"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default PatientDetails;
