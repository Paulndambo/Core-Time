import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Clock,
    Video,
    Phone,
    MapPin,
    Users,
    Copy,
    ExternalLink,
    AlertCircle,
    Mail,
    PhoneCall,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Hourglass,
    Hash,
    Settings,
    Share2,
    Download,
    Filter,
    Search,
} from 'lucide-react';
import { format, parseISO, isValid, isFuture, isPast as isDatePast } from 'date-fns';
import { getEventTypeDetails } from '../services/api';

/* ── helpers ────────────────────────────────────────────────────────────── */

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_SHORT = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
    Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

const fmt12 = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    
    if (isNaN(h) || isNaN(m)) return timeStr;
    
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

const parseBookingTime = (rawTime) => {
    if (!rawTime) return new Date();
    try {
        const parsed = parseISO(rawTime);
        return isValid(parsed) ? parsed : new Date(rawTime);
    } catch {
        return new Date(rawTime);
    }
};

const getStatusConfig = (status) => {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
        case 'confirmed':
            return { 
                label: 'Confirmed', 
                cls: 'bg-green-100 text-green-700 border-green-200', 
                Icon: CheckCircle2 
            };
        case 'cancelled':
            return { 
                label: 'Cancelled', 
                cls: 'bg-red-100 text-red-700 border-red-200', 
                Icon: XCircle 
            };
        case 'pending':
        default:
            return { 
                label: 'Pending', 
                cls: 'bg-amber-100 text-amber-700 border-amber-200', 
                Icon: Hourglass 
            };
    }
};

const getLocationIcon = (location) => {
    if (!location) return Video;
    const loc = location.toLowerCase();
    if (loc.includes('phone') || loc.includes('call')) return Phone;
    if (loc.includes('person') || loc.includes('office')) return MapPin;
    return Video;
};

/* ── component ──────────────────────────────────────────────────────────── */

const EventTypeDetailsPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [bookingFilter, setBookingFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showShareMenu, setShowShareMenu] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!eventId) {
                setError('No event ID provided');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            
            try {
                const res = await getEventTypeDetails(eventId);
                if (!res) {
                    throw new Error('No data returned from API');
                }
                setData(res);
            } catch (err) {
                console.error('Failed to load event details:', err);
                setError(err.message || 'Failed to load event type details.');
            } finally {
                setLoading(false);
            }
        };
        
        load();
    }, [eventId]);

    const bookingLink = data?.user && data?.id
        ? `${window.location.origin}/book/${data.user}/${data.id}`
        : '';

    const handleCopy = async () => {
        if (!bookingLink) return;
        
        try {
            await navigator.clipboard.writeText(bookingLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = async () => {
        if (navigator.share && bookingLink) {
            try {
                await navigator.share({
                    title: data?.event_name || 'Book a meeting',
                    text: `Book a ${data?.duration || 30} minute meeting with ${data?.event_owner || 'me'}`,
                    url: bookingLink,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            setShowShareMenu(!showShareMenu);
        }
    };

    const exportBookings = () => {
        if (!data?.bookings || data.bookings.length === 0) return;

        const csv = [
            ['ID', 'Name', 'Email', 'Phone', 'Date', 'Time', 'Status', 'Notes'].join(','),
            ...data.bookings.map(b => {
                const date = parseBookingTime(b.booked_time);
                return [
                    b.id,
                    `"${b.name || ''}"`,
                    b.email || '',
                    b.phone_number || '',
                    format(date, 'yyyy-MM-dd'),
                    format(date, 'HH:mm'),
                    b.status || 'pending',
                    `"${(b.notes || '').replace(/"/g, '""')}"`,
                ].join(',');
            }),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.event_name || 'bookings'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ── sorted slots (Mon → Sun) ── */
    const sortedSlots = data?.available_slots
        ? [...data.available_slots].sort(
              (a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
          )
        : [];

    /* ── sorted bookings (newest first) ── */
    const sortedBookings = data?.bookings
        ? [...data.bookings].sort(
              (a, b) => new Date(b.booked_time) - new Date(a.booked_time)
          )
        : [];

    const now = new Date();
    const upcomingBookings = sortedBookings.filter(b => {
        const bookingDate = parseBookingTime(b.booked_time);
        return isValid(bookingDate) && isFuture(bookingDate);
    });
    
    const pastBookings = sortedBookings.filter(b => {
        const bookingDate = parseBookingTime(b.booked_time);
        return isValid(bookingDate) && isDatePast(bookingDate);
    });

    /* ── filtered bookings with search ── */
    let filteredBookings = bookingFilter === 'upcoming'
        ? upcomingBookings
        : bookingFilter === 'past'
        ? pastBookings
        : sortedBookings;

    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredBookings = filteredBookings.filter(b =>
            (b.name || '').toLowerCase().includes(query) ||
            (b.email || '').toLowerCase().includes(query) ||
            (b.phone_number || '').toLowerCase().includes(query) ||
            (b.notes || '').toLowerCase().includes(query)
        );
    }

    const LocationIcon = data?.location ? getLocationIcon(data.location) : Video;

    /* ── loading state ── */
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-tertiary)]/20 to-[var(--color-bg-tertiary)]/40">
                <div className="flex flex-col items-center gap-4 rounded-2xl bg-[var(--color-bg-primary)] shadow-lg border border-[var(--color-border)] px-8 py-6">
                    <div className="relative">
                        <div className="animate-ping absolute inline-flex h-14 w-14 rounded-full bg-blue-400/30" />
                        <div className="relative flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                            <CalendarIcon className="text-white animate-pulse" size={22} />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Loading event details</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1.5 max-w-xs">
                            Fetching availability, bookings, and configuration
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* ── error state ── */
    if (error || !data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4 bg-gradient-to-br from-[var(--color-bg-tertiary)]/20 to-[var(--color-bg-tertiary)]/40">
                <div className="w-full max-w-lg space-y-4">
                    <button
                        onClick={() => navigate('/scheduling')}
                        className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]"
                    >
                        <ArrowLeft size={18} /> Back to Scheduling
                    </button>
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="text-red-600" size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-red-900 font-semibold text-base">Unable to load event</p>
                            <p className="text-red-700 text-sm mt-1.5 leading-relaxed">
                                {error || 'This event type could not be found or you may not have permission to view it.'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const hasBookings = sortedBookings.length > 0;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[var(--color-bg-tertiary)]/20 to-[var(--color-bg-tertiary)]/40">
            <div className="mx-auto w-full px-2 sm:px-4 lg:px-6 py-5 sm:py-8 space-y-5">
                
                {/* ── Header ───────────────────────────────────────── */}
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
                        <div className="flex flex-col gap-4">
                            {/* Top row: Back button + Actions */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => navigate('/scheduling')}
                                    className="inline-flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all text-sm font-medium"
                                >
                                    <ArrowLeft size={16} />
                                    <span className="hidden sm:inline">Back</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    {hasBookings && (
                                        <button
                                            onClick={exportBookings}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-all"
                                            title="Export bookings"
                                        >
                                            <Download size={16} />
                                            <span className="hidden sm:inline">Export</span>
                                        </button>
                                    )}
                                    
                                    <div className="relative">
                                        <button
                                            onClick={handleShare}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-all"
                                            title="Share booking link"
                                        >
                                            <Share2 size={16} />
                                            <span className="hidden sm:inline">Share</span>
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleCopy}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${
                                            copied
                                                ? 'bg-green-600 text-white'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                                        }`}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle2 size={16} />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                <span className="hidden sm:inline">Copy Link</span>
                                                <span className="sm:hidden">Copy</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => window.open(bookingLink, '_blank')}
                                        className="p-2 bg-[var(--color-bg-tertiary)] hover:bg-blue-50 hover:text-blue-600 text-[var(--color-text-secondary)] rounded-lg transition-all"
                                        title="Open booking page"
                                    >
                                        <ExternalLink size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Title and metadata */}
                            <div>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                                        {(data.event_owner || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide mb-1">
                                            Event Type
                                        </p>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] leading-tight">
                                            {data.event_name}
                                        </h1>
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                            by {data.event_owner}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm border border-blue-100">
                                        <Clock size={14} />
                                        {data.duration} min
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-semibold text-sm border border-purple-100">
                                        <LocationIcon size={14} />
                                        {data.location}
                                    </span>
                                    {hasBookings && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-semibold text-sm border border-green-100">
                                            <Users size={14} />
                                            {upcomingBookings.length} upcoming
                                            {pastBookings.length > 0 && (
                                                <>
                                                    <span className="text-green-400">·</span>
                                                    {pastBookings.length} past
                                                </>
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main grid ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* ── LEFT COLUMN ─────────────────────────────────────── */}
                    <div className="lg:col-span-1 space-y-4">

                        {/* Event Details card */}
                        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl shadow-sm p-5 space-y-4">
                            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
                                <Settings size={16} className="text-blue-600" />
                                Event Details
                            </h2>

                            <dl className="space-y-3 text-sm">
                                <InfoRow 
                                    icon={<Clock size={15} className="text-blue-600" />} 
                                    label="Duration"
                                >
                                    {data.duration} minutes
                                </InfoRow>

                                <InfoRow 
                                    icon={<LocationIcon size={15} className="text-purple-600" />} 
                                    label="Location"
                                >
                                    {data.location}
                                </InfoRow>

                                {data.buffer_time > 0 && (
                                    <InfoRow 
                                        icon={<Clock size={15} className="text-orange-600" />} 
                                        label="Buffer Time"
                                    >
                                        {data.buffer_time} min before &amp; after
                                    </InfoRow>
                                )}

                                {(data.start_date || data.end_date) && (
                                    <InfoRow 
                                        icon={<CalendarIcon size={15} className="text-indigo-600" />} 
                                        label="Booking Window"
                                    >
                                        <span className="font-mono text-xs">
                                            {data.start_date && isValid(parseISO(data.start_date))
                                                ? format(parseISO(data.start_date), 'MMM d, yyyy')
                                                : 'Open'}
                                            {' → '}
                                            {data.end_date && isValid(parseISO(data.end_date))
                                                ? format(parseISO(data.end_date), 'MMM d, yyyy')
                                                : 'Ongoing'}
                                        </span>
                                    </InfoRow>
                                )}

                                <InfoRow 
                                    icon={<CalendarIcon size={15} className="text-gray-500" />} 
                                    label="Created"
                                >
                                    {data.created_at && isValid(parseISO(data.created_at))
                                        ? format(parseISO(data.created_at), 'MMM d, yyyy')
                                        : 'N/A'}
                                </InfoRow>
                            </dl>

                            {data.description && (
                                <div className="pt-4 border-t border-[var(--color-border)]">
                                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                        Description
                                    </p>
                                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                        {data.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Available Slots card (table) */}
                        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl shadow-sm p-5">
                            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
                                <Clock size={16} className="text-blue-600" />
                                Available Slots
                            </h2>

                            {sortedSlots.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                        <Clock size={20} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-[var(--color-text-muted)] font-medium">
                                        No availability defined
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                        Add time slots to start accepting bookings
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto -mx-2 sm:mx-0">
                                    <table className="min-w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-[var(--color-bg-tertiary)]/60 border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                                                <th className="px-3 py-2 text-left font-semibold w-24">Day</th>
                                                <th className="px-3 py-2 text-left font-semibold">Start</th>
                                                <th className="px-3 py-2 text-left font-semibold">End</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedSlots.map((slot, i) => (
                                                <tr
                                                    key={`${slot.day_of_week}-${i}`}
                                                    className="border-b last:border-0 border-[var(--color-border)]/60 hover:bg-blue-50/50 transition-colors"
                                                >
                                                    <td className="px-3 py-2 font-semibold text-[var(--color-text-primary)]">
                                                        {DAY_SHORT[slot.day_of_week] ?? slot.day_of_week}
                                                    </td>
                                                    <td className="px-3 py-2 text-[var(--color-text-secondary)] font-mono tabular-nums">
                                                        {fmt12(slot.start_time)}
                                                    </td>
                                                    <td className="px-3 py-2 text-[var(--color-text-secondary)] font-mono tabular-nums">
                                                        {fmt12(slot.end_time)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: Bookings ────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl shadow-sm p-5">
                            
                            {/* Header */}
                            <div className="flex flex-col gap-4 mb-5 pb-4 border-b border-[var(--color-border)]">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                            <Users size={18} className="text-blue-600" />
                                            Bookings
                                        </h2>
                                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                            {hasBookings 
                                                ? `${sortedBookings.length} total · ${upcomingBookings.length} upcoming`
                                                : 'No bookings yet'
                                            }
                                        </p>
                                    </div>

                                    {hasBookings && (
                                        <div className="inline-flex rounded-xl bg-[var(--color-bg-tertiary)] p-1 text-xs shadow-inner">
                                            <button
                                                type="button"
                                                onClick={() => setBookingFilter('all')}
                                                className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
                                                    bookingFilter === 'all'
                                                        ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                                                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                                                }`}
                                            >
                                                All
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBookingFilter('upcoming')}
                                                className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
                                                    bookingFilter === 'upcoming'
                                                        ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                                                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                                                }`}
                                            >
                                                Upcoming
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBookingFilter('past')}
                                                className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
                                                    bookingFilter === 'past'
                                                        ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                                                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                                                }`}
                                            >
                                                Past
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Search bar */}
                                {hasBookings && (
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                        <input
                                            type="text"
                                            placeholder="Search bookings by name, email, phone, or notes..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Bookings list */}
                            {!hasBookings ? (
                                <EmptyState
                                    icon={<Users size={28} className="text-gray-400" />}
                                    title="No bookings yet"
                                    description="Share your booking link to start receiving appointments"
                                    action={
                                        <button
                                            onClick={handleCopy}
                                            className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                                        >
                                            <Copy size={15} />
                                            Copy Booking Link
                                        </button>
                                    }
                                />
                            ) : filteredBookings.length === 0 ? (
                                <EmptyState
                                    icon={searchQuery ? <Search size={28} className="text-gray-400" /> : <CalendarIcon size={28} className="text-gray-400" />}
                                    title={searchQuery ? 'No matching bookings' : `No ${bookingFilter} bookings`}
                                    description={searchQuery ? 'Try a different search term' : 'Try switching the filter to see other bookings'}
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-[var(--color-bg-tertiary)]/60 border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                                                <th className="px-3 py-2 text-left font-semibold">Attendee</th>
                                                <th className="px-3 py-2 text-left font-semibold">Contact</th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Date</th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Time</th>
                                                <th className="px-3 py-2 text-left font-semibold">Status</th>
                                                <th className="px-3 py-2 text-left font-semibold">Notes</th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Booking Info</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBookings.map((booking) => {
                                                const bookedDate = parseBookingTime(booking.booked_time);
                                                const isBookingPast = isValid(bookedDate) && isDatePast(bookedDate);
                                                const status = getStatusConfig(booking.status);

                                                return (
                                                    <tr
                                                        key={booking.id}
                                                        className={`border-b last:border-0 border-[var(--color-border)]/60 ${
                                                            isBookingPast
                                                                ? 'bg-gray-50/60'
                                                                : 'bg-white hover:bg-blue-50/50'
                                                        } transition-colors`}
                                                    >
                                                        {/* Attendee */}
                                                        <td className="px-3 py-3 align-top">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                                    {(booking.name || '?').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-semibold text-[var(--color-text-primary)] truncate max-w-[160px]">
                                                                        {booking.name || 'Unnamed attendee'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Contact */}
                                                        <td className="px-3 py-3 align-top">
                                                            <div className="flex flex-col gap-1 text-xs">
                                                                {booking.email && (
                                                                    <a
                                                                        href={`mailto:${booking.email}`}
                                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                                                                    >
                                                                        <Mail size={12} />
                                                                        <span className="truncate max-w-[160px]">{booking.email}</span>
                                                                    </a>
                                                                )}
                                                                {booking.phone_number && (
                                                                    <a
                                                                        href={`tel:${booking.phone_number}`}
                                                                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 hover:underline"
                                                                    >
                                                                        <PhoneCall size={12} />
                                                                        <span>{booking.phone_number}</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Date */}
                                                        <td className="px-3 py-3 align-top whitespace-nowrap text-[var(--color-text-primary)] text-sm">
                                                            {isValid(bookedDate) ? format(bookedDate, 'MMM d, yyyy') : '—'}
                                                        </td>

                                                        {/* Time */}
                                                        <td className="px-3 py-3 align-top whitespace-nowrap text-[var(--color-text-secondary)] text-sm">
                                                            {isValid(bookedDate) ? format(bookedDate, 'h:mm a') : '—'}
                                                            {isBookingPast && (
                                                                <span className="ml-1 text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                                                                    Past
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-3 py-3 align-top">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full border shadow-sm ${status.cls}`}>
                                                                <status.Icon size={11} />
                                                                {status.label}
                                                            </span>
                                                        </td>

                                                        {/* Notes */}
                                                        <td className="px-3 py-3 align-top text-xs text-[var(--color-text-secondary)] max-w-xs">
                                                            {booking.notes ? (
                                                                <div className="flex items-start gap-1.5">
                                                                    <MessageSquare size={11} className="mt-0.5 text-amber-600 flex-shrink-0" />
                                                                    <span className="whitespace-pre-wrap">
                                                                        {booking.notes}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[var(--color-text-muted)]">—</span>
                                                            )}
                                                        </td>

                                                        {/* Booking info */}
                                                        <td className="px-3 py-3 align-top text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-mono flex items-center gap-1">
                                                                    <Hash size={10} />
                                                                    #{booking.id}
                                                                </span>
                                                                {booking.created_at && isValid(parseISO(booking.created_at)) && (
                                                                    <span>
                                                                        Created {format(parseISO(booking.created_at), 'MMM d, yyyy')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Sub-components ─────────────────────────────────────────────────────── */

const InfoRow = ({ icon, label, children }) => (
    <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
            <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wide block mb-1">
                {label}
            </span>
            <div className="text-[var(--color-text-primary)] font-medium">{children}</div>
        </div>
    </div>
);

const EmptyState = ({ icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center shadow-inner">
            {icon}
        </div>
        <div>
            <p className="font-bold text-[var(--color-text-primary)] text-lg">{title}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-sm">{description}</p>
        </div>
        {action}
    </div>
);

export default EventTypeDetailsPage;