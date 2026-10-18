import React, { useState, useEffect, useRef } from 'react';
import { Bell, PackageX, CalendarClock, AlertTriangle, CalendarDays } from 'lucide-react';
import api from '../lib/api';
import { Badge } from './ui';
import { formatDate } from '../lib/format';

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [alerts, setAlerts] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        api.get('/api/alerts')
            .then((res) => setAlerts(res.data))
            .catch(() => setAlerts(null));
    }, [open]);

    useEffect(() => {
        const handler = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const count = alerts?.count || 0;
    const groups = [
        { key: 'todaysAppointments', icon: CalendarDays, color: 'text-brand-600', label: "Today's Appointments" },
        { key: 'lowStock', icon: PackageX, color: 'text-red-600', label: 'Low Stock' },
        { key: 'expiring', icon: AlertTriangle, color: 'text-amber-600', label: 'Expiring Soon' },
        { key: 'overdueLab', icon: CalendarClock, color: 'text-orange-600', label: 'Overdue Lab Cases' },
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                title="Notifications"
            >
                <Bell size={20} />
                {count > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-fade-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-800">Notifications</span>
                        {count > 0 && <Badge color="red">{count} active</Badge>}
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                        {alerts && count === 0 && (
                            <p className="px-4 py-8 text-center text-sm text-slate-400">You're all caught up 🎉</p>
                        )}
                        {groups.map((g) =>
                            (alerts?.[g.key] || []).map((item, i) => (
                                <div key={`${g.key}-${i}`} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50">
                                    <g.icon size={18} className={`${g.color} mt-0.5 shrink-0`} />
                                    <div className="min-w-0">
                                        <p className="text-sm text-slate-700">
                                            {item.patient_name || item.name}
                                            {item.lab_name ? ` · ${item.lab_name}` : ''}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {g.label}
                                            {item.expiration_date ? ` · exp ${formatDate(item.expiration_date)}` : ''}
                                            {item.due_date ? ` · due ${formatDate(item.due_date)}` : ''}
                                            {item.qty !== undefined ? ` · ${item.qty} left` : ''}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
