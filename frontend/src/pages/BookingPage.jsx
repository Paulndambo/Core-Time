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
    setHours,
    setMinutes,
    getDay
} from 'date-fns';
import { getEventTypeDetails, createEventBooking } from '../services/api';

const BookingPage = () => {
    const { username, eventId } = useParams();
    const navigate = useNavigate();
    
    const [eventTypes, setEventTypes] = useState([]);
    const [eventType, setEventType] = useState(null);
    const [ownerName, setOwnerName] = useState(null);
    const [availability, setAvailability] = useState({});
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

    // Transform API event type to component format
    const transformEventTypeFromAPI = (apiEvent) => {
        return {
            id: apiEvent.id,
            name: apiEvent.event_name,
            duration: apiEvent.duration,
            description: apiEvent.description || '',
            color: 'blue',
            active: true,
            location: apiEvent.location || 'Google Meet',
            bufferTime: apiEvent.buffer_time || 0,
            startDate: apiEvent.start_date,
            endDate: apiEvent.end_date
        };
    };

    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                if (eventId) {
                    // Fetch event details from API
                    const eventData = await getEventTypeDetails(eventId);
                    const transformed = transformEventTypeFromAPI(eventData);
                    setEventType(transformed);
                    
                    // Store owner name
                    if (eventData.owner_name) {
                        setOwnerName(eventData.owner_name);
                    }
                    
                    // Set initial date based on start_date
                    const today = new Date();
                    const startDate = eventData.start_date ? parse(eventData.start_date, 'yyyy-MM-dd', new Date()) : today;
                    const endDate = eventData.end_date ? parse(eventData.end_date, 'yyyy-MM-dd', new Date()) : addDays(today, 365);
                    
                    // Set initial selected date to start_date if it's in the future, otherwise today (if within range)
                    let initialDate = today;
                    if (isAfter(startDate, today)) {
                        initialDate = startDate;
                    } else if (isBefore(today, endDate) || isSameDay(today, endDate)) {
                        initialDate = today;
                    } else {
                        initialDate = startDate;
                    }
                    
                    setSelectedDate(initialDate);
                    
                    // Set initial week start to the week containing the initial date
                    setCurrentWeekStart(startOfWeek(initialDate, { weekStartsOn: 1 }));
                } else {
                    // If no eventId, we could fetch all events for the user
                    // For now, keep the localStorage fallback
                    const savedEvents = localStorage.getItem('schedulingEvents');
                    if (savedEvents) {
                        const events = JSON.parse(savedEvents);
                        const activeEvents = events.filter(e => e.active);
                        setEventTypes(activeEvents);
                    }
                }

                // Load availability from localStorage (not yet in API)
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
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError(err.message || 'Failed to load event details. Please try again.');
                // Fallback to localStorage if API fails
                const savedEvents = localStorage.getItem('schedulingEvents');
                if (savedEvents) {
                    const events = JSON.parse(savedEvents);
                    const activeEvents = events.filter(e => e.active);
                    setEventTypes(activeEvents);
                    
                    if (eventId) {
                        const event = events.find(e => e.id === eventId);
                        if (event && event.active) {
                            setEventType(event);
                        }
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const getAvailableTimeSlots = (date) => {
        if (!eventType || !availability) return [];

        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][getDay(date)];
        const dayAvailability = availability[dayName] || [];

        if (dayAvailability.length === 0) return [];

        const slots = [];
        const now = new Date();
        const isToday = isSameDay(date, now);

        dayAvailability.forEach(slot => {
            const [startHour, startMinute] = slot.start.split(':').map(Number);
            const [endHour, endMinute] = slot.end.split(':').map(Number);

            let currentTime = setMinutes(setHours(date, startHour), startMinute);
            const endTime = setMinutes(setHours(date, endHour), endMinute);

            while (isBefore(currentTime, endTime)) {
                // Check if slot is in the future (if today)
                if (!isToday || isAfter(currentTime, now)) {
                    // Check if there's enough time for the meeting duration
                    const slotEnd = addMinutes(currentTime, eventType.duration);
                    if (isBefore(slotEnd, endTime) || slotEnd.getTime() === endTime.getTime()) {
                        slots.push(new Date(currentTime));
                    }
                }
                currentTime = addMinutes(currentTime, 30); // 30-minute intervals
            }
        });

        return slots;
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const handleNextWeek = () => {
        const nextWeek = addDays(currentWeekStart, 7);
        if (eventType && eventType.endDate) {
            const endDate = parse(eventType.endDate, 'yyyy-MM-dd', new Date());
            const weekEnd = addDays(nextWeek, 6);
            // Only allow if the week doesn't go past the end date
            if (isBefore(weekEnd, endDate) || isSameDay(weekEnd, endDate)) {
                setCurrentWeekStart(nextWeek);
            }
        } else {
            setCurrentWeekStart(nextWeek);
        }
    };

    const handlePrevWeek = () => {
        const prevWeek = addDays(currentWeekStart, -7);
        const today = startOfDay(new Date());
        const weekStart = startOfWeek(prevWeek, { weekStartsOn: 1 });
        
        // Check if we're within the booking range
        let canGoBack = isAfter(prevWeek, today) || isSameDay(prevWeek, today);
        
        if (eventType && eventType.startDate) {
            const startDate = parse(eventType.startDate, 'yyyy-MM-dd', new Date());
            // Only allow if the week doesn't go before the start date
            if (isBefore(weekStart, startDate)) {
                canGoBack = false;
            }
        }
        
        if (canGoBack) {
            setCurrentWeekStart(prevWeek);
        }
    };
    
    // Check if a date is within the booking range
    const isDateInBookingRange = (date) => {
        if (!eventType) return false;
        
        const dateToCheck = startOfDay(date);
        const today = startOfDay(new Date());
        
        // Must be today or in the future
        if (isBefore(dateToCheck, today)) return false;
        
        // Check start date
        if (eventType.startDate) {
            const startDate = parse(eventType.startDate, 'yyyy-MM-dd', new Date());
            if (isBefore(dateToCheck, startDate)) return false;
        }
        
        // Check end date
        if (eventType.endDate) {
            const endDate = parse(eventType.endDate, 'yyyy-MM-dd', new Date());
            if (isAfter(dateToCheck, endDate)) return false;
        }
        
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

        setIsSubmitting(true);
        setError(null);

        try {
            // Format booked_time as "YYYY-MM-DD HH:mm"
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const timeStr = format(selectedTime, 'HH:mm');
            const bookedTime = `${dateStr} ${timeStr}`;

            // Prepare booking data according to API format
            const bookingData = {
                event: eventType.id,
                event_name: eventType.name,
                notes: bookingDetails.notes || '',
                email: bookingDetails.email,
                name: bookingDetails.name,
                phone_number: bookingDetails.phone || '',
                booked_time: bookedTime
            };

            // Submit booking to backend
            await createEventBooking(bookingData);

            // On success, move to confirmation step
            setStep(3);
        } catch (err) {
            console.error('Error creating booking:', err);
            setError(err.message || 'Failed to create booking. Please try again.');
            // Stay on step 2 so user can fix and retry
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Loading event details...</p>
                </div>
            </div>
        );
    }

    if (error && !eventType) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Event</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // If no eventId, show event type selection page
    if (!eventId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={40} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{username}</h1>
                        <p className="text-xl text-gray-600">Select a meeting type to get started</p>
                    </div>

                    {/* Event Types Grid */}
                    {eventTypes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {eventTypes.map(event => (
                                <button
                                    key={event.id}
                                    onClick={() => navigate(`/book/${username}/${event.id}`)}
                                    className="bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl transition-all hover:scale-105"
                                >
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{event.name}</h3>
                                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                                        <span className="flex items-center gap-2">
                                            <Clock size={18} />
                                            {event.duration} min
                                        </span>
                                        <span className="flex items-center gap-2">
                                            {event.location === 'Google Meet' && <Video size={18} />}
                                            {event.location === 'Phone Call' && <Phone size={18} />}
                                            {event.location === 'In Person' && <MapPin size={18} />}
                                            {event.location}
                                        </span>
                                    </div>
                                    {event.description && (
                                        <p className="text-gray-600 mb-4">{event.description}</p>
                                    )}
                                    <div className="text-blue-600 font-semibold flex items-center gap-2">
                                        Book Now
                                        <ChevronRight size={20} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                            <CalendarIcon size={64} className="mx-auto mb-4 text-gray-400" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Events Available</h2>
                            <p className="text-gray-600">
                                This user hasn't set up any booking events yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!eventType && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon size={32} className="text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        This booking link is not available or has been disabled.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const weekDays = getWeekDays();
    const availableSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {ownerName ? `Book a call with ${ownerName}` : 'Book a Meeting'}
                    </h1>
                    <h2 className="text-xl text-gray-700 mb-2">{eventType.name}</h2>
                    <div className="flex items-center justify-center gap-4 text-gray-600">
                        <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {eventType.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                            {eventType.location === 'Google Meet' && <Video size={16} />}
                            {eventType.location === 'Phone Call' && <Phone size={16} />}
                            {eventType.location === 'In Person' && <MapPin size={16} />}
                            {eventType.location}
                        </span>
                    </div>
                    {eventType.description && (
                        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">{eventType.description}</p>
                    )}
                </div>

                {/* Booking Steps */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Select a Date & Time</h3>
                        
                        {/* Week Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={handlePrevWeek}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={(() => {
                                    const prevWeek = addDays(currentWeekStart, -7);
                                    const today = startOfDay(new Date());
                                    if (isBefore(prevWeek, today)) return true;
                                    if (eventType && eventType.startDate) {
                                        const startDate = parse(eventType.startDate, 'yyyy-MM-dd', new Date());
                                        const weekStart = startOfWeek(prevWeek, { weekStartsOn: 1 });
                                        return isBefore(weekStart, startDate);
                                    }
                                    return false;
                                })()}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <span className="font-semibold text-gray-900">
                                {format(currentWeekStart, 'MMMM yyyy')}
                            </span>
                            <button
                                onClick={handleNextWeek}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={(() => {
                                    if (eventType && eventType.endDate) {
                                        const nextWeek = addDays(currentWeekStart, 7);
                                        const endDate = parse(eventType.endDate, 'yyyy-MM-dd', new Date());
                                        const weekEnd = addDays(nextWeek, 6);
                                        return isAfter(weekEnd, endDate);
                                    }
                                    return false;
                                })()}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Day Selection */}
                        <div className="grid grid-cols-7 gap-2 mb-8">
                            {weekDays.map((day, index) => {
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                const isInRange = isDateInBookingRange(day);
                                const hasAvailability = getAvailableTimeSlots(day).length > 0;
                                const isEnabled = isInRange && hasAvailability;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleDateSelect(day)}
                                        disabled={!isEnabled}
                                        className={`p-4 rounded-xl text-center transition-all ${
                                            isSelected
                                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                : isEnabled
                                                ? 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                                                : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                                        }`}
                                    >
                                        <div className="text-xs font-medium mb-1">
                                            {format(day, 'EEE')}
                                        </div>
                                        <div className="text-lg font-bold">
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
                                    <h4 className="font-semibold text-gray-900 mb-4">
                                        Available Times for {format(selectedDate, 'EEEE, MMMM d')}
                                    </h4>
                                    {availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                                            {availableSlots.map((slot, index) => {
                                                const isSelected = selectedTime && isSameDay(slot, selectedTime) && 
                                                                 slot.getTime() === selectedTime.getTime();
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleTimeSelect(slot)}
                                                        className={`p-3 rounded-lg font-medium transition-all ${
                                                            isSelected
                                                                ? 'bg-blue-600 text-white shadow-md'
                                                                : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                                                        }`}
                                                    >
                                                        {format(slot, 'h:mm a')}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>No available times for this date</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Please select a date to view available times</p>
                                </div>
                            )}
                        </div>

                        {selectedTime && (
                            <button
                                onClick={handleContinue}
                                className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Continue
                            </button>
                        )}
                    </div>
                )}

                {/* Step 2: Enter Details */}
                {step === 2 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                        >
                            <ChevronLeft size={20} />
                            Back
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Details</h3>
                        <p className="text-gray-600 mb-6">
                            {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {format(selectedTime, 'h:mm a')}
                        </p>

                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Your Name *
                                </label>
                                <div className="relative">
                                    <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={bookingDetails.name}
                                        onChange={(e) => {
                                            setBookingDetails({ ...bookingDetails, name: e.target.value });
                                            if (error) setError(null);
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={bookingDetails.email}
                                        onChange={(e) => {
                                            setBookingDetails({ ...bookingDetails, email: e.target.value });
                                            if (error) setError(null);
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Phone Number (Optional)
                                </label>
                                <div className="relative">
                                    <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={bookingDetails.phone}
                                        onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <div className="relative">
                                    <MessageSquare size={20} className="absolute left-3 top-3 text-gray-400" />
                                    <textarea
                                        value={bookingDetails.notes}
                                        onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                        placeholder="Please share anything that will help prepare for our meeting."
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={!bookingDetails.name || !bookingDetails.email || isSubmitting}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                            <Check size={40} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">You're Scheduled!</h3>
                        <p className="text-gray-600 mb-8">
                            A calendar invitation has been sent to your email address.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                            <h4 className="font-semibold text-gray-900 mb-4">Meeting Details</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <CalendarIcon size={18} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">{eventType.name}</p>
                                        <p className="text-gray-600">
                                            {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {format(selectedTime, 'h:mm a')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock size={18} className="text-gray-400 mt-0.5" />
                                    <p className="text-gray-600">{eventType.duration} minutes</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    {eventType.location === 'Google Meet' && <Video size={18} className="text-gray-400 mt-0.5" />}
                                    {eventType.location === 'Phone Call' && <Phone size={18} className="text-gray-400 mt-0.5" />}
                                    {eventType.location === 'In Person' && <MapPin size={18} className="text-gray-400 mt-0.5" />}
                                    <p className="text-gray-600">{eventType.location}</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <User size={18} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-900">{bookingDetails.name}</p>
                                        <p className="text-gray-600">{bookingDetails.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-6">
                            A confirmation email with the meeting link will be sent shortly.
                        </p>

                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
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
