import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './format';

const BRAND = [0x1f, 0x8d, 0xa5]; // brand-500

// Generates and downloads a clean, branded invoice PDF.
export function generateInvoicePDF(invoice) {
    const doc = new jsPDF();
    const items = invoice.items || [];

    // Header band
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, 210, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('DentOS', 14, 17);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Dental Clinic Invoice', 14, 23);

    // Invoice meta
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice #INV-${String(invoice.id).padStart(4, '0')}`, 196, 15, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Issued: ${formatDate(invoice.issue_date)}`, 196, 21, { align: 'right' });
    doc.text(`Due: ${formatDate(invoice.due_date)}`, 196, 26, { align: 'right' });

    // Bill to
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('BILL TO', 14, 40);
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.patient_name || '—', 14, 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    if (invoice.phone) doc.text(`Phone: ${invoice.phone}`, 14, 51);
    if (invoice.address) doc.text(invoice.address, 14, 56);

    // Items table
    autoTable(doc, {
        startY: 64,
        head: [['Description', 'Qty', 'Unit Price', 'Amount']],
        body: items.map((it) => [
            it.description,
            String(it.quantity),
            formatCurrency(it.unit_price),
            formatCurrency(it.total),
        ]),
        headStyles: { fillColor: BRAND, halign: 'left' },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
        styles: { fontSize: 9, cellPadding: 3 },
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY || 90;
    const taxAmt = (invoice.subtotal - invoice.discount) * (invoice.tax / 100);
    const rows = [
        ['Subtotal', formatCurrency(invoice.subtotal)],
        ['Discount', formatCurrency(invoice.discount)],
        [`Tax (${invoice.tax || 0}%)`, formatCurrency(taxAmt)],
    ];
    autoTable(doc, {
        startY: finalY + 6,
        body: rows,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { halign: 'right', textColor: [110, 110, 110] }, 1: { halign: 'right' } },
        margin: { left: 120 },
    });

    const totalY = (doc.lastAutoTable.finalY || finalY + 30) + 2;
    doc.setFillColor(...BRAND);
    doc.rect(120, totalY, 76, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL', 124, totalY + 8);
    doc.text(formatCurrency(invoice.total), 192, totalY + 8, { align: 'right' });

    if (invoice.notes) {
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Notes: ${invoice.notes}`, 14, totalY + 20, { maxWidth: 110 });
    }

    // Status
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(`Status: ${invoice.status?.toUpperCase()}`, 14, totalY + 8);

    doc.save(`Invoice-${String(invoice.id).padStart(4, '0')}.pdf`);
}
