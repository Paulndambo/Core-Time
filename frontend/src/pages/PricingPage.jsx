import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Check,
    ArrowRight,
    Sparkles,
    User,
    Users,
    Clock,
    Building2
} from 'lucide-react';
import CoretimeLogo from '../assets/CoretimeLogo';
import { useAuth } from '../contexts/AuthContext';

const sharedFeatures = [
    'All core features',
    'Finance tracker & budgeting',
    'Habit & goal tracking',
    'Health & fitness tracking',
    'Google Calendar sync',
    'Notes & task management',
    'Meal planning & inventory',
    'Library tracker',
    'Mobile responsive',
    'Priority support',
    'Data export (coming soon)',
];

const PricingPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Individual',
            description: 'Perfect for personal use',
            priceLabel: '$5.99',
            priceSub: '/ month',
            icon: User,
            iconBg: 'bg-indigo-100',
            iconText: 'text-indigo-600',
            popular: false,
            badge: null,
            cta: 'Start Free Trial',
            buttonClass: 'bg-indigo-600 hover:bg-indigo-700',
            borderClass: 'border-slate-200 hover:border-indigo-200',
            highlight: '1 user · 2 months free trial',
            trialNote: 'Free for 2 months, then $5.99/month',
        },
        {
            name: 'Family',
            description: 'Share with your household',
            priceLabel: '$15.99',
            priceSub: '/ month',
            icon: Users,
            iconBg: 'bg-violet-600',
            iconText: 'text-white',
            popular: true,
            badge: 'Most Popular',
            cta: 'Start Free Trial',
            buttonClass: 'bg-violet-600 hover:bg-violet-700',
            borderClass: 'border-violet-500',
            highlight: 'Up to 6 users · 2 months free trial',
            trialNote: 'Free for 2 months, then $15.99/month',
        },
        {
            name: 'Enterprise',
            description: 'For teams and organizations',
            priceLabel: 'Custom',
            priceSub: '',
            icon: Building2,
            iconBg: 'bg-emerald-100',
            iconText: 'text-emerald-600',
            popular: false,
            badge: null,
            cta: 'Contact Sales',
            buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
            borderClass: 'border-slate-200 hover:border-emerald-200',
            highlight: 'Unlimited users · Custom pricing',
            trialNote: 'Contact us for a custom quote',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navbar */}
            <nav className="border-b border-white/50 backdrop-blur-md bg-white/80 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <CoretimeLogo size={32} />
                            <span className="font-bold text-xl text-slate-800">Coretime</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/"
                                className="text-slate-600 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
                            >
                                Home
                            </Link>
                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
                                >
                                    Login
                                </Link>
                            )}
                            <Link
                                to="/login"
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative overflow-hidden pt-20 pb-16 lg:pt-24">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 animate-fade-in-up">
                            Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">pricing</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
                            Start free for two months, then pick the plan that fits your life.
                            All plans include every feature — no tiers, no limits.
                        </p>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100 animate-fade-in-up animation-delay-400">
                            <Clock className="w-4 h-4" />
                            <span>Free for 2 months · No credit card required</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Pricing Cards */}
            <section className="py-12 pb-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {plans.map((plan, index) => {
                            const Icon = plan.icon;
                            return (
                                <div
                                    key={plan.name}
                                    className={`relative bg-white rounded-2xl shadow-lg border-2 ${
                                        plan.popular
                                            ? `${plan.borderClass} shadow-xl scale-[1.03]`
                                            : `${plan.borderClass}`
                                    } transition-all hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up flex flex-col`}
                                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                                                ✦ Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-7 flex flex-col flex-1">
                                        {/* Plan Header */}
                                        <div className="mb-5">
                                            <div className={`w-12 h-12 ${plan.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                                                <Icon className={`${plan.iconText} w-6 h-6`} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                                            <p className="text-slate-500 text-sm">{plan.description}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-5 pb-5 border-b border-slate-100">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-4xl font-extrabold text-slate-900">{plan.priceLabel}</span>
                                                <span className="text-slate-400 text-sm">{plan.priceSub}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">{plan.highlight}</p>
                                            <p className="text-xs text-emerald-600 font-semibold mt-2">{plan.trialNote}</p>
                                        </div>

                                        {/* CTA Button */}
                                        <Link
                                            to="/login"
                                            className={`w-full ${plan.buttonClass} text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 mb-6 text-sm`}
                                        >
                                            {plan.cta}
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>

                                        {/* Shared Features */}
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Everything included</p>
                                            <ul className="space-y-2.5">
                                                {sharedFeatures.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-2.5">
                                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-slate-600 text-sm">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-10 space-y-3">
                        <p className="text-slate-400 text-sm">
                            All plans include the full feature set and a 2-month free trial.
                        </p>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 font-semibold">
                            <Sparkles className="w-4 h-4" />
                            <span>Start with 2 months free — No credit card required</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently asked questions</h2>
                        <p className="text-xl text-slate-600">Everything you need to know about our pricing</p>
                    </div>
                    
                    <div className="space-y-6">
                        {[
                            {
                                q: 'How does the 2-month free trial work?',
                                a: 'All plans include a 2-month free trial with full access to every feature. No credit card required to start. After the trial ends, you\'ll be charged the monthly rate for your chosen plan.'
                            },
                            {
                                q: 'What\'s the difference between Individual, Family, and Enterprise?',
                                a: 'All plans have exactly the same features. Individual is for 1 user, Family supports up to 6 users, and Enterprise offers unlimited users for teams and organizations.'
                            },
                            {
                                q: 'Can I switch between plans?',
                                a: 'Yes! You can upgrade or downgrade between plans at any time. Changes take effect immediately and we\'ll prorate any charges.'
                            },
                            {
                                q: 'Do I need a credit card for the free trial?',
                                a: 'No! You can start your 2-month free trial without entering any payment information. We\'ll only ask for payment details when your trial is about to end.'
                            },
                            {
                                q: 'What payment methods do you accept?',
                                a: 'We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners.'
                            },
                            {
                                q: 'What happens to my data if I cancel?',
                                a: 'Your data remains accessible for 30 days after cancellation. You can export all your data at any time. After 30 days, data is permanently deleted.'
                            },
                            {
                                q: 'Are there any hidden fees?',
                                a: 'No hidden fees, ever. The price you see is the price you pay. All plans include every feature — no upsells, no add-ons.'
                            }
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                                <p className="text-slate-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to get started?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of users who are already building better routines with Coretime.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center bg-white text-blue-600 text-lg px-8 py-4 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 group"
                        >
                            Start Free Trial <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white text-lg px-8 py-4 rounded-xl hover:bg-white/20 transition-all font-semibold border-2 border-white/30"
                        >
                            View Features
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <CoretimeLogo size={32} />
                                <span className="font-bold text-xl text-white">Coretime</span>
                            </div>
                            <p className="mb-6 max-w-md text-slate-400 leading-relaxed">
                                Simple, powerful, and beautiful personal tracking for everyone.
                                Build better routines, one day at a time.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Product</h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/" className="hover:text-white transition-colors flex items-center gap-2 group">
                                        <span>Features</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/pricing" className="hover:text-white transition-colors flex items-center gap-2 group">
                                        <span>Pricing</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="hover:text-white transition-colors flex items-center gap-2 group">
                                        <span>Sign In</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Legal</h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/terms" className="hover:text-white transition-colors flex items-center gap-2 group">
                                        <span>Terms of Service</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-2 group">
                                        <span>Privacy Policy</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500">© {new Date().getFullYear()} Coretime. All rights reserved.</p>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            Made with <span className="text-red-500">❤️</span> for a better life
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PricingPage;
