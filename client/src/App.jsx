import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, Activity, Package, Truck, Receipt,
    LogOut, Stethoscope,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/ui';
import NotificationBell from './components/NotificationBell';
import Login from './components/Login';

// Code-split each route into its own chunk (lazy loading).
const Dashboard = lazy(() => import('./components/Dashboard'));
const PatientList = lazy(() => import('./components/PatientList'));
const PatientDetails = lazy(() => import('./components/PatientDetails'));
const AppointmentScheduler = lazy(() => import('./components/AppointmentScheduler'));
const TreatmentSession = lazy(() => import('./components/TreatmentSession'));
const Settings = lazy(() => import('./components/Settings'));
const Inventory = lazy(() => import('./components/Inventory'));
const LabCases = lazy(() => import('./components/LabCases'));
const Invoices = lazy(() => import('./components/Invoices'));

const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/schedule', label: 'Schedule', icon: Calendar },
    { path: '/treatment', label: 'Treatment', icon: Activity },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/lab-cases', label: 'Lab Cases', icon: Truck },
    { path: '/billing', label: 'Billing', icon: Receipt },
    { path: '/settings', label: 'Settings', icon: Stethoscope },
];

function Sidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 bg-brand-800 text-white flex flex-col h-screen shrink-0">
            <div className="px-6 py-5 flex items-center gap-2.5 border-b border-white/10">
                <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
                    <Stethoscope size={20} />
                </div>
                <span className="text-xl font-extrabold tracking-tight">Dent<span className="text-brand-300">OS</span></span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-brand-100/80 hover:bg-white/10'
                            }`}
                        >
                            <Icon size={19} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="px-3 py-3 border-t border-white/10">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-sm font-bold uppercase">
                        {user?.full_name?.[0] || user?.username?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.full_name || user?.username}</p>
                        <p className="text-xs text-brand-200 capitalize">{user?.role}</p>
                    </div>
                    <button onClick={logout} title="Sign out" className="p-1.5 rounded-lg hover:bg-white/10 text-brand-200 hover:text-white">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

function TopBar() {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            <div className="text-sm text-slate-400">Clinic Management System</div>
            <NotificationBell />
        </header>
    );
}

function ProtectedLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <Spinner className="min-h-screen" />;
    if (!isAuthenticated) return <Login />;

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-auto">
                    <Suspense fallback={<Spinner className="min-h-[60vh]" />}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/patients" element={<PatientList />} />
                            <Route path="/patients/:id" element={<PatientDetails />} />
                            <Route path="/schedule" element={<AppointmentScheduler />} />
                            <Route path="/treatment" element={<TreatmentSession />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/lab-cases" element={<LabCases />} />
                            <Route path="/billing" element={<Invoices />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <ProtectedLayout />
        </Router>
    );
}
