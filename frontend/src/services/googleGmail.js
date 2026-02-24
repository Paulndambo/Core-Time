// Google Gmail API Service
const SCOPES = 'https://www.googleapis.com/auth/gmail.modify';

let gapiInited = false;
let tokenClient;
let scriptsLoading = false;

// Initialize Google API (reuses the same loading logic as Calendar if possible, but standalone here for safety)
export const initGmail = (callback) => {
    // Check if scripts are already loaded
    if (window.gapi && window.google) {
        loadGmailClient(callback);
        return;
    }

    // Prevent duplicate script loading
    if (scriptsLoading) {
        const checkInterval = setInterval(() => {
            if (window.gapi && window.google) {
                clearInterval(checkInterval);
                loadGmailClient(callback);
            }
        }, 100);
        return;
    }

    scriptsLoading = true;

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
        window.gapi.load('client', async () => {
            await loadGmailClient(callback);
        });
    };
    script.onerror = () => {
        scriptsLoading = false;
        console.error('Failed to load Google API script');
    };
    document.body.appendChild(script);

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
        console.error('Failed to load Google Identity Services script');
    };
    document.body.appendChild(gisScript);
};

const loadGmailClient = async (callback) => {
    try {
        await window.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
        });
        gapiInited = true;
        scriptsLoading = false;

        // Restore token if exists
        const token = localStorage.getItem('googleGmailToken');
        if (token) {
            window.gapi.client.setToken({ access_token: token });
        }

        // Re-init token client if needed
        if (window.google && !tokenClient) {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: '',
            });
        }

        if (callback) callback();
    } catch (error) {
        scriptsLoading = false;
        console.error('Error initializing Gmail client:', error);
        if (callback) callback();
    }
};

// Request Gmail access
export const requestGmailAccess = () => {
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
            localStorage.setItem('googleGmailToken', response.access_token);
            
            // Set token on gapi client
            if (window.gapi && window.gapi.client) {
                window.gapi.client.setToken({ access_token: response.access_token });
            }
            
            resolve(response);
        };

        const token = localStorage.getItem('googleGmailToken');
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

export const isGmailConnected = () => {
    return !!localStorage.getItem('googleGmailToken');
};

// List messages
export const listMessages = async (maxResults = 20, query = '') => {
    try {
        if (!gapiInited || !window.gapi || !window.gapi.client) {
            throw new Error('Google API not initialized');
        }

        // Ensure token is set
        const token = localStorage.getItem('googleGmailToken');
        if (token && !window.gapi.client.getToken()) {
            window.gapi.client.setToken({ access_token: token });
        }

        if (!window.gapi.client.getToken()) {
            throw new Error('Not authenticated. Please connect your Gmail.');
        }

        const response = await window.gapi.client.gmail.users.messages.list({
            userId: 'me',
            maxResults: maxResults,
            q: query
        });
        return response.result.messages || [];
    } catch (error) {
        console.error('Error listing messages:', error);
        
        // If token expired, clear it
        if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('googleGmailToken');
            if (window.gapi && window.gapi.client) {
                window.gapi.client.setToken('');
            }
        }
        
        throw error;
    }
};

// Get message details
export const getMessageDetails = async (messageId) => {
    try {
        if (!gapiInited || !window.gapi || !window.gapi.client) {
            throw new Error('Google API not initialized');
        }

        // Ensure token is set
        const token = localStorage.getItem('googleGmailToken');
        if (token && !window.gapi.client.getToken()) {
            window.gapi.client.setToken({ access_token: token });
        }

        if (!window.gapi.client.getToken()) {
            throw new Error('Not authenticated. Please connect your Gmail.');
        }

        const response = await window.gapi.client.gmail.users.messages.get({
            userId: 'me',
            id: messageId,
        });
        return response.result;
    } catch (error) {
        console.error('Error getting message details:', error);
        
        // If token expired, clear it
        if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('googleGmailToken');
            if (window.gapi && window.gapi.client) {
                window.gapi.client.setToken('');
            }
        }
        
        throw error;
    }
};

// Get batch message details (helper)
export const getBatchMessageDetails = async (messages) => {
    const promises = messages.map(msg => getMessageDetails(msg.id));
    return Promise.all(promises);
};

// Send email
export const sendMessage = async (to, subject, body) => {
    try {
        if (!gapiInited || !window.gapi || !window.gapi.client) {
            throw new Error('Google API not initialized');
        }

        // Ensure token is set
        const token = localStorage.getItem('googleGmailToken');
        if (token && !window.gapi.client.getToken()) {
            window.gapi.client.setToken({ access_token: token });
        }

        if (!window.gapi.client.getToken()) {
            throw new Error('Not authenticated. Please connect your Gmail.');
        }

        // Create email content compliant with RFC 2822
        const emailContent = [
            `To: ${to}`,
            `Subject: ${subject}`,
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            '',
            body
        ].join('\n');

        // Base64 encode the email
        const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const response = await window.gapi.client.gmail.users.messages.send({
            userId: 'me',
            resource: {
                raw: encodedEmail
            }
        });
        return response.result;
    } catch (error) {
        console.error('Error sending email:', error);
        
        // If token expired, clear it
        if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('googleGmailToken');
            if (window.gapi && window.gapi.client) {
                window.gapi.client.setToken('');
            }
        }
        
        throw error;
    }
};

// Extract headers helper
export const getHeader = (headers, name) => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
};

// Decode body helper
export const getBody = (payload) => {
    let body = '';
    if (payload.body.data) {
        body = payload.body.data;
    } else if (payload.parts) {
        // Find HTML part first, fallback to text
        const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
        if (htmlPart && htmlPart.body.data) {
            body = htmlPart.body.data;
        } else if (textPart && textPart.body.data) {
            body = textPart.body.data;
        }
    }

    if (!body) return '';

    return decodeURIComponent(escape(atob(body.replace(/-/g, '+').replace(/_/g, '/'))));
};
