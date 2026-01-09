import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const Dashboard = () => {
    const [stats, setStats] = useState({ patients: 0, appointments: 0 });
    const [todaysAppointments, setTodaysAppointments] = useState([]);

    useEffect(() => {
        // Mock stats or fetch real ones if endpoints exist
        // For now, let's fetch lists and count
        const fetchData = async () => {
            try {
                const [ptsInfo, apptsInfo] = await Promise.all([
                    axios.get('http://localhost:5001/api/patients'),
                    axios.get('http://localhost:5001/api/appointments')
                ]);

                const appts = apptsInfo.data;
                const patients = ptsInfo.data;

                // Filter for today
                const today = moment().format('YYYY-MM-DD');
                const todayRes = appts.filter(a => moment(a.start_time).format('YYYY-MM-DD') === today);

                setStats({ patients: patients.length, appointments: appts.length });
                setTodaysAppointments(todayRes.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));

            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Clinic Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm uppercase">Total Patients</h3>
                    <p className="text-3xl font-bold">{stats.patients}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm uppercase">Appointments (Total)</h3>
                    <p className="text-3xl font-bold">{stats.appointments}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm uppercase">Today's Visits</h3>
                    <p className="text-3xl font-bold">{todaysAppointments.length}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
                {todaysAppointments.length === 0 ? (
                    <p className="text-gray-500">No appointments scheduled for today.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Time</th>
                                    <th className="text-left py-2">Patient</th>
                                    <th className="text-left py-2">Provider</th>
                                    <th className="text-left py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todaysAppointments.map(appt => (
                                    <tr key={appt.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2">{moment(appt.start_time).format('LT')}</td>
                                        <td className="py-2 font-medium">{appt.patient_first} {appt.patient_last}</td>
                                        <td className="py-2 text-gray-600">{appt.dentist_name || 'Unassigned'}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded text-xs ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
