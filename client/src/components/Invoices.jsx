import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Download, CheckCircle2, FileText } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/format';
import { Button, Card, PageHeader, Badge, StatCard, EmptyState, Spinner } from './ui';
import InvoiceModal from './InvoiceModal';
import { generateInvoicePDF } from '../lib/pdf';

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const fetch = () => {
        Promise.all([api.get('/api/invoices'), api.get('/api/invoices/stats/summary')])
            .then(([inv, st]) => { setInvoices(inv.data); setStats(st.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const markPaid = async (id) => {
        try {
            await api.put(`/api/invoices/${id}/status`, { status: 'paid' });
            fetch();
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const download = async (id) => {
        try {
            const { data } = await api.get(`/api/invoices/${id}`);
            generateInvoicePDF(data);
        } catch (e) {
            alert('Failed to load invoice');
        }
    };

    const statusColor = { paid: 'green', unpaid: 'amber', partial: 'blue' };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <PageHeader
                title="Billing & Invoices"
                subtitle="Track payments and generate invoices."
                actions={<Button onClick={() => setModalOpen(true)}><Plus size={18} /> New Invoice</Button>}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard icon={Receipt} label="Total Billed" value={formatCurrency(stats?.total_billed)} color="blue" />
                <StatCard icon={CheckCircle2} label="Collected" value={formatCurrency(stats?.total_paid)} color="green" />
                <StatCard icon={FileText} label="Outstanding" value={formatCurrency(stats?.outstanding)} color="amber" />
            </div>

            <Card className="p-0 overflow-hidden">
                {loading ? <Spinner /> : invoices.length === 0 ? (
                    <EmptyState icon={Receipt} title="No invoices yet" message="Create your first invoice to start billing." />
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <Th>#</Th><Th>Patient</Th><Th>Issued</Th><Th>Due</Th>
                                <Th className="text-right">Amount</Th><Th>Status</Th><Th className="text-right">Actions</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/70">
                                    <Td className="font-semibold text-slate-500">INV-{String(inv.id).padStart(4, '0')}</Td>
                                    <Td className="font-medium text-slate-800">{inv.patient_name}</Td>
                                    <Td>{formatDate(inv.issue_date)}</Td>
                                    <Td>{formatDate(inv.due_date)}</Td>
                                    <Td className="text-right font-bold text-slate-800">{formatCurrency(inv.total)}</Td>
                                    <Td><Badge color={statusColor[inv.status]}>{inv.status}</Badge></Td>
                                    <Td className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => download(inv.id)} title="Download PDF"><Download size={16} /></Button>
                                            {inv.status !== 'paid' && (
                                                <Button variant="ghost" size="sm" onClick={() => markPaid(inv.id)} title="Mark paid" className="text-emerald-600"><CheckCircle2 size={16} /></Button>
                                            )}
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            <InvoiceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetch} />
        </div>
    );
}

const Th = ({ children, className = '' }) => (
    <th className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${className}`}>{children}</th>
);
const Td = ({ children, className = '' }) => (
    <td className={`px-5 py-3 text-sm text-slate-600 ${className}`}>{children}</td>
);
