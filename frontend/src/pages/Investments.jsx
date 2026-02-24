import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Edit2, Trash2, RefreshCw } from 'lucide-react';
import Modal from '../components/Modal';
import { formatCurrency } from '../constants/currency';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Investments = () => {
    const { user } = useAuth();
    const [investments, setInvestments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [newInvestment, setNewInvestment] = useState({
        name: '',
        investment_type: 'Stocks',
        quantity: '',
        initial_value: '',
        current_value: ''
    });

    const investmentTypes = ['Stocks', 'Bonds', 'Crypto', 'Property', 'Mutual Funds', 'ETF', 'Other'];

    // Fetch investments on component mount
    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getInvestments();
            // Handle paginated response
            const investmentsList = data.results || data || [];
            setInvestments(investmentsList);
        } catch (err) {
            console.error('Error fetching investments:', err);
            setError(err.message || 'Failed to load investments. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const totalValue = investments.reduce((sum, inv) => sum + parseFloat(inv.current_value || 0), 0);
    const totalInitialValue = investments.reduce((sum, inv) => sum + parseFloat(inv.initial_value || 0), 0);
    const totalChange = totalInitialValue > 0 ? ((totalValue - totalInitialValue) / totalInitialValue) * 100 : 0;
    const totalGainLoss = totalValue - totalInitialValue;

    const handleAddOrUpdateInvestment = async (e) => {
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

            const investmentData = {
                user: String(userId),
                name: newInvestment.name.trim(),
                investment_type: newInvestment.investment_type,
                quantity: parseFloat(newInvestment.quantity),
                initial_value: parseFloat(newInvestment.initial_value),
                current_value: parseFloat(newInvestment.current_value)
            };

            if (editingInvestment) {
                // Update existing investment
                await updateInvestment(editingInvestment.id, investmentData);
            } else {
                // Create new investment
                await createInvestment(investmentData);
            }
            
            // Refresh investments list
            await fetchInvestments();
            
            // Close modal and reset form
            setIsModalOpen(false);
            setEditingInvestment(null);
            setNewInvestment({ 
                name: '', 
                investment_type: 'Stocks', 
                quantity: '', 
                initial_value: '', 
                current_value: '' 
            });
        } catch (err) {
            console.error('Error saving investment:', err);
            setError(err.message || 'Failed to save investment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditInvestment = (investment) => {
        setEditingInvestment(investment);
        setNewInvestment({
            name: investment.name,
            investment_type: investment.investment_type,
            quantity: investment.quantity.toString(),
            initial_value: investment.initial_value,
            current_value: investment.current_value
        });
        setIsModalOpen(true);
    };

    const handleDeleteInvestment = async (investmentId) => {
        if (!window.confirm('Are you sure you want to delete this investment?')) {
            return;
        }

        setError(null);
        try {
            await deleteInvestment(investmentId);
            await fetchInvestments();
        } catch (err) {
            console.error('Error deleting investment:', err);
            setError(err.message || 'Failed to delete investment. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingInvestment(null);
        setNewInvestment({ 
            name: '', 
            investment_type: 'Stocks', 
            quantity: '', 
            initial_value: '', 
            current_value: '' 
        });
        setError(null);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Investments</h1>
                    <p className="text-slate-600">Track and manage your investment portfolio</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchInvestments}
                        className="btn btn-secondary gap-2"
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span>Add Investment</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600">Total Portfolio Value</h3>
                        <DollarSign className="text-blue-600" size={20} />
                    </div>
                    {isLoading ? (
                        <div className="h-9 bg-slate-200 animate-pulse rounded"></div>
                    ) : (
                        <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
                    )}
                </div>
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600">Total Gain/Loss</h3>
                        {totalGainLoss >= 0 ? (
                            <TrendingUp className="text-green-600" size={20} />
                        ) : (
                            <TrendingDown className="text-red-600" size={20} />
                        )}
                    </div>
                    {isLoading ? (
                        <div className="h-9 bg-slate-200 animate-pulse rounded"></div>
                    ) : (
                        <>
                            <p className={`text-3xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                            </p>
                            <p className={`text-sm mt-1 ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
                            </p>
                        </>
                    )}
                </div>
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600">Active Investments</h3>
                        <PieChart className="text-purple-600" size={20} />
                    </div>
                    {isLoading ? (
                        <div className="h-9 bg-slate-200 animate-pulse rounded"></div>
                    ) : (
                        <p className="text-3xl font-bold text-slate-900">{investments.length}</p>
                    )}
                </div>
            </div>

            {/* Investments List */}
            <div className="card">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Investment Portfolio</h2>
                </div>
                {isLoading ? (
                    <div className="p-8 text-center">
                        <RefreshCw size={32} className="animate-spin mx-auto text-slate-400 mb-2" />
                        <p className="text-slate-500">Loading investments...</p>
                    </div>
                ) : investments.length === 0 ? (
                    <div className="p-8 text-center">
                        <PieChart size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 mb-4">No investments yet. Start tracking your portfolio!</p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-primary inline-flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Your First Investment
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Investment</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Quantity</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Initial Value</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Current Value</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Change</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {investments.map((investment) => {
                                    const change = investment.change || 0;
                                    const gainLoss = parseFloat(investment.current_value) - parseFloat(investment.initial_value);
                                    return (
                                        <tr key={investment.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{investment.name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                    {investment.investment_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-900">{investment.quantity}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{formatCurrency(parseFloat(investment.initial_value))}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{formatCurrency(parseFloat(investment.current_value))}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex flex-col gap-0.5`}>
                                                    <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {change >= 0 ? (
                                                            <TrendingUp size={16} />
                                                        ) : (
                                                            <TrendingDown size={16} />
                                                        )}
                                                        <span className="font-semibold">{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
                                                    </div>
                                                    <span className={`text-xs ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {gainLoss >= 0 ? '+' : ''}{formatCurrency(Math.abs(gainLoss))}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditInvestment(investment)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteInvestment(investment.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Investment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingInvestment ? 'Edit Investment' : 'Add New Investment'}
                size="xl"
            >
                <form onSubmit={handleAddOrUpdateInvestment} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Investment Name</label>
                        <input
                            type="text"
                            required
                            value={newInvestment.name}
                            onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                            placeholder="e.g., Safaricom Stocks"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Type</label>
                            <select
                                value={newInvestment.investment_type}
                                onChange={(e) => setNewInvestment({ ...newInvestment, investment_type: e.target.value })}
                                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                disabled={isSubmitting}
                            >
                                {investmentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Quantity</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={newInvestment.quantity}
                                onChange={(e) => setNewInvestment({ ...newInvestment, quantity: e.target.value })}
                                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                placeholder="100"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Initial Value</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={newInvestment.initial_value}
                                onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })}
                                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                placeholder="1700.00"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Current Value</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={newInvestment.current_value}
                                onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })}
                                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                placeholder="3400.00"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={handleCloseModal}
                            className="flex-1 px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border)] transition-colors font-medium"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-6 py-3 btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (editingInvestment ? 'Update Investment' : 'Add Investment')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Investments;
