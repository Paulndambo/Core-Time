import React from 'react';
import { Link } from 'react-router-dom';
import {
  Beaker,
  ArrowRight,
  Wallet,
  Heart,
  CheckSquare,
  Activity,
  Target,
  Package,
  UtensilsCrossed,
  TrendingUp,
  Receipt,
  FileText,
  PieChart,
  Mail,
  Video,
} from 'lucide-react';

const labsModules = [
  {
    section: 'Finance (preview)',
    items: [
      { path: '/finances?labs=1', label: 'Finances', icon: Wallet, note: 'Partial (uses demo data + API create)' },
      { path: '/bills?labs=1', label: 'Bills', icon: Receipt, note: 'Demo only' },
      { path: '/invoices?labs=1', label: 'Invoices', icon: FileText, note: 'Demo only' },
      { path: '/budgets?labs=1', label: 'Budgets', icon: PieChart, note: 'Demo only' },
      { path: '/financial-statement?labs=1', label: 'Financial Statement', icon: FileText, note: 'Demo only' },
    ],
  },
  {
    section: 'Life modules (preview)',
    items: [
      { path: '/chores?labs=1', label: 'Chores', icon: CheckSquare, note: 'Demo only' },
      { path: '/habits?labs=1', label: 'Habits', icon: Activity, note: 'Demo only' },
      { path: '/goals?labs=1', label: 'Goals', icon: Target, note: 'Demo only' },
      { path: '/health?labs=1', label: 'Health & Fitness', icon: Heart, note: 'Demo only' },
      { path: '/meal-plans?labs=1', label: 'Meal Plans', icon: UtensilsCrossed, note: 'Demo only' },
    ],
  },
  {
    section: 'Integrations (high scope)',
    items: [
      { path: '/meet?labs=1', label: 'Google Meet', icon: Video, note: 'Depends on Calendar + Meet creation' },
      { path: '/email?labs=1', label: 'Gmail', icon: Mail, note: 'Sensitive scope (verification/compliance)' },
    ],
  },
];

const Labs = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
          <Beaker size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Labs</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Preview modules that aren’t part of the MVP launch. Most of these are demo-only or partially wired.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900">
        <p className="text-sm">
          <span className="font-bold">Heads up:</span> Labs modules may reset, use mock data, or change without notice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {labsModules.map((group) => (
          <div key={group.section} className="bg-white rounded-2xl border border-slate-200/60 p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">{group.section}</h2>
            <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate">{item.label}</div>
                        <div className="text-xs text-slate-500 truncate">{item.note}</div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Labs;

