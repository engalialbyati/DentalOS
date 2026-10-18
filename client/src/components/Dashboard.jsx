import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, Wallet, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import api from '../lib/api';
import { dayjs, formatTime, formatCurrency, initials } from '../lib/format';
import { Card, StatCard, PageHeader, Badge, EmptyState, Spinner } from './ui';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get('/api/patients?limit=1000'),
            api.get('/api/appointments'),
            api.get('/api/invoices/stats/summary'),
            api.get('/api/alerts'),
        ])
            .then(([pts, appts, inv, al]) => {
                const apptData = appts.data;
                const patientData = pts.data;
                const today = dayjs().format('YYYY-MM-DD');
                const todays = apptData
                    .filter((a) => dayjs(a.start_time).format('YYYY-MM-DD') === today)
                    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

                // Appointments per day for the last 7 days (mini chart).
                const chart = [];
                for (let i = 6; i >= 0; i--) {
                    const d = dayjs().subtract(i, 'day');
                    const label = d.format('ddd');
                    const count = apptData.filter(
                        (a) => dayjs(a.start_time).format('YYYY-MM-DD') === d.format('YYYY-MM-DD')
                    ).length;
                    chart.push({ label, visits: count });
                }

                setData({
                    patients: patientData,
                    appointments: apptData,
                    todays,
                    stats: inv.data,
                    chart,
                });
                setAlerts(al.data);
                setError(false);
            })
            .catch((e) => { console.error('Dashboard load error', e); setError(true); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner className="min-h-[60vh]" />;
    if (error || !data) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <PageHeader title="Dashboard" />
                <Card>
                    <EmptyState title="Couldn't load dashboard data" message="Please check the server is running and try again." />
                </Card>
            </div>
        );
    }

    const { patients, todays, stats, chart } = data;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <PageHeader title="Dashboard" subtitle="Overview of your clinic activity today." />

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Users} label="Total Patients" value={patients.length} color="brand" />
                <StatCard icon={CalendarCheck} label="Today's Appointments" value={todays.length} color="blue" />
                <StatCard icon={Wallet} label="Outstanding" value={formatCurrency(stats?.outstanding || 0)} color="amber" trend={`Billed ${formatCurrency(stats?.total_billed || 0)}`} />
                <StatCard icon={AlertTriangle} label="Active Alerts" value={alerts?.count || 0} color={alerts?.count > 0 ? 'red' : 'green'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visits chart */}
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800">Appointments — Last 7 Days</h3>
                        <Badge color="brand">{data.appointments.length} total</Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chart} margin={{ left: -20, right: 8, top: 4 }}>
                            <defs>
                                <linearGradient id="visits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1f8da5" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#1f8da5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                            <Area type="monotone" dataKey="visits" stroke="#1f8da5" strokeWidth={2.5} fill="url(#visits)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Alerts panel */}
                <Card>
                    <h3 className="font-bold text-slate-800 mb-4">Needs Attention</h3>
                    <div className="space-y-3">
                        <AlertRow to="/inventory" count={alerts?.lowStock.length} label="Low stock items" />
                        <AlertRow to="/inventory" count={alerts?.expiring.length} label="Expiring soon (30d)" />
                        <AlertRow to="/lab-cases" count={alerts?.overdueLab.length} label="Overdue lab cases" />
                    </div>
                    {alerts?.count === 0 && <p className="text-sm text-slate-400 text-center py-6">Everything looks good 🎉</p>}
                </Card>
            </div>

            {/* Today's schedule */}
            <Card className="mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">Today's Schedule</h3>
                    <Link to="/schedule" className="text-sm text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
                        View calendar <ArrowRight size={15} />
                    </Link>
                </div>
                {todays.length === 0 ? (
                    <EmptyState icon={Clock} title="No appointments today" message="Your schedule is clear." />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {todays.map((a) => (
                            <div key={a.id} className="flex items-center gap-4 py-3">
                                <div className="w-11 h-11 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
                                    {initials(a.patient_name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 truncate">{a.patient_name}</p>
                                    <p className="text-sm text-slate-500">{a.notes || 'Checkup'}</p>
                                </div>
                                <Badge color={a.status === 'confirmed' ? 'green' : 'gray'}>{a.status}</Badge>
                                <span className="text-sm text-slate-500 w-20 text-right">{formatTime(a.start_time)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

function AlertRow({ to, count, label }) {
    return (
        <Link to={to} className="flex items-center justify-between py-2 group">
            <span className="text-sm text-slate-600 group-hover:text-slate-900">{label}</span>
            <Badge color={count > 0 ? 'red' : 'green'}>{count || 0}</Badge>
        </Link>
    );
}
