import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    Settings,
    Link as LinkIcon,
    Copy,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    ExternalLink,
    Users,
    Video,
    Phone,
    MapPin,
    ChevronRight,
    AlertCircle,
    Mail,
    MessageSquare
} from 'lucide-react';
import { format, addDays, startOfWeek, addMinutes, parse, setHours, setMinutes } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { getEventTypes, createEventType, updateEventType, deleteEventType, getEventBookings, getAvailabilitySlots, createAvailabilitySlot } from '../services/api';

const Scheduling = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('events'); // 'events' | 'availability' | 'settings'
    const [eventTypes, setEventTypes] = useState([]);
    const [availability, setAvailability] = useState({});
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [editingDay, setEditingDay] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingAvailability, setIsSavingAvailability] = useState(false);

    // Transform API event type to component format
    const transformEventTypeFromAPI = (apiEvent) => {
        return {
            id: apiEvent.id,
            name: apiEvent.event_name,
            duration: apiEvent.duration,
            description: apiEvent.description || '',
            color: 'blue', // Default color
            active: true, // Default to active
            location: apiEvent.location || 'Google Meet',
            bufferTime: apiEvent.buffer_time || 0,
            startDate: apiEvent.start_date,
            endDate: apiEvent.end_date,
            createdAt: apiEvent.created_at,
            updatedAt: apiEvent.updated_at
        };
    };

    // Transform component event type to API format
    const transformEventTypeToAPI = (eventData) => {
        const userId = user?.id || user?.user_id || user?.uuid || user?.pk;
        if (!userId) {
            throw new Error('User ID not found. Please log in again.');
        }

        return {
            user: String(userId),
            event_name: eventData.name,
            description: eventData.description || '',
            duration: eventData.duration,
            location: eventData.location || 'Google Meet',
            buffer_time: eventData.bufferTime || 0,
            start_date: eventData.startDate || format(new Date(), 'yyyy-MM-dd'),
            end_date: eventData.endDate || format(addDays(new Date(), 365), 'yyyy-MM-dd')
        };
    };

    // Transform API booking to component format
    const transformBookingFromAPI = (apiBooking, eventTypesList = []) => {
        const bookedTime = new Date(apiBooking.booked_time);
        return {
            id: apiBooking.id,
            eventType: apiBooking.event_name,
            date: format(bookedTime, 'yyyy-MM-dd'),
            time: format(bookedTime, 'HH:mm'),
            duration: eventTypesList.find(e => e.id === apiBooking.event)?.duration || 30, // Get duration from event type
            attendee: {
                name: apiBooking.name,
                email: apiBooking.email,
                phone: apiBooking.phone_number || '',
                notes: apiBooking.notes || ''
            },
            status: apiBooking.status || 'Pending',
            createdAt: apiBooking.created_at,
            eventOwner: apiBooking.event_owner
        };
    };

    // Load event types from API on mount
    useEffect(() => {
        const fetchEventTypes = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getEventTypes();
                const eventsList = response.results || response || [];
                const transformedEvents = eventsList.map(transformEventTypeFromAPI);
                setEventTypes(transformedEvents);
            } catch (err) {
                console.error('Error fetching event types:', err);
                setError(err.message || 'Failed to load event types. Please try again.');
                // Fallback to localStorage if API fails
                const savedEvents = localStorage.getItem('schedulingEvents');
                if (savedEvents) {
                    setEventTypes(JSON.parse(savedEvents));
                }
            } finally {
                setIsLoading(false);
            }
        };

        const fetchAvailability = async () => {
            if (!user) return;

            try {
                const response = await getAvailabilitySlots();
                const slotsList = response.results || response || [];

                if (Array.isArray(slotsList) && slotsList.length > 0) {
                    const defaultAvailability = {
                        monday: [],
                        tuesday: [],
                        wednesday: [],
                        thursday: [],
                        friday: [],
                        saturday: [],
                        sunday: []
                    };

                    const availabilityByDay = { ...defaultAvailability };

                    slotsList.forEach((slot) => {
                        const dayOfWeek = (slot.day_of_week || '').toLowerCase();

                        // Normalize possible day names from API to our keys
                        const dayMap = {
                            monday: 'monday',
                            tuesday: 'tuesday',
                            wednesday: 'wednesday',
                            thursday: 'thursday',
                            friday: 'friday',
                            saturday: 'saturday',
                            sunday: 'sunday'
                        };

                        const key = dayMap[dayOfWeek];
                        if (!key) return;

                        const start = (slot.start_time || '').slice(0, 5); // "HH:MM"
                        const end = (slot.end_time || '').slice(0, 5);     // "HH:MM"

                        availabilityByDay[key] = [
                            ...availabilityByDay[key],
                            { start, end }
                        ];
                    });

                    setAvailability(availabilityByDay);
                    return;
                }
            } catch (err) {
                console.error('Error fetching availability slots:', err);
                // Silent fallback below
            }

            // Fallback to localStorage or sensible defaults if API fails or returns nothing
            const savedAvailability = localStorage.getItem('schedulingAvailability');
            if (savedAvailability) {
                setAvailability(JSON.parse(savedAvailability));
            } else {
                // Default availability: Monday-Friday, 9 AM - 5 PM
                setAvailability({
                    monday: [{ start: '09:00', end: '17:00' }],
                    tuesday: [{ start: '09:00', end: '17:00' }],
                    wednesday: [{ start: '09:00', end: '17:00' }],
                    thursday: [{ start: '09:00', end: '17:00' }],
                    friday: [{ start: '09:00', end: '17:00' }],
                    saturday: [],
                    sunday: []
                });
            }
        };

        if (user) {
            fetchEventTypes();
            fetchAvailability();
        }

        // Don't load bookings from localStorage - they will be fetched from API when needed
    }, [user]);

    // Fetch bookings from API when bookings tab is active or when event types change
    useEffect(() => {
        const fetchBookings = async () => {
            if (!user || activeTab !== 'bookings') return;
            
            setIsLoading(true);
            setError(null);
            
            try {
                const response = await getEventBookings();
                const bookingsList = response.results || response || [];
                const transformedBookings = bookingsList.map(booking => transformBookingFromAPI(booking, eventTypes));
                setBookings(transformedBookings);
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError(err.message || 'Failed to load bookings. Please try again.');
                // Fallback to localStorage if API fails
                const savedBookings = localStorage.getItem('schedulingBookings');
                if (savedBookings) {
                    setBookings(JSON.parse(savedBookings));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [user, activeTab, eventTypes]);

    useEffect(() => {
        localStorage.setItem('schedulingAvailability', JSON.stringify(availability));
    }, [availability]);

    const getBookingLink = (eventId) => {
        const baseUrl = window.location.origin;
        const userId = user?.id || user?.user_id || user?.uuid || user?.pk;
        if (!userId) {
            console.error('User ID not found');
            return '';
        }
        return `${baseUrl}/book/${userId}/${eventId}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Link copied to clipboard!');
    };

    const handleCreateEvent = async (eventData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const apiData = transformEventTypeToAPI(eventData);
            
            if (editingEvent) {
                // Update existing event
                const updatedEvent = await updateEventType(editingEvent.id, apiData);
                const transformed = transformEventTypeFromAPI(updatedEvent);
                setEventTypes(eventTypes.map(e => 
                    e.id === editingEvent.id ? transformed : e
                ));
            } else {
                // Create new event
                const newEvent = await createEventType(apiData);
                const transformed = transformEventTypeFromAPI(newEvent);
                setEventTypes([...eventTypes, transformed]);
            }
            setShowEventModal(false);
            setEditingEvent(null);
        } catch (err) {
            console.error('Error saving event type:', err);
            setError(err.message || 'Failed to save event type. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event type?')) {
            return;
        }

        setError(null);
        try {
            await deleteEventType(eventId);
            setEventTypes(eventTypes.filter(e => e.id !== eventId));
        } catch (err) {
            console.error('Error deleting event type:', err);
            setError(err.message || 'Failed to delete event type. Please try again.');
        }
    };

    const handleToggleEventActive = (eventId) => {
        setEventTypes(eventTypes.map(e => 
            e.id === eventId ? { ...e, active: !e.active } : e
        ));
    };

    const handleSaveAvailability = async (day, slots) => {
        // Persist to backend
        setIsSavingAvailability(true);
        setError(null);

        try {
            const userId = user?.id || user?.user_id || user?.uuid || user?.pk;
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }

            // Map internal day key to API day_of_week value (capitalized)
            const dayMap = {
                monday: 'Monday',
                tuesday: 'Tuesday',
                wednesday: 'Wednesday',
                thursday: 'Thursday',
                friday: 'Friday',
                saturday: 'Saturday',
                sunday: 'Sunday',
            };
            const apiDay = dayMap[day] || (day.charAt(0).toUpperCase() + day.slice(1));

            // Create a slot on the backend for each time range
            // Note: this currently only creates new slots and does not remove old ones on the backend.
            for (const slot of slots) {
                await createAvailabilitySlot({
                    user: String(userId),
                    day_of_week: apiDay,
                    start_time: slot.start,
                    end_time: slot.end,
                });
            }

            // Update local state so UI and localStorage stay in sync
            setAvailability({ ...availability, [day]: slots });
            setShowAvailabilityModal(false);
            setEditingDay(null);
        } catch (err) {
            console.error('Error saving availability:', err);
            setError(err.message || 'Failed to save availability. Please try again.');
            // Re-throw so the modal submit handler can react if needed
            throw err;
        } finally {
            setIsSavingAvailability(false);
        }
    };

    if (isLoading && eventTypes.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-[var(--color-text-secondary)]">Loading event types...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-4 space-y-4 max-w-[1600px] mx-auto">
            {/* Enhanced Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Scheduling</h1>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Manage your booking links, availability, and scheduled meetings
                    </p>
                </div>
                {activeTab === 'events' && (
                    <button
                        onClick={() => {
                            setEditingEvent(null);
                            setShowEventModal(true);
                        }}
                        className="btn bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 gap-2 px-5 py-2.5 font-semibold"
                    >
                        <Plus size={18} />
                        New Event Type
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </div>
                    <button
                        onClick={() => {
                            setError(null);
                            if (activeTab === 'events') {
                                window.location.reload();
                            } else if (activeTab === 'bookings') {
                                setActiveTab('events');
                                setTimeout(() => setActiveTab('bookings'), 100);
                            }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold whitespace-nowrap"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Enhanced Tabs with Icons */}
            <div className="flex gap-1 border-b-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)] rounded-t-lg p-1">
                <button
                    onClick={() => setActiveTab('events')}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-all text-sm ${
                        activeTab === 'events'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                    }`}
                >
                    <CalendarIcon size={16} />
                    Event Types
                </button>
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-all text-sm ${
                        activeTab === 'bookings'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                    }`}
                >
                    <Users size={16} />
                    Bookings
                    {bookings.length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            {bookings.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('availability')}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-all text-sm ${
                        activeTab === 'availability'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                    }`}
                >
                    <Clock size={16} />
                    Availability
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-all text-sm ${
                        activeTab === 'settings'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                    }`}
                >
                    <Settings size={16} />
                    Settings
                </button>
            </div>

            {/* Event Types Tab */}
            {activeTab === 'events' && (
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                            <p className="text-sm text-[var(--color-text-secondary)]">Loading event types...</p>
                        </div>
                    ) : eventTypes.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {eventTypes.map(event => {
                                const LocationIcon = event.location === 'Phone Call' ? Phone : 
                                                    event.location === 'In Person' ? MapPin : Video;
                                return (
                                    <div
                                        key={event.id}
                                        className={`card border-2 transition-all hover:shadow-lg ${
                                            event.active 
                                                ? 'border-blue-200 bg-gradient-to-br from-white to-blue-50/30' 
                                                : 'border-[var(--color-border)] opacity-60 hover:opacity-80'
                                        }`}
                                    >
                                        {/* Header with Status Badge */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                                                        {event.name}
                                                    </h3>
                                                    <button
                                                        onClick={() => handleToggleEventActive(event.id)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                            event.active 
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                        }`}
                                                    >
                                                        {event.active ? '● Active' : '○ Inactive'}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)] font-medium">
                                                        <Clock size={16} className="text-blue-600" />
                                                        {event.duration} min
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)] font-medium">
                                                        <LocationIcon size={16} className="text-blue-600" />
                                                        {event.location}
                                                    </span>
                                                    {event.bufferTime > 0 && (
                                                        <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)] font-medium">
                                                            <Clock size={16} className="text-orange-600" />
                                                            {event.bufferTime}m buffer
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingEvent(event);
                                                        setShowEventModal(true);
                                                    }}
                                                    className="p-2.5 text-[var(--color-text-muted)] hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all"
                                                    title="Edit event type"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                                    title="Delete event type"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {event.description && (
                                            <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
                                                {event.description}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
                                            <button
                                                onClick={() => copyToClipboard(getBookingLink(event.id))}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                                            >
                                                <Copy size={16} />
                                                Copy Booking Link
                                            </button>
                                            <button
                                                onClick={() => window.open(getBookingLink(event.id), '_blank')}
                                                className="p-2.5 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all"
                                                title="Open booking page"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 px-6">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CalendarIcon size={40} className="text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                                    No Event Types Yet
                                </h3>
                                <p className="text-[var(--color-text-secondary)] mb-6">
                                    Create your first event type to start accepting bookings. Event types define the meetings people can schedule with you.
                                </p>
                                <button
                                    onClick={() => {
                                        setEditingEvent(null);
                                        setShowEventModal(true);
                                    }}
                                    className="btn bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 gap-2 px-6 py-3 font-semibold"
                                >
                                    <Plus size={20} />
                                    Create Your First Event Type
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                            <p className="text-sm text-[var(--color-text-secondary)]">Loading bookings...</p>
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                                                Event Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                                                Attendee
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--color-border)]">
                                        {bookings.sort((a, b) => {
                                            const dateA = new Date(a.date + ' ' + a.time);
                                            const dateB = new Date(b.date + ' ' + b.time);
                                            return dateB - dateA; // Sort newest first
                                        }).map((booking) => {
                                            const bookingDate = new Date(booking.date + ' ' + booking.time);
                                            const isPast = bookingDate < new Date();
                                            const isToday = format(bookingDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                                            const isTomorrow = format(bookingDate, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd');
                                            
                                            const getStatusColor = (status) => {
                                                switch (status?.toLowerCase()) {
                                                    case 'confirmed':
                                                        return 'bg-green-100 text-green-700 border-green-200';
                                                    case 'cancelled':
                                                        return 'bg-red-100 text-red-700 border-red-200';
                                                    case 'pending':
                                                        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
                                                    default:
                                                        return 'bg-gray-100 text-gray-700 border-gray-200';
                                                }
                                            };
                                            
                                            return (
                                                <tr 
                                                    key={booking.id || booking.createdAt}
                                                    className={`hover:bg-[var(--color-bg-tertiary)] transition-colors ${
                                                        isPast ? 'opacity-60' : ''
                                                    } ${isToday ? 'bg-green-50/30' : ''}`}
                                                >
                                                    {/* Event Type */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                                                                {booking.eventType}
                                                            </span>
                                                            <span className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                                                {booking.duration} min
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Date & Time */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                                                                <CalendarIcon size={16} className="text-blue-600" />
                                                                {format(bookingDate, 'MMM d, yyyy')}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mt-1">
                                                                <Clock size={16} className="text-green-600" />
                                                                {format(bookingDate, 'h:mm a')}
                                                            </div>
                                                            {isToday && (
                                                                <span className="text-xs font-bold text-green-600 mt-1 animate-pulse">
                                                                    Today
                                                                </span>
                                                            )}
                                                            {isTomorrow && (
                                                                <span className="text-xs font-bold text-blue-600 mt-1">
                                                                    Tomorrow
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Attendee */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                                {booking.attendee.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-[var(--color-text-primary)]">
                                                                    {booking.attendee.name}
                                                                </span>
                                                                {booking.attendee.notes && (
                                                                    <span className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                                                                        <MessageSquare size={12} />
                                                                        Has notes
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Contact */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <a 
                                                                href={`mailto:${booking.attendee.email}`}
                                                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                                                            >
                                                                <Mail size={14} />
                                                                {booking.attendee.email}
                                                            </a>
                                                            {booking.attendee.phone && (
                                                                <a 
                                                                    href={`tel:${booking.attendee.phone}`}
                                                                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 hover:underline"
                                                                >
                                                                    <Phone size={14} />
                                                                    {booking.attendee.phone}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-2">
                                                            {booking.status && (
                                                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusColor(booking.status)} w-fit`}>
                                                                    {booking.status}
                                                                </span>
                                                            )}
                                                            {isPast && (
                                                                <span className="inline-flex items-center px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full w-fit">
                                                                    Past
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {booking.attendee.notes && (
                                                                <button
                                                                    onClick={() => {
                                                                        alert(`Notes from ${booking.attendee.name}:\n\n${booking.attendee.notes}`);
                                                                    }}
                                                                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-all"
                                                                    title="View notes"
                                                                >
                                                                    <MessageSquare size={18} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Are you sure you want to cancel this booking?')) {
                                                                        const updatedBookings = bookings.filter(b => b.id !== booking.id);
                                                                        setBookings(updatedBookings);
                                                                    }
                                                                }}
                                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                                                title="Cancel booking"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 px-6">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users size={40} className="text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                                    No Bookings Yet
                                </h3>
                                <p className="text-[var(--color-text-secondary)] mb-6">
                                    When people schedule meetings with you, they'll appear here. Share your booking links to start receiving appointments.
                                </p>
                                <button
                                    onClick={() => setActiveTab('events')}
                                    className="btn bg-blue-600 text-white hover:bg-blue-700 gap-2 px-6 py-3 font-semibold"
                                >
                                    <CalendarIcon size={20} />
                                    View Event Types
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Availability Tab */}
            {activeTab === 'availability' && (
                <div className="space-y-4">
                    {/* Info Banner */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <Clock size={24} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-[var(--color-text-primary)] mb-1">
                                    Set Your Weekly Availability
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Define when you're available for meetings. You can set multiple time slots for each day to accommodate breaks.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => {
                            const isWeekend = day === 'saturday' || day === 'sunday';
                            const hasAvailability = availability[day]?.length > 0;
                            
                            return (
                                <div 
                                    key={day} 
                                    className={`card border-2 transition-all hover:shadow-lg ${
                                        hasAvailability 
                                            ? 'border-blue-200 bg-gradient-to-r from-white to-blue-50/30' 
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Day Info */}
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Day Number Badge */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                                                hasAvailability 
                                                    ? 'bg-blue-600 text-white shadow-lg' 
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                                            </div>

                                            {/* Day Name and Slots */}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-[var(--color-text-primary)] capitalize mb-2">
                                                    {day}
                                                    {isWeekend && (
                                                        <span className="ml-2 text-xs text-[var(--color-text-muted)] font-normal">
                                                            (Weekend)
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {hasAvailability ? (
                                                        availability[day].map((slot, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold shadow-md flex items-center gap-2"
                                                            >
                                                                <Clock size={14} />
                                                                {slot.start} - {slot.end}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium flex items-center gap-2">
                                                            <X size={14} />
                                                            Unavailable
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => {
                                                setEditingDay(day);
                                                setShowAvailabilityModal(true);
                                            }}
                                            className="p-3 text-[var(--color-text-primary)] hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all font-semibold flex items-center gap-2"
                                        >
                                            <Edit2 size={18} />
                                            <span className="hidden md:inline">Edit</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                        <h3 className="font-bold text-[var(--color-text-primary)] mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    const weekdaySlots = [{ start: '09:00', end: '17:00' }];
                                    setAvailability({
                                        monday: weekdaySlots,
                                        tuesday: weekdaySlots,
                                        wednesday: weekdaySlots,
                                        thursday: weekdaySlots,
                                        friday: weekdaySlots,
                                        saturday: [],
                                        sunday: []
                                    });
                                }}
                                className="p-4 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-all text-left"
                            >
                                <p className="font-semibold text-[var(--color-text-primary)] mb-1">
                                    Set Standard Work Hours
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    Mon-Fri, 9 AM - 5 PM
                                </p>
                            </button>
                            <button
                                onClick={() => {
                                    setAvailability({
                                        monday: [],
                                        tuesday: [],
                                        wednesday: [],
                                        thursday: [],
                                        friday: [],
                                        saturday: [],
                                        sunday: []
                                    });
                                }}
                                className="p-4 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-left"
                            >
                                <p className="font-semibold text-[var(--color-text-primary)] mb-1">
                                    Clear All Hours
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    Remove all availability
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="space-y-4">
                    {/* Scheduling Link Card */}
                    <div className="card border border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="p-2.5 bg-blue-600 rounded-lg shadow-lg">
                                <LinkIcon size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
                                    Your Scheduling Link
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Share this link to let people view all your event types and book time with you
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white border-2 border-blue-200 rounded-xl">
                            <LinkIcon size={18} className="text-blue-600 flex-shrink-0" />
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/book/${user?.id || user?.user_id || user?.uuid || user?.pk || 'user'}`}
                                className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-[var(--color-text-primary)] font-semibold"
                            />
                            <button
                                onClick={() => copyToClipboard(`${window.location.origin}/book/${user?.id || user?.user_id || user?.uuid || user?.pk || 'user'}`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center gap-2 shadow-md"
                            >
                                <Copy size={16} />
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Booking Preferences Card */}
                    <div className="card border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/30">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                                <Settings size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
                                    Booking Preferences
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Configure how people can schedule meetings with you
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Minimum Notice */}
                            <div className="p-4 bg-white border-2 border-purple-100 rounded-xl hover:border-purple-300 transition-all">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={18} className="text-purple-600" />
                                            <p className="font-bold text-[var(--color-text-primary)]">
                                                Minimum Scheduling Notice
                                            </p>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)] ml-6">
                                            Prevent bookings too close to the current time
                                        </p>
                                    </div>
                                    <select className="px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-2 border-purple-200 rounded-lg outline-none focus:border-purple-500 font-semibold text-[var(--color-text-primary)] cursor-pointer">
                                        <option>No minimum</option>
                                        <option>15 minutes</option>
                                        <option>30 minutes</option>
                                        <option>1 hour</option>
                                        <option>2 hours</option>
                                        <option>4 hours</option>
                                        <option>1 day</option>
                                    </select>
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="p-4 bg-white border-2 border-purple-100 rounded-xl hover:border-purple-300 transition-all">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CalendarIcon size={18} className="text-purple-600" />
                                            <p className="font-bold text-[var(--color-text-primary)]">
                                                Booking Window
                                            </p>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)] ml-6">
                                            How far in advance can people book?
                                        </p>
                                    </div>
                                    <select className="px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-2 border-purple-200 rounded-lg outline-none focus:border-purple-500 font-semibold text-[var(--color-text-primary)] cursor-pointer">
                                        <option>7 days</option>
                                        <option>14 days</option>
                                        <option>30 days</option>
                                        <option>60 days</option>
                                        <option>90 days</option>
                                    </select>
                                </div>
                            </div>

                            {/* Time Slot Interval */}
                            <div className="p-4 bg-white border-2 border-purple-100 rounded-xl hover:border-purple-300 transition-all">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={18} className="text-purple-600" />
                                            <p className="font-bold text-[var(--color-text-primary)]">
                                                Time Slot Interval
                                            </p>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)] ml-6">
                                            Time between available booking slots
                                        </p>
                                    </div>
                                    <select className="px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-2 border-purple-200 rounded-lg outline-none focus:border-purple-500 font-semibold text-[var(--color-text-primary)] cursor-pointer">
                                        <option>15 minutes</option>
                                        <option>30 minutes</option>
                                        <option>60 minutes</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help Card */}
                    <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">💡</div>
                            <div>
                                <h3 className="font-bold text-[var(--color-text-primary)] mb-2">
                                    Pro Tips
                                </h3>
                                <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold">•</span>
                                        <span>Set a minimum notice period to give yourself preparation time</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold">•</span>
                                        <span>Use buffer time in event types to avoid back-to-back meetings</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold">•</span>
                                        <span>Review your availability regularly to keep it up to date</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Type Modal */}
            {showEventModal && (
                <EventTypeModal
                    event={editingEvent}
                    onSave={handleCreateEvent}
                    onClose={() => {
                        setShowEventModal(false);
                        setEditingEvent(null);
                        setError(null);
                    }}
                    isSubmitting={isSubmitting}
                    error={error}
                />
            )}

            {/* Availability Modal */}
            {showAvailabilityModal && editingDay && (
                <AvailabilityModal
                    day={editingDay}
                    slots={availability[editingDay] || []}
                    onSave={handleSaveAvailability}
                    isSaving={isSavingAvailability}
                    onClose={() => {
                        setShowAvailabilityModal(false);
                        setEditingDay(null);
                    }}
                />
            )}
        </div>
    );
};

// Event Type Modal Component
const EventTypeModal = ({ event, onSave, onClose, isSubmitting, error }) => {
    const [formData, setFormData] = useState(
        event || {
            name: '',
            duration: 30,
            description: '',
            color: 'blue',
            active: true,
            location: 'Google Meet',
            bufferTime: 0,
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(addDays(new Date(), 365), 'yyyy-MM-dd')
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const locationIcons = {
        'Google Meet': Video,
        'Zoom': Video,
        'Phone Call': Phone,
        'In Person': MapPin,
        'Microsoft Teams': Video
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={event ? 'Edit Event Type' : 'New Event Type'} size="xl">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Event Name */}
                <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                        Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border-2 border-transparent rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                        placeholder="e.g., 30 Minute Consultation"
                    />
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                        Give your event a clear, descriptive name
                    </p>
                </div>

                {/* Duration and Location Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                            Duration <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-tertiary)] border-2 border-transparent rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-[var(--color-text-primary)] appearance-none cursor-pointer"
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>60 minutes</option>
                                <option value={90}>90 minutes</option>
                                <option value={120}>120 minutes</option>
                            </select>
                            <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[var(--color-text-muted)] pointer-events-none" />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                            Location
                        </label>
                        <div className="relative">
                            {React.createElement(locationIcons[formData.location] || Video, {
                                size: 18,
                                className: "absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                            })}
                            <select
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-tertiary)] border-2 border-transparent rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-[var(--color-text-primary)] appearance-none cursor-pointer"
                            >
                                <option value="Google Meet">Google Meet</option>
                                <option value="Zoom">Zoom</option>
                                <option value="Phone Call">Phone Call</option>
                                <option value="In Person">In Person</option>
                                <option value="Microsoft Teams">Microsoft Teams</option>
                            </select>
                            <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[var(--color-text-muted)] pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border-2 border-transparent rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] resize-none"
                        rows={4}
                        placeholder="Describe what this meeting is about and what attendees should prepare..."
                    />
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                        Help attendees understand what to expect from this meeting
                    </p>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                            Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border-2 border-transparent rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-[var(--color-text-primary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                            End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border-2 border-transparent rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-[var(--color-text-primary)]"
                        />
                    </div>
                </div>

                {/* Buffer Time */}
                <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                        Buffer Time
                    </label>
                    <div className="relative">
                        <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                        <select
                            value={formData.bufferTime}
                            onChange={(e) => setFormData({ ...formData, bufferTime: parseInt(e.target.value) })}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-blue-200 rounded-xl outline-none focus:border-blue-500 transition-all text-[var(--color-text-primary)] appearance-none cursor-pointer"
                        >
                            <option value={0}>No buffer time</option>
                            <option value={5}>5 minutes before/after</option>
                            <option value={10}>10 minutes before/after</option>
                            <option value={15}>15 minutes before/after</option>
                            <option value={30}>30 minutes before/after</option>
                        </select>
                        <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-blue-600 pointer-events-none" />
                    </div>
                    <p className="text-xs text-blue-700 mt-2 flex items-start gap-2">
                        <span className="mt-0.5">💡</span>
                        <span>Buffer time adds breathing room between meetings to avoid back-to-back scheduling</span>
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2 border-t border-[var(--color-border)]">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                {event ? 'Saving...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                {event ? '✓ Save Changes' : '+ Create Event'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// Availability Modal Component
const AvailabilityModal = ({ day, slots, onSave, onClose, isSaving }) => {
    const [timeSlots, setTimeSlots] = useState(slots.length > 0 ? slots : [{ start: '09:00', end: '17:00' }]);

    const handleAddSlot = () => {
        setTimeSlots([...timeSlots, { start: '09:00', end: '17:00' }]);
    };

    const handleRemoveSlot = (index) => {
        if (timeSlots.length === 1) {
            // If removing the last slot, set to empty array (unavailable)
            setTimeSlots([]);
        } else {
            setTimeSlots(timeSlots.filter((_, i) => i !== index));
        }
    };

    const handleSlotChange = (index, field, value) => {
        const newSlots = [...timeSlots];
        newSlots[index][field] = value;
        setTimeSlots(newSlots);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(day, timeSlots);
    };

    const dayName = day.charAt(0).toUpperCase() + day.slice(1);

    return (
        <Modal isOpen={true} onClose={onClose} title={`${dayName} Availability`} size="xl">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Header Info */}
                <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4">
                    <p className="text-sm text-blue-900 flex items-start gap-2">
                        <CalendarIcon size={16} className="mt-0.5 flex-shrink-0" />
                        <span>
                            Set your available hours for <strong>{dayName}</strong>. You can add multiple time slots if you have breaks during the day.
                        </span>
                    </p>
                </div>

                {/* Time Slots */}
                {timeSlots.length > 0 ? (
                    <div className="space-y-3">
                        {timeSlots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-3 p-4 bg-[var(--color-bg-tertiary)] rounded-xl border-2 border-transparent hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            value={slot.start}
                                            onChange={(e) => handleSlotChange(index, 'start', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white border-2 border-[var(--color-border)] rounded-lg outline-none focus:border-blue-500 transition-all text-[var(--color-text-primary)] font-medium"
                                        />
                                    </div>
                                    <div className="flex items-center justify-center pt-5">
                                        <ChevronRight size={20} className="text-[var(--color-text-muted)]" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            value={slot.end}
                                            onChange={(e) => handleSlotChange(index, 'end', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white border-2 border-[var(--color-border)] rounded-lg outline-none focus:border-blue-500 transition-all text-[var(--color-text-primary)] font-medium"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSlot(index)}
                                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all mt-5"
                                    title="Remove time slot"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 px-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                        <Clock size={32} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 mb-1">No availability set</p>
                        <p className="text-xs text-gray-500">Click "Add Time Slot" to set your hours</p>
                    </div>
                )}

                {/* Add Slot Button */}
                <button
                    type="button"
                    onClick={handleAddSlot}
                    className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 border-2 border-transparent hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    Add Time Slot
                </button>

                {/* Helper Text */}
                <p className="text-xs text-[var(--color-text-muted)] flex items-start gap-2 px-1">
                    <span className="mt-0.5">💡</span>
                    <span>
                        Tip: Add multiple slots if you have breaks (e.g., 9:00 AM - 12:00 PM and 2:00 PM - 5:00 PM)
                    </span>
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2 border-t border-[var(--color-border)]">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex-1 px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            '✓ Save Hours'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default Scheduling;
