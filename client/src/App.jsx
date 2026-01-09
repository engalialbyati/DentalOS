import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Activity, Package, Truck } from 'lucide-react';

import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PatientDetails from './components/PatientDetails';
import AppointmentScheduler from './components/AppointmentScheduler';
import Settings from './components/Settings';
import Inventory from './components/Inventory';
import LabCases from './components/LabCases';

import TreatmentSession from './components/TreatmentSession';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/schedule', label: 'Schedule', icon: Calendar },
    { path: '/treatment', label: 'Treatment', icon: Activity }, // New Link
    { path: '/settings', label: 'Settings', icon: Activity },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/lab-cases', label: 'Lab Cases', icon: Truck },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen">
      <div className="p-6 font-bold text-2xl tracking-wider">DENT<span className="text-blue-400">OS</span></div>
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        v1.0.0
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100 font-sans text-slate-900">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/schedule" element={<AppointmentScheduler />} />
            <Route path="/treatment" element={<TreatmentSession />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/lab-cases" element={<LabCases />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
