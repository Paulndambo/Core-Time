import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    User,
    Mail,
    MessageSquare,
    Check,
    Video,
    Phone,
    MapPin,
    Users as UsersIcon,
    AlertCircle
} from 'lucide-react';
import {
    format,
    addDays,
    startOfWeek,
    addMinutes,
    parse,
    isSameDay,
    isAfter,
    isBefore,
    startOfDay,
    isValid,
    setHours,
    setMinutes
} from 'date-fns';
import { getEventTypeDetails, createEventBooking } from '../services/api';

const BookingPage = () => {
    const { username, eventId } = useParams();
    const navigate = useNavigate();
    
    const [eventTypes, setEventTypes] = useState([]);
    const [eventType, setEventType] = useState(null);
    const [ownerName, setOwnerName] = useState(null);
    const [ownerUserId, setOwnerUserId] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [step, setStep] = useState(1); // 1: select time, 2: enter details, 3: confirmation
    const [bookingDetails, setBookingDetails] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getDateOnlyPrefix = (value) => {
        if (!value) return null;
        if (value instanceof Date) return isValid(value) ? format(value, 'yyyy-MM-dd') : null;
        if (typeof value !== 'string') return null;
        const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
        return m ? m[1] : null;
    };

    const parseApiDate = (value) => {
        if (!value) return null;

        // Already a Date instance
        if (value instanceof Date) {
            return isValid(value) ? startOfDay(value) : null;
        }

        if (typeof value !== 'string') return null;

        // Treat anything that *starts* with YYYY-MM-DD as a date-only value (no timezone shifting),
        // even if the backend sends a full ISO timestamp like "2026-02-24T00:00:00Z".
        const datePrefixMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
        if (datePrefixMatch) {
            const d = parse(datePrefixMatch[1], 'yyyy-MM-dd', new Date());
            return isValid(d) ? startOfDay(d) : null;
        }

        // Fallback: ISO timestamps etc.
        const d = new Date(value);
        return isValid(d) ? startOfDay(d) : null;
    };

    // Transform API response (from /event-types/<id>/details) into component shape.
    // Field mapping based on actual API response:
    //   event_owner      → ownerName (set separately on state)
    //   event_name       → name
    //   buffer_time      → bufferTime
    //   start_date       → startDate
    //   end_date         → endDate
    //   available_slots  → availableSlots (array of { day_of_week, start_time, end_time })
    const transformEventTypeFromAPI = (apiEvent) => {
        return {
            id:             apiEvent.id,
            name:           apiEvent.event_name,
            ownerName:      apiEvent.event_owner     || '',
            duration:       apiEvent.duration,
            description:    apiEvent.description     || '',
            location:       apiEvent.location        || 'Google Meet',
            bufferTime:     apiEvent.buffer_time     || 0,
            startDate:      apiEvent.start_date,
            endDate:        apiEvent.end_date,
            availableSlots: apiEvent.available_slots || [],
        };
    };

    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                if (eventId) {
                    // Always fetch directly from the API using the eventId from the URL.
                    // This is a public endpoint — no auth token required.
                    const eventData = await getEventTypeDetails(eventId);
                    const transformed = transformEventTypeFromAPI(eventData);
                    setEventType(transformed);

                    // Set owner name from the correct API field: event_owner
                    setOwnerName(eventData.event_owner || '');

                    // Initialise the calendar to the first selectable date within the
                    // event's booking window (start_date → end_date).
                    const today = new Date();

                    // For range math, prefer date-only parsing (YYYY-MM-DD) to avoid timezone edge cases.
                    const startDateStr = getDateOnlyPrefix(eventData.start_date);
                    const endDateStr = getDateOnlyPrefix(eventData.end_date);
                    const startDate = startDateStr ? startOfDay(parse(startDateStr, 'yyyy-MM-dd', new Date())) : startOfDay(today);
                    const endDate = endDateStr ? startOfDay(parse(endDateStr, 'yyyy-MM-dd', new Date())) : startOfDay(addDays(today, 365));

                    let initialDate = today;
                    if (isAfter(startDate, today)) {
                        // Booking window starts in the future — jump straight to it
                        initialDate = startDate;
                    } else if (isBefore(today, endDate) || isSameDay(today, endDate)) {
                        initialDate = today;
                    } else {
                        initialDate = startDate;
                    }

                    setSelectedDate(initialDate);
                    setCurrentWeekStart(startOfWeek(initialDate, { weekStartsOn: 1 }));

                    // Store owner UUID — slots are fetched on demand when a date is selected.
                    setOwnerUserId(eventData.user);
                }
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError(err.message || 'Failed to load event details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleDateSelect = (date) => {
        // Hard guard — never allow selecting a date outside the booking window,
        // even if a disabled button's click event somehow fired (e.g. touch / keyboard).
        if (!isDateInBookingRange(date)) return;
        setSelectedDate(date);
        setSelectedTime(null);
    };

    // Generate bookable time slots from the already-fetched available_slots whenever
    // the selected date or eventType changes.  No extra API call is needed — the
    // available_slots array is embedded in the event-type details response.
    useEffect(() => {
        if (!selectedDate || !eventType) return;
        if (!isDateInBookingRange(selectedDate)) {
            setTimeSlots([]);
            return;
        }

        const dayName = format(selectedDate, 'EEEE'); // "Monday", "Tuesday", …

        // Filter the embedded slots to those matching the selected day of the week.
        const slotsForDay = (eventType.availableSlots || []).filter(
            (s) => s.day_of_week === dayName
        );

        if (slotsForDay.length === 0) {
            setTimeSlots([]);
            return;
        }

        setTimeSlotsLoading(true);
        setTimeSlots([]);

        const now = new Date();
        const isToday = isSameDay(selectedDate, now);
        const generated = [];

        slotsForDay.forEach((slot) => {
            const [sh, sm] = (slot.start_time || '').slice(0, 5).split(':').map(Number);
            const [eh, em] = (slot.end_time   || '').slice(0, 5).split(':').map(Number);

            let cur = setMinutes(setHours(selectedDate, sh), sm);
            const end = setMinutes(setHours(selectedDate, eh), em);

            while (isBefore(cur, end)) {
                if (!isToday || isAfter(cur, now)) {
                    const slotEnd = addMinutes(cur, eventType.duration);
                    if (isBefore(slotEnd, end) || slotEnd.getTime() === end.getTime()) {
                        generated.push(new Date(cur));
                    }
                }
                cur = addMinutes(cur, eventType.duration);
            }
        });

        setTimeSlots(generated);
        setTimeSlotsLoading(false);
    }, [selectedDate, eventType]);

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const handleNextWeek = () => {
        const nextWeekStart = addDays(currentWeekStart, 7);
        if (eventType && eventType.endDate) {
            const endDateStr = getDateOnlyPrefix(eventType.endDate);
            if (!endDateStr) {
                setCurrentWeekStart(nextWeekStart);
                return;
            }
            // Allow as long as the FIRST day of next week is still on/before endDate.
            // This ensures weeks that merely start before endDate are always reachable,
            // even when some days later in that week fall after endDate.
            const nextWeekKey = format(startOfDay(nextWeekStart), 'yyyy-MM-dd');
            if (nextWeekKey <= endDateStr) {
                setCurrentWeekStart(nextWeekStart);
            }
        } else {
            setCurrentWeekStart(nextWeekStart);
        }
    };

    const handlePrevWeek = () => {
        const prevWeekStart = addDays(currentWeekStart, -7);
        const prevWeekEnd   = addDays(currentWeekStart, -1); // last day of the previous week
        const today = startOfDay(new Date());

        // Block if the entire previous week has already passed today.
        if (isBefore(prevWeekEnd, today)) return;

        // Block if the entire previous week ends before startDate.
        // Using prevWeekEnd (not prevWeekStart) means weeks that merely begin before
        // startDate but still contain valid days remain reachable.
        if (eventType && eventType.startDate) {
            const startDateStr = getDateOnlyPrefix(eventType.startDate);
            if (startDateStr) {
                const prevWeekEndKey = format(startOfDay(prevWeekEnd), 'yyyy-MM-dd');
                if (prevWeekEndKey < startDateStr) return;
            }
        }

        setCurrentWeekStart(prevWeekStart);
    };
    
    const isDateInBookingRange = (date) => {
        if (!eventType) return false;
        
        const dateToCheck = startOfDay(date);
        const dateKey = format(dateToCheck, 'yyyy-MM-dd');
        const todayKey = format(startOfDay(new Date()), 'yyyy-MM-dd');
        
        // Must not be in the past.
        if (dateKey < todayKey) return false;
        
        // Must fall within the event's start_date → end_date window.
        if (eventType.startDate) {
            const startDateStr = getDateOnlyPrefix(eventType.startDate);
            if (startDateStr && dateKey < startDateStr) return false;
        }
        
        if (eventType.endDate) {
            const endDateStr = getDateOnlyPrefix(eventType.endDate);
            if (endDateStr && dateKey > endDateStr) return false;
        }

        // Must have at least one available slot defined for this day of the week.
        const dayName = format(date, 'EEEE'); // e.g. "Monday"
        const hasSlot = (eventType.availableSlots || []).some(
            (s) => s.day_of_week === dayName
        );
        if (!hasSlot) return false;
        
        return true;
    };

    const handleContinue = () => {
        if (step === 1 && selectedTime) {
            setStep(2);
        } else if (step === 2 && bookingDetails.name && bookingDetails.email) {
            handleConfirmBooking();
        }
    };

    const handleConfirmBooking = async () => {
        if (!eventType || !selectedDate || !selectedTime) {
            setError('Please select a date and time');
            return;
        }

        if (!isDateInBookingRange(selectedDate)) {
            setError('Selected date is outside the allowed booking range for this event.');
            setStep(1);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const timeStr = format(selectedTime, 'HH:mm');
            const bookedTime = `${dateStr} ${timeStr}`;

            const bookingData = {
                event: eventType.id,
                event_name: eventType.name,
                email: bookingDetails.email,
                name: bookingDetails.name,
                booked_time: bookedTime
            };

            const trimmedNotes = (bookingDetails.notes || '').trim();
            if (trimmedNotes) {
                bookingData.notes = trimmedNotes;
            }

            const trimmedPhone = (bookingDetails.phone || '').trim();
            if (trimmedPhone) {
                bookingData.phone_number = trimmedPhone;
            }

            await createEventBooking(bookingData);
            setStep(3);
        } catch (err) {
            console.error('Error creating booking:', err);
            setError(err.message || 'Failed to create booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getWeekDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(addDays(currentWeekStart, i));
        }
        return days;
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 text-sm">Loading event details...</p>
                </div>
            </div>
        );
    }

    // ── Fatal error ───────────────────────────────────────────────────────────
    if (error && !eventType) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-full max-w-sm">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={28} className="text-red-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-3">Error Loading Event</h1>
                    <p className="text-gray-600 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // ── Event type selection (no eventId) ─────────────────────────────────────
    if (!eventId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 sm:py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={32} className="text-white sm:hidden" />
                            <User size={40} className="text-white hidden sm:block" />
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">{username}</h1>
                        <p className="text-base sm:text-xl text-gray-600">Select a meeting type to get started</p>
                    </div>

                    {eventTypes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {eventTypes.map(event => (
                                <button
                                    key={event.id}
                                    onClick={() => navigate(`/book/${username}/${event.id}`)}
                                    className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 text-left hover:shadow-xl transition-all active:scale-95 sm:hover:scale-105"
                                >
                                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3">{event.name}</h3>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-600 mb-4 text-sm sm:text-base">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={16} />
                                            {event.duration} min
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            {event.location === 'Google Meet' && <Video size={16} />}
                                            {event.location === 'Phone Call' && <Phone size={16} />}
                                            {event.location === 'In Person' && <MapPin size={16} />}
                                            {event.location}
                                        </span>
                                    </div>
                                    {event.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                                    )}
                                    <div className="text-blue-600 font-semibold flex items-center gap-2 text-sm sm:text-base">
                                        Book Now
                                        <ChevronRight size={18} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
                            <CalendarIcon size={48} className="mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Events Available</h2>
                            <p className="text-gray-600 text-sm sm:text-base">
                                This user hasn't set up any booking events yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Event not found ───────────────────────────────────────────────────────
    if (!eventType && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-full max-w-sm">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon size={28} className="text-gray-400" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-3">Event Not Found</h1>
                    <p className="text-gray-600 text-sm mb-6">
                        This booking link is not available or has been disabled.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const weekDays = getWeekDays();

    const LocationIcon = eventType.location === 'Phone Call' ? Phone
        : eventType.location === 'In Person' ? MapPin
        : Video;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 sm:py-12 px-3 sm:px-4">
            <div className="max-w-2xl mx-auto">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="text-center mb-5 sm:mb-8 px-2">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <User size={24} className="text-white sm:hidden" />
                        <User size={32} className="text-white hidden sm:block" />
                    </div>
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 leading-snug">
                        {ownerName ? `Book a call with ${ownerName}` : 'Book a Meeting'}
                    </h1>
                    <h2 className="text-base sm:text-xl text-gray-700 mb-2">{eventType.name}</h2>
                    <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-4 text-gray-600 text-sm sm:text-base">
                        <span className="flex items-center gap-1">
                            <Clock size={15} />
                            {eventType.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                            <LocationIcon size={15} />
                            {eventType.location}
                        </span>
                    </div>
                    {eventType.description && (
                        <p className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base max-w-lg mx-auto">
                            {eventType.description}
                        </p>
                    )}
                </div>

                {/* ── Step progress indicator ─────────────────────────────── */}
                <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                                step === s
                                    ? 'bg-blue-600 text-white shadow-md scale-110'
                                    : step > s
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                            }`}>
                                {step > s ? <Check size={13} /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`h-0.5 w-10 sm:w-16 rounded transition-all ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* ── Step 1: Select Date & Time ───────────────────────────── */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Select a Date & Time</h3>
                        
                        {/* Booking window info */}
                        {(eventType.startDate || eventType.endDate) && (
                            <div className="flex items-center gap-2 mb-4 py-2 px-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs sm:text-sm">
                                <CalendarIcon size={14} className="flex-shrink-0" />
                                <span>
                                    Bookings accepted
                                    {eventType.startDate && (() => {
                                        const d = parseApiDate(eventType.startDate);
                                        return d ? <> from <strong>{format(d, 'MMM d, yyyy')}</strong></> : null;
                                    })()}
                                    {eventType.endDate && (() => {
                                        const d = parseApiDate(eventType.endDate);
                                        return d ? <> to <strong>{format(d, 'MMM d, yyyy')}</strong></> : null;
                                    })()}
                                </span>
                            </div>
                        )}

                        {/* Week Navigation */}
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <button
                                onClick={handlePrevWeek}
                                className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={(() => {
                                    // Disabled if the LAST day of the previous week is before today or before startDate.
                                    // Using the last day (not first) means partial weeks that still contain
                                    // valid days remain reachable.
                                    const prevWeekEnd = addDays(currentWeekStart, -1);
                                    const prevWeekEndKey = format(startOfDay(prevWeekEnd), 'yyyy-MM-dd');
                                    const todayKey = format(startOfDay(new Date()), 'yyyy-MM-dd');
                                    if (prevWeekEndKey < todayKey) return true;
                                    if (eventType && eventType.startDate) {
                                        const startDateStr = getDateOnlyPrefix(eventType.startDate);
                                        if (startDateStr && prevWeekEndKey < startDateStr) return true;
                                    }
                                    return false;
                                })()}
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                                {format(currentWeekStart, 'MMM yyyy')}
                            </span>
                            <button
                                onClick={handleNextWeek}
                                className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={(() => {
                                    // Disabled if the FIRST day of the next week is already past endDate.
                                    // Using the first day (not last) means partial weeks that still contain
                                    // valid days remain reachable.
                                    if (eventType && eventType.endDate) {
                                        const nextWeekStart = addDays(currentWeekStart, 7);
                                        const nextWeekKey = format(startOfDay(nextWeekStart), 'yyyy-MM-dd');
                                        const endDateStr = getDateOnlyPrefix(eventType.endDate);
                                        return endDateStr ? nextWeekKey > endDateStr : false;
                                    }
                                    return false;
                                })()}
                            >
                                <ChevronRight size={22} />
                            </button>
                        </div>

                        {/* Day Selection — 7 equal columns, compact on mobile */}
                        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6 sm:mb-8">
                            {weekDays.map((day, index) => {
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                const isEnabled  = isDateInBookingRange(day);

                                return (
                                    <button
                                        key={index}
                                        onClick={() => isEnabled ? handleDateSelect(day) : null}
                                        disabled={!isEnabled}
                                        title={!isEnabled ? 'Outside booking window' : undefined}
                                        className={`py-2 px-0.5 sm:p-3 rounded-xl text-center transition-all relative ${
                                            !isEnabled
                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-40'
                                                : isSelected
                                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                : 'bg-gray-50 hover:bg-blue-50 active:bg-blue-100 text-gray-900 border border-transparent hover:border-blue-200'
                                        }`}
                                    >
                                        <div className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">
                                            {format(day, 'EEE')}
                                        </div>
                                        <div className="text-sm sm:text-lg font-bold leading-none">
                                            {format(day, 'd')}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Time Slots */}
                        <div>
                            {selectedDate ? (
                                <>
                                    <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                                        <span className="hidden sm:inline">
                                            Available Times for {format(selectedDate, 'EEEE, MMMM d')}
                                        </span>
                                        <span className="sm:hidden">
                                            {format(selectedDate, 'EEE, MMM d')}
                                        </span>
                                    </h4>
                                    {timeSlotsLoading ? (
                                        <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                            <span className="text-sm">Loading available times…</span>
                                        </div>
                                    ) : timeSlots.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 max-h-72 sm:max-h-96 overflow-y-auto pr-1">
                                            {timeSlots.map((slot, index) => {
                                                const isSlotSelected = selectedTime && isSameDay(slot, selectedTime) &&
                                                    slot.getTime() === selectedTime.getTime();
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleTimeSelect(slot)}
                                                        className={`py-3 px-2 rounded-lg font-medium transition-all text-sm ${
                                                            isSlotSelected
                                                                ? 'bg-blue-600 text-white shadow-md'
                                                                : 'bg-gray-50 hover:bg-blue-50 active:bg-blue-100 text-gray-900 border border-gray-100'
                                                        }`}
                                                    >
                                                        {format(slot, 'h:mm a')}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            <CalendarIcon size={40} className="mx-auto mb-3 opacity-40" />
                                            <p className="text-sm">No available times for this date</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    <CalendarIcon size={40} className="mx-auto mb-3 opacity-40" />
                                    <p className="text-sm">Select a date to view available times</p>
                                </div>
                            )}
                        </div>

                        {selectedTime && (
                            <div className="mt-6 sm:mt-8 space-y-2">
                                {/* Selected summary pill */}
                                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm font-medium">
                                    <Check size={15} />
                                    {format(selectedDate, 'EEE, MMM d')} · {format(selectedTime, 'h:mm a')}
                                </div>
                                <button
                                    onClick={handleContinue}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base"
                                >
                                    Continue →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Step 2: Enter Details ───────────────────────────────── */}
                {step === 2 && (
                    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 mb-5 sm:mb-6 text-sm font-medium"
                        >
                            <ChevronLeft size={18} />
                            Back
                        </button>

                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Enter Your Details</h3>

                        {/* Selected time summary */}
                        <div className="flex items-center gap-2 mb-5 sm:mb-6 py-2.5 px-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs sm:text-sm font-medium">
                            <CalendarIcon size={14} />
                            {format(selectedDate, 'EEE, MMM d, yyyy')} · {format(selectedTime, 'h:mm a')}
                            <span className="ml-auto text-blue-500">· {eventType.duration} min</span>
                        </div>

                        <form className="space-y-4 sm:space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={bookingDetails.name}
                                        onChange={(e) => {
                                            setBookingDetails({ ...bookingDetails, name: e.target.value });
                                            if (error) setError(null);
                                        }}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                                        placeholder="John Doe"
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={bookingDetails.email}
                                        onChange={(e) => {
                                            setBookingDetails({ ...bookingDetails, email: e.target.value });
                                            if (error) setError(null);
                                        }}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                                        placeholder="john@example.com"
                                        autoComplete="email"
                                        inputMode="email"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                                    Phone Number <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={bookingDetails.phone}
                                        onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                                        placeholder="+1 (555) 123-4567"
                                        autoComplete="tel"
                                        inputMode="tel"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                                    Additional Notes <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <MessageSquare size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <textarea
                                        value={bookingDetails.notes}
                                        onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm sm:text-base resize-none"
                                        rows={3}
                                        placeholder="Anything that will help prepare for the meeting..."
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded-xl flex items-start gap-2 text-sm">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={!bookingDetails.name || !bookingDetails.email || isSubmitting}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base mt-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Scheduling...
                                    </>
                                ) : (
                                    'Schedule Event'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Step 3: Confirmation ────────────────────────────────── */}
                {step === 3 && (
                    <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Check size={32} className="text-green-600 sm:hidden" />
                            <Check size={40} className="text-green-600 hidden sm:block" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">You're Scheduled!</h3>
                        <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
                            A calendar invitation has been sent to your email address.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-left space-y-3">
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Meeting Details</h4>

                            <div className="flex items-start gap-3">
                                <CalendarIcon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{eventType.name}</p>
                                    <p className="text-gray-600 text-xs sm:text-sm">
                                        {format(selectedDate, 'EEE, MMM d, yyyy')} · {format(selectedTime, 'h:mm a')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-gray-400 flex-shrink-0" />
                                <p className="text-gray-600 text-sm">{eventType.duration} minutes</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <LocationIcon size={16} className="text-gray-400 flex-shrink-0" />
                                <p className="text-gray-600 text-sm">{eventType.location}</p>
                            </div>

                            <div className="flex items-start gap-3">
                                <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-900 text-sm font-medium">{bookingDetails.name}</p>
                                    <p className="text-gray-600 text-xs sm:text-sm break-all">{bookingDetails.email}</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6">
                            A confirmation email with the meeting link will be sent shortly.
                        </p>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
