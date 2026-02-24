import React, { useState } from 'react';
import Modal from '../components/Modal';
import { Plus, PieChart, DollarSign, TrendingUp, TrendingDown, X, Edit, Trash2, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

const Budgets = () => {
    const [budgets, setBudgets] = useState([
        { id: 1, category: 'Food & Dining', limit: 600, spent: 450, color: '#F59E0B' },
        { id: 2, category: 'Transportation', limit: 300, spent: 280, color: '#3B82F6' },
        { id: 3, category: 'Entertainment', limit: 200, spent: 85, color: '#8B5CF6' },
        { id: 4, category: 'Shopping', limit: 400, spent: 420, color: '#EC4899' },
        { id: 5, category: 'Utilities', limit: 250, spent: 180, color: '#10B981' },
        { id: 6, category: 'Healthcare', limit: 150, spent: 120, color: '#EF4444' }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [newBudget, setNewBudget] = useState({
        category: '',
        limit: '',
        spent: '',
        color: '#3B82F6'
    });

    const categories = ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Personal Care', 'Other'];
    const colors = ['#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

    const totalLimit = budgets.reduce((sum, budget) => sum + budget.limit, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const remaining = totalLimit - totalSpent;
    const overBudgetCount = budgets.filter(b => b.spent > b.limit).length;

    const chartData = budgets.map(budget => ({
        name: budget.category,
        value: budget.spent,
        limit: budget.limit,
        color: budget.color
    }));

    const COLORS = budgets.map(b => b.color);

    const handleAddBudget = (e) => {
        e.preventDefault();
        const budget = {
            id: editingBudget ? editingBudget.id : uuidv4(),
            category: newBudget.category,
            limit: parseFloat(newBudget.limit),
            spent: parseFloat(newBudget.spent) || 0,
            color: newBudget.color
        };
        
        if (editingBudget) {
            setBudgets(budgets.map(b => b.id === editingBudget.id ? budget : b));
        } else {
            setBudgets([...budgets, budget]);
        }
        
        setIsModalOpen(false);
        setEditingBudget(null);
        setNewBudget({
            category: '',
            limit: '',
            spent: '',
            color: '#3B82F6'
        });
    };

    const handleEdit = (budget) => {
        setEditingBudget(budget);
        setNewBudget({
            category: budget.category,
            limit: budget.limit.toString(),
            spent: budget.spent.toString(),
            color: budget.color
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            setBudgets(budgets.filter(b => b.id !== id));
        }
    };

    const handleUpdateSpent = (id, newSpent) => {
        setBudgets(budgets.map(budget => 
            budget.id === id ? { ...budget, spent: parseFloat(newSpent) || 0 } : budget
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Budgets</h1>
                    <p className="text-[var(--color-text-secondary)]">Manage your spending limits and track expenses by category.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingBudget(null);
                        setNewBudget({
                            category: '',
                            limit: '',
                            spent: '',
                            color: '#3B82F6'
                        });
                        setIsModalOpen(true);
                    }}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={18} />
                    Add Budget
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
                            <p className="text-blue-100 text-sm">Total Budget</p>
                            <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalLimit)}</h3>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <TrendingDown size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Total Spent</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(totalSpent)}</h3>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min(100, (totalSpent / totalLimit) * 100)}%` }}></div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Remaining</span>
                    </div>
                    <h3 className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(remaining), { showDecimals: false })}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        {remaining >= 0 ? 'Available' : 'Over budget'}
                    </p>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Over Budget</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{overBudgetCount}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">Categories exceeded</p>
                </div>
            </div>

            {/* Budget List & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Budget List */}
                <div className="card lg:col-span-2">
                    <div className="p-6 border-b border-[var(--color-border)]">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Budget Categories</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {budgets.map((budget) => {
                            const percent = Math.min(100, Math.round((budget.spent / budget.limit) * 100));
                            const isOver = budget.spent > budget.limit;
                            const remaining = budget.limit - budget.spent;

                            return (
                                <div key={budget.id} className="p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: budget.color }}></div>
                                            <div>
                                                <h4 className="font-medium text-[var(--color-text-primary)]">{budget.category}</h4>
                                                <p className="text-xs text-[var(--color-text-muted)]">
                                                    {isOver ? `Over by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(Math.abs(remaining))} remaining`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(budget)}
                                                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(budget.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-[var(--color-text-secondary)] hover:text-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[var(--color-text-secondary)]">
                                            {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                                        </span>
                                        <span className={`font-medium ${isOver ? 'text-red-600' : 'text-[var(--color-text-secondary)]'}`}>
                                            {percent}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2.5 overflow-hidden mb-3">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : ''}`}
                                            style={{ 
                                                width: `${Math.min(100, percent)}%`,
                                                backgroundColor: isOver ? '#EF4444' : budget.color
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={budget.spent}
                                            onChange={(e) => handleUpdateSpent(budget.id, e.target.value)}
                                            className="flex-1 px-3 py-1.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                            placeholder="Update spent"
                                        />
                                        <span className="text-xs text-[var(--color-text-muted)]">Update spent</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chart */}
                <div className="card">
                    <div className="p-6 border-b border-[var(--color-border)]">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Spending Overview</h3>
                    </div>
                    <div className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Legend />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Add/Edit Budget Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBudget(null);
                    setNewBudget({
                        category: '',
                        limit: '',
                        spent: '',
                        color: '#3B82F6'
                    });
                }}
                title={editingBudget ? 'Edit Budget' : 'Add New Budget'}
                size="xl"
            >
                <form onSubmit={handleAddBudget} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Category</label>
                                <select
                                    required
                                    value={newBudget.category}
                                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Budget Limit</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        min="0"
                                        value={newBudget.limit}
                                        onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Amount Spent</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newBudget.spent}
                                        onChange={(e) => setNewBudget({ ...newBudget, spent: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {colors.map((color, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setNewBudget({ ...newBudget, color })}
                                            className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                                newBudget.color === color ? 'border-[var(--color-accent)] scale-110' : 'border-[var(--color-border)]'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingBudget(null);
                                        setNewBudget({
                                            category: '',
                                            limit: '',
                                            spent: '',
                                            color: '#3B82F6'
                                        });
                                    }}
                                    className="flex-1 px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border)] transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-6 py-3 btn btn-primary"
                                >
                                    {editingBudget ? 'Update Budget' : 'Add Budget'}
                                </button>
                            </div>
                        </form>
            </Modal>
        </div>
    );
};

export default Budgets;
