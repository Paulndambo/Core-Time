import React, { useState } from 'react';
import {
    Plus,
    Check,
    X,
    Flame,
    Trophy,
    Calendar as CalendarIcon,
    MoreHorizontal,
    Trash2
} from 'lucide-react';
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    subDays,
    isToday
} from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const initialHabits = [
    {
        id: uuidv4(),
        title: 'Drink 2L Water',
        streak: 5,
        completedDates: [
            subDays(new Date(), 0).toISOString(),
            subDays(new Date(), 1).toISOString(),
            subDays(new Date(), 2).toISOString(),
            subDays(new Date(), 3).toISOString(),
            subDays(new Date(), 4).toISOString(),
        ],
        color: 'bg-indigo-500'
    },
    {
        id: uuidv4(),
        title: 'Read 30 Mins',
        streak: 2,
        completedDates: [
            subDays(new Date(), 0).toISOString(),
            subDays(new Date(), 1).toISOString(),
        ],
        color: 'bg-violet-500'
    },
    {
        id: uuidv4(),
        title: 'Morning Meditation',
        streak: 0,
        completedDates: [],
        color: 'bg-emerald-500'
    }
];

const HabitTracker = () => {
    const [habits, setHabits] = useState(initialHabits);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');

    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const toggleHabitCompletion = (habitId, date) => {
        setHabits(habits.map(habit => {
            if (habit.id !== habitId) return habit;
            const dateStr = date.toISOString();
            const isCompleted = habit.completedDates.some(d => isSameDay(new Date(d), date));
            let newCompletedDates;
            if (isCompleted) {
                newCompletedDates = habit.completedDates.filter(d => !isSameDay(new Date(d), date));
            } else {
                newCompletedDates = [...habit.completedDates, dateStr];
            }
            const sortedDates = [...newCompletedDates].map(d => new Date(d)).sort((a, b) => b - a);
            const currentStreak = calculateStreak(sortedDates);
            return { ...habit, completedDates: newCompletedDates, streak: currentStreak };
        }));
    };

    const calculateStreak = (sortedDatesDesc) => {
        if (sortedDatesDesc.length === 0) return 0;
        let streak = 0;
        let checkDate = new Date();
        const hasToday = isSameDay(sortedDatesDesc[0], checkDate);
        if (!hasToday) {
            checkDate = subDays(checkDate, 1);
            if (!isSameDay(sortedDatesDesc[0], checkDate)) return 0;
        }
        for (let date of sortedDatesDesc) {
            if (isSameDay(date, checkDate)) {
                streak++;
                checkDate = subDays(checkDate, 1);
            } else break;
        }
        return streak;
    };

    const addHabit = (e) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;
        const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
        setHabits([...habits, {
            id: uuidv4(), title: newHabitTitle, streak: 0, completedDates: [],
            color: colors[Math.floor(Math.random() * colors.length)]
        }]);
        setNewHabitTitle('');
        setShowAddModal(false);
    };

    const deleteHabit = (id) => setHabits(habits.filter(h => h.id !== id));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Habit Tracker</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Build consistent routines, one day at a time.</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary gap-2 shadow-md shadow-indigo-200/50">
                    <Plus size={16} />
                    New Habit
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-5">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                        <Trophy size={100} className="-mr-4 -mt-4" />
                    </div>
                    <div className="relative z-10">
                        <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm w-fit mb-4">
                            <Trophy size={18} />
                        </div>
                        <p className="text-indigo-200 text-xs font-medium">Longest Streak</p>
                        <h3 className="text-3xl font-bold mt-0.5">12 Days</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Check size={18} />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Completion Rate</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">85%</h3>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                            <Flame size={18} />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Active Habits</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{habits.length}</h3>
                </div>
            </div>

            {/* Habits Grid */}
            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left font-semibold text-slate-500 text-xs py-4 pl-5 w-1/4">Habit</th>
                                {weekDays.map(day => (
                                    <th key={day.toString()} className="text-center font-semibold text-slate-500 text-xs py-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="uppercase tracking-wider text-[10px]">{format(day, 'EEE')}</span>
                                            <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs ${
                                                isToday(day) ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
                                            }`}>
                                                {format(day, 'd')}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                                <th className="text-center font-semibold text-slate-500 text-xs py-4 pr-5">Streak</th>
                                <th className="w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {habits.map(habit => (
                                <tr key={habit.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                    <td className="py-4 pl-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-1 h-7 rounded-full ${habit.color}`} />
                                            <span className="font-semibold text-slate-900 text-sm">{habit.title}</span>
                                        </div>
                                    </td>
                                    {weekDays.map(day => {
                                        const isCompleted = habit.completedDates.some(d => isSameDay(new Date(d), day));
                                        return (
                                            <td key={day.toString()} className="py-4 text-center">
                                                <button
                                                    onClick={() => toggleHabitCompletion(habit.id, day)}
                                                    className={`
                                                        w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200
                                                        ${isCompleted
                                                            ? `${habit.color} text-white shadow-sm`
                                                            : 'bg-slate-100 hover:bg-slate-200 text-transparent'
                                                        }
                                                    `}
                                                >
                                                    {isCompleted && <Check size={14} strokeWidth={3} />}
                                                </button>
                                            </td>
                                        );
                                    })}
                                    <td className="py-4 pr-5 text-center">
                                        <div className="flex items-center justify-center gap-1 font-bold text-sm text-slate-900">
                                            <Flame size={14} className={habit.streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-200'} />
                                            {habit.streak}
                                        </div>
                                    </td>
                                    <td className="py-4 text-center">
                                        <button
                                            onClick={() => deleteHabit(habit.id)}
                                            className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {habits.length === 0 && (
                                <tr>
                                    <td colSpan={weekDays.length + 3} className="py-10 text-center text-slate-400 text-sm">
                                        No habits added yet. Start by adding one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md border border-slate-200/60" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-900">New Habit</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={addHabit}>
                            <div className="mb-5">
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">I want to...</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g. Read 30 mins, Drink Water"
                                    value={newHabitTitle}
                                    onChange={(e) => setNewHabitTitle(e.target.value)}
                                    className="input text-base"
                                />
                            </div>
                            <button type="submit" className="w-full btn btn-primary py-3 text-base font-semibold shadow-md shadow-indigo-200/50">
                                Start Habit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitTracker;
