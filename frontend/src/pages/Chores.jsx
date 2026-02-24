import React, { useState } from 'react';
import {
    Plus,
    CheckCircle,
    Circle,
    Clock,
    User,
    Trash2,
    Repeat,
    Award,
    Star,
    Zap
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const initialChores = [
    { id: uuidv4(), title: 'Wash Dishes', assignee: 'John', xp: 10, status: 'pending', due: 'Today', frequency: 'Daily' },
    { id: uuidv4(), title: 'Vacuum Living Room', assignee: 'Sarah', xp: 20, status: 'completed', due: 'Yesterday', frequency: 'Weekly' },
    { id: uuidv4(), title: 'Take out Trash', assignee: 'John', xp: 5, status: 'pending', due: 'Tomorrow', frequency: 'Weekly' },
    { id: uuidv4(), title: 'Water Plants', assignee: 'Emily', xp: 5, status: 'pending', due: 'Sat', frequency: 'Weekly' },
];

const Chores = () => {
    const [chores, setChores] = useState(initialChores);
    const [newChore, setNewChore] = useState({ title: '', xp: 10, frequency: 'Once' });
    const [totalXP, setTotalXP] = useState(1250);
    const level = Math.floor(totalXP / 1000) + 1;
    const nextLevelXP = level * 1000;
    const progress = ((totalXP % 1000) / 1000) * 100;

    const toggleStatus = (id) => {
        setChores(chores.map(chore => {
            if (chore.id === id) {
                const newStatus = chore.status === 'pending' ? 'completed' : 'pending';
                if (newStatus === 'completed') setTotalXP(prev => prev + chore.xp);
                else setTotalXP(prev => prev - chore.xp);
                return { ...chore, status: newStatus };
            }
            return chore;
        }));
    };

    const deleteChore = (id) => setChores(chores.filter(chore => chore.id !== id));

    const addChore = (e) => {
        e.preventDefault();
        if (!newChore.title.trim()) return;
        setChores([{
            id: uuidv4(), title: newChore.title, assignee: 'Me',
            xp: parseInt(newChore.xp), status: 'pending', due: 'Today', frequency: newChore.frequency
        }, ...chores]);
        setNewChore({ title: '', xp: 10, frequency: 'Once' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chores</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Gamified household tasks.</p>
                </div>
            </div>

            {/* Gamification Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white p-6">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <Award size={140} className="-mr-6 -mt-6" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <Star size={28} className="text-amber-300 fill-amber-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Household Level {level}</h2>
                            <p className="text-indigo-200 text-sm">{nextLevelXP - totalXP} XP to next level</p>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3">
                        <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-widest">
                            <span className="text-indigo-200">Progress</span>
                            <span>{totalXP} / {nextLevelXP} XP</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2.5 backdrop-blur-sm">
                            <div
                                className="bg-amber-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Add Form */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 lg:col-span-1 h-fit">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Add New Chore</h3>
                    <form onSubmit={addChore} className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chore Title</label>
                            <input
                                type="text"
                                value={newChore.title}
                                onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
                                placeholder="e.g. Clean the kitchen"
                                className="input"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">XP Value</label>
                                <select
                                    value={newChore.xp}
                                    onChange={(e) => setNewChore({ ...newChore, xp: e.target.value })}
                                    className="select"
                                >
                                    <option value="5">5 XP (Easy)</option>
                                    <option value="10">10 XP (Medium)</option>
                                    <option value="20">20 XP (Hard)</option>
                                    <option value="50">50 XP (Epic)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Frequency</label>
                                <select
                                    value={newChore.frequency}
                                    onChange={(e) => setNewChore({ ...newChore, frequency: e.target.value })}
                                    className="select"
                                >
                                    <option value="Once">Once</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary w-full gap-2 shadow-md shadow-indigo-200/50">
                            <Plus size={16} />
                            Add Chore
                        </button>
                    </form>
                </div>

                {/* Task List */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Task Board</h3>
                    <div className="space-y-2">
                        {chores.map((chore) => (
                            <div
                                key={chore.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${
                                    chore.status === 'completed'
                                        ? 'bg-slate-50 border-slate-100 opacity-60'
                                        : 'bg-white border-slate-200/60 hover:border-indigo-200 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleStatus(chore.id)}
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            chore.status === 'completed'
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'border-slate-300 hover:border-indigo-400'
                                        }`}
                                    >
                                        {chore.status === 'completed' && <CheckCircle size={12} />}
                                    </button>
                                    <div>
                                        <h4 className={`font-semibold text-sm ${
                                            chore.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                                        }`}>
                                            {chore.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-bold">
                                                <Zap size={9} className="fill-amber-500" />
                                                {chore.xp} XP
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User size={10} /> {chore.assignee}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} /> {chore.due}
                                            </span>
                                            {chore.frequency !== 'Once' && (
                                                <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md font-semibold">
                                                    <Repeat size={9} /> {chore.frequency}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteChore(chore.id)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-50"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {chores.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-sm">
                                No chores found. Great job!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chores;
