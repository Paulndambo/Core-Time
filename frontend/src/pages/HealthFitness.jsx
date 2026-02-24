import React, { useState } from 'react';
import {
    Activity,
    Droplets,
    Moon,
    Scale,
    Plus,
    Flame,
    Utensils,
    Timer
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { format, subDays } from 'date-fns';

const mockWeightData = [
    { date: '2024-01-01', weight: 75 },
    { date: '2024-01-08', weight: 74.5 },
    { date: '2024-01-15', weight: 74.2 },
    { date: '2024-01-22', weight: 73.8 },
    { date: '2024-01-29', weight: 73.5 },
    { date: '2024-02-05', weight: 73.0 },
    { date: '2024-02-12', weight: 72.8 },
];

const mockSleepData = [
    { day: 'Mon', hours: 7.5 },
    { day: 'Tue', hours: 6.8 },
    { day: 'Wed', hours: 8.0 },
    { day: 'Thu', hours: 7.2 },
    { day: 'Fri', hours: 6.5 },
    { day: 'Sat', hours: 9.0 },
    { day: 'Sun', hours: 8.5 },
];

const HealthFitness = () => {
    const [waterIntake, setWaterIntake] = useState(3); // 3 glasses so far
    const [waterGoal] = useState(8); // 8 glasses goal
    const [recentWorkouts, setRecentWorkouts] = useState([
        { id: 1, type: 'Running', duration: '30 mins', calories: 320, date: 'Today' },
        { id: 2, type: 'Yoga', duration: '45 mins', calories: 180, date: 'Yesterday' },
        { id: 3, type: 'HIIT', duration: '20 mins', calories: 250, date: '2 days ago' },
    ]);

    const addWater = () => {
        if (waterIntake < waterGoal) {
            setWaterIntake(prev => prev + 1);
        }
    };

    const removeWater = () => {
        if (waterIntake > 0) {
            setWaterIntake(prev => prev - 1);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Health & Fitness</h1>
                    <p className="text-[var(--color-text-secondary)]">Track your body, sleep, and activity.</p>
                </div>
                <button className="btn btn-primary gap-2">
                    <Plus size={18} />
                    Log Workout
                </button>
            </div>

            {/* Top Cards: Water & Todays Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Water Tracker */}
                <div className="card bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <Droplets size={24} />
                            <h3 className="font-bold">Hydration</h3>
                        </div>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {waterIntake} / {waterGoal} glasses
                        </span>
                    </div>

                    <div className="flex gap-1 mb-6">
                        {Array.from({ length: waterGoal }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-12 flex-1 rounded-md transition-all duration-300 ${i < waterIntake
                                        ? 'bg-blue-500'
                                        : 'bg-blue-200 dark:bg-blue-800/50'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={addWater}
                            className="flex-1 btn bg-blue-600 text-white hover:bg-blue-700"
                        >
                            + Drink
                        </button>
                        <button
                            onClick={removeWater}
                            className="btn bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                        >
                            -
                        </button>
                    </div>
                </div>

                {/* Sleep Summary */}
                <div className="card bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                            <Moon size={24} />
                            <h3 className="font-bold">Sleep</h3>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-indigo-600/70 dark:text-indigo-400/70 text-sm">Last Night</p>
                        <h3 className="text-4xl font-bold text-indigo-800 dark:text-indigo-200">7h 30m</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                        <span className="bg-indigo-200 dark:bg-indigo-800 px-2 py-0.5 rounded text-xs font-bold">+15m</span>
                        vs 7-day avg
                    </div>
                </div>

                {/* Calories / Activity */}
                <div className="card bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                            <Flame size={24} />
                            <h3 className="font-bold">Activity</h3>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-orange-600/70 dark:text-orange-400/70 text-sm">Calories Burned</p>
                        <h3 className="text-4xl font-bold text-orange-800 dark:text-orange-200">450</h3>
                    </div>
                    <div className="mt-4 w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weight Chart */}
                <div className="card h-80 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            <Scale size={20} />
                            Weight Trend
                        </h3>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">Last 30 Days</span>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockWeightData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                                />
                                <YAxis
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                    formatter={(value) => [`${value} kg`, 'Weight']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="var(--color-accent)"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: 'var(--color-bg-primary)', strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sleep Bar Chart */}
                <div className="card h-80 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            <Moon size={20} />
                            Sleep Quality
                        </h3>
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">This Week</span>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockSleepData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                                />
                                <YAxis
                                    domain={[0, 12]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--color-bg-tertiary)' }}
                                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                    formatter={(value) => [`${value} hrs`, 'Sleep']}
                                />
                                <Bar
                                    dataKey="hours"
                                    fill="#6366f1"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Workouts */}
            <div className="card">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Recent Activities</h3>
                <div className="space-y-2">
                    {recentWorkouts.map(workout => (
                        <div key={workout.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-[var(--color-text-primary)]">{workout.type}</h4>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{workout.date} • {workout.duration}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-[var(--color-text-primary)]">{workout.calories}</span>
                                <span className="text-xs text-[var(--color-text-muted)] ml-1">kcal</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthFitness;
