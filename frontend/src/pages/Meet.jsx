import React, { useState, useEffect } from 'react';
import {
    Video,
    Plus,
    Calendar as CalendarIcon,
    Clock,
    Link as LinkIcon,
    Copy,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { format, addHours, startOfDay, endOfDay } from 'date-fns';
import {
    initGoogleCalendar,
    requestCalendarAccess,
    isCalendarConnected,
    createGoogleCalendarEvent,
    fetchGoogleCalendarEvents
} from '../services/googleCalendar';

const Meet = () => {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [joinCode, setJoinCode] = useState('');
    const [createdMeeting, setCreatedMeeting] = useState(null);

    useEffect(() => {
        initGoogleCalendar(() => {
            const isConnected = isCalendarConnected();
            setConnected(isConnected);
            if (isConnected) {
                fetchMeetings();
            }
        });
    }, []);

    const handleConnect = async () => {
        try {
            setLoading(true);
            await requestCalendarAccess();
            setConnected(true);
            await fetchMeetings();
        } catch (error) {
            console.error('Failed to connect Google Calendar:', error);
            const errorMessage = error.error || error.message || 'Failed to connect.';
            if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
                alert('Please allow popups for this site to connect Google Meet.');
            } else {
                alert(`Failed to connect: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const end = addHours(now, 24 * 7); // Next 7 days
            const events = await fetchGoogleCalendarEvents(now, end);

            // Filter for events with conference data or hangout links
            const meetings = events.filter(e => e.hangoutLink || e.conferenceData);
            setUpcomingMeetings(meetings);
        } catch (error) {
            console.error('Error fetching meetings:', error);
            const errorMessage = error.message || 'Failed to fetch meetings.';
            if (errorMessage.includes('Not authenticated')) {
                setConnected(false);
                alert('Your session expired. Please reconnect Google Meet.');
            }
        } finally {
            setLoading(false);
        }
    };

    const createInstantMeeting = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const end = addHours(now, 1);

            const event = {
                title: 'Instant Meeting (Nyumba)',
                description: 'Created via Nyumba App',
                start: now,
                end: end,
                withMeet: true
            };

            const result = await createGoogleCalendarEvent(event);
            setCreatedMeeting(result);
            await fetchMeetings(); // Refresh list
        } catch (error) {
            console.error('Error creating meeting:', error);
            const errorMessage = error.message || 'Failed to create instant meeting.';
            if (errorMessage.includes('Not authenticated')) {
                setConnected(false);
                alert('Your session expired. Please reconnect Google Meet.');
            } else {
                alert(`Failed to create meeting: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (!joinCode) return;

        let url = joinCode;
        if (!url.startsWith('http')) {
            // Assume it's a code like "abc-defg-hij" or just a code
            url = `https://meet.google.com/${joinCode}`;
        }
        window.open(url, '_blank');
        setJoinCode('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Link copied to clipboard!');
    };

    if (!connected) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-4">
                    <Video size={48} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Google Meet</h1>
                <p className="text-[var(--color-text-secondary)] max-w-md">
                    Connect your Google Calendar to create instant video meetings and see your upcoming calls.
                </p>
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="btn bg-teal-600 text-white hover:bg-teal-700 px-8 py-3 text-lg gap-3"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : <Video />}
                    Connect Google Meet
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Google Meet</h1>
                    <p className="text-[var(--color-text-secondary)]">Video conferencing and virtual meetings.</p>
                </div>
                <button
                    onClick={fetchMeetings}
                    className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors"
                    title="Refresh Meetings"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Actions Section */}
                <div className="space-y-6">
                    {/* New Meeting Card */}
                    <div className="card bg-gradient-to-br from-teal-600 to-teal-700 text-white border-none p-8">
                        <h2 className="text-2xl font-bold mb-4">New Meeting</h2>
                        <p className="text-teal-100 mb-6">Create a meeting code to share with others and start collaborating instantly.</p>

                        <button
                            onClick={createInstantMeeting}
                            disabled={loading}
                            className="bg-white text-teal-700 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-teal-50 transition-colors flex items-center gap-2 w-full justify-center md:w-auto"
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : <Plus size={20} />}
                            Start Instant Meeting
                        </button>

                        {/* Recent Created Meeting Info */}
                        {createdMeeting && (
                            <div className="mt-6 bg-black/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm text-teal-100 mb-2">Meeting ready!</p>
                                <div className="flex items-center gap-2 bg-white/10 rounded p-2">
                                    <LinkIcon size={16} className="text-teal-200" />
                                    <input
                                        type="text"
                                        readOnly
                                        value={createdMeeting.hangoutLink}
                                        className="bg-transparent border-none text-white text-sm flex-1 outline-none truncate"
                                    />
                                    <button onClick={() => copyToClipboard(createdMeeting.hangoutLink)} className="p-1 hover:text-white text-teal-200">
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <a
                                    href={createdMeeting.hangoutLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block mt-3 text-center text-sm font-bold hover:underline"
                                >
                                    Join Now
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Join Meeting Card */}
                    <div className="card border-[var(--color-border)]">
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Join a Meeting</h2>
                        <form onSubmit={handleJoin} className="flex gap-2">
                            <div className="relative flex-1">
                                <Video size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Enter a code or link"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-tertiary)] rounded-lg outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!joinCode}
                                className="btn font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50"
                            >
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                {/* Upcoming Meetings List */}
                <div className="card h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Upcoming Calls</h2>
                        <Clock size={20} className="text-[var(--color-text-muted)]" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {upcomingMeetings.length === 0 ? (
                            <div className="text-center py-12 text-[var(--color-text-muted)]">
                                <p>No upcoming meetings found.</p>
                                <p className="text-sm mt-1">Scheduled Google Meet events will appear here.</p>
                            </div>
                        ) : (
                            upcomingMeetings.map(meeting => (
                                <div key={meeting.id} className="p-4 rounded-xl border border-[var(--color-border)] hover:border-teal-500 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-[var(--color-text-primary)] line-clamp-1">{meeting.summary}</h3>
                                        <a
                                            href={meeting.hangoutLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                                            title="Join Meeting"
                                        >
                                            <Video size={18} />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                                        <span className="flex items-center gap-1.5">
                                            <CalendarIcon size={14} />
                                            {format(new Date(meeting.start.dateTime || meeting.start.date), 'EEE, MMM d')}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {format(new Date(meeting.start.dateTime || meeting.start.date), 'h:mm a')}
                                        </span>
                                    </div>
                                    {meeting.hangoutLink && (
                                        <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs text-[var(--color-text-muted)] truncate flex-1">{meeting.hangoutLink}</span>
                                            <button
                                                onClick={() => copyToClipboard(meeting.hangoutLink)}
                                                className="text-teal-600 font-medium text-xs hover:underline flex items-center gap-1"
                                            >
                                                <Copy size={12} /> Copy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Meet;
