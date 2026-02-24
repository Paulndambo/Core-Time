import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    RefreshCw,
    Link as LinkIcon,
    X,
    Video,
    Edit2,
    Trash2
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addDays,
    isToday,
    parseISO,
    setHours,
    setMinutes
} from 'date-fns';
import {
    initGoogleCalendar,
    requestCalendarAccess,
    isCalendarConnected,
    fetchGoogleCalendarEvents,
    createGoogleCalendarEvent
} from '../services/googleCalendar';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Calendar = () => {
    const { user } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarConnected, setCalendarConnected] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [newEvent, setNewEvent] = useState({ title: '', time: '09:00', description: '', withMeet: false, event_link: '' });

    useEffect(() => {
        // Try to initialize Google Calendar, but always fall back to backend
        let googleCalendarInitialized = false;
        
        const initTimeout = setTimeout(() => {
            // If Google Calendar hasn't initialized after 3 seconds, load backend events
            if (!googleCalendarInitialized) {
                console.log('Google Calendar initialization timeout, loading backend events');
                setCalendarConnected(false);
                fetchBackendEvents();
            }
        }, 3000);

        try {
            initGoogleCalendar(() => {
                googleCalendarInitialized = true;
                clearTimeout(initTimeout);
                
                const connected = isCalendarConnected();
                setCalendarConnected(connected);
                
                // Load events based on connection status
                if (connected) {
                    syncGoogleCalendar();
                } else {
                    fetchBackendEvents();
                }
            });
        } catch (error) {
            // If Google Calendar initialization fails completely, load backend events
            console.error('Google Calendar initialization failed:', error);
            googleCalendarInitialized = true;
            clearTimeout(initTimeout);
            setCalendarConnected(false);
            fetchBackendEvents();
        }

        return () => clearTimeout(initTimeout);
    }, []);

    // Fetch backend events when Google Calendar is NOT connected
    const fetchBackendEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getEvents();
            const eventsList = data.results || data || [];
            
            // Format events from backend
            const formattedEvents = eventsList.map(event => ({
                id: event.id,
                title: event.title,
                description: event.description || '',
                date: parseISO(event.date),
                time: event.time ? format(parseISO(`${event.date}T${event.time}`), 'h:mm a') : 'All day',
                type: 'backend',
                event_link: event.event_link || null,
                backendEventId: event.id
            }));
            
            setEvents(formattedEvents);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError(err.message || 'Failed to load events. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dayEvents = events.filter(e => isSameDay(e.date, selectedDate));

    const daysInMonth = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const handleConnectCalendar = async () => {
        try {
            setSyncing(true);
            await requestCalendarAccess();
            setCalendarConnected(true);
            // Once connected, switch to showing Google Calendar events
            await syncGoogleCalendar();
        } catch (error) {
            console.error('Error connecting calendar:', error);
            const errorMessage = error.error || error.message || 'Failed to connect Google Calendar.';
            if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
                alert('Please allow popups for this site to connect Google Calendar.');
            } else {
                alert(`Failed to connect Google Calendar: ${errorMessage}`);
            }
        } finally {
            setSyncing(false);
        }
    };

    const syncGoogleCalendar = async () => {
        try {
            setSyncing(true);
            setIsLoading(true);
            const googleEvents = await fetchGoogleCalendarEvents(
                startOfMonth(currentMonth),
                endOfMonth(currentMonth)
            );

            const formattedGoogleEvents = googleEvents.map(event => ({
                id: event.id,
                title: event.summary,
                description: event.description || '',
                date: parseISO(event.start.dateTime || event.start.date),
                time: event.start.dateTime ? format(parseISO(event.start.dateTime), 'h:mm a') : 'All day',
                type: 'google',
                googleEventId: event.id,
                event_link: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null
            }));

            // When Google Calendar is connected, ONLY show Google Calendar events
            setEvents(formattedGoogleEvents);
        } catch (error) {
            console.error('Error syncing calendar:', error);
            const errorMessage = error.message || 'Failed to sync calendar events.';
            if (errorMessage.includes('Not authenticated')) {
                setCalendarConnected(false);
                // Fall back to backend events if Google Calendar fails
                await fetchBackendEvents();
                alert('Your session expired. Please reconnect Google Calendar.');
            } else {
                alert(`Failed to sync: ${errorMessage}`);
            }
        } finally {
            setSyncing(false);
            setIsLoading(false);
        }
    };

    const handleAddOrUpdateEvent = async () => {
        if (!newEvent.title.trim()) return;
        
        if (!user || !user.id) {
            setError('User not found. Please log in again.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const userId = user.id || user.user_id || user.uuid || user.pk;
            
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }

            const [hours, minutes] = newEvent.time.split(':');
            const eventDate = setMinutes(setHours(selectedDate, parseInt(hours)), parseInt(minutes));

            let meetLink = newEvent.event_link || null;

            // If calendar is connected and user wants Google Meet, create Google Calendar event first
            if (calendarConnected && !editingEvent && newEvent.withMeet) {
                try {
                    const endDate = new Date(eventDate);
                    endDate.setHours(eventDate.getHours() + 1); // 1 hour duration

                    const googleEvent = await createGoogleCalendarEvent({
                        title: newEvent.title,
                        description: newEvent.description || '',
                        start: eventDate,
                        end: endDate,
                        withMeet: true
                    });

                    // Get the Google Meet link from the created event
                    if (googleEvent.hangoutLink) {
                        meetLink = googleEvent.hangoutLink;
                    } else if (googleEvent.conferenceData?.entryPoints?.[0]?.uri) {
                        meetLink = googleEvent.conferenceData.entryPoints[0].uri;
                    }
                } catch (error) {
                    console.error('Error creating Google Calendar event with Meet:', error);
                    // Continue with backend event creation even if Google Calendar fails
                    setError('Note: Google Calendar event creation failed, but the event will be saved locally.');
                }
            }

            // Now create/update the backend event with the Meet link (if obtained)
            const eventData = {
                user: String(userId),
                title: newEvent.title.trim(),
                description: newEvent.description.trim() || '',
                date: format(selectedDate, 'yyyy-MM-dd'),
                time: newEvent.time,
                event_link: meetLink
            };

            let savedEvent;
            if (editingEvent) {
                // Update existing event
                savedEvent = await updateEvent(editingEvent.backendEventId, eventData);
            } else {
                // Create new event
                savedEvent = await createEvent(eventData);
            }

            // If calendar is connected but user didn't want Meet, still add to Google Calendar
            if (calendarConnected && !editingEvent && !newEvent.withMeet) {
                try {
                    const endDate = new Date(eventDate);
                    endDate.setHours(eventDate.getHours() + 1); // 1 hour duration

                    await createGoogleCalendarEvent({
                        title: newEvent.title,
                        description: newEvent.description || '',
                        start: eventDate,
                        end: endDate,
                        withMeet: false
                    });
                } catch (error) {
                    console.error('Error creating Google Calendar event:', error);
                    // Don't fail the whole operation if Google Calendar fails
                }
            }

            // Refresh events list based on connection status
            if (calendarConnected) {
                await syncGoogleCalendar();
            } else {
                await fetchBackendEvents();
            }
            
            // Close modal and reset form
            handleCloseModal();
        } catch (err) {
            console.error('Error saving event:', err);
            setError(err.message || 'Failed to save event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setNewEvent({
            title: event.title,
            time: event.time ? format(parseISO(`${format(event.date, 'yyyy-MM-dd')}T${event.time.replace(' AM', '').replace(' PM', '')}`), 'HH:mm') : '09:00',
            description: event.description || '',
            withMeet: false,
            event_link: event.event_link || ''
        });
        setSelectedDate(event.date);
        setShowEventModal(true);
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        setError(null);
        try {
            await deleteEvent(eventId);
            // Refresh based on connection status
            if (calendarConnected) {
                await syncGoogleCalendar();
            } else {
                await fetchBackendEvents();
            }
        } catch (err) {
            console.error('Error deleting event:', err);
            setError(err.message || 'Failed to delete event. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setShowEventModal(false);
        setEditingEvent(null);
        setNewEvent({ title: '', time: '09:00', description: '', withMeet: false, event_link: '' });
        setError(null);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Calendar</h1>
                    <p className="text-[var(--color-text-secondary)]">Manage your schedule and upcoming events.</p>
                </div>
                <div className="flex gap-2">
                    {calendarConnected ? (
                        <button
                            onClick={syncGoogleCalendar}
                            disabled={syncing}
                            className="btn bg-green-600 text-white hover:bg-green-700 gap-2"
                        >
                            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                            {syncing ? 'Syncing...' : 'Sync Calendar'}
                        </button>
                    ) : (
                        <button
                            onClick={handleConnectCalendar}
                            disabled={syncing}
                            className="btn bg-purple-600 text-white hover:bg-purple-700 gap-2"
                        >
                            <LinkIcon size={18} />
                            {syncing ? 'Connecting...' : 'Connect Google Calendar'}
                        </button>
                    )}
                    <button onClick={() => setShowEventModal(true)} className="btn btn-primary gap-2">
                        <Plus size={18} />
                        Add Event
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {calendarConnected && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-800 font-medium">Google Calendar connected</span>
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <RefreshCw size={24} className="animate-spin text-indigo-600 mr-2" />
                    <span className="text-slate-600">Loading events...</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="card lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setCurrentMonth(new Date())} className="text-sm font-medium px-3 py-1 hover:bg-[var(--color-bg-tertiary)] rounded-md transition-colors">
                                Today
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-2 text-center text-sm font-medium text-[var(--color-text-muted)]">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {daysInMonth.map((day, i) => {
                            const eventsForDay = events.filter(e => isSameDay(e.date, day));
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, monthStart);

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                    min-h-[100px] p-2 border border-[var(--color-border)] rounded-lg cursor-pointer transition-colors relative
                    ${!isCurrentMonth ? 'bg-[var(--color-bg-tertiary)]/30 text-[var(--color-text-muted)]' : 'bg-[var(--color-bg-secondary)]'}
                    ${isSelected ? 'ring-2 ring-[var(--color-accent)] z-10' : 'hover:border-[var(--color-accent)]'}
                  `}
                                >
                                    <div className={`
                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1
                    ${isToday(day) ? 'bg-[var(--color-accent)] text-white' : ''}
                  `}>
                                        {format(day, 'd')}
                                    </div>

                                    <div className="space-y-1">
                                        {eventsForDay.map(event => (
                                            <div
                                                key={event.id}
                                                className={`text-[10px] truncate px-1.5 py-0.5 rounded-md ${event.type === 'google'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {event.time} {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day events */}
                <div className="card h-fit">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
                        {format(selectedDate, 'EEEE, MMMM do')}
                    </h3>

                    <div className="space-y-4">
                        {dayEvents.length > 0 ? dayEvents.map(event => (
                            <div key={event.id} className={`p-4 rounded-lg border-l-4 ${event.type === 'google' ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-[var(--color-text-primary)]">{event.title}</h4>
                                    {/* Only show edit/delete for backend events (when Google Calendar is not connected) */}
                                    {event.type === 'backend' && !calendarConnected && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEditEvent(event)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.backendEventId)}
                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {event.description && (
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-2">{event.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-text-secondary)] flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} /> {event.time}
                                    </span>
                                    <span className={`capitalize px-2 py-0.5 rounded text-xs ${event.type === 'google' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {event.type === 'google' ? 'Google Calendar' : 'Local'}
                                    </span>
                                    {/* Show event link if it exists (Google Meet or other video conferencing) */}
                                    {event.event_link && (
                                        <a
                                            href={event.event_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium hover:underline"
                                        >
                                            <Video size={14} />
                                            {event.event_link.includes('meet.google.com') ? 'Join Meet' : 'Join Meeting'}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-[var(--color-text-muted)]">
                                <p>No events scheduled for this day.</p>
                                <button onClick={() => setShowEventModal(true)} className="text-[var(--color-accent)] text-sm font-medium mt-2 hover:underline">
                                    + Add Event
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Enter event title"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Add a description (optional)"
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                    <input
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-200">
                                        {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Link (Optional)</label>
                                <input
                                    type="url"
                                    value={newEvent.event_link}
                                    onChange={(e) => setNewEvent({ ...newEvent, event_link: e.target.value })}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {calendarConnected && !editingEvent && (
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <input
                                        type="checkbox"
                                        id="addMeet"
                                        checked={newEvent.withMeet}
                                        onChange={(e) => setNewEvent({ ...newEvent, withMeet: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="addMeet" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <Video size={20} className="text-blue-600" />
                                        <span className="text-sm font-medium text-gray-700">Add Google Meet video conferencing</span>
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddOrUpdateEvent}
                                    className="flex-1 btn btn-primary px-6 py-3"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
