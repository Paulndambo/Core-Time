import React, { useState } from 'react';
import { Plus, Receipt, Calendar, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../components/Modal';
import { formatCurrency } from '../constants/currency';

const Bills = () => {
    const [bills, setBills] = useState([
        { id: 1, name: 'Electricity', company: 'Power Co', amount: 125.50, dueDate: '2024-01-15', category: 'Utilities', status: 'pending', paidDate: null },
        { id: 2, name: 'Internet', company: 'ISP Provider', amount: 79.99, dueDate: '2024-01-20', category: 'Utilities', status: 'pending', paidDate: null },
        { id: 3, name: 'Water', company: 'Water Authority', amount: 45.00, dueDate: '2024-01-10', category: 'Utilities', status: 'paid', paidDate: '2024-01-08' },
        { id: 4, name: 'Netflix', company: 'Netflix Inc', amount: 15.99, dueDate: '2024-01-25', category: 'Subscription', status: 'pending', paidDate: null },
        { id: 5, name: 'Gym Membership', company: 'Fitness Center', amount: 49.99, dueDate: '2024-01-05', category: 'Subscription', status: 'paid', paidDate: '2024-01-03' },
        { id: 6, name: 'Phone Bill', company: 'Mobile Carrier', amount: 89.99, dueDate: '2024-01-18', category: 'Utilities', status: 'pending', paidDate: null }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBill, setNewBill] = useState({
        name: '',
        company: '',
        amount: '',
        dueDate: '',
        category: 'Utilities',
        status: 'pending'
    });

    const totalPending = bills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0);
    const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
    const overdueBills = bills.filter(b => b.status === 'pending' && new Date(b.dueDate) < new Date()).length;

    const categories = ['Utilities', 'Subscription', 'Insurance', 'Rent/Mortgage', 'Other'];

    const handleAddBill = (e) => {
        e.preventDefault();
        const bill = {
            id: uuidv4(),
            name: newBill.name,
            company: newBill.company,
            amount: parseFloat(newBill.amount),
            dueDate: newBill.dueDate,
            category: newBill.category,
            status: newBill.status,
            paidDate: newBill.status === 'paid' ? format(new Date(), 'yyyy-MM-dd') : null
        };
        setBills([bill, ...bills]);
        setIsModalOpen(false);
        setNewBill({
            name: '',
            company: '',
            amount: '',
            dueDate: '',
            category: 'Utilities',
            status: 'pending'
        });
    };

    const toggleBillStatus = (id) => {
        setBills(bills.map(bill => 
            bill.id === id 
                ? { 
                    ...bill, 
                    status: bill.status === 'paid' ? 'pending' : 'paid',
                    paidDate: bill.status === 'paid' ? null : format(new Date(), 'yyyy-MM-dd')
                }
                : bill
        ));
    };

    const getStatusColor = (status, dueDate) => {
        if (status === 'paid') return 'bg-green-100 text-green-700';
        if (new Date(dueDate) < new Date()) return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    const getStatusIcon = (status, dueDate) => {
        if (status === 'paid') return <CheckCircle size={16} />;
        if (new Date(dueDate) < new Date()) return <AlertCircle size={16} />;
        return <Clock size={16} />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Bills</h1>
                    <p className="text-[var(--color-text-secondary)]">Track and manage your recurring bills and payments.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={18} />
                    Add Bill
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-orange-600 to-orange-700 text-white border-none relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Receipt size={24} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-orange-100 text-sm">Total Pending</p>
                            <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalPending)}</h3>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Total Paid</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(totalPaid)}</h3>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: '60%' }}></div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Overdue</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{overdueBills}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">Bills past due date</p>
                </div>
            </div>

            {/* Bills List */}
            <div className="card">
                <div className="p-6 border-b border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">All Bills</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="text-left text-sm text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="pb-3 pl-6 font-medium">Bill Name</th>
                                <th className="pb-3 font-medium">Company</th>
                                <th className="pb-3 font-medium">Category</th>
                                <th className="pb-3 font-medium">Amount</th>
                                <th className="pb-3 font-medium">Due Date</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 pr-6 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {bills.map((bill) => (
                                <tr key={bill.id} className="group border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-tertiary)] transition-colors">
                                    <td className="py-4 pl-6 font-medium text-[var(--color-text-primary)]">{bill.name}</td>
                                    <td className="py-4 text-[var(--color-text-secondary)]">{bill.company}</td>
                                    <td className="py-4">
                                        <span className="px-2 py-1 rounded-md bg-[var(--color-bg-tertiary)] text-xs">
                                            {bill.category}
                                        </span>
                                    </td>
                                    <td className="py-4 font-bold text-[var(--color-text-primary)]">{formatCurrency(bill.amount)}</td>
                                    <td className="py-4 text-[var(--color-text-secondary)]">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>{format(new Date(bill.dueDate), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(bill.status, bill.dueDate)}`}>
                                            {getStatusIcon(bill.status, bill.dueDate)}
                                            {bill.status === 'paid' ? 'Paid' : new Date(bill.dueDate) < new Date() ? 'Overdue' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-6 text-right">
                                        <button
                                            onClick={() => toggleBillStatus(bill.id)}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                                bill.status === 'paid'
                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        >
                                            {bill.status === 'paid' ? 'Mark Pending' : 'Mark Paid'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Bill Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Bill"
                size="xl"
            >
                <form onSubmit={handleAddBill} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Bill Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBill.name}
                                        onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                        placeholder="e.g., Electricity"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Company</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBill.company}
                                        onChange={(e) => setNewBill({ ...newBill, company: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                        placeholder="e.g., Power Co"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Amount</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        min="0"
                                        value={newBill.amount}
                                        onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newBill.dueDate}
                                        onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Category</label>
                                    <select
                                        value={newBill.category}
                                        onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Status</label>
                                    <select
                                        value={newBill.status}
                                        onChange={(e) => setNewBill({ ...newBill, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
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
                                    Add Bill
                                </button>
                            </div>
                        </form>
            </Modal>
        </div>
    );
};

export default Bills;
