import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Calendar,
    DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { getTransactions, createTransaction, updateTransactionStatus } from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatCurrencyWithSign } from '../constants/currency';

const Transactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [transactionToConfirm, setTransactionToConfirm] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [newTransaction, setNewTransaction] = useState({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'Mpesa'
    });

    // Fetch transactions on component mount
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getTransactions();
            // Handle paginated response
            const transactionsList = data.results || data || [];
            setTransactions(transactionsList);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(err.message || 'Failed to load transactions. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
            const userId = user.id || user.user_id || user.uuid || user.pk;
            
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }

            const transactionData = {
                description: newTransaction.description.trim(),
                user: String(userId),
                category: newTransaction.category,
                transaction_type: newTransaction.type === 'income' ? 'Income' : 'Expense',
                amount: parseFloat(newTransaction.amount),
                transaction_date: newTransaction.date,
                payment_method: newTransaction.payment_method
            };

            await createTransaction(transactionData);
            
            // Refresh transactions list
            await fetchTransactions();
            
            setIsModalOpen(false);
            setNewTransaction({ 
                description: '', 
                amount: '', 
                type: 'expense', 
                category: 'Food', 
                date: new Date().toISOString().split('T')[0],
                payment_method: 'Mpesa'
            });
        } catch (err) {
            console.error('Error creating transaction:', err);
            setError(err.message || 'Failed to create transaction. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            transaction.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || 
                           transaction.transaction_type?.toLowerCase() === filterType.toLowerCase();
        return matchesSearch && matchesType;
    });

    const categories = ['Food', 'Job', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Salary', 'Family Support', 'Subscriptions', 'Betting', 'Groceries', 'Fast Food', 'Other'];

    const formatAmount = (amount, transactionType) => {
        return formatCurrencyWithSign(amount, transactionType);
    };

    const getTypeColor = (type) => {
        return type === 'Income' 
            ? 'text-emerald-600 bg-emerald-50' 
            : 'text-red-600 bg-red-50';
    };

    const handleConfirmClick = (transaction) => {
        setTransactionToConfirm(transaction);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmTransaction = async () => {
        if (!transactionToConfirm) return;
        
        setError(null);
        setIsConfirming(true);
        
        try {
            await updateTransactionStatus(transactionToConfirm.id, 'Confirmed');
            await fetchTransactions();
            setIsConfirmModalOpen(false);
            setTransactionToConfirm(null);
        } catch (err) {
            console.error('Error confirming transaction:', err);
            setError(err.message || 'Failed to confirm transaction. Please try again.');
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions</h1>
                    <p className="text-slate-500 text-sm mt-0.5">View and manage all your financial transactions.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchTransactions}
                        className="btn btn-secondary gap-2"
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary gap-2 shadow-md shadow-indigo-200/50"
                    >
                        <Plus size={16} />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 border border-slate-100"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                filterType === 'all'
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType('income')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                filterType === 'income'
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Income
                        </button>
                        <button
                            onClick={() => setFilterType('expense')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                filterType === 'expense'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Expense
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Summary Metrics */}
            {!isLoading && filteredTransactions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
                                <DollarSign size={18} />
                            </div>
                            <span className="text-xs font-semibold text-slate-400">Total Transactions</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{filteredTransactions.length}</h3>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <ArrowUpRight size={18} />
                            </div>
                            <span className="text-xs font-semibold text-slate-400">Total Income</span>
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(filteredTransactions
                                .filter(t => t.transaction_type === 'Income')
                                .reduce((sum, t) => sum + parseFloat(t.amount), 0))}
                        </h3>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                                <ArrowDownRight size={18} />
                            </div>
                            <span className="text-xs font-semibold text-slate-400">Total Expenses</span>
                        </div>
                        <h3 className="text-2xl font-bold text-red-600">
                            {formatCurrency(filteredTransactions
                                .filter(t => t.transaction_type === 'Expense')
                                .reduce((sum, t) => sum + parseFloat(t.amount), 0))}
                        </h3>
                    </div>
                </div>
            )}

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw size={24} className="animate-spin text-indigo-600" />
                        <span className="ml-3 text-slate-600">Loading transactions...</span>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <DollarSign size={48} className="mb-3 opacity-50" />
                        <p className="text-sm font-medium">No transactions found</p>
                        <p className="text-xs mt-1">
                            {searchQuery || filterType !== 'all' 
                                ? 'Try adjusting your filters' 
                                : 'Add your first transaction to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-left text-xs text-slate-400 border-b border-slate-100 bg-slate-50/50">
                                <tr>
                                    <th className="pb-3 pl-6 font-semibold">Description</th>
                                    <th className="pb-3 font-semibold">Category</th>
                                    <th className="pb-3 font-semibold">Type</th>
                                    <th className="pb-3 font-semibold">Date</th>
                                    <th className="pb-3 font-semibold">Payment Method</th>
                                    <th className="pb-3 pr-6 text-right font-semibold">Amount</th>
                                    <th className="pb-3 pr-6 font-semibold">Confirmation</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-50">
                                {filteredTransactions.map((transaction) => (
                                    <tr 
                                        key={transaction.id} 
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="py-4 pl-6 font-semibold text-slate-900">
                                            {transaction.description}
                                        </td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                                                {transaction.category}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getTypeColor(transaction.transaction_type)}`}>
                                                {transaction.transaction_type}
                                            </span>
                                        </td>
                                        <td className="py-4 text-slate-500">
                                            {transaction.transaction_date 
                                                ? format(new Date(transaction.transaction_date), 'MMM dd, yyyy')
                                                : transaction.created_at
                                                ? format(new Date(transaction.created_at), 'MMM dd, yyyy')
                                                : 'N/A'}
                                        </td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                                                {transaction.payment_method || 'N/A'}
                                            </span>
                                        </td>
                                        <td className={`py-4 pr-6 text-right font-bold ${
                                            transaction.transaction_type === 'Income' 
                                                ? 'text-emerald-600' 
                                                : 'text-slate-900'
                                        }`}>
                                            {formatAmount(transaction.amount, transaction.transaction_type)}
                                        </td>
                                        <td className="py-4 pr-6">
                                            {String(transaction.status || '').toLowerCase() === 'confirmed' ? (
                                                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                                    Confirmed
                                                </span>
                                            ) : String(transaction.status || '').toLowerCase() === 'pending' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleConfirmClick(transaction)}
                                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm"
                                                >
                                                    Confirm
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-500">
                                                    {transaction.status || 'N/A'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Transaction Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
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
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method</label>
                        <select
                            value={newTransaction.payment_method}
                            onChange={(e) => setNewTransaction({ ...newTransaction, payment_method: e.target.value })}
                            className="select"
                        >
                            <option value="Mpesa">Mpesa</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                        </select>
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

            {/* Confirm Transaction Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setTransactionToConfirm(null);
                }}
                title="Confirm Transaction"
                size="md"
            >
                <div className="p-6 space-y-4">
                    {transactionToConfirm && (
                        <>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">Description:</span>
                                    <span className="text-sm font-semibold text-slate-900">{transactionToConfirm.description}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">Amount:</span>
                                    <span className={`text-sm font-bold ${
                                        transactionToConfirm.transaction_type === 'Income' 
                                            ? 'text-emerald-600' 
                                            : 'text-slate-900'
                                    }`}>
                                        {formatAmount(transactionToConfirm.amount, transactionToConfirm.transaction_type)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">Date:</span>
                                    <span className="text-sm font-semibold text-slate-900">
                                        {transactionToConfirm.transaction_date 
                                            ? format(new Date(transactionToConfirm.transaction_date), 'MMM dd, yyyy')
                                            : transactionToConfirm.created_at
                                            ? format(new Date(transactionToConfirm.created_at), 'MMM dd, yyyy')
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-700">
                                Are you sure you want to confirm this transaction? This action cannot be undone.
                            </p>
                        </>
                    )}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmModalOpen(false);
                                setTransactionToConfirm(null);
                                setError(null);
                            }}
                            className="flex-1 btn btn-secondary"
                            disabled={isConfirming}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button"
                            onClick={handleConfirmTransaction}
                            className="flex-1 btn btn-primary"
                            disabled={isConfirming}
                        >
                            {isConfirming ? 'Confirming...' : 'Yes, Confirm'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Transactions;
