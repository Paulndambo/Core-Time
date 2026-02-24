import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../constants/currency';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { format, subMonths } from 'date-fns';

const FinancialStatement = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Mock financial data
    const monthlyData = [
        { month: 'Jan', income: 4500, expenses: 3200, profit: 1300 },
        { month: 'Feb', income: 4800, expenses: 3400, profit: 1400 },
        { month: 'Mar', income: 5200, expenses: 3600, profit: 1600 },
        { month: 'Apr', income: 4900, expenses: 3500, profit: 1400 },
        { month: 'May', income: 5100, expenses: 3700, profit: 1400 },
        { month: 'Jun', income: 5300, expenses: 3800, profit: 1500 }
    ];

    const expenseCategories = [
        { name: 'Utilities', amount: 850, color: '#3B82F6' },
        { name: 'Food & Dining', amount: 1200, color: '#10B981' },
        { name: 'Transportation', amount: 450, color: '#F59E0B' },
        { name: 'Entertainment', amount: 300, color: '#8B5CF6' },
        { name: 'Shopping', amount: 600, color: '#EC4899' },
        { name: 'Other', amount: 400, color: '#6B7280' }
    ];

    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);

    const incomeSources = [
        { source: 'Salary', amount: 4500, percentage: 85 },
        { source: 'Freelance', amount: 500, percentage: 10 },
        { source: 'Investments', amount: 300, percentage: 5 }
    ];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Financial Statement</h1>
                    <p className="text-[var(--color-text-secondary)]">Comprehensive overview of your financial performance.</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <button className="btn btn-primary gap-2">
                        <Download size={18} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <DollarSign size={24} />
                            </div>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+12.5%</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-blue-100 text-sm">Total Income</p>
                            <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalIncome)}</h3>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <ArrowDownRight size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Total Expenses</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(totalExpenses)}</h3>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Net Profit</span>
                    </div>
                    <h3 className="text-2xl font-bold text-green-600">{formatCurrency(netProfit)}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">Profit margin: {profitMargin}%</p>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <FileText size={20} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Period</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">Last 6 months</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expenses Chart */}
                <div className="card">
                    <div className="p-6 border-b border-[var(--color-border)]">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Income vs Expenses</h3>
                    </div>
                    <div className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
                                    cursor={{ fill: 'var(--color-bg-tertiary)' }}
                                />
                                <Bar dataKey="income" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit Trend Chart */}
                <div className="card">
                    <div className="p-6 border-b border-[var(--color-border)]">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Profit Trend</h3>
                    </div>
                    <div className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
                                    cursor={{ fill: 'var(--color-bg-tertiary)' }}
                                />
                                <Line type="monotone" dataKey="profit" stroke="var(--color-success)" strokeWidth={3} dot={{ fill: 'var(--color-success)', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Income Sources & Expense Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income Sources */}
                <div className="card">
                    <div className="p-6 border-b border-[var(--color-border)]">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Income Sources</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {incomeSources.map((source, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium text-[var(--color-text-primary)]">{source.source}</span>
                                    <span className="font-bold text-[var(--color-text-primary)]">{formatCurrency(source.amount)}</span>
                                </div>
                                <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${source.percentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">{source.percentage}% of total income</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="card">
                    <div className="p-6 border-b border-[var(--color-border)]">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Expense Breakdown</h3>
                    </div>
                    <div className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenseCategories}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, amount }) => {
                                        const total = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);
                                        const percentage = ((amount / total) * 100).toFixed(0);
                                        return `${name}: ${percentage}%`;
                                    }}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="amount"
                                >
                                    {expenseCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {expenseCategories.map((category, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                    <span className="text-xs text-[var(--color-text-secondary)]">{category.name}</span>
                                    <span className="text-xs font-medium text-[var(--color-text-primary)] ml-auto">{formatCurrency(category.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Summary Table */}
            <div className="card">
                <div className="p-6 border-b border-[var(--color-border)]">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Monthly Summary</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="text-left text-sm text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="pb-3 pl-6 font-medium">Month</th>
                                <th className="pb-3 font-medium">Income</th>
                                <th className="pb-3 font-medium">Expenses</th>
                                <th className="pb-3 font-medium">Profit</th>
                                <th className="pb-3 pr-6 font-medium">Profit Margin</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {monthlyData.map((data, index) => {
                                const margin = ((data.profit / data.income) * 100).toFixed(1);
                                return (
                                    <tr key={index} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-tertiary)] transition-colors">
                                        <td className="py-4 pl-6 font-medium text-[var(--color-text-primary)]">{data.month}</td>
                                        <td className="py-4 text-green-600 font-semibold">{formatCurrency(data.income)}</td>
                                        <td className="py-4 text-red-600 font-semibold">{formatCurrency(data.expenses)}</td>
                                        <td className="py-4 text-[var(--color-text-primary)] font-bold">{formatCurrency(data.profit)}</td>
                                        <td className="py-4 pr-6">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                                parseFloat(margin) > 30 ? 'bg-green-100 text-green-700' : 
                                                parseFloat(margin) > 20 ? 'bg-blue-100 text-blue-700' : 
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {margin}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancialStatement;
