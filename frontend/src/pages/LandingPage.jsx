import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    CheckSquare,
    StickyNote,
    Calendar,
    ArrowRight,
    Check,
    Shield,
    Zap,
    User,
    Users,
    Star,
    TrendingUp,
    Clock,
    Lock,
    Crown,
    Building2,
    Sparkles,
    ChevronDown,
    Play,
    Menu,
    X,
    Activity,
    Target,
    Heart,
    BookOpen,
    Layers,
    BarChart2,
    Smartphone,
    DollarSign,
    ListChecks,
    Salad,
    Package,
    CreditCard,
    PiggyBank,
} from 'lucide-react';
import CoretimeLogo from '../assets/CoretimeLogo';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard');
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-white">

            {/* ─── Navbar ─── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm'
                    : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 lg:h-20">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <CoretimeLogo size={32} className="transition-transform group-hover:scale-105 flex-shrink-0" />
                            <span className="font-bold text-xl text-slate-900">Coretime</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {[
                                { label: 'Features', section: 'features' },
                                { label: 'Pricing', section: 'pricing' },
                                { label: 'Reviews', section: 'testimonials' },
                            ].map((item) => (
                                <button
                                    key={item.section}
                                    onClick={() => scrollToSection(item.section)}
                                    className="px-4 py-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors rounded-lg hover:bg-indigo-50/50 text-sm"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-indigo-50/50 text-sm">
                                Sign In
                            </Link>
                            <Link
                                to="/login"
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Try Free for 2 Months
                            </Link>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 animate-fade-in">
                        <div className="px-4 py-4 space-y-1">
                            {[
                                { label: 'Features', section: 'features' },
                                { label: 'Pricing', section: 'pricing' },
                                { label: 'Reviews', section: 'testimonials' },
                            ].map((item) => (
                                <button
                                    key={item.section}
                                    onClick={() => scrollToSection(item.section)}
                                    className="block w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 text-slate-700 font-medium transition-colors text-sm"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <div className="pt-3 border-t border-slate-100 space-y-2">
                                <Link to="/login" className="block w-full text-center px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>
                                    Sign In
                                </Link>
                                <Link to="/login" className="block w-full text-center bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm shadow-md" onClick={() => setMobileMenuOpen(false)}>
                                    Try Free for 2 Months
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* ─── Hero Section ─── */}
            <header className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
                {/* Gradient Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/30 to-violet-400/20 rounded-full blur-3xl animate-blob" />
                    <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-indigo-200/20 via-violet-200/20 to-purple-200/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-5xl mx-auto">

                        {/* Announcement Pill */}
                        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-8 border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => scrollToSection('pricing')}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Free for 2 months — No credit card required</span>
                            <ArrowRight className="w-3 h-3" />
                        </div>

                        {/* Headline — Clear, specific, outcome-driven */}
                        <h1 className="animate-fade-in-up animation-delay-200 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                            One dashboard.{' '}
                            <br className="hidden sm:block" />
                            <span className="gradient-text">Every part of your life.</span>
                        </h1>

                        {/* Sub-headline — Lists what's inside */}
                        <p className="animate-fade-in-up animation-delay-400 mt-6 text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
                            Coretime replaces your finance tracker, habit app, task manager, goal planner, health log, meal planner, book tracker, and calendar — in one beautifully simple dashboard.
                        </p>

                        {/* CTA Buttons */}
                        <div className="animate-fade-in-up animation-delay-600 flex flex-col sm:flex-row justify-center gap-3 mt-10">
                            <Link
                                to="/login"
                                className="group inline-flex items-center justify-center bg-indigo-600 text-white text-base px-7 py-3.5 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 hover:-translate-y-0.5"
                            >
                                Start Free — 2 Months
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <button
                                onClick={() => scrollToSection('features')}
                                className="inline-flex items-center justify-center bg-white text-slate-700 text-base px-7 py-3.5 rounded-xl hover:bg-slate-50 transition-all font-semibold border border-slate-200 hover:border-slate-300 shadow-sm"
                            >
                                See Everything It Does
                                <ChevronDown className="ml-1.5 w-4 h-4" />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="animate-fade-in-up animation-delay-800 flex flex-wrap justify-center gap-6 mt-12 text-sm">
                            {[
                                { icon: Check, label: 'No credit card needed', color: 'text-emerald-600 bg-emerald-50' },
                                { icon: Shield, label: 'Your data stays private', color: 'text-indigo-600 bg-indigo-50' },
                                { icon: Users, label: '10,000+ active users', color: 'text-violet-600 bg-violet-50' },
                                { icon: Smartphone, label: 'Works on any device', color: 'text-sky-600 bg-sky-50' },
                            ].map(({ icon: Icon, label, color }) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${color}`}>
                                        <Icon size={11} />
                                    </div>
                                    <span className="font-medium text-slate-600">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dashboard Preview Mockup */}
                    <div className="animate-fade-in-up animation-delay-1000 mt-16 lg:mt-20 relative mx-auto max-w-6xl">
                        <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden border border-slate-200/60 shadow-2xl bg-gradient-to-b from-slate-50 to-white">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100/80 border-b border-slate-200/60">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="bg-white rounded-lg px-4 py-1.5 text-xs text-slate-400 font-medium max-w-md mx-auto border border-slate-200/60">
                                        app.coretime.io/dashboard
                                    </div>
                                </div>
                            </div>
                            {/* Dashboard Grid Preview */}
                            <div className="p-4 md:p-6 grid grid-cols-4 gap-3 md:gap-4">
                                {[
                                    { label: 'Net Worth', value: '$12,450', bg: 'from-indigo-500 to-indigo-600', icon: Wallet },
                                    { label: 'Habits Today', value: '6/8', bg: 'from-emerald-500 to-emerald-600', icon: Activity },
                                    { label: 'Tasks Done', value: '5/7', bg: 'from-amber-500 to-amber-600', icon: CheckSquare },
                                    { label: 'Goal Progress', value: '68%', bg: 'from-violet-500 to-violet-600', icon: Target },
                                ].map(({ label, value, bg, icon: Icon }) => (
                                    <div key={label} className={`bg-gradient-to-br ${bg} rounded-xl p-3 md:p-4 text-white`}>
                                        <Icon className="w-4 h-4 md:w-5 md:h-5 opacity-80 mb-2" />
                                        <p className="text-[10px] md:text-xs opacity-80">{label}</p>
                                        <p className="text-sm md:text-lg font-bold">{value}</p>
                                    </div>
                                ))}
                                {/* Chart Placeholder */}
                                <div className="col-span-3 bg-white rounded-xl border border-slate-200/60 p-4 h-32 md:h-40">
                                    <div className="text-xs font-semibold text-slate-800 mb-3">Monthly Spending Overview</div>
                                    <div className="flex items-end gap-1.5 h-16 md:h-24">
                                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 50].map((h, i) => (
                                            <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-sm opacity-70" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>
                                {/* Activity */}
                                <div className="col-span-1 bg-white rounded-xl border border-slate-200/60 p-3 h-32 md:h-40">
                                    <div className="text-xs font-semibold text-slate-800 mb-2">Today</div>
                                    <div className="space-y-2">
                                        {[
                                            { color: 'bg-indigo-400', w: '80%' },
                                            { color: 'bg-emerald-400', w: '60%' },
                                            { color: 'bg-violet-400', w: '90%' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                                <div className="h-2 rounded-full bg-slate-100 flex-1">
                                                    <div className={`h-2 rounded-full ${item.color} opacity-50`} style={{ width: item.w }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Ambient glow */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200/20 via-violet-200/30 to-purple-200/20 rounded-3xl blur-2xl -z-10" />
                    </div>
                </div>
            </header>

            {/* ─── Problem Section ─── */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="badge bg-rose-100 text-rose-600 mb-4">The Problem</div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                            Still juggling{' '}
                            <span className="relative">
                                <span className="line-through decoration-rose-400 decoration-[3px]">too many apps?</span>
                            </span>
                        </h2>
                        <p className="text-lg text-slate-500 max-w-xl mx-auto">
                            The average person uses 8+ separate apps to manage their life — and still feels scattered and behind.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 items-stretch">
                        {/* Before */}
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex flex-col">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center">
                                    <X className="w-3 h-3 text-rose-600" />
                                </div>
                                <p className="text-sm font-bold text-rose-600 uppercase tracking-widest">Before Coretime</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 flex-1">
                                {[
                                    'Budget App', 'Task Manager',
                                    'Habit Tracker', 'Note-taking App',
                                    'Fitness App', 'Meal Planner',
                                    'Book Tracker', 'Calendar App',
                                ].map((app) => (
                                    <div key={app} className="bg-white border border-rose-100 rounded-lg px-3 py-2 text-sm text-slate-400 flex items-center gap-2 line-through decoration-rose-300">
                                        <div className="w-1.5 h-1.5 bg-rose-300 rounded-full flex-shrink-0" />
                                        {app}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-rose-400 mt-4 font-medium text-center">Multiple subscriptions · Scattered data · Constant context-switching</p>
                        </div>

                        {/* After */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 flex flex-col">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-indigo-600" />
                                </div>
                                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">With Coretime</p>
                            </div>
                            <div className="bg-white border-2 border-indigo-200 rounded-xl p-4 shadow-sm flex-1">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                    <CoretimeLogo size={22} />
                                    <span className="font-bold text-slate-900 text-sm">Coretime Dashboard</span>
                                    <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">All in one</span>
                                </div>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                                    {[
                                        { icon: Wallet, label: 'Finances & Budget', color: 'text-indigo-600' },
                                        { icon: CheckSquare, label: 'Tasks & To-Dos', color: 'text-emerald-600' },
                                        { icon: Activity, label: 'Habit Tracker', color: 'text-violet-600' },
                                        { icon: Target, label: 'Goals & Milestones', color: 'text-rose-600' },
                                        { icon: Heart, label: 'Health & Fitness', color: 'text-pink-600' },
                                        { icon: StickyNote, label: 'Smart Notes', color: 'text-amber-600' },
                                        { icon: BookOpen, label: 'Book Library', color: 'text-cyan-600' },
                                        { icon: Calendar, label: 'Calendar Sync', color: 'text-teal-600' },
                                    ].map(({ icon: Icon, label, color }) => (
                                        <div key={label} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                                            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-indigo-500 mt-4 font-medium text-center">One subscription · All your data · One beautiful place</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Stats Bar ─── */}
            <section className="py-14 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_70%)]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        {[
                            { value: '10+', label: 'Modules in one app', icon: Layers },
                            { value: '10k+', label: 'Active users', icon: Users },
                            { value: '2 mo', label: 'Free trial, no card', icon: Sparkles },
                            { value: '4.9★', label: 'Average rating', icon: Star },
                        ].map(({ value, label, icon: Icon }) => (
                            <div key={label} className="flex flex-col items-center gap-2">
                                <Icon className="w-5 h-5 text-indigo-200 mb-1" />
                                <div className="text-3xl md:text-4xl font-extrabold">{value}</div>
                                <div className="text-sm text-indigo-200 font-medium">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features Section ─── */}
            <section id="features" className="py-24 lg:py-32 bg-slate-50/50 relative scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 lg:mb-20">
                        <div className="badge badge-primary mb-4">Features</div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                            One app. Everything covered.
                        </h2>
                        <p className="text-lg text-slate-500 max-w-3xl mx-auto">
                            From tracking every dollar to building daily habits — Coretime handles it all without the complexity of managing separate tools.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                        {[
                            {
                                icon: Wallet,
                                title: 'Finance Tracker',
                                desc: 'See exactly where your money goes. Track income, expenses, budgets, and investments with beautiful charts that make sense at a glance.',
                                color: 'indigo',
                                cta: 'Track your money',
                            },
                            {
                                icon: Activity,
                                title: 'Habit Tracker',
                                desc: 'Build routines that stick. Visual streaks and daily check-ins keep you consistent — whether it\'s exercise, reading, or hydration.',
                                color: 'violet',
                                cta: 'Build better habits',
                            },
                            {
                                icon: CheckSquare,
                                title: 'Task Manager',
                                desc: 'Capture every to-do before it slips through the cracks. Set priorities, due dates, and check things off with satisfaction.',
                                color: 'emerald',
                                cta: 'Stay on top of tasks',
                            },
                            {
                                icon: Calendar,
                                title: 'Calendar Sync',
                                desc: 'Two-way sync with Google Calendar means your schedule lives in one place — no more hopping between apps to find your next meeting.',
                                color: 'amber',
                                cta: 'Unify your schedule',
                            },
                        ].map(({ icon: Icon, title, desc, color, cta }) => {
                            const colorMap = {
                                indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-600', text: 'text-indigo-600', border: 'hover:border-indigo-200' },
                                violet: { bg: 'bg-violet-50', icon: 'bg-violet-600', text: 'text-violet-600', border: 'hover:border-violet-200' },
                                emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-600', text: 'text-emerald-600', border: 'hover:border-emerald-200' },
                                amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-600', border: 'hover:border-amber-200' },
                            };
                            const c = colorMap[color];
                            return (
                                <div key={title} className={`group bg-white p-7 rounded-2xl border border-slate-200/60 ${c.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default`}>
                                    <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                        <Icon className="text-white w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{desc}</p>
                                    <div className={`flex items-center ${c.text} font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0`}>
                                        {cta} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Extended Feature Grid */}
                    <div className="mt-6 grid md:grid-cols-3 gap-4 lg:gap-5">
                        {[
                            { icon: Target, title: 'Goals & Milestones', desc: 'Break big ambitions into trackable milestones. Visualize your progress and celebrate every win on the way.' },
                            { icon: Heart, title: 'Health & Fitness', desc: 'Log workouts, track nutrition, and monitor your wellbeing — no separate fitness app subscription needed.' },
                            { icon: StickyNote, title: 'Smart Notes', desc: 'Capture ideas the moment they hit. Organize with colors, search everything instantly, and never lose a thought.' },
                            { icon: BookOpen, title: 'Book Library', desc: 'Track what you\'re reading, want to read, and have finished. Build a personal library you\'re proud of.' },
                            { icon: Salad, title: 'Meal Planning', desc: 'Plan your weekly meals, build a shopping list, and track nutrition — all without a separate app.' },
                            { icon: Package, title: 'Home Inventory', desc: 'Know what you own. Track household items, warranties, and belongings so you\'re never caught off guard.' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="group flex items-start gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                                    <Icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Feature count callout */}
                    <div className="mt-10 text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-semibold text-sm">
                            <Layers className="w-4 h-4" />
                            And more: Bills, Loans, Investments, Invoices, Transactions & Gmail integration
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section className="py-24 lg:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="badge bg-emerald-100 text-emerald-700 mb-4">How It Works</div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                            Up and running in 2 minutes
                        </h2>
                        <p className="text-lg text-slate-500 max-w-3xl mx-auto">
                            No complex onboarding, no tutorial videos required. Coretime is built to be picked up instantly.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                        {[
                            {
                                step: '01',
                                icon: User,
                                title: 'Create your free account',
                                desc: 'Sign up in 30 seconds with your Google account. No credit card, no forms to fill — just click and you\'re in.',
                                color: 'indigo',
                            },
                            {
                                step: '02',
                                icon: Layers,
                                title: 'Choose what to track',
                                desc: 'Start with finances, habits, tasks, or all of it. Each module is ready to go the moment you open it — no setup required.',
                                color: 'violet',
                            },
                            {
                                step: '03',
                                icon: TrendingUp,
                                title: 'Take control of your life',
                                desc: 'Everything in one dashboard. Check your balance, tick off habits, and see your goals move forward — every single day.',
                                color: 'emerald',
                            },
                        ].map(({ step, icon: Icon, title, desc, color }, index) => {
                            const colorMap = {
                                indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', step: 'text-indigo-200' },
                                violet: { bg: 'bg-violet-600', light: 'bg-violet-50', text: 'text-violet-600', step: 'text-violet-200' },
                                emerald: { bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600', step: 'text-emerald-200' },
                            };
                            const c = colorMap[color];
                            return (
                                <div key={step} className="relative text-center group">
                                    {/* Connector line */}
                                    {index < 2 && (
                                        <div className="hidden md:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-slate-200 to-slate-200 z-0" />
                                    )}
                                    <div className="relative z-10">
                                        <div className={`w-20 h-20 ${c.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                            <Icon className="text-white w-9 h-9" />
                                        </div>
                                        <div className={`text-xs font-extrabold uppercase tracking-widest ${c.text} mb-2`}>Step {step}</div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                                        <p className="text-slate-500 leading-relaxed text-sm max-w-xs mx-auto">{desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-14">
                        <Link
                            to="/login"
                            className="group inline-flex items-center justify-center bg-indigo-600 text-white text-base px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200/50 hover:-translate-y-0.5"
                        >
                            Get Started for Free
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <p className="text-sm text-slate-400 mt-3">Free for 2 months · No credit card required</p>
                    </div>
                </div>
            </section>

            {/* ─── Why Routinely Section ─── */}
            <section className="py-24 lg:py-32 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="badge bg-violet-100 text-violet-700 mb-4">Why Routinely?</div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                            Built different — on purpose
                        </h2>
                        <p className="text-lg text-slate-500 max-w-3xl mx-auto">
                            Most apps are built to lock you in. Coretime is built to free you up.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {[
                            {
                                icon: DollarSign,
                                title: 'Replace multiple apps',
                                desc: 'Keep your money, habits, tasks, notes, and calendar in one place to reduce context-switching and simplify your daily routine.',
                                gradient: 'from-emerald-500 to-emerald-600',
                                highlight: 'Save money',
                            },
                            {
                                icon: Shield,
                                title: 'Your data is never sold',
                                desc: 'No ads, no data brokers, no selling your information. Your financial and personal data belongs to you — period. Export it anytime, delete it anytime.',
                                gradient: 'from-indigo-500 to-indigo-600',
                                highlight: 'Privacy first',
                            },
                            {
                                icon: Zap,
                                title: 'See everything in one glance',
                                desc: 'Your morning check-in takes 60 seconds: finances, habits, tasks, and calendar — all in one dashboard. Stop the tab-switching madness.',
                                gradient: 'from-violet-500 to-violet-600',
                                highlight: 'Save time',
                            },
                        ].map(({ icon: Icon, title, desc, gradient, highlight }) => (
                            <div key={title} className="group bg-white p-8 rounded-2xl border border-slate-200/60 hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
                                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                                    <Icon className="text-white w-7 h-7" />
                                </div>
                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">{highlight}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Testimonials Section ─── */}
            <section id="testimonials" className="py-24 lg:py-32 bg-white scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="badge bg-amber-100 text-amber-700 mb-4">Real Users</div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                            People are simplifying their lives
                        </h2>
                        <p className="text-lg text-slate-500">Here's what they say after switching to Coretime</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: '"I cancelled 4 paid app subscriptions when I switched to Coretime. My finances, habits, tasks, and reading list — all in one place. I\'m saving $47/month and feel more organized than ever."',
                                name: 'Sarah Chen',
                                role: 'Product Manager · San Francisco',
                                initials: 'SC',
                                gradient: 'from-indigo-500 to-indigo-600',
                                badge: 'Cancelled 4 subscriptions',
                            },
                            {
                                quote: '"I\'ve hit my morning habits streak for 94 days straight. The visual check-ins and streaks are weirdly motivating — I don\'t want to break the chain. It\'s changed how I start every day."',
                                name: 'Marcus Johnson',
                                role: 'Freelance Designer · London',
                                initials: 'MJ',
                                gradient: 'from-violet-500 to-violet-600',
                                badge: '94-day habit streak',
                            },
                            {
                                quote: '"Our whole family shares one Coretime account — household tasks, the grocery budget, meal planning, all of it. We argue about money way less now because we can all see the numbers together."',
                                name: 'Emily Rodriguez',
                                role: 'Teacher & Mom of 3 · Austin',
                                initials: 'ER',
                                gradient: 'from-emerald-500 to-emerald-600',
                                badge: 'Family plan user',
                            },
                        ].map((t, idx) => (
                            <div key={idx} className="bg-slate-50 p-7 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300 flex flex-col">
                                {/* Badge */}
                                <div className="mb-4">
                                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${t.gradient} text-white`}>
                                        {t.badge}
                                    </span>
                                </div>
                                {/* Stars */}
                                <div className="flex items-center gap-0.5 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-700 mb-6 leading-relaxed text-sm flex-1 italic">{t.quote}</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                                        {t.initials}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                                        <p className="text-xs text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Pricing Section ─── */}
            <section id="pricing" className="py-24 lg:py-32 bg-slate-50/50 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="badge badge-success mb-4">Pricing</div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                            Simple, honest pricing
                        </h2>
                        <p className="text-lg text-slate-500 max-w-3xl mx-auto">
                            Start free for 2 months. No credit card, no gotchas. Every plan includes every feature — the only difference is who can sign in.
                        </p>
                    </div>

                    {/* Feature parity callout */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 shadow-sm">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>All plans include <strong className="text-slate-800">every single feature</strong> — no feature tiers, no upsells, ever.</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Individual */}
                        <div className="bg-white p-7 rounded-2xl border border-slate-200/60 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 flex flex-col">
                            <div className="mb-5">
                                <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                                    <User className="text-indigo-600 w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Individual</h3>
                                <p className="text-slate-500 text-sm mb-4">Perfect for personal use</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900">$5.99</span>
                                    <span className="text-slate-400 text-sm">/month</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">1 user · 2 months free trial</p>
                                <p className="text-xs text-emerald-600 font-semibold mt-1.5">Free for 2 months, then $5.99/month</p>
                            </div>
                            <Link to="/login" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2 mb-6">
                                Start Free Trial <ArrowRight className="w-4 h-4" />
                            </Link>
                            <ul className="space-y-2.5 flex-1">
                                {['All 10+ modules unlocked', 'Finance tracker & budgeting', 'Habit & goal tracking', 'Google Calendar sync', 'Export data (CSV, PDF)'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-600 text-sm">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Family – Featured */}
                        <div className="bg-white p-7 rounded-2xl border-2 border-violet-500 shadow-xl relative flex flex-col scale-[1.02]">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                                    <Star className="w-3 h-3 fill-current" /> Most Popular
                                </span>
                            </div>
                            <div className="mb-5">
                                <div className="w-11 h-11 bg-violet-600 rounded-xl flex items-center justify-center mb-4">
                                    <Users className="text-white w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Family</h3>
                                <p className="text-slate-500 text-sm mb-4">Share with your household</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900">$15.99</span>
                                    <span className="text-slate-400 text-sm">/month</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Up to 6 users · 2 months free trial</p>
                                <p className="text-xs text-violet-600 font-semibold mt-1.5">Free for 2 months, then $15.99/month</p>
                            </div>
                            <Link to="/login" className="w-full bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-violet-200/50 hover:shadow-xl flex items-center justify-center gap-2 mb-6">
                                Start Free Trial <ArrowRight className="w-4 h-4" />
                            </Link>
                            <ul className="space-y-2.5 flex-1">
                                {['All 10+ modules unlocked', 'Finance tracker & budgeting', 'Habit & goal tracking', 'Google Calendar sync', 'Export data (CSV, PDF)'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700 text-sm font-medium">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-white p-7 rounded-2xl border border-slate-200/60 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 flex flex-col">
                            <div className="mb-5">
                                <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                    <Building2 className="text-emerald-600 w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Enterprise</h3>
                                <p className="text-slate-500 text-sm mb-4">For teams and organizations</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900">Custom</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Unlimited users · Custom pricing</p>
                                <p className="text-xs text-emerald-600 font-semibold mt-1.5">Contact us for a custom quote</p>
                            </div>
                            <Link to="/login" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2 mb-6">
                                Contact Sales <ArrowRight className="w-4 h-4" />
                            </Link>
                            <ul className="space-y-2.5 flex-1">
                                {['All 10+ modules unlocked', 'Finance tracker & budgeting', 'Habit & goal tracking', 'Google Calendar sync', 'Export data (CSV, PDF)'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-600 text-sm">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="text-center mt-10 space-y-3">
                        <p className="text-slate-500 text-sm">All plans include a 2-month free trial · No credit card required · Cancel anytime</p>
                        <Link to="/pricing" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors group">
                            See full pricing details
                            <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Final CTA Section ─── */}
            <section className="py-24 lg:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_60%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white rounded-full text-xs font-semibold mb-8 border border-white/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>No credit card • Free for 2 months</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                        Stop managing apps.<br />Start living your life.
                    </h2>
                    <p className="text-lg text-indigo-100 mb-10 max-w-xl mx-auto leading-relaxed">
                        Join 10,000+ people who replaced a mess of subscriptions with one beautiful dashboard. It takes 2 minutes to set up — and it's completely free to start.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mb-10">
                        <Link
                            to="/login"
                            className="group inline-flex items-center justify-center bg-white text-indigo-600 text-base px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all font-bold shadow-xl hover:-translate-y-0.5"
                        >
                            Start Free — 2 Months
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <button
                            onClick={() => scrollToSection('features')}
                            className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white text-base px-7 py-4 rounded-xl hover:bg-white/20 transition-all font-semibold border border-white/20"
                        >
                            See All Features
                        </button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-indigo-200">
                        {[
                            { icon: Clock, label: 'Setup in 2 minutes' },
                            { icon: Check, label: 'No credit card needed' },
                            { icon: Lock, label: 'Cancel anytime' },
                            { icon: Star, label: '4.9/5 rating' },
                        ].map(({ icon: Icon, label }) => (
                            <span key={label} className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="bg-slate-950 text-slate-400 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <Link to="/" className="flex items-center gap-2 mb-4 group">
                                <CoretimeLogo size={28} className="opacity-90" />
                                <span className="font-bold text-lg text-white">Coretime</span>
                            </Link>
                            <p className="mb-4 max-w-sm text-slate-500 leading-relaxed text-sm">
                                The all-in-one personal dashboard that replaces 8+ apps. Track your finances, habits, tasks, goals, health, and more — in one place.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span>All systems operational</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4 text-sm">Product</h4>
                            <ul className="space-y-2.5">
                                {[
                                    { label: 'Features', action: () => scrollToSection('features') },
                                    { label: 'Pricing', action: () => scrollToSection('pricing') },
                                ].map(({ label, action }) => (
                                    <li key={label}>
                                        <button onClick={action} className="hover:text-white transition-colors text-sm">{label}</button>
                                    </li>
                                ))}
                                <li><Link to="/login" className="hover:text-white transition-colors text-sm">Sign In</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
                            <ul className="space-y-2.5">
                                <li><Link to="/terms" className="hover:text-white transition-colors text-sm">Terms of Service</Link></li>
                                <li><Link to="/privacy" className="hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Coretime. All rights reserved.</p>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                            Made with <span className="text-red-500">❤️</span> for a better life
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
