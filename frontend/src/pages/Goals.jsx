import React, { useState, useCallback } from 'react';
import {
    Plus,
    Target,
    CheckCircle,
    Circle,
    Flag,
    MoreHorizontal,
    Trash2,
    Calendar,
    ChevronDown,
    ChevronUp,
    X
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const initialGoals = [
    {
        id: uuidv4(),
        title: 'Learn React Native',
        description: 'Build a mobile app for the portfolio.',
        deadline: '2024-12-31',
        color: 'bg-indigo-500',
        milestones: [
            { id: uuidv4(), title: 'Setup Development Environment', completed: true },
            { id: uuidv4(), title: 'Build "Hello World" App', completed: true },
            { id: uuidv4(), title: 'Learn Navigation', completed: false },
            { id: uuidv4(), title: 'Build Final Project', completed: false },
        ]
    },
    {
        id: uuidv4(),
        title: 'Save $10,000',
        description: 'Emergency fund and travel savings.',
        deadline: '2024-06-30',
        color: 'bg-emerald-500',
        milestones: [
            { id: uuidv4(), title: 'Save first $1,000', completed: true },
            { id: uuidv4(), title: 'Cut expenses by 10%', completed: true },
            { id: uuidv4(), title: 'Save $5,000', completed: false },
            { id: uuidv4(), title: 'Reach $10,000', completed: false },
        ]
    }
];

const Goals = () => {
    const [goals, setGoals] = useState(initialGoals);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '' });
    const [expandedGoalId, setExpandedGoalId] = useState(null);

    const toggleMilestone = (goalId, milestoneId) => {
        setGoals(goals.map(goal => {
            if (goal.id !== goalId) return goal;
            return {
                ...goal,
                milestones: goal.milestones.map(m =>
                    m.id === milestoneId ? { ...m, completed: !m.completed } : m
                )
            };
        }));
    };

    const deleteGoal = (id) => setGoals(goals.filter(g => g.id !== id));

    const addGoal = (e) => {
        e.preventDefault();
        if (!newGoal.title.trim()) return;
        const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setGoals([...goals, {
            id: uuidv4(), ...newGoal, color: randomColor,
            milestones: [{ id: uuidv4(), title: 'Define Goal Scope', completed: false }]
        }]);
        setNewGoal({ title: '', description: '', deadline: '' });
        setShowAddModal(false);
    };

    const addMilestone = (goalId, title) => {
        if (!title.trim()) return;
        setGoals(goals.map(goal => {
            if (goal.id !== goalId) return goal;
            return { ...goal, milestones: [...goal.milestones, { id: uuidv4(), title, completed: false }] };
        }));
    };

    const calculateProgress = (milestones) => {
        if (milestones.length === 0) return 0;
        return Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100);
    };

    const toggleGoalExpansion = useCallback((goalId) => {
        setExpandedGoalId(prevId => prevId === goalId ? null : goalId);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Goals</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Set ambitious targets and track your journey.</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary gap-2 shadow-md shadow-indigo-200/50">
                    <Plus size={16} />
                    New Goal
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {goals.map(goal => {
                    const progress = calculateProgress(goal.milestones);
                    const isExpanded = expandedGoalId === goal.id;

                    return (
                        <div key={goal.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 relative group hover:shadow-md transition-all">
                            <div className={`absolute top-0 left-0 w-1 h-full ${goal.color} rounded-l-2xl`} />
                            <div className="pl-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{goal.title}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{goal.description}</p>
                                    </div>
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Flag size={12} /> {goal.milestones.length} Milestones
                                    </span>
                                    {goal.deadline && (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} /> {format(new Date(goal.deadline), 'MMM d, yyyy')}
                                        </span>
                                    )}
                                </div>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-semibold text-slate-500">Progress</span>
                                        <span className="font-bold text-slate-900">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${goal.color}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Milestones Accordion */}
                                <div className="border-t border-slate-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleGoalExpansion(goal.id); }}
                                        className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                                    >
                                        <span>Key Results & Milestones</span>
                                        <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-3 space-y-1.5 animate-fade-in">
                                            {goal.milestones.map(milestone => (
                                                <div
                                                    key={milestone.id}
                                                    onClick={(e) => { e.stopPropagation(); toggleMilestone(goal.id, milestone.id); }}
                                                    className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                                                >
                                                    <div className={`mt-0.5 ${milestone.completed ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                        {milestone.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                    </div>
                                                    <span className={`text-sm ${milestone.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                        {milestone.title}
                                                    </span>
                                                </div>
                                            ))}

                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    addMilestone(goal.id, e.target.elements.milestone.value);
                                                    e.target.reset();
                                                }}
                                                className="mt-2 pl-7"
                                            >
                                                <input
                                                    name="milestone"
                                                    type="text"
                                                    placeholder="+ Add a milestone"
                                                    className="w-full bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none border-b border-transparent focus:border-indigo-400 transition-colors py-1"
                                                />
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Goal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-lg border border-slate-200/60" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-bold text-slate-900">New Goal</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={addGoal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Goal Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Run a Marathon"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    placeholder="Why is this important?"
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                    className="input resize-none h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Date</label>
                                <input
                                    type="date"
                                    value={newGoal.deadline}
                                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <button type="submit" className="w-full btn btn-primary py-3 mt-2 shadow-md shadow-indigo-200/50">
                                Create Goal
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Goals;
