import React, { useState } from 'react';
import { Plus, UtensilsCrossed, Calendar, Clock, Users } from 'lucide-react';

const MealPlans = () => {
    const [mealPlans] = useState([
        { id: 1, name: 'Weekly Meal Plan', startDate: '2024-12-09', meals: 21, calories: 2100, status: 'active' },
        { id: 2, name: 'Vegetarian Plan', startDate: '2024-12-01', meals: 14, calories: 1800, status: 'active' },
        { id: 3, name: 'Low Carb Diet', startDate: '2024-11-20', meals: 7, calories: 1600, status: 'completed' }
    ]);

    const activePlans = mealPlans.filter(p => p.status === 'active').length;
    const totalMeals = mealPlans.filter(p => p.status === 'active').reduce((sum, p) => sum + p.meals, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Meal Plans</h1>
                    <p className="text-slate-600">Plan and organize your weekly meals</p>
                </div>
                <button className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    <span>Create Meal Plan</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600">Active Plans</h3>
                        <UtensilsCrossed className="text-green-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{activePlans}</p>
                </div>
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600">Total Meals</h3>
                        <Users className="text-blue-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{totalMeals}</p>
                </div>
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600">Avg Calories</h3>
                        <Clock className="text-purple-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {activePlans > 0 
                            ? Math.round(mealPlans.filter(p => p.status === 'active').reduce((sum, p) => sum + p.calories, 0) / activePlans)
                            : 0
                        }
                    </p>
                </div>
            </div>

            {/* Meal Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mealPlans.map((plan) => (
                    <div key={plan.id} className="card p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <Calendar size={14} />
                                    <span>Started {new Date(plan.startDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                plan.status === 'active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                            }`}>
                                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Meals</span>
                                <span className="font-semibold text-slate-900">{plan.meals}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Daily Calories</span>
                                <span className="font-semibold text-slate-900">{plan.calories}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <button className="w-full btn bg-slate-100 hover:bg-slate-200 text-slate-700">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MealPlans;
