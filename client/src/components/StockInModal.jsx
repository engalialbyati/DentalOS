import React, { useState } from 'react';
import { Modal, Button, Field, Input } from './ui';

export default function StockInModal({ item, isOpen, onClose, onSave }) {
    const [batchNumber, setBatchNumber] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expirationDate, setExpirationDate] = useState('');

    if (!isOpen || !item) return null;

    const reset = () => { setBatchNumber(''); setQuantity(''); setExpirationDate(''); };

    const submit = (e) => {
        e.preventDefault();
        onSave({ item_id: item.id, batch_number: batchNumber, quantity: parseInt(quantity), expiration_date: expirationDate });
        reset();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Stock In — ${item.name}`}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Batch Number">
                    <Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="e.g. BATCH-001" />
                </Field>
                <Field label="Quantity" required>
                    <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </Field>
                <Field label="Expiration Date" required>
                    <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} required />
                </Field>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Stock</Button>
                </div>
            </form>
        </Modal>
    );
}
