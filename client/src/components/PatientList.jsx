import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PatientModal from './PatientModal';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const navigate = useNavigate();

    const fetchPatients = () => {
        axios.get('http://localhost:5001/api/patients')
            .then(res => setPatients(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleCreate = () => {
        setEditingPatient(null);
        setIsModalOpen(true);
    };

    const handleEdit = (patient, e) => {
        e.stopPropagation(); // Prevent row click
        setEditingPatient(patient);
        setIsModalOpen(true);
    };

    const handleSavePatient = (data) => {
        if (editingPatient) {
            // Update
            axios.put(`http://localhost:5001/api/patients/${editingPatient.id}`, data)
                .then(() => {
                    setIsModalOpen(false);
                    fetchPatients();
                })
                .catch(err => console.error("Error updating patient", err));
        } else {
            // Create
            axios.post('http://localhost:5001/api/patients', data)
                .then(() => {
                    setIsModalOpen(false);
                    fetchPatients();
                })
                .catch(err => console.error("Error creating patient", err));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Patients</h1>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + New Patient
                </button>
            </div>

            <div className="bg-white rounded shadow text-left overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="py-3 px-6 font-medium text-gray-500">Name</th>
                            <th className="py-3 px-6 font-medium text-gray-500">Age</th>
                            <th className="py-3 px-6 font-medium text-gray-500">Contact</th>
                            <th className="py-3 px-6 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-4 text-center text-gray-500">No patients found.</td>
                            </tr>
                        ) : (
                            patients.map(p => (
                                <tr
                                    key={p.id}
                                    onClick={() => navigate(`/patients/${p.id}`)}
                                    className="border-b hover:bg-blue-50 cursor-pointer"
                                >
                                    <td className="py-3 px-6 font-medium">{p.name}</td>
                                    <td className="py-3 px-6">{p.age}</td>
                                    <td className="py-3 px-6">{p.phone}</td>
                                    <td className="py-3 px-6 text-right">
                                        <button
                                            onClick={(e) => handleEdit(p, e)}
                                            className="text-blue-600 hover:text-blue-800 font-medium px-2"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <PatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePatient}
                initialData={editingPatient}
            />
        </div>
    );
};

export default PatientList;
