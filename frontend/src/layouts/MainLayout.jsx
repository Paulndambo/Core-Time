import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Wallet,
    CheckSquare,
    StickyNote,
    Calendar,
    Activity,
    Target,
    Heart,
    Mail,
    Video,
    BookOpen,
    Menu,
    X,
    User,
    LogOut,
    TrendingUp,
    CreditCard,
    UtensilsCrossed,
    Package,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Receipt,
    FileText,
    PieChart,
    Search,
    Bell,
    FlaskConical,
    Sparkles,
    CalendarClock,
    ClipboardList,
    Zap,
    Users
} from 'lucide-react';

import CoretimeLogo from '../assets/CoretimeLogo';
import { LAUNCH_MODE } from '../config/launchScope';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);
    const location = useLocation();
    const { user, logout } = useAuth();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        if (!isCollapsed) {
            setExpandedSection(null);
        }
    };

    const toggleSection = (sectionKey) => {
        setExpandedSection(prev => prev === sectionKey ? null : sectionKey);
    };

    const isSectionActive = (items) => {
        return items.some(item => location.pathname === item.path);
    };

    const getPageTitle = () => {
        const titleMap = {
            '/': 'Dashboard',
            '/dashboard': 'Dashboard',
            '/finances': 'Finances',
            '/chores': 'Chores',
            '/notes': 'Notes',
            '/habits': 'Habit Tracker',
            '/goals': 'Goals',
            '/health': 'Health & Fitness',
            '/email': 'Email',
            '/meet': 'Google Meet',
            '/library': 'Library',
            '/calendar': 'Calendar',
            '/transactions': 'Transactions',
            '/investments': 'Investments',
            '/loans': 'Loans',
            '/bills': 'Bills',
            '/invoices': 'Invoices',
            '/budgets': 'Budgets',
            '/financial-statement': 'Financial Statement',
            '/meal-plans': 'Meal Plans',
            '/inventory': 'Inventory',
            '/profile': 'Profile',
            '/labs': 'Labs',
            '/scheduling': 'Scheduling',
            '/forms': 'Forms',
            '/integrations': 'Integrations',
            '/family': 'Family',
        };
        if (location.pathname.startsWith('/library/books/')) return 'Book Details';
        if (location.pathname.startsWith('/forms/') && location.pathname.includes('/edit')) return 'Form Builder';
        if (location.pathname.startsWith('/forms/') && location.pathname.includes('/responses')) return 'Form Responses';
        return titleMap[location.pathname] || 'Coretime';
    };

    const fullNavSections = [
        {
            type: 'single',
            item: { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
        },
        {
            type: 'group',
            key: 'finance',
            label: 'Finance',
            icon: Wallet,
            items: [
                { path: '/finances', label: 'Finances', icon: Wallet },
                { path: '/transactions', label: 'Transactions', icon: CreditCard },
                { path: '/investments', label: 'Investments', icon: TrendingUp },
                { path: '/loans', label: 'Loans', icon: CreditCard },
                { path: '/bills', label: 'Bills', icon: Receipt },
                { path: '/invoices', label: 'Invoices', icon: FileText },
                { path: '/budgets', label: 'Budgets', icon: PieChart },
                { path: '/financial-statement', label: 'Statement', icon: FileText }
            ]
        },
        {
            type: 'group',
            key: 'home',
            label: 'Home Mgmt',
            icon: Package,
            items: [
                { path: '/chores', label: 'Chores', icon: CheckSquare },
                { path: '/inventory', label: 'Inventory', icon: Package },
                { path: '/family', label: 'Family', icon: Users }
            ]
        },
        {
            type: 'single',
            item: { path: '/notes', label: 'Notes', icon: StickyNote }
        },
        {
            type: 'group',
            key: 'personal',
            label: 'Personal Dvt',
            icon: Target,
            items: [
                { path: '/habits', label: 'Habits', icon: Activity },
                { path: '/goals', label: 'Goals', icon: Target }
            ]
        },
        {
            type: 'group',
            key: 'health',
            label: 'Wellness',
            icon: Heart,
            items: [
                { path: '/health', label: 'Health & Fitness', icon: Heart },
                { path: '/meal-plans', label: 'Meal Plans', icon: UtensilsCrossed }
            ]
        },
        {
            type: 'group',
            key: 'communication',
            label: 'Communication',
            icon: Mail,
            items: [
                { path: '/email', label: 'Email', icon: Mail },
                { path: '/meet', label: 'Google Meet', icon: Video },
                { path: '/calendar', label: 'Calendar', icon: Calendar },
                { path: '/scheduling', label: 'Scheduling', icon: CalendarClock }
            ]
        },
        {
            type: 'single',
            item: { path: '/library', label: 'Library', icon: BookOpen }
        },
        {
            type: 'single',
            item: { path: '/integrations', label: 'Integrations', icon: Zap }
        }
    ];

    const mvpNavSections = [
        {
            type: 'single',
            item: { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
        },
        {
            type: 'group',
            key: 'finance',
            label: 'Finance',
            icon: Wallet,
            items: [
                { path: '/transactions', label: 'Transactions', icon: CreditCard },
                { path: '/investments', label: 'Investments', icon: TrendingUp },
                { path: '/loans', label: 'Loans', icon: CreditCard },
            ]
        },
        {
            type: 'group',
            key: 'home',
            label: 'Home & Life',
            icon: Package,
            items: [
                { path: '/inventory', label: 'Inventory', icon: Package },
                { path: '/family', label: 'Family', icon: Users },
                { path: '/calendar', label: 'Calendar', icon: Calendar },
                { path: '/scheduling', label: 'Scheduling', icon: CalendarClock },
                { path: '/forms', label: 'Forms', icon: ClipboardList },
            ]
        },
        {
            type: 'single',
            item: { path: '/notes', label: 'Notes', icon: StickyNote }
        },
        {
            type: 'single',
            item: { path: '/library', label: 'Library', icon: BookOpen }
        },
        {
            type: 'single',
            item: { path: '/integrations', label: 'Integrations', icon: Zap }
        },
        {
            type: 'single',
            item: { path: '/labs', label: 'Labs', icon: FlaskConical }
        },
    ];

    const navSections = LAUNCH_MODE === 'full' ? fullNavSections : mvpNavSections;

    const NavItem = ({ item, isNested = false }) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
            <NavLink
                to={item.path}
                onClick={closeSidebar}
                className={`
                    flex items-center ${isCollapsed && !isNested ? 'justify-center' : 'gap-3'} 
                    ${isCollapsed && !isNested ? 'px-2' : 'px-3'} 
                    ${isNested ? 'py-2 text-[13px]' : 'py-2.5'} 
                    rounded-xl transition-all duration-200
                    ${isActive
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }
                `}
                title={isCollapsed && !isNested ? item.label : ''}
            >
                <Icon size={isNested ? 16 : 18} className={isActive ? 'text-indigo-600' : ''} />
                {(!isCollapsed || isNested) && <span className="truncate">{item.label}</span>}
            </NavLink>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 md:hidden transition-opacity"
                    onClick={closeSidebar}
                />
            )}

            {/* ─── Sidebar ─── */}
            <aside
                className={`
                    fixed md:relative z-30
                    flex flex-col
                    ${isCollapsed ? 'w-[68px]' : 'w-64'} h-full
                    bg-white border-r border-slate-200/60
                    transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Logo Section */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5'} h-16 lg:h-[72px] border-b border-slate-100 flex-shrink-0`}>
                    {!isCollapsed && (
                        <button 
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <CoretimeLogo size={30} />
                            <span className="font-bold text-lg text-slate-900">Coretime</span>
                        </button>
                    )}
                    {isCollapsed && (
                        <button 
                            onClick={() => window.location.reload()}
                            className="cursor-pointer hover:opacity-80 transition-opacity inline-block"
                        >
                            <CoretimeLogo size={26} />
                        </button>
                    )}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleCollapse}
                            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            title={isCollapsed ? 'Expand' : 'Collapse'}
                        >
                            <ChevronLeft size={16} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                        <button onClick={closeSidebar} className="md:hidden p-1.5 text-slate-400 hover:text-slate-600">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-3'} py-4 overflow-y-auto custom-scrollbar space-y-0.5`}>
                    {!isCollapsed && (
                        <div className="px-3 mb-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu</p>
                        </div>
                    )}
                    {navSections.map((section) => {
                        if (section.type === 'single') {
                            return <NavItem key={section.item.path} item={section.item} />;
                        }

                        const isExpanded = expandedSection === section.key;
                        const isActive = isSectionActive(section.items);
                        const SectionIcon = section.icon;

                        return (
                            <div key={section.key}>
                                <button
                                    onClick={() => !isCollapsed && toggleSection(section.key)}
                                    className={`
                                        w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} 
                                        py-2.5 rounded-xl transition-all duration-200
                                        ${isActive
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }
                                    `}
                                    title={isCollapsed ? section.label : ''}
                                >
                                    <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                                        <SectionIcon size={18} />
                                        {!isCollapsed && <span className="font-medium text-sm">{section.label}</span>}
                                    </div>
                                    {!isCollapsed && (
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    )}
                                </button>
                                {isExpanded && !isCollapsed && (
                                    <div className="ml-3 pl-3 border-l-2 border-slate-100 space-y-0.5 mt-0.5 mb-1">
                                        {section.items.map((item) => (
                                            <NavItem key={item.path} item={item} isNested />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className={`border-t border-slate-100 ${isCollapsed ? 'p-2' : 'p-3'} flex-shrink-0 space-y-1.5`}>
                    <NavLink
                        to="/profile"
                        onClick={closeSidebar}
                        className={`flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'} ${isCollapsed ? 'p-2' : 'px-3 py-2.5'} rounded-xl hover:bg-slate-50 transition-all group`}
                        title={isCollapsed ? 'Profile' : ''}
                    >
                        {user?.picture ? (
                            <img
                                src={user.picture}
                                alt={user.name}
                                className={`${isCollapsed ? 'w-8 h-8' : 'w-9 h-9'} rounded-xl object-cover ring-2 ring-slate-100`}
                            />
                        ) : (
                            <div className={`${isCollapsed ? 'w-8 h-8' : 'w-9 h-9'} rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600`}>
                                <User size={isCollapsed ? 14 : 16} />
                            </div>
                        )}
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                    {user?.first_name && user?.last_name 
                                        ? `${user.first_name} ${user.last_name}` 
                                        : user?.name || 'User'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
                            </div>
                        )}
                    </NavLink>
                    <button
                        onClick={logout}
                        className={`w-full flex ${isCollapsed ? 'justify-center' : 'items-center justify-center gap-2'} ${isCollapsed ? 'p-2' : 'px-3 py-2'} rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm`}
                        title="Logout"
                    >
                        <LogOut size={16} />
                        {!isCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ─── Main Content ─── */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-16 lg:h-[72px] bg-white border-b border-slate-200/60 flex items-center justify-between px-6 flex-shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{getPageTitle()}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:block text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
