import React, { useState } from 'react';
import {
    Calendar,
    Mail,
    Video,
    Clock,
    Users,
    FileText,
    MessageSquare,
    Cloud,
    Smartphone,
    Zap,
    CheckCircle2,
    ExternalLink,
    Search,
    Filter,
    Sparkles
} from 'lucide-react';

const Integrations = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'available', 'coming-soon'

    const integrations = [
        {
            id: 'google-calendar',
            name: 'Google Calendar',
            description: 'Sync your events and manage your schedule seamlessly',
            icon: Calendar,
            status: 'available',
            category: 'Productivity',
            color: 'blue',
            features: ['Two-way sync', 'Event notifications', 'Multiple calendars']
        },
        {
            id: 'google-meet',
            name: 'Google Meet',
            description: 'Schedule and join video meetings directly from your dashboard',
            icon: Video,
            status: 'available',
            category: 'Communication',
            color: 'green',
            features: ['Quick join', 'Meeting creation', 'Calendar integration']
        },
        {
            id: 'zoom',
            name: 'Zoom',
            description: 'Host and join Zoom meetings with one click',
            icon: Video,
            status: 'coming-soon',
            category: 'Communication',
            color: 'indigo',
            features: ['Meeting scheduling', 'Instant meetings', 'Recording access']
        },
        {
            id: 'gmail',
            name: 'Gmail',
            description: 'Access and manage your emails without leaving the app',
            icon: Mail,
            status: 'coming-soon',
            category: 'Communication',
            color: 'red',
            features: ['Email management', 'Smart filters', 'Quick replies']
        },
        {
            id: 'outlook',
            name: 'Microsoft Outlook',
            description: 'Connect your Outlook calendar and email',
            icon: Mail,
            status: 'coming-soon',
            category: 'Productivity',
            color: 'blue',
            features: ['Calendar sync', 'Email integration', 'Contact management']
        },
        {
            id: 'slack',
            name: 'Slack',
            description: 'Get notifications and updates in your Slack workspace',
            icon: MessageSquare,
            status: 'coming-soon',
            category: 'Communication',
            color: 'purple',
            features: ['Real-time notifications', 'Channel updates', 'Direct messages']
        },
        {
            id: 'microsoft-teams',
            name: 'Microsoft Teams',
            description: 'Integrate with Teams for meetings and collaboration',
            icon: Users,
            status: 'coming-soon',
            category: 'Communication',
            color: 'indigo',
            features: ['Meeting scheduling', 'Team chat', 'File sharing']
        },
        {
            id: 'notion',
            name: 'Notion',
            description: 'Sync your notes and documents with Notion',
            icon: FileText,
            status: 'coming-soon',
            category: 'Productivity',
            color: 'slate',
            features: ['Database sync', 'Page embedding', 'Two-way updates']
        },
        {
            id: 'google-drive',
            name: 'Google Drive',
            description: 'Access and attach files from your Google Drive',
            icon: Cloud,
            status: 'coming-soon',
            category: 'Storage',
            color: 'yellow',
            features: ['File browser', 'Quick upload', 'Shared drives']
        },
        {
            id: 'dropbox',
            name: 'Dropbox',
            description: 'Connect your Dropbox for file storage and sharing',
            icon: Cloud,
            status: 'coming-soon',
            category: 'Storage',
            color: 'blue',
            features: ['File sync', 'Share links', 'Team folders']
        },
        {
            id: 'apple-calendar',
            name: 'Apple Calendar',
            description: 'Sync with your iCloud calendar',
            icon: Calendar,
            status: 'coming-soon',
            category: 'Productivity',
            color: 'slate',
            features: ['iCloud sync', 'Event management', 'Reminders']
        },
        {
            id: 'webhooks',
            name: 'Webhooks',
            description: 'Create custom integrations with webhooks',
            icon: Zap,
            status: 'coming-soon',
            category: 'Developer',
            color: 'orange',
            features: ['Custom triggers', 'API access', 'Real-time updates']
        }
    ];

    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-200',
            hover: 'hover:border-blue-300',
            button: 'bg-blue-600 hover:bg-blue-700'
        },
        green: {
            bg: 'bg-green-50',
            text: 'text-green-600',
            border: 'border-green-200',
            hover: 'hover:border-green-300',
            button: 'bg-green-600 hover:bg-green-700'
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            border: 'border-red-200',
            hover: 'hover:border-red-300',
            button: 'bg-red-600 hover:bg-red-700'
        },
        purple: {
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            border: 'border-purple-200',
            hover: 'hover:border-purple-300',
            button: 'bg-purple-600 hover:bg-purple-700'
        },
        indigo: {
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            border: 'border-indigo-200',
            hover: 'hover:border-indigo-300',
            button: 'bg-indigo-600 hover:bg-indigo-700'
        },
        yellow: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-600',
            border: 'border-yellow-200',
            hover: 'hover:border-yellow-300',
            button: 'bg-yellow-600 hover:bg-yellow-700'
        },
        orange: {
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            border: 'border-orange-200',
            hover: 'hover:border-orange-300',
            button: 'bg-orange-600 hover:bg-orange-700'
        },
        slate: {
            bg: 'bg-slate-50',
            text: 'text-slate-600',
            border: 'border-slate-200',
            hover: 'hover:border-slate-300',
            button: 'bg-slate-600 hover:bg-slate-700'
        }
    };

    const filteredIntegrations = integrations.filter(integration => {
        const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            integration.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = filterStatus === 'all' || integration.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    const handleConnect = (integration) => {
        if (integration.status === 'available') {
            // Handle connection logic here
            console.log('Connecting to:', integration.name);
            alert(`Connecting to ${integration.name}... (Integration logic to be implemented)`);
        }
    };

    const stats = {
        total: integrations.length,
        available: integrations.filter(i => i.status === 'available').length,
        comingSoon: integrations.filter(i => i.status === 'coming-soon').length
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <Zap className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
                    </div>
                    <p className="text-slate-600 text-lg">
                        Connect your favorite apps and services to streamline your workflow
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Integrations</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <Sparkles className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Available Now</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-xl">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Coming Soon</p>
                                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.comingSoon}</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search integrations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        
                        {/* Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                    filterStatus === 'all'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus('available')}
                                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                    filterStatus === 'available'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Available
                            </button>
                            <button
                                onClick={() => setFilterStatus('coming-soon')}
                                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                    filterStatus === 'coming-soon'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Coming Soon
                            </button>
                        </div>
                    </div>
                </div>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIntegrations.map((integration) => {
                        const colors = colorClasses[integration.color];
                        const Icon = integration.icon;
                        
                        return (
                            <div
                                key={integration.id}
                                className={`bg-white rounded-xl border-2 ${colors.border} ${colors.hover} transition-all duration-200 overflow-hidden hover:shadow-lg`}
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 ${colors.bg} rounded-xl`}>
                                            <Icon className={`w-6 h-6 ${colors.text}`} />
                                        </div>
                                        {integration.status === 'available' ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                Available
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                                Coming Soon
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        {integration.name}
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                        {integration.description}
                                    </p>

                                    {/* Category */}
                                    <div className="mb-4">
                                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                                            {integration.category}
                                        </span>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-2 mb-6">
                                        {integration.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle2 className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleConnect(integration)}
                                        disabled={integration.status === 'coming-soon'}
                                        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                                            integration.status === 'available'
                                                ? `${colors.button} shadow-sm hover:shadow-md`
                                                : 'bg-slate-300 cursor-not-allowed'
                                        }`}
                                    >
                                        {integration.status === 'available' ? (
                                            <>
                                                <span>Connect</span>
                                                <ExternalLink className="w-4 h-4" />
                                            </>
                                        ) : (
                                            <span>Coming Soon</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredIntegrations.length === 0 && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No integrations found</h3>
                        <p className="text-slate-600">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Integrations;
