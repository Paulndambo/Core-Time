// Google Calendar API Service
const CALENDAR_ID = 'primary';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

let gapiInited = false;
let tokenClient;
let scriptsLoading = false;

// Initialize Google API
export const initGoogleCalendar = (callback) => {
    // Check if scripts are already loaded
    if (window.gapi && window.google) {
        loadCalendarClient(callback);
        return;
    }

    // Prevent duplicate script loading
    if (scriptsLoading) {
        const checkInterval = setInterval(() => {
            if (window.gapi && window.google) {
                clearInterval(checkInterval);
                loadCalendarClient(callback);
            }
        }, 100);
        return;
    }

    scriptsLoading = true;

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
        window.gapi.load('client', async () => {
            await loadCalendarClient(callback);
        });
    };
    script.onerror = () => {
        scriptsLoading = false;
        console.error('Failed to load Google API script - likely no internet connection');
        // Call callback even on error so app can fall back to backend
        if (callback) callback();
    };
    document.body.appendChild(script);

    // Load Google Identity Services
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
        if (window.google) {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: '', // Will be set when requesting access
            });
        }
    };
    gisScript.onerror = () => {
        console.error('Failed to load Google Identity Services script - likely no internet connection');
        // Don't call callback here as it's not critical for initialization
    };
    document.body.appendChild(gisScript);
};

const loadCalendarClient = async (callback) => {
    try {
        if (!window.gapi || !window.gapi.client) {
            throw new Error('Google API client not available');
        }

        await window.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        });
        gapiInited = true;
        scriptsLoading = false;

        // Restore token if exists
        const token = localStorage.getItem('googleCalendarToken');
        if (token) {
            window.gapi.client.setToken({ access_token: token });
        }

        if (callback) callback();
    } catch (error) {
        scriptsLoading = false;
        console.error('Error initializing Google Calendar client (likely offline):', error);
        // Always call callback so app can fall back to backend
        if (callback) callback();
    }
};

// Request calendar access
export const requestCalendarAccess = () => {
    return new Promise((resolve, reject) => {
        if (!window.google) {
            reject(new Error('Google Identity Services not loaded. Please refresh the page.'));
            return;
        }

        if (!tokenClient) {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: '', // Will be set below
            });
        }

        tokenClient.callback = (response) => {
            if (response.error) {
                reject(response);
                return;
            }
            
            // Store token
            localStorage.setItem('googleCalendarToken', response.access_token);
            
            // Set token on gapi client
            if (window.gapi && window.gapi.client) {
                window.gapi.client.setToken({ access_token: response.access_token });
            }
            
            resolve(response);
        };

        const token = localStorage.getItem('googleCalendarToken');
        if (token === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Restore existing token
            if (window.gapi && window.gapi.client) {
                window.gapi.client.setToken({ access_token: token });
            }
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
};

// Check if calendar is connected
export const isCalendarConnected = () => {
    return !!localStorage.getItem('googleCalendarToken');
};

// Fetch events from Google Calendar
export const fetchGoogleCalendarEvents = async (timeMin, timeMax) => {
    try {
        if (!gapiInited || !window.gapi || !window.gapi.client) {
            throw new Error('Google API not initialized');
        }

        // Ensure token is set
        const token = localStorage.getItem('googleCalendarToken');
        if (token && !window.gapi.client.getToken()) {
            window.gapi.client.setToken({ access_token: token });
        }

        if (!window.gapi.client.getToken()) {
            throw new Error('Not authenticated. Please connect your Google Calendar.');
        }

        const response = await window.gapi.client.calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            showDeleted: false,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.result.items || [];
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        
        // If token expired, clear it
        if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('googleCalendarToken');
            if (window.gapi && window.gapi.client) {
                window.gapi.client.setToken('');
            }
        }
        
        throw error;
    }
};

// Create event in Google Calendar
export const createGoogleCalendarEvent = async (event) => {
    try {
        if (!gapiInited || !window.gapi || !window.gapi.client) {
            throw new Error('Google API not initialized');
        }

        // Ensure token is set
        const token = localStorage.getItem('googleCalendarToken');
        if (token && !window.gapi.client.getToken()) {
            window.gapi.client.setToken({ access_token: token });
        }

        if (!window.gapi.client.getToken()) {
            throw new Error('Not authenticated. Please connect your Google Calendar.');
        }

        const calendarEvent = {
            summary: event.title,
            description: event.description || '',
            start: {
                dateTime: event.start.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: event.end.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
        };

        if (event.withMeet) {
            calendarEvent.conferenceData = {
                createRequest: {
                    requestId: Math.random().toString(36).substring(7),
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                }
            };
        }

        const response = await window.gapi.client.calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: calendarEvent,
            conferenceDataVersion: event.withMeet ? 1 : 0,
        });

        return response.result;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        
        // If token expired, clear it
        if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('googleCalendarToken');
            if (window.gapi && window.gapi.client) {
                window.gapi.client.setToken('');
            }
        }
        
        throw error;
    }
};

// Update event in Google Calendar
export const updateGoogleCalendarEvent = async (eventId, event) => {
    try {
        if (!gapiInited) {
            throw new Error('Google API not initialized');
        }

        const calendarEvent = {
            summary: event.title,
            description: event.description || '',
            start: {
                dateTime: event.start.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: event.end.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
        };

        const response = await window.gapi.client.calendar.events.update({
            calendarId: CALENDAR_ID,
            eventId: eventId,
            resource: calendarEvent,
        });

        return response.result;
    } catch (error) {
        console.error('Error updating calendar event:', error);
        throw error;
    }
};

// Delete event from Google Calendar
export const deleteGoogleCalendarEvent = async (eventId) => {
    try {
        if (!gapiInited) {
            throw new Error('Google API not initialized');
        }

        await window.gapi.client.calendar.events.delete({
            calendarId: CALENDAR_ID,
            eventId: eventId,
        });

        return true;
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        throw error;
    }
};

// Revoke calendar access
export const revokeCalendarAccess = () => {
    localStorage.removeItem('googleCalendarToken');
    const token = window.gapi.client.getToken();
    if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token);
        window.gapi.client.setToken('');
    }
};
