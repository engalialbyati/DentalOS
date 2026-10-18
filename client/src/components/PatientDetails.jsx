import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Cake, HeartPulse, Pill, AlertTriangle, Plus } from 'lucide-react';
import api from '../lib/api';
import { formatDate } from '../lib/format';
import Odontogram from './Odontogram';
import { Card, Button, Badge, Spinner, EmptyState } from './ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function PatientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('chart');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.get(`/api/patients/${id}`).then((r) => setPatient(r.data)).catch(console.error);
    }, [id]);

    useEffect(() => {
        if (activeTab === 'history') {
            api.get(`/api/treatments/patient/${id}`).then((r) => setHistory(r.data)).catch(console.error);
        }
    }, [id, activeTab]);

    if (!patient) return <Spinner className="min-h-[60vh]" />;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <button onClick={() => navigate('/patients')} className="text-slate-500 hover:text-brand-600 text-sm flex items-center gap-1 mb-4">
                <ArrowLeft size={16} /> Back to Patients
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile card */}
                <Card className="lg:col-span-1 h-fit">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold uppercase">
                            {patient.name?.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mt-3">{patient.name}</h2>
                        <p className="text-sm text-slate-400">Patient ID: {patient.id}</p>
                    </div>

                    <div className="mt-5 space-y-2.5 text-sm">
                        <InfoRow icon={Cake} label={`Age ${patient.age || '—'}`} />
                        <InfoRow icon={Phone} label={patient.phone || '—'} />
                        <InfoRow icon={Mail} label={patient.email || '—'} />
                        <InfoRow icon={MapPin} label={patient.address || '—'} />
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Medical History</p>
                        {patient.allergies && <HistoryItem icon={AlertTriangle} color="text-red-500" label="Allergies" value={patient.allergies} />}
                        <HistoryItem icon={HeartPulse} color="text-blue-500" label="Conditions" value={patient.medical_conditions} />
                        <HistoryItem icon={Pill} color="text-purple-500" label="Medications" value={patient.medications} />
                        {!patient.allergies && !patient.medical_conditions && !patient.medications && (
                            <p className="text-xs text-slate-400 italic">No medical history recorded.</p>
                        )}
                    </div>

                    <Link to="/treatment">
                        <Button className="w-full mt-5"><Plus size={18} /> New Treatment</Button>
                    </Link>
                </Card>

                {/* Chart / history */}
                <div className="lg:col-span-2">
                    <div className="flex border-b border-slate-200 mb-4">
                        <Tab active={activeTab === 'chart'} onClick={() => setActiveTab('chart')}>Dental Chart</Tab>
                        <Tab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>Treatment History</Tab>
                    </div>

                    {activeTab === 'chart' && <Odontogram patientId={id} />}

                    {activeTab === 'history' && (
                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <Card><EmptyState title="No treatment history" message="Treatments will appear here." /></Card>
                            ) : (
                                history.map((item) => (
                                    <Card key={item.id} className="border-l-4 !border-l-brand-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-slate-800">{formatDate(item.date)}</p>
                                            <Badge color="brand">{item.tooth_number ? `Tooth ${item.tooth_number}` : 'General'}</Badge>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-2">{item.description}</p>
                                        {item.materials?.length > 0 && (
                                            <p className="text-xs text-slate-500">
                                                <span className="font-semibold">Materials:</span>{' '}
                                                {item.materials.map((m) => `${m.name} (×${m.qty})`).join(', ')}
                                            </p>
                                        )}
                                        {item.images?.length > 0 && (
                                            <div className="flex gap-2 mt-3">
                                                {item.images.map((img, idx) => (
                                                    <a key={idx} href={`${API_URL}/${img}`} target="_blank" rel="noopener noreferrer">
                                                        <img src={`${API_URL}/${img}`} alt="Treatment" className="h-16 w-16 object-cover rounded-lg border hover:opacity-80" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label }) {
    return (
        <div className="flex items-center gap-2.5 text-slate-600">
            <Icon size={16} className="text-slate-400 shrink-0" /> <span>{label}</span>
        </div>
    );
}

function HistoryItem({ icon: Icon, color, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-2 mb-2">
            <Icon size={15} className={`${color} mt-0.5 shrink-0`} />
            <p className="text-xs text-slate-600"><span className="font-semibold">{label}:</span> {value}</p>
        </div>
    );
}

function Tab({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                active ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            {children}
        </button>
    );
}
