import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CreditCard, Calendar, DollarSign, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import Modal from '../components/Modal';
import { createLoan, getLoans } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../constants/currency';

const Loans = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newLoan, setNewLoan] = useState({
        counterparty_name: '',
        direction: 'Borrowed',
        principal_amount: '',
        outstanding_balance: '',
        interest_rate: '',
        start_date: '',
        due_date: ''
    });

    // Fetch loans on component mount
    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getLoans();
            // Handle paginated response
            const loansList = data.results || data || [];
            setLoans(loansList);
        } catch (err) {
            console.error('Error fetching loans:', err);
            setError(err.message || 'Failed to load loans. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLoan = async (e) => {
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

            const loanData = {
                counterparty_name: newLoan.counterparty_name.trim(),
                user: String(userId),
                direction: newLoan.direction,
                interest_rate: parseFloat(newLoan.interest_rate),
                start_date: newLoan.start_date,
                due_date: newLoan.due_date,
                principal_amount: parseFloat(newLoan.principal_amount),
                outstanding_balance: parseFloat(newLoan.outstanding_balance)
            };

            await createLoan(loanData);
            
            // Refresh loans list
            await fetchLoans();
            
            setIsModalOpen(false);
            setNewLoan({
                counterparty_name: '',
                direction: 'Borrowed',
                principal_amount: '',
                outstanding_balance: '',
                interest_rate: '',
                start_date: '',
                due_date: ''
            });
        } catch (err) {
            console.error('Error creating loan:', err);
            setError(err.message || 'Failed to create loan. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate totals from API data
    const totalLoans = loans.reduce((sum, loan) => sum + parseFloat(loan.principal_amount || 0), 0);
    
    const totalRepaid = loans.reduce((sum, loan) => {
        const principal = parseFloat(loan.principal_amount || 0);
        const outstanding = parseFloat(loan.outstanding_balance || 0);
        return sum + (principal - outstanding);
    }, 0);
    
    const totalRemaining = loans.reduce((sum, loan) => sum + parseFloat(loan.outstanding_balance || 0), 0);
    
    const totalMonthlyPayments = loans
        .filter(l => parseFloat(l.outstanding_balance || 0) > 0)
        .reduce((sum, loan) => sum + (parseFloat(loan.outstanding_balance || 0) * parseFloat(loan.interest_rate || 0) / 100 / 12), 0);
    
    const activeLoans = loans.filter(l => parseFloat(l.outstanding_balance || 0) > 0).length;

    return (
        <div className="space-y-4 sm:space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">Loans</h1>
                    <p className="text-sm sm:text-base text-slate-600">Manage and track your loans and debt</p>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                        onClick={fetchLoans}
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
                        <span>Add Loan</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <div className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-600">Total Loans</h3>
                        <DollarSign className="text-blue-600" size={18} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{formatCurrency(totalLoans)}</p>
                    <p className="text-xs text-slate-500 mt-1">Sum of all principal amounts</p>
                </div>
                <div className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-600">Total Repaid</h3>
                        <DollarSign className="text-green-600" size={18} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{formatCurrency(totalRepaid)}</p>
                    <p className="text-xs text-slate-500 mt-1">Principal - Outstanding</p>
                </div>
                <div className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-600">Total Remaining</h3>
                        <DollarSign className="text-red-600" size={18} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">{formatCurrency(totalRemaining)}</p>
                    <p className="text-xs text-slate-500 mt-1">Outstanding balance</p>
                </div>
                <div className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-600">Active Loans</h3>
                        <AlertCircle className="text-blue-600" size={18} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{activeLoans}</p>
                    <p className="text-xs text-slate-500 mt-1">Loans with balance &gt; 0</p>
                </div>
            </div>

            {/* Loans List */}
            <div className="card">
                <div className="p-4 sm:p-6 border-b border-slate-200">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Loan Portfolio</h2>
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw size={24} className="animate-spin text-indigo-600" />
                        <span className="ml-3 text-sm sm:text-base text-slate-600">Loading loans...</span>
                    </div>
                ) : loans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <CreditCard size={48} className="mb-3 opacity-50" />
                        <p className="text-sm font-medium">No loans found</p>
                        <p className="text-xs mt-1">Add your first loan to get started</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Counterparty</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Direction</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Principal Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Outstanding Balance</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Interest Rate</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Start Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Due Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loans.map((loan) => {
                                    const principalAmount = parseFloat(loan.principal_amount);
                                    const outstandingBalance = parseFloat(loan.outstanding_balance);
                                    const percentageRemaining = principalAmount > 0 ? (outstandingBalance / principalAmount) * 100 : 0;
                                    
                                    return (
                                        <tr 
                                            key={loan.id} 
                                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/loans/${loan.id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{loan.counterparty_name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                    loan.direction === 'Borrowed' 
                                                        ? 'bg-red-100 text-red-700' 
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {loan.direction}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{formatCurrency(principalAmount)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{formatCurrency(outstandingBalance)}</p>
                                                <p className="text-xs text-slate-500">
                                                    {percentageRemaining.toFixed(1)}% remaining
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                    {parseFloat(loan.interest_rate).toFixed(2)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Calendar size={14} />
                                                    <span className="text-sm">{new Date(loan.start_date).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Calendar size={14} />
                                                    <span className="text-sm">{new Date(loan.due_date).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/loans/${loan.id}`);
                                                    }}
                                                    className="p-2 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-slate-200">
                            {loans.map((loan) => {
                                const principalAmount = parseFloat(loan.principal_amount);
                                const outstandingBalance = parseFloat(loan.outstanding_balance);
                                const percentageRemaining = principalAmount > 0 ? (outstandingBalance / principalAmount) * 100 : 0;
                                
                                return (
                                    <div 
                                        key={loan.id} 
                                        className="p-4 sm:p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/loans/${loan.id}`)}
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-2">{loan.counterparty_name}</h3>
                                                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                                    loan.direction === 'Borrowed' 
                                                        ? 'bg-red-100 text-red-700' 
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {loan.direction}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                    {parseFloat(loan.interest_rate).toFixed(2)}%
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/loans/${loan.id}`);
                                                    }}
                                                    className="p-2 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Amounts */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Principal Amount</p>
                                                <p className="font-bold text-slate-900 text-base sm:text-lg">{formatCurrency(principalAmount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Outstanding</p>
                                                <p className="font-bold text-slate-900 text-base sm:text-lg">{formatCurrency(outstandingBalance)}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {percentageRemaining.toFixed(1)}% remaining
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1.5">Start Date</p>
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Calendar size={14} className="flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm">{new Date(loan.start_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1.5">Due Date</p>
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Calendar size={14} className="flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm">{new Date(loan.due_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Add Loan Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setError(null);
                    setNewLoan({
                        counterparty_name: '',
                        direction: 'Borrowed',
                        principal_amount: '',
                        outstanding_balance: '',
                        interest_rate: '',
                        start_date: '',
                        due_date: ''
                    });
                }}
                title="Add New Loan"
                size="xl"
            >
                <form onSubmit={handleAddLoan} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">Counterparty Name</label>
                            <input
                                type="text"
                                required
                                value={newLoan.counterparty_name}
                                onChange={(e) => setNewLoan({ ...newLoan, counterparty_name: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm sm:text-base"
                                placeholder="e.g., Branch, Bank ABC"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">Direction</label>
                            <select
                                required
                                value={newLoan.direction}
                                onChange={(e) => setNewLoan({ ...newLoan, direction: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm sm:text-base"
                            >
                                <option value="Borrowed">Borrowed</option>
                                <option value="Lent">Lent</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">Principal Amount</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={newLoan.principal_amount}
                                onChange={(e) => setNewLoan({ ...newLoan, principal_amount: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm sm:text-base"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">Outstanding Balance</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={newLoan.outstanding_balance}
                                onChange={(e) => setNewLoan({ ...newLoan, outstanding_balance: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm sm:text-base"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">Interest Rate (%)</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                max="100"
                                value={newLoan.interest_rate}
                                onChange={(e) => setNewLoan({ ...newLoan, interest_rate: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm sm:text-base"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">Start Date</label>
                            <input
                                type="date"
                                required
                                value={newLoan.start_date}
                                onChange={(e) => setNewLoan({ ...newLoan, start_date: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm sm:text-base"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">Due Date</label>
                        <input
                            type="date"
                            required
                            value={newLoan.due_date}
                            onChange={(e) => setNewLoan({ ...newLoan, due_date: e.target.value })}
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
                                setNewLoan({
                                    counterparty_name: '',
                                    direction: 'Borrowed',
                                    principal_amount: '',
                                    outstanding_balance: '',
                                    interest_rate: '',
                                    start_date: '',
                                    due_date: ''
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
                            {isSubmitting ? 'Creating...' : 'Add Loan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Loans;
