import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Calendar, 
    DollarSign, 
    TrendingUp, 
    AlertCircle, 
    RefreshCw, 
    Plus,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import Modal from '../components/Modal';
import { getLoanDetails, createLoanTransaction } from '../services/api';
import { formatCurrency } from '../constants/currency';

const LoanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loan, setLoan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        transaction_type: 'PAYMENT',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchLoanDetails();
    }, [id]);

    const fetchLoanDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getLoanDetails(id);
            setLoan(data);
        } catch (err) {
            console.error('Error fetching loan details:', err);
            setError(err.message || 'Failed to load loan details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const transactionData = {
                transaction_type: newTransaction.transaction_type,
                amount: parseFloat(newTransaction.amount),
                transaction_date: newTransaction.transaction_date
            };

            await createLoanTransaction(id, transactionData);
            
            // Refresh loan details
            await fetchLoanDetails();
            
            setIsModalOpen(false);
            setNewTransaction({
                transaction_type: 'PAYMENT',
                amount: '',
                transaction_date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error('Error creating transaction:', err);
            setError(err.message || 'Failed to create transaction. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw size={32} className="animate-spin text-indigo-600" />
                <span className="ml-3 text-slate-600 text-lg">Loading loan details...</span>
            </div>
        );
    }

    if (error && !loan) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/loans')}
                    className="mt-4 btn btn-secondary flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Back to Loans
                </button>
            </div>
        );
    }

    if (!loan) return null;

    const principalAmount = parseFloat(loan.principal_amount);
    const outstandingBalance = parseFloat(loan.outstanding_balance);
    const totalPaid = principalAmount - outstandingBalance;
    const percentageRemaining = principalAmount > 0 ? (outstandingBalance / principalAmount) * 100 : 0;
    const percentagePaid = 100 - percentageRemaining;

    return (
        <div className="space-y-4 sm:space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                    <button
                        onClick={() => navigate('/loans')}
                        className="mt-1 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                            {loan.counterparty_name}
                        </h1>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                loan.direction === 'Borrowed' 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-green-100 text-green-700'
                            }`}>
                                {loan.direction}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                {parseFloat(loan.interest_rate).toFixed(2)}% Interest
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                        onClick={fetchLoanDetails}
                        className="btn btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                        disabled={isLoading}
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                    >
                        <Plus size={18} />
                        <span>Add Transaction</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <div className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-600">Principal Amount</h3>
                        <DollarSign className="text-blue-600" size={18} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{formatCurrency(principalAmount)}</p>
                    <p className="text-xs text-slate-500 mt-1">Original loan amount</p>
                </div>
                <div className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-600">Outstanding</h3>
                        <DollarSign className="text-red-600" size={18} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">{formatCurrency(outstandingBalance)}</p>
                    <p className="text-xs text-slate-500 mt-1">{percentageRemaining.toFixed(1)}% remaining</p>
                </div>
                <div className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-600">Total Paid</h3>
                        <DollarSign className="text-green-600" size={18} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                    <p className="text-xs text-slate-500 mt-1">{percentagePaid.toFixed(1)}% paid off</p>
                </div>
                <div className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-600">Transactions</h3>
                        <TrendingUp className="text-indigo-600" size={18} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{loan.transactions?.length || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Total recorded</p>
                </div>
            </div>

            {/* Loan Information */}
            <div className="card p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Loan Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                        <p className="text-xs sm:text-sm text-slate-500 mb-1">Start Date</p>
                        <div className="flex items-center gap-2 text-slate-900">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="font-semibold">{new Date(loan.start_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-slate-500 mb-1">Due Date</p>
                        <div className="flex items-center gap-2 text-slate-900">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="font-semibold">{new Date(loan.due_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-slate-500 mb-1">Interest Rate</p>
                        <div className="flex items-center gap-2 text-slate-900">
                            <TrendingUp size={16} className="text-slate-400" />
                            <span className="font-semibold">{parseFloat(loan.interest_rate).toFixed(2)}%</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Repayment Progress</span>
                        <span className="text-sm font-bold text-slate-900">{percentagePaid.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentagePaid}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="card">
                <div className="p-4 sm:p-6 border-b border-slate-200">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Transaction History</h2>
                </div>
                {!loan.transactions || loan.transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <CreditCard size={48} className="mb-3 opacity-50" />
                        <p className="text-sm font-medium">No transactions recorded</p>
                        <p className="text-xs mt-1">Add your first transaction to track payments</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Transaction ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {loan.transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span className="text-sm font-medium">
                                                        {new Date(transaction.transaction_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {transaction.transaction_type === 'PAYMENT' ? (
                                                        <ArrowDownRight size={16} className="text-green-600" />
                                                    ) : (
                                                        <ArrowUpRight size={16} className="text-red-600" />
                                                    )}
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                        transaction.transaction_type === 'PAYMENT'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {transaction.transaction_type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">
                                                    {formatCurrency(parseFloat(transaction.amount))}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-500 font-mono">#{transaction.id}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-200">
                            {loan.transactions.map((transaction) => (
                                <div key={transaction.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {transaction.transaction_type === 'PAYMENT' ? (
                                                <ArrowDownRight size={18} className="text-green-600" />
                                            ) : (
                                                <ArrowUpRight size={18} className="text-red-600" />
                                            )}
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                transaction.transaction_type === 'PAYMENT'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {transaction.transaction_type}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono">#{transaction.id}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar size={14} />
                                            <span className="text-sm">
                                                {new Date(transaction.transaction_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="font-bold text-lg text-slate-900">
                                            {formatCurrency(parseFloat(transaction.amount))}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add Transaction Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setError(null);
                    setNewTransaction({
                        transaction_type: 'PAYMENT',
                        amount: '',
                        transaction_date: new Date().toISOString().split('T')[0]
                    });
                }}
                title="Add Transaction"
                size="lg"
            >
                <form onSubmit={handleAddTransaction} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Transaction Type
                        </label>
                        <select
                            required
                            value={newTransaction.transaction_type}
                            onChange={(e) => setNewTransaction({ ...newTransaction, transaction_type: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm sm:text-base"
                        >
                            <option value="PAYMENT">Payment</option>
                            <option value="DISBURSEMENT">Disbursement</option>
                            <option value="INTEREST">Interest</option>
                            <option value="FEE">Fee</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1.5">
                            Payment reduces balance, others increase it
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            min="0"
                            value={newTransaction.amount}
                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm sm:text-base"
                            placeholder="0.00"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Transaction Date
                        </label>
                        <input
                            type="date"
                            required
                            value={newTransaction.transaction_date}
                            onChange={(e) => setNewTransaction({ ...newTransaction, transaction_date: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm sm:text-base"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                        <button 
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setError(null);
                                setNewTransaction({
                                    transaction_type: 'PAYMENT',
                                    amount: '',
                                    transaction_date: new Date().toISOString().split('T')[0]
                                });
                            }}
                            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border)] transition-colors font-medium text-sm sm:text-base"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 btn btn-primary text-sm sm:text-base"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default LoanDetails;
