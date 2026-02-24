import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    TrendingUp,
    MoreHorizontal,
    RefreshCw
} from 'lucide-react';
import Modal from '../components/Modal';
import {
    BarChart,
    Bar,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { mockTransactions } from '../data/mockData';
import { createTransaction } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../constants/currency';

const Finances = () => {
    const { user } = useAuth();
    const [data, setData] = useState(mockTransactions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [newTransaction, setNewTransaction] = useState({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
    });

    const totalIncome = data.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = data.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    const balance = totalIncome - totalExpense;

    const chartData = data.slice(0, 7).reverse().map(t => ({
        name: format(t.date, 'MMM dd'),
        income: t.type === 'income' ? t.amount : 0,
        expense: t.type === 'expense' ? Math.abs(t.amount) : 0,
    }));

    const budgets = [
        { category: 'Food & Dining', limit: 600, spent: 450, color: 'bg-amber-500' },
        { category: 'Transportation', limit: 300, spent: 280, color: 'bg-indigo-500' },
        { category: 'Entertainment', limit: 200, spent: 85, color: 'bg-violet-500' },
        { category: 'Shopping', limit: 400, spent: 420, color: 'bg-rose-500' },
    ];

    const recurring = [
        { id: 1, name: 'Rent', amount: 1200, date: '1st of month' },
        { id: 2, name: 'Netflix', amount: 15.99, date: '15th of month' },
        { id: 3, name: 'Gym Membership', amount: 49.99, date: '5th of month' },
        { id: 4, name: 'Spotify', amount: 9.99, date: '21st of month' },
    ];

    const getIcon = (name) => {
        if (name.includes('Gym')) return <RefreshCw size={16} />;
        return <CreditCard size={16} />;
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!user || !user.id) {
            setError('User not found. Please log in again.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Get user ID - try multiple possible field names
            const userId = user.id || user.user_id || user.uuid || user.pk;
            
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }

            // Prepare transaction data according to API requirements
            const transactionData = {
                description: newTransaction.description.trim(),
                user: String(userId),
                category: newTransaction.category,
                transaction_type: newTransaction.type === 'income' ? 'Income' : 'Expense',
                amount: parseFloat(newTransaction.amount),
                transaction_date: newTransaction.date
            };

            // Create transaction via API
            const createdTransaction = await createTransaction(transactionData);

            // Update local state with the created transaction
            // Map API response to local format
            const localTransaction = {
                id: createdTransaction.id || uuidv4(),
                description: createdTransaction.description,
                amount: createdTransaction.transaction_type === 'Income'
                    ? createdTransaction.amount
                    : -Math.abs(createdTransaction.amount),
                type: createdTransaction.transaction_type.toLowerCase(),
                category: createdTransaction.category,
                date: new Date(createdTransaction.transaction_date)
            };

            setData([localTransaction, ...data]);
            setIsModalOpen(false);
            setNewTransaction({ 
                description: '', 
                amount: '', 
                type: 'expense', 
                category: 'Food', 
                date: new Date().toISOString().split('T')[0] 
            });
        } catch (err) {
            console.error('Error creating transaction:', err);
            setError(err.message || 'Failed to create transaction. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = ['Food', 'Job', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Family Support', 'Subscriptions', 'Betting', 'Groceries', 'Fast Food', 'Other'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finances</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage your income, expenses, and budgets.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary gap-2 shadow-md shadow-indigo-200/50"
                >
                    <Plus size={16} />
                    Add Transaction
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-5">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                        <Wallet size={100} className="-mr-4 -mt-4" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
                                <Wallet size={18} />
                            </div>
                            <span className="text-xs bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg font-bold">+2.5%</span>
                        </div>
                        <div className="mt-5">
                            <p className="text-indigo-200 text-xs font-medium">Total Balance</p>
                            <h3 className="text-3xl font-bold mt-0.5">{formatCurrency(balance)}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <ArrowUpRight size={18} />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Total Income</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalIncome)}</h3>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '70%' }} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                            <ArrowDownRight size={18} />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Total Expenses</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpense)}</h3>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: '45%' }} />
                    </div>
                </div>
            </div>

            {/* Budget & Recurring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 lg:col-span-2">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-sm font-bold text-slate-900">Monthly Budget</h3>
                        <button className="text-xs text-indigo-600 font-semibold hover:underline">Edit Budgets</button>
                    </div>
                    <div className="space-y-5">
                        {budgets.map((budget) => {
                            const percent = Math.min(100, Math.round((budget.spent / budget.limit) * 100));
                            const isOver = budget.spent > budget.limit;
                            return (
                                <div key={budget.category}>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="font-semibold text-slate-700">{budget.category}</span>
                                        <span className={`font-semibold ${isOver ? 'text-red-500' : 'text-slate-400'}`}>
                                            {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : budget.color}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-sm font-bold text-slate-900">Recurring</h3>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                            <Plus size={14} className="text-slate-400" />
                        </button>
                    </div>
                    <div className="space-y-1">
                        {recurring.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 group-hover:bg-white rounded-xl transition-colors text-slate-500">
                                        {getIcon(item.name)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-xs text-slate-900">{item.name}</h4>
                                        <p className="text-[11px] text-slate-400">Due {item.date}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-sm text-slate-900">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                        <div className="pt-3 mt-2 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-400">Total Fixed</span>
                            <span className="text-base font-bold text-slate-900">
                                {formatCurrency(recurring.reduce((a, c) => a + c.amount, 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-8 pr-4 py-2 bg-slate-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 border border-slate-100 w-32 md:w-auto transition-all"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-left text-[11px] text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="pb-3 pl-3 font-semibold">Description</th>
                                    <th className="pb-3 font-semibold">Category</th>
                                    <th className="pb-3 font-semibold">Date</th>
                                    <th className="pb-3 pr-3 text-right font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {data.slice(0, 5).map((transaction) => (
                                    <tr key={transaction.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 pl-3 font-semibold text-slate-900 text-sm">{transaction.description}</td>
                                        <td className="py-3.5">
                                            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
                                                {transaction.category}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-slate-500 text-xs">{format(transaction.date, 'MMM dd')}</td>
                                        <td className={`py-3.5 pr-3 text-right font-bold text-sm ${
                                            transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                                        }`}>
                                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), { showDecimals: false })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 h-96 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 mb-5">Cash Flow</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
                                        fontSize: '12px',
                                        padding: '8px 12px'
                                    }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="income" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Transaction"
                size="xl"
            >
                <form onSubmit={handleAddTransaction} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                        <input
                            type="text"
                            required
                            value={newTransaction.description}
                            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            className="input"
                            placeholder="e.g., Grocery Shopping"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={newTransaction.amount}
                                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type</label>
                            <select
                                value={newTransaction.type}
                                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                className="select"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                            <select
                                value={newTransaction.category}
                                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                className="select"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
                            <input
                                type="date"
                                required
                                value={newTransaction.date}
                                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setError(null);
                                setNewTransaction({ 
                                    description: '', 
                                    amount: '', 
                                    type: 'expense', 
                                    category: 'Food', 
                                    date: new Date().toISOString().split('T')[0] 
                                });
                            }}
                            className="flex-1 btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Finances;
