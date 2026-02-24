import React, { useState, useEffect } from 'react';
import {
    Mail,
    Inbox,
    Send,
    RefreshCw,
    Plus,
    X,
    User,
    ChevronLeft,
    Trash2,
    Star
} from 'lucide-react';
import { format } from 'date-fns';
import {
    initGmail,
    requestGmailAccess,
    isGmailConnected,
    listMessages,
    getMessageDetails,
    sendMessage
} from '../services/googleGmail';

const Email = () => {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [showCompose, setShowCompose] = useState(false);
    const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

    useEffect(() => {
        initGmail(() => {
            setConnected(isGmailConnected());
            if (isGmailConnected()) {
                fetchEmails();
            }
        });
    }, []);

    const handleConnect = async () => {
        try {
            setLoading(true);
            await requestGmailAccess();
            setConnected(true);
            await fetchEmails();
        } catch (error) {
            console.error('Failed to connect Gmail:', error);
            const errorMessage = error.error || error.message || 'Failed to connect Gmail.';
            if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
                alert('Please allow popups for this site to connect Gmail.');
            } else {
                alert(`Failed to connect Gmail: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchEmails = async () => {
        try {
            setLoading(true);
            const messages = await listMessages(20);

            // Fetch details for each message
            const emailDetails = await Promise.all(
                messages.map(msg => getMessageDetails(msg.id))
            );

            const formattedEmails = emailDetails.map(detail => {
                const headers = detail.payload.headers;
                const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
                const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
                const date = headers.find(h => h.name === 'Date')?.value;
                const snippet = detail.snippet;

                return {
                    id: detail.id,
                    subject,
                    from,
                    date: date ? new Date(date) : new Date(),
                    snippet,
                    body: getBody(detail.payload) // Helper needed or simplified
                };
            });

            setEmails(formattedEmails);
        } catch (error) {
            console.error('Error fetching emails:', error);
            const errorMessage = error.message || 'Failed to fetch emails.';
            if (errorMessage.includes('Not authenticated')) {
                setConnected(false);
                alert('Your session expired. Please reconnect Gmail.');
            } else {
                alert(`Failed to fetch emails: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const getBody = (payload) => {
        let body = '';
        if (payload.body.data) {
            body = payload.body.data;
        } else if (payload.parts) {
            const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
            const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
            if (htmlPart && htmlPart.body.data) body = htmlPart.body.data;
            else if (textPart && textPart.body.data) body = textPart.body.data;
        }

        if (!body) return '';
        // Decode Base64URL
        return decodeURIComponent(escape(window.atob(body.replace(/-/g, '+').replace(/_/g, '/'))));
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await sendMessage(composeData.to, composeData.subject, composeData.body);
            alert('Email sent successfully!');
            setShowCompose(false);
            setComposeData({ to: '', subject: '', body: '' });
            fetchEmails(); // Refresh list
        } catch (error) {
            console.error('Error sending email:', error);
            const errorMessage = error.message || 'Failed to send email.';
            if (errorMessage.includes('Not authenticated')) {
                setConnected(false);
                alert('Your session expired. Please reconnect Gmail.');
            } else {
                alert(`Failed to send email: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!connected) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                    <Mail size={48} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Connect Gmail</h1>
                <p className="text-[var(--color-text-secondary)] max-w-md">
                    Link your Google account to read, reply, and send emails directly from Nyumba.
                </p>
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="btn bg-red-600 text-white hover:bg-red-700 px-8 py-3 text-lg gap-3"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : <Mail />}
                    Sign in with Google
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 overflow-hidden">
            {/* Sidebar / List */}
            <div className={`w-full md:w-1/3 flex flex-col bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] overflow-hidden ${selectedEmail ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-primary)]">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Inbox size={20} /> Inbox
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={fetchEmails} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full" title="Refresh">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={() => setShowCompose(true)} className="p-2 bg-[var(--color-accent)] text-white rounded-full hover:bg-blue-700" title="Compose">
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {emails.length === 0 && !loading ? (
                        <div className="p-8 text-center text-[var(--color-text-muted)]">No emails found.</div>
                    ) : (
                        emails.map(email => (
                            <div
                                key={email.id}
                                onClick={() => setSelectedEmail(email)}
                                className={`p-4 border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors ${selectedEmail?.id === email.id ? 'bg-[var(--color-bg-tertiary)] border-l-4 border-l-[var(--color-accent)]' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm text-[var(--color-text-primary)] truncate w-3/4">{email.from}</span>
                                    <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                                        {format(email.date, 'MMM d')}
                                    </span>
                                </div>
                                <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-1 truncate">{email.subject}</h4>
                                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{email.snippet}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Email Detail View */}
            <div className={`flex-1 flex flex-col bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] overflow-hidden ${!selectedEmail ? 'hidden md:flex' : 'flex'}`}>
                {selectedEmail ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedEmail(null)} className="md:hidden p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full">
                                        <ChevronLeft />
                                    </button>
                                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{selectedEmail.subject}</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-[var(--color-text-muted)] hover:text-yellow-500 rounded-full">
                                        <Star size={20} />
                                    </button>
                                    <button className="p-2 text-[var(--color-text-muted)] hover:text-red-500 rounded-full">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {selectedEmail.from.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">{selectedEmail.from}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{format(selectedEmail.date, 'PPP p')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} className="prose max-w-none" />
                        </div>

                        {/* Action Bar */}
                        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)] flex justify-end">
                            <button
                                onClick={() => {
                                    setComposeData({
                                        to: selectedEmail.from,
                                        subject: `Re: ${selectedEmail.subject}`,
                                        body: `<br><br>On ${format(selectedEmail.date, 'PPP')}, ${selectedEmail.from} wrote:<br>${selectedEmail.snippet}...`
                                    });
                                    setShowCompose(true);
                                }}
                                className="btn btn-primary gap-2"
                            >
                                <Send size={18} /> Reply
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)] p-8 text-center">
                        <Mail size={64} className="mb-4 opacity-20" />
                        <h3 className="text-xl font-medium mb-2">Select an email to read</h3>
                        <p className="max-w-xs">Choose an email from the list on the left to view its contents.</p>
                    </div>
                )}
            </div>

            {/* Compose Modal */}
            {showCompose && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">New Message</h3>
                            <button onClick={() => setShowCompose(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSendEmail} className="flex-1 flex flex-col p-4 overflow-hidden">
                            <input
                                type="text"
                                placeholder="To"
                                value={composeData.to}
                                onChange={e => setComposeData({ ...composeData, to: e.target.value })}
                                className="w-full p-3 border-b border-gray-200 outline-none focus:bg-blue-50 transition-colors"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Subject"
                                value={composeData.subject}
                                onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                                className="w-full p-3 border-b border-gray-200 outline-none focus:bg-blue-50 transition-colors font-medium"
                                required
                            />
                            <textarea
                                placeholder="Write your message..."
                                value={composeData.body}
                                onChange={e => setComposeData({ ...composeData, body: e.target.value })}
                                className="flex-1 w-full p-3 outline-none resize-none focus:bg-blue-50/30 transition-colors mt-2"
                                required
                            />

                            <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
                                <button type="submit" disabled={loading} className="btn btn-primary gap-2 px-6">
                                    {loading ? <RefreshCw className="animate-spin" /> : <Send size={18} />}
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Email;
