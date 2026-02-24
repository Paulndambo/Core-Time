import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../constants/currency';
import {
    DollarSign,
    CheckCircle,
    StickyNote,
    Calendar,
    ArrowUp,
    ArrowDown,
    Plus,
    TrendingUp,
    Clock,
    AlertCircle,
    Wallet,
    Target,
    Activity,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const financeData = [
    { name: 'Mon', income: 4000, expense: 2400 },
    { name: 'Tue', income: 3000, expense: 1398 },
    { name: 'Wed', income: 2000, expense: 9800 },
    { name: 'Thu', income: 2780, expense: 3908 },
    { name: 'Fri', income: 1890, expense: 4800 },
    { name: 'Sat', income: 2390, expense: 3800 },
    { name: 'Sun', income: 3490, expense: 4300 },
];

const SummaryCard = ({ title, value, icon: Icon, color, trend, subtitle, gradient }) => {
    const colorMap = {
        indigo: {
            gradient: 'from-indigo-500 to-indigo-600',
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            light: 'text-indigo-300',
        },
        emerald: {
            gradient: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            light: 'text-emerald-300',
        },
        amber: {
            gradient: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            light: 'text-amber-300',
        },
        violet: {
            gradient: 'from-violet-500 to-violet-600',
            bg: 'bg-violet-50',
            text: 'text-violet-600',
            light: 'text-violet-300',
        },
    };

    const c = colorMap[color] || colorMap.indigo;

    if (gradient) {
        return (
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.gradient} p-5 text-white group hover:shadow-lg hover:shadow-indigo-200/50 transition-all duration-300`}>
                <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
                    <Icon size={100} className="-mr-4 -mt-4" />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
                            <Icon size={20} />
                        </div>
                        {trend && (
                            <div className="flex items-center gap-1 text-xs font-bold bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                                {trend > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                                {Math.abs(trend)}%
                            </div>
                        )}
                    </div>
                    <p className="text-white/70 text-xs font-medium mb-1">{title}</p>
                    <p className="text-2xl md:text-3xl font-bold mb-1">{value}</p>
                    {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-5 group hover:shadow-md transition-all duration-300">
            <div className={`absolute right-0 top-0 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity pointer-events-none ${c.text}`}>
                <Icon size={100} className="-mr-4 -mt-4" />
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-2.5 ${c.bg} rounded-xl`}>
                        <Icon size={20} className={c.text} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                            trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                            {trend > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <p className="text-slate-500 text-xs font-medium mb-1">{title}</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{value}</p>
                {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    const quickActions = [
        { icon: DollarSign, label: 'Add Expense', color: 'indigo', link: '/finances' },
        { icon: CheckCircle, label: 'New Chore', color: 'emerald', link: '/chores' },
        { icon: StickyNote, label: 'Create Note', color: 'amber', link: '/notes' },
        { icon: Calendar, label: 'Add Event', color: 'violet', link: '/calendar' },
    ];

    const recentActivities = [
        { type: 'expense', title: 'Grocery Shopping', amount: '$125.50', time: '2 hours ago', color: 'red' },
        { type: 'chore', title: 'Cleaned Kitchen', time: '4 hours ago', color: 'emerald' },
        { type: 'note', title: 'Meeting Notes - Q4 Planning', time: '1 day ago', color: 'amber' },
        { type: 'event', title: 'Team Meeting', time: '2 days ago', color: 'indigo' },
    ];

    const colorMap = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
        red: { bg: 'bg-red-50', text: 'text-red-600' },
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                        Dashboard Overview
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Welcome back! Here's what's happening today.
                    </p>
                </div>
                <Link
                    to="/finances"
                    className="btn btn-primary gap-2 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-200/50"
                >
                    <Plus size={16} />
                    <span>Add New Item</span>
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Balance"
                    value="$12,450"
                    icon={Wallet}
                    color="indigo"
                    trend={12}
                    subtitle="+$1,200 this month"
                    gradient
                />
                <SummaryCard
                    title="Pending Chores"
                    value="5"
                    icon={CheckCircle}
                    color="emerald"
                    subtitle="3 due today"
                />
                <SummaryCard
                    title="Active Notes"
                    value="12"
                    icon={StickyNote}
                    color="amber"
                    subtitle="8 updated this week"
                />
                <SummaryCard
                    title="Upcoming Events"
                    value="3"
                    icon={Calendar}
                    color="violet"
                    subtitle="Next: Team Meeting"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickActions.map((action, idx) => {
                        const Icon = action.icon;
                        const c = colorMap[action.color] || colorMap.indigo;
                        return (
                            <Link
                                key={idx}
                                to={action.link}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-sm hover:bg-white transition-all duration-200 group"
                            >
                                <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}>
                                    <Icon className={c.text} size={18} />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{action.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Financial Chart */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 lg:col-span-2 flex flex-col h-[400px]">
                    <div className="flex justify-between items-center mb-5 flex-shrink-0">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Financial Overview</h3>
                            <p className="text-xs text-slate-400">Income vs Expenses</p>
                        </div>
                        <div className="flex bg-slate-100 rounded-lg p-0.5">
                            {['week', 'month', 'year'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        selectedPeriod === period
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {period.charAt(0).toUpperCase() + period.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financeData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    tickFormatter={(v) => `$${v / 1000}k`}
                                />
                                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                                        padding: '10px 14px',
                                        fontSize: '13px',
                                    }}
                                    formatter={(value) => [formatCurrency(value, { showDecimals: false }), undefined]}
                                    labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: 4 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#f43f5e"
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-5 mt-3 pt-3 border-t border-slate-100 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                            <span className="text-xs text-slate-500 font-medium">Income</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="text-xs text-slate-500 font-medium">Expenses</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col h-[400px]">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                        <Link to="/finances" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {recentActivities.map((activity, idx) => {
                            const c = colorMap[activity.color] || colorMap.indigo;
                            const getIcon = () => {
                                const icons = { expense: DollarSign, chore: CheckCircle, note: StickyNote, event: Calendar };
                                const IconComponent = icons[activity.type] || DollarSign;
                                return <IconComponent className={c.text} size={16} />;
                            };
                            return (
                                <div
                                    key={idx}
                                    className="p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer group border border-transparent hover:border-slate-200/60"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                                            {getIcon()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-slate-900 truncate">{activity.title}</h4>
                                            {activity.amount && (
                                                <p className="text-xs font-bold text-red-500 mt-0.5">{activity.amount}</p>
                                            )}
                                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                                                <Clock size={10} />
                                                <span>{activity.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Notes */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 h-80 flex flex-col">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-sm font-bold text-slate-900">Recent Notes</h3>
                        <Link to="/notes" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="p-3.5 rounded-xl hover:bg-amber-50/50 transition-all cursor-pointer border border-slate-100 hover:border-amber-200/60 group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                                        <StickyNote className="text-amber-500" size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-slate-900">Meeting Notes {i}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                            Discussion about the new project roadmap and timeline for Q{i}.
                                        </p>
                                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
                                            <Clock size={10} />
                                            <span>{i === 1 ? '2 hours ago' : `${i} days ago`}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button className="p-1.5 hover:bg-amber-100 rounded-lg">
                                            <Eye size={13} className="text-amber-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 h-80 flex flex-col">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-sm font-bold text-slate-900">Upcoming Events</h3>
                        <Link to="/calendar" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                            View Calendar <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {[
                            { title: 'Team Meeting', time: 'Today, 2:00 PM', type: 'meeting' },
                            { title: 'Project Review', time: 'Tomorrow, 10:00 AM', type: 'review' },
                            { title: 'Client Call', time: 'Dec 15, 3:00 PM', type: 'call' },
                            { title: 'Workshop', time: 'Dec 18, 9:00 AM', type: 'workshop' },
                        ].map((event, idx) => (
                            <div
                                key={idx}
                                className="p-3.5 rounded-xl hover:bg-violet-50/50 transition-all cursor-pointer border border-slate-100 hover:border-violet-200/60 group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="text-violet-500" size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
                                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                                            <Clock size={10} />
                                            <span>{event.time}</span>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-violet-100 rounded-lg flex-shrink-0">
                                        <MoreVertical size={13} className="text-violet-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
