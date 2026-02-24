import React, { useState } from 'react';
import Modal from '../components/Modal';
import { Plus, FileText, Calendar, DollarSign, CheckCircle, Clock, X, Download, Eye, Send, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency } from '../constants/currency';

const Invoices = () => {
    const [invoices, setInvoices] = useState([
        { id: 1, invoiceNumber: 'INV-2024-001', client: 'ABC Company', amount: 2500.00, issueDate: '2024-01-05', dueDate: '2024-01-20', status: 'paid', paidDate: '2024-01-18', items: [{ description: 'Web Development', quantity: 1, rate: 2500.00 }] },
        { id: 2, invoiceNumber: 'INV-2024-002', client: 'XYZ Corp', amount: 1800.00, issueDate: '2024-01-10', dueDate: '2024-01-25', status: 'pending', paidDate: null, items: [{ description: 'Consulting Services', quantity: 8, rate: 225.00 }] },
        { id: 3, invoiceNumber: 'INV-2024-003', client: 'Tech Solutions', amount: 3200.00, issueDate: '2024-01-12', dueDate: '2024-01-27', status: 'pending', paidDate: null, items: [{ description: 'Mobile App Development', quantity: 1, rate: 3200.00 }] },
        { id: 4, invoiceNumber: 'INV-2024-004', client: 'Design Studio', amount: 950.00, issueDate: '2024-01-08', dueDate: '2024-01-23', status: 'overdue', paidDate: null, items: [{ description: 'Logo Design', quantity: 1, rate: 950.00 }] },
        { id: 5, invoiceNumber: 'INV-2024-005', client: 'Marketing Agency', amount: 1500.00, issueDate: '2024-01-15', dueDate: '2024-01-30', status: 'draft', paidDate: null, items: [{ description: 'SEO Services', quantity: 3, rate: 500.00 }] },
        { id: 6, invoiceNumber: 'INV-2024-006', client: 'Startup Inc', amount: 4200.00, issueDate: '2024-01-03', dueDate: '2024-01-18', status: 'paid', paidDate: '2024-01-15', items: [{ description: 'Full Stack Development', quantity: 1, rate: 4200.00 }] }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [newInvoice, setNewInvoice] = useState({
        invoiceNumber: '',
        client: '',
        issueDate: '',
        dueDate: '',
        items: [{ description: '', quantity: 1, rate: 0 }],
        status: 'draft'
    });

    const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const overdueInvoices = invoices.filter(i => i.status === 'overdue' || (i.status === 'pending' && new Date(i.dueDate) < new Date())).length;
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             invoice.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'overdue': return 'bg-red-100 text-red-700';
            case 'draft': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircle size={16} />;
            case 'pending': return <Clock size={16} />;
            case 'overdue': return <X size={16} />;
            case 'draft': return <FileText size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const handleAddInvoice = (e) => {
        e.preventDefault();
        const totalAmount = newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        const invoice = {
            id: uuidv4(),
            invoiceNumber: newInvoice.invoiceNumber || `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
            client: newInvoice.client,
            amount: totalAmount,
            issueDate: newInvoice.issueDate,
            dueDate: newInvoice.dueDate,
            status: newInvoice.status,
            paidDate: newInvoice.status === 'paid' ? format(new Date(), 'yyyy-MM-dd') : null,
            items: newInvoice.items
        };
        setInvoices([invoice, ...invoices]);
        setIsModalOpen(false);
        setNewInvoice({
            invoiceNumber: '',
            client: '',
            issueDate: '',
            dueDate: '',
            items: [{ description: '', quantity: 1, rate: 0 }],
            status: 'draft'
        });
    };

    const addInvoiceItem = () => {
        setNewInvoice({
            ...newInvoice,
            items: [...newInvoice.items, { description: '', quantity: 1, rate: 0 }]
        });
    };

    const updateInvoiceItem = (index, field, value) => {
        const updatedItems = [...newInvoice.items];
        updatedItems[index][field] = field === 'quantity' || field === 'rate' ? parseFloat(value) || 0 : value;
        setNewInvoice({ ...newInvoice, items: updatedItems });
    };

    const removeInvoiceItem = (index) => {
        const updatedItems = newInvoice.items.filter((_, i) => i !== index);
        setNewInvoice({ ...newInvoice, items: updatedItems });
    };

    const toggleInvoiceStatus = (id, newStatus) => {
        setInvoices(invoices.map(invoice => 
            invoice.id === id 
                ? { 
                    ...invoice, 
                    status: newStatus,
                    paidDate: newStatus === 'paid' ? format(new Date(), 'yyyy-MM-dd') : invoice.paidDate
                }
                : invoice
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Invoices</h1>
                    <p className="text-[var(--color-text-secondary)]">Create, manage, and track your invoices.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={18} />
                    Create Invoice
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-blue-100 text-sm">Total Revenue</p>
                            <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalRevenue)}</h3>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Pending</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(totalPending)}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">{invoices.filter(i => i.status === 'pending').length} invoices</p>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Paid</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(totalPaid)}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">{invoices.filter(i => i.status === 'paid').length} invoices</p>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <X size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Overdue</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{overdueInvoices}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">Requires attention</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search invoices by number or client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-[var(--color-text-muted)]" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="card">
                <div className="p-6 border-b border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">All Invoices</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="text-left text-sm text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="pb-3 pl-6 font-medium">Invoice #</th>
                                <th className="pb-3 font-medium">Client</th>
                                <th className="pb-3 font-medium">Issue Date</th>
                                <th className="pb-3 font-medium">Due Date</th>
                                <th className="pb-3 font-medium">Amount</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 pr-6 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-tertiary)] transition-colors">
                                    <td className="py-4 pl-6 font-medium text-[var(--color-text-primary)]">{invoice.invoiceNumber}</td>
                                    <td className="py-4 text-[var(--color-text-secondary)]">{invoice.client}</td>
                                    <td className="py-4 text-[var(--color-text-secondary)]">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-[var(--color-text-secondary)]">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 font-bold text-[var(--color-text-primary)]">{formatCurrency(invoice.amount)}</td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(invoice.status)}`}>
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedInvoice(invoice)}
                                                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </button>
                                            {invoice.status === 'pending' && (
                                                <button
                                                    onClick={() => toggleInvoiceStatus(invoice.id, 'paid')}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Invoice"
                size="2xl"
            >
                <form onSubmit={handleAddInvoice} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Invoice Number</label>
                                    <input
                                        type="text"
                                        value={newInvoice.invoiceNumber}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                        placeholder="Auto-generated if empty"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Client Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newInvoice.client}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                        placeholder="Client name"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Issue Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newInvoice.issueDate}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newInvoice.dueDate}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Status</label>
                                    <select
                                        value={newInvoice.status}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)]">Items</label>
                                    <button
                                        type="button"
                                        onClick={addInvoiceItem}
                                        className="text-sm text-[var(--color-accent)] hover:underline"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {newInvoice.items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-3 items-end">
                                            <div className="col-span-5">
                                                <input
                                                    type="text"
                                                    required
                                                    value={item.description}
                                                    onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                                                    className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm"
                                                    placeholder="Description"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateInvoiceItem(index, 'quantity', e.target.value)}
                                                    className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm"
                                                    placeholder="Qty"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    min="0"
                                                    value={item.rate}
                                                    onChange={(e) => updateInvoiceItem(index, 'rate', e.target.value)}
                                                    className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm"
                                                    placeholder="Rate"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                {newInvoice.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeInvoiceItem(index)}
                                                        className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-end">
                                    <div className="text-right">
                                        <p className="text-sm text-[var(--color-text-muted)]">Total Amount</p>
                                        <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                                            {formatCurrency(newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-[var(--color-border)]">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border)] transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-6 py-3 btn btn-primary"
                                >
                                    Create Invoice
                                </button>
                            </div>
                        </form>
            </Modal>

            {/* View Invoice Modal */}
            {selectedInvoice && (
                <Modal
                    isOpen={!!selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                    title={`Invoice ${selectedInvoice.invoiceNumber}`}
                    size="xl"
                >
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-[var(--color-text-muted)] mb-1">Client</p>
                                <p className="font-medium text-[var(--color-text-primary)]">{selectedInvoice.client}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--color-text-muted)] mb-1">Status</p>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${getStatusColor(selectedInvoice.status)}`}>
                                    {getStatusIcon(selectedInvoice.status)}
                                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--color-text-muted)] mb-1">Issue Date</p>
                                <p className="font-medium text-[var(--color-text-primary)]">{format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--color-text-muted)] mb-1">Due Date</p>
                                <p className="font-medium text-[var(--color-text-primary)]">{format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}</p>
                            </div>
                        </div>
                        <div className="border-t border-[var(--color-border)] pt-6">
                            <h4 className="font-medium text-[var(--color-text-primary)] mb-4">Items</h4>
                            <div className="space-y-3">
                                {selectedInvoice.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                                        <div>
                                            <p className="font-medium text-[var(--color-text-primary)]">{item.description}</p>
                                                <p className="text-sm text-[var(--color-text-muted)]">Qty: {item.quantity} × {formatCurrency(item.rate)}</p>
                                            </div>
                                            <p className="font-bold text-[var(--color-text-primary)]">{formatCurrency(item.quantity * item.rate)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex justify-end">
                                <div className="text-right">
                                    <p className="text-sm text-[var(--color-text-muted)] mb-1">Total Amount</p>
                                    <p className="text-3xl font-bold text-[var(--color-text-primary)]">{formatCurrency(selectedInvoice.amount)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button className="flex-1 px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border)] transition-colors font-medium flex items-center justify-center gap-2">
                                <Download size={18} />
                                Download PDF
                            </button>
                            {selectedInvoice.status === 'pending' && (
                                <button 
                                    onClick={() => {
                                        toggleInvoiceStatus(selectedInvoice.id, 'paid');
                                        setSelectedInvoice(null);
                                    }}
                                    className="flex-1 px-6 py-3 btn btn-primary"
                                >
                                    Mark as Paid
                                </button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Invoices;
