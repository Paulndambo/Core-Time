/**
 * API service for Django REST backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Log API configuration for debugging (only in development)
if (import.meta.env.DEV) {
    console.log('API Base URL:', API_BASE_URL);
    console.log('Google Client ID configured:', !!import.meta.env.VITE_GOOGLE_CLIENT_ID);
}

/**
 * Get the stored access token
 */
const getAccessToken = () => {
    return localStorage.getItem('accessToken');
};

/**
 * Get the stored refresh token
 */
const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

/**
 * Store tokens in localStorage
 */
const setTokens = (accessToken, refreshToken) => {
    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    }
};

/**
 * Remove tokens from localStorage
 */
const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

/**
 * Make an authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
    const token = getAccessToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // If token expired, try to refresh
        if (response.status === 401 && token) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry the original request with new token
                headers['Authorization'] = `Bearer ${getAccessToken()}`;
                const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...config,
                    headers,
                });
                return retryResponse;
            }
        }

        return response;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

/**
 * Refresh the access token using refresh token
 */
const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            setTokens(data.access, refreshToken);
            return true;
        } else {
            // Refresh token expired, clear tokens
            clearTokens();
            return false;
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        clearTokens();
        return false;
    }
};

/**
 * Authenticate with Google OAuth token
 */
export const authenticateWithGoogle = async (googleCredential) => {
    try {
        const url = `${API_BASE_URL}/auth/google/`;
        console.log('Authenticating with Google at:', url);
        
        if (!googleCredential) {
            throw new Error('Google credential is missing');
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credential: googleCredential }),
        });

        // Log response details for debugging
        console.log('Authentication response status:', response.status, response.statusText);

        if (!response.ok) {
            let errorData = {};
            let errorMessage = 'Authentication failed';
            
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                } else {
                    const text = await response.text();
                    errorData = { message: text || `HTTP ${response.status}: ${response.statusText}` };
                }
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
                errorData = { 
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    detail: 'Failed to parse error response'
                };
            }

            // Extract error message from various possible fields
            errorMessage = errorData.detail || 
                          errorData.message || 
                          errorData.error || 
                          errorData.non_field_errors?.[0] ||
                          `HTTP ${response.status}: ${response.statusText}`;

            // Add more context for common errors
            if (response.status === 404) {
                errorMessage = 'Authentication endpoint not found. Please check if the backend server is running and the API URL is correct.';
            } else if (response.status === 500) {
                errorMessage = 'Server error during authentication. Please try again later.';
            } else if (response.status === 401 || response.status === 403) {
                errorMessage = errorMessage || 'Invalid Google credential. Please try signing in again.';
            } else if (response.status === 0 || response.status === 'NetworkError') {
                errorMessage = 'Network error. Please check if the backend server is running and accessible.';
            }

            console.error('Authentication error details:', {
                status: response.status,
                statusText: response.statusText,
                errorData,
                url
            });

            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Validate response data
        if (!data.access || !data.refresh) {
            console.error('Invalid response data:', data);
            throw new Error('Invalid response from server: missing access or refresh token');
        }
        
        // Store tokens
        setTokens(data.access, data.refresh);
        
        return {
            user: data.user,
            accessToken: data.access,
            refreshToken: data.refresh,
        };
    } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error('Network error during authentication:', error);
            throw new Error('Unable to connect to the server. Please check if the backend is running and the API URL is correct.');
        }
        
        // Re-throw if it's already our custom error
        if (error.message && error.message !== 'Authentication failed') {
            throw error;
        }
        
        console.error('Google authentication error:', error);
        throw new Error(error.message || 'Authentication failed. Please try again.');
    }
};

/**
 * Get current user from backend
 */
export const getCurrentUser = async () => {
    try {
        const response = await apiRequest('/auth/user/');
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token invalid, clear tokens
                clearTokens();
                return null;
            }
            throw new Error('Failed to get user');
        }

        return await response.json();
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData) => {
    try {
        const response = await apiRequest('/auth/user/', {
            method: 'PATCH',
            body: JSON.stringify(profileData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update profile';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
};

/**
 * Logout - optionally send logout request to backend
 */
export const logout = async () => {
    try {
        // Optionally call backend logout endpoint if you have one
        // await apiRequest('/auth/logout/', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Always clear tokens locally
        clearTokens();
    }
};

/**
 * Verify if user is authenticated by checking token validity
 */
export const verifyAuth = async () => {
    const token = getAccessToken();
    
    if (!token) {
        return false;
    }

    try {
        const user = await getCurrentUser();
        return user !== null;
    } catch (error) {
        return false;
    }
};

/**
 * Generic API request helper (for other API calls)
 */
export const api = {
    get: async (endpoint) => {
        const response = await apiRequest(endpoint, { method: 'GET' });
        return response.json();
    },
    post: async (endpoint, data) => {
        const response = await apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.json();
    },
    put: async (endpoint, data) => {
        const response = await apiRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.json();
    },
    patch: async (endpoint, data) => {
        const response = await apiRequest(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response.json();
    },
    delete: async (endpoint) => {
        const response = await apiRequest(endpoint, { method: 'DELETE' });
        return response.json();
    },
};

/**
 * Library API functions
 */

/**
 * Get all books from library
 */
export const getBooks = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.title) queryParams.append('title', params.title);
        if (params.author) queryParams.append('author', params.author);
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/library/books/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch books');
        }

        return await response.json();
    } catch (error) {
        console.error('Get books error:', error);
        throw error;
    }
};

/**
 * Create a new book
 */
export const createBook = async (bookData) => {
    try {
        const response = await apiRequest('/library/books/', {
            method: 'POST',
            body: JSON.stringify(bookData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create book';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create book error:', error);
        throw error;
    }
};

/**
 * Update a book (full update)
 */
export const updateBook = async (bookId, bookData) => {
    try {
        const response = await apiRequest(`/library/books/${bookId}/details/`, {
            method: 'PUT',
            body: JSON.stringify(bookData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update book';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Update book error:', error);
        throw error;
    }
};

/**
 * Partially update a book (for status updates, etc.)
 */
export const patchBook = async (bookId, bookData) => {
    try {
        const response = await apiRequest(`/library/books/${bookId}/details/`, {
            method: 'PATCH',
            body: JSON.stringify(bookData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update book';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Patch book error:', error);
        throw error;
    }
};

/**
 * Delete a book
 */
export const deleteBook = async (bookId) => {
    try {
        const response = await apiRequest(`/library/books/${bookId}/details/`, {
            method: 'DELETE',
        });
        
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to delete book');
        }

        return true;
    } catch (error) {
        console.error('Delete book error:', error);
        throw error;
    }
};

/**
 * Get book details with reviews
 */
export const getBookDetails = async (bookId) => {
    try {
        const response = await apiRequest(`/library/books/${bookId}/details/`, {
            method: 'GET',
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch book details');
        }

        return await response.json();
    } catch (error) {
        console.error('Get book details error:', error);
        throw error;
    }
};

/**
 * Create a book review
 */
export const createBookReview = async (reviewData) => {
    try {
        const response = await apiRequest('/library/book-reviews/', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create review';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create book review error:', error);
        throw error;
    }
};

/**
 * Update a book review
 */
export const updateBookReview = async (reviewId, reviewData) => {
    try {
        const response = await apiRequest(`/library/book-reviews/${reviewId}/details/`, {
            method: 'PUT',
            body: JSON.stringify(reviewData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update review';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Update book review error:', error);
        throw error;
    }
};

/**
 * Delete a book review
 */
export const deleteBookReview = async (reviewId) => {
    try {
        const response = await apiRequest(`/library/book-reviews/${reviewId}/details/`, {
            method: 'DELETE',
        });
        
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to delete review');
        }

        return true;
    } catch (error) {
        console.error('Delete book review error:', error);
        throw error;
    }
};

/**
 * Finance API functions
 */

/**
 * Create a new transaction
 */
export const createTransaction = async (transactionData) => {
    try {
        const response = await apiRequest('/finance/transactions/', {
            method: 'POST',
            body: JSON.stringify(transactionData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create transaction';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create transaction error:', error);
        throw error;
    }
};

/**
 * Get all transactions
 */
export const getTransactions = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/finance/transactions/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch transactions');
        }

        return await response.json();
    } catch (error) {
        console.error('Get transactions error:', error);
        throw error;
    }
};

/**
 * Update transaction status (e.g., confirm a pending transaction)
 */
export const updateTransactionStatus = async (transactionId, status) => {
    try {
        const response = await apiRequest(`/finance/transactions/${transactionId}/update/`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail ||
                               errorData.message ||
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update transaction status';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Update transaction status error:', error);
        throw error;
    }
};

/**
 * Money Requests API functions
 */

/**
 * Get all money requests
 */
export const getMoneyRequests = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.direction) queryParams.append('direction', params.direction);
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/finance/money-requests/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch money requests');
        }

        return await response.json();
    } catch (error) {
        console.error('Get money requests error:', error);
        throw error;
    }
};

/**
 * Create a new money request
 */
export const createMoneyRequest = async (moneyRequestData) => {
    try {
        const response = await apiRequest('/finance/money-requests/', {
            method: 'POST',
            body: JSON.stringify(moneyRequestData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create money request';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create money request error:', error);
        throw error;
    }
};

/**
 * Update a money request
 */
export const updateMoneyRequest = async (moneyRequestId, moneyRequestData) => {
    try {
        const response = await apiRequest(`/finance/money-requests/${moneyRequestId}/details/`, {
            method: 'PUT',
            body: JSON.stringify(moneyRequestData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update money request';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Update money request error:', error);
        throw error;
    }
};

/**
 * Loans API functions
 */

/**
 * Create a new loan
 */
export const createLoan = async (loanData) => {
    try {
        const response = await apiRequest('/loans/', {
            method: 'POST',
            body: JSON.stringify(loanData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create loan';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create loan error:', error);
        throw error;
    }
};

/**
 * Get all loans
 */
export const getLoans = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.direction) queryParams.append('direction', params.direction);
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/loans/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch loans');
        }

        return await response.json();
    } catch (error) {
        console.error('Get loans error:', error);
        throw error;
    }
};

/**
 * Get loan details with transactions
 */
export const getLoanDetails = async (loanId) => {
    try {
        const response = await apiRequest(`/loans/${loanId}/details/`, {
            method: 'GET',
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch loan details');
        }

        return await response.json();
    } catch (error) {
        console.error('Get loan details error:', error);
        throw error;
    }
};

/**
 * Create a loan transaction
 */
export const createLoanTransaction = async (loanId, transactionData) => {
    try {
        const response = await apiRequest(`/loans/${loanId}/transactions/`, {
            method: 'POST',
            body: JSON.stringify(transactionData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create transaction';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create loan transaction error:', error);
        throw error;
    }
};

/**
 * Events/Calendar API functions
 */

/**
 * Get all events
 */
export const getEvents = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.date) queryParams.append('date', params.date);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/events/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch events');
        }

        return await response.json();
    } catch (error) {
        console.error('Get events error:', error);
        throw error;
    }
};

/**
 * Create a new event
 */
export const createEvent = async (eventData) => {
    try {
        const response = await apiRequest('/events/', {
            method: 'POST',
            body: JSON.stringify(eventData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create event';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create event error:', error);
        throw error;
    }
};

/**
 * Update an event
 */
export const updateEvent = async (eventId, eventData) => {
    try {
        const response = await apiRequest(`/events/${eventId}/details/`, {
            method: 'PUT',
            body: JSON.stringify(eventData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update event';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Update event error:', error);
        throw error;
    }
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId) => {
    try {
        const response = await apiRequest(`/events/${eventId}/details/`, {
            method: 'DELETE',
        });
        
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to delete event');
        }

        return true;
    } catch (error) {
        console.error('Delete event error:', error);
        throw error;
    }
};

/**
 * Inventory API functions
 */

/**
 * Get all inventory items
 */
export const getInventoryItems = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/inventory/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch inventory items');
        }

        return await response.json();
    } catch (error) {
        console.error('Get inventory items error:', error);
        throw error;
    }
};

/**
 * Create a new inventory item
 */
export const createInventoryItem = async (itemData) => {
    try {
        const response = await apiRequest('/inventory/', {
            method: 'POST',
            body: JSON.stringify(itemData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create inventory item';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create inventory item error:', error);
        throw error;
    }
};

/**
 * Update an inventory item
 */
export const updateInventoryItem = async (itemId, itemData) => {
    try {
        const response = await apiRequest(`/inventory/${itemId}/details/`, {
            method: 'PUT',
            body: JSON.stringify(itemData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update inventory item';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Update inventory item error:', error);
        throw error;
    }
};

/**
 * Delete an inventory item
 */
export const deleteInventoryItem = async (itemId) => {
    try {
        const response = await apiRequest(`/inventory/${itemId}/details/`, {
            method: 'DELETE',
        });
        
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to delete inventory item');
        }

        return true;
    } catch (error) {
        console.error('Delete inventory item error:', error);
        throw error;
    }
};

/**
 * Investments API functions
 */

/**
 * Get all investments
 */
export const getInvestments = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.investment_type) queryParams.append('investment_type', params.investment_type);
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/finance/investments/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch investments');
        }

        return await response.json();
    } catch (error) {
        console.error('Get investments error:', error);
        throw error;
    }
};

/**
 * Create a new investment
 */
export const createInvestment = async (investmentData) => {
    try {
        const response = await apiRequest('/finance/investments/', {
            method: 'POST',
            body: JSON.stringify(investmentData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create investment';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create investment error:', error);
        throw error;
    }
};

/**
 * Update an investment
 */
export const updateInvestment = async (investmentId, investmentData) => {
    try {
        const response = await apiRequest(`/finance/investments/${investmentId}/details/`, {
            method: 'PUT',
            body: JSON.stringify(investmentData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update investment';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Update investment error:', error);
        throw error;
    }
};

/**
 * Delete an investment
 */
export const deleteInvestment = async (investmentId) => {
    try {
        const response = await apiRequest(`/finance/investments/${investmentId}/details/`, {
            method: 'DELETE',
        });
        
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to delete investment');
        }

        return true;
    } catch (error) {
        console.error('Delete investment error:', error);
        throw error;
    }
};

/**
 * Forms API functions
 */

/**
 * Get all forms
 */
export const getForms = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/forms/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch forms');
        }

        return await response.json();
    } catch (error) {
        console.error('Get forms error:', error);
        throw error;
    }
};

/**
 * Create a new form
 */
export const createForm = async (formData) => {
    try {
        const response = await apiRequest('/forms/', {
            method: 'POST',
            body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create form';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create form error:', error);
        throw error;
    }
};

/**
 * Get form details
 */
export const getFormDetails = async (formId) => {
    try {
        const response = await apiRequest(`/forms/${formId}/`, {
            method: 'GET',
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch form details');
        }

        return await response.json();
    } catch (error) {
        console.error('Get form details error:', error);
        throw error;
    }
};

/**
 * Get public form (no authentication required)
 */
export const getPublicForm = async (formId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/forms/${formId}/public/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch form');
        }

        return await response.json();
    } catch (error) {
        console.error('Get public form error:', error);
        throw error;
    }
};

/**
 * Update a form
 */
export const updateForm = async (formId, formData) => {
    try {
        const response = await apiRequest(`/forms/${formId}/`, {
            method: 'PUT',
            body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update form';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Update form error:', error);
        throw error;
    }
};

/**
 * Delete a form
 */
export const deleteForm = async (formId) => {
    try {
        const response = await apiRequest(`/forms/${formId}/`, {
            method: 'DELETE',
        });
        
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to delete form');
        }

        return true;
    } catch (error) {
        console.error('Delete form error:', error);
        throw error;
    }
};

/**
 * Submit a form response (no authentication required)
 */
export const submitFormResponse = async (formId, responseData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/forms/${formId}/responses/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(responseData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to submit response';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Submit form response error:', error);
        throw error;
    }
};

/**
 * Get form responses
 */
export const getFormResponses = async (formId, params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/forms/${formId}/responses/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch responses');
        }

        return await response.json();
    } catch (error) {
        console.error('Get form responses error:', error);
        throw error;
    }
};

/**
 * Delete a form response
 */
export const deleteFormResponse = async (formId, responseId) => {
    try {
        const response = await apiRequest(`/forms/${formId}/responses/${responseId}/`, {
            method: 'DELETE',
        });
        
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to delete response');
        }

        return true;
    } catch (error) {
        console.error('Delete form response error:', error);
        throw error;
    }
};

/**
 * Scheduling API functions
 */

/**
 * Get all event types
 */
export const getEventTypes = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/scheduling/event-types/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch event types');
        }

        return await response.json();
    } catch (error) {
        console.error('Get event types error:', error);
        throw error;
    }
};

/**
 * Create a new event type
 */
export const createEventType = async (eventTypeData) => {
    try {
        const response = await apiRequest('/scheduling/event-types/', {
            method: 'POST',
            body: JSON.stringify(eventTypeData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create event type';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create event type error:', error);
        throw error;
    }
};

/**
 * Update an event type
 */
export const updateEventType = async (eventTypeId, eventTypeData) => {
    try {
        const response = await apiRequest(`/scheduling/event-types/${eventTypeId}/`, {
            method: 'PUT',
            body: JSON.stringify(eventTypeData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to update event type';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Update event type error:', error);
        throw error;
    }
};

/**
 * Delete an event type
 */
export const deleteEventType = async (eventTypeId) => {
    try {
        const response = await apiRequest(`/scheduling/event-types/${eventTypeId}/`, {
            method: 'DELETE',
        });
        
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to delete event type');
        }

        return true;
    } catch (error) {
        console.error('Delete event type error:', error);
        throw error;
    }
};

/**
 * Get availability slots for a specific user (public endpoint — used by the booking page).
 * Passes the owner's user UUID as a query param so the guest visitor gets
 * the right owner's slots without needing to be authenticated themselves.
 */
export const getAvailabilitySlotsForUser = async (userId, params = {}) => {
    try {
        const queryParams = new URLSearchParams({ user: userId });
        if (params.day_of_week) queryParams.append('day_of_week', params.day_of_week);

        const response = await fetch(
            `${API_BASE_URL}/scheduling/availability-slots/?${queryParams.toString()}`,
            {
                method: 'GET',
                headers: { 'Accept': '*/*' },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch availability slots');
        }

        return await response.json();
    } catch (error) {
        console.error('Get availability slots for user error:', error);
        throw error;
    }
};

/**
 * Get event type details (public endpoint, no authentication required)
 */
export const getEventTypeDetails = async (eventTypeId) => {
    try {
        // Public endpoint — no authentication required, no Content-Type on a GET
        const response = await fetch(`${API_BASE_URL}/scheduling/event-types/${eventTypeId}/details`, {
            method: 'GET',
            headers: {
                'Accept': '*/*',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch event type details');
        }

        return await response.json();
    } catch (error) {
        console.error('Get event type details error:', error);
        throw error;
    }
};

/**
 * Create an event booking (public endpoint, no authentication required)
 */
export const createEventBooking = async (bookingData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/scheduling/create-event-booking/`, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 
                               errorData.message || 
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create booking';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create event booking error:', error);
        throw error;
    }
};

/**
 * Get all event bookings (authenticated endpoint)
 */
export const getEventBookings = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.event) queryParams.append('event', params.event);
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page);
        
        const queryString = queryParams.toString();
        const url = `/scheduling/event-bookings/${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch bookings');
        }

        return await response.json();
    } catch (error) {
        console.error('Get event bookings error:', error);
        throw error;
    }
};

/**
 * Get availability slots for the authenticated user
 */
export const getAvailabilitySlots = async (params = {}) => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.day_of_week) queryParams.append('day_of_week', params.day_of_week);
        if (params.page) queryParams.append('page', params.page);

        const queryString = queryParams.toString();
        const url = `/scheduling/availability-slots/${queryString ? `?${queryString}` : ''}`;

        const response = await apiRequest(url, { method: 'GET' });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch availability slots');
        }

        return await response.json();
    } catch (error) {
        console.error('Get availability slots error:', error);
        throw error;
    }
};

/**
 * Create an availability slot for the authenticated user
 */
export const createAvailabilitySlot = async (slotData) => {
    try {
        const response = await apiRequest('/scheduling/availability-slots/', {
            method: 'POST',
            body: JSON.stringify(slotData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail ||
                               errorData.message ||
                               errorData.error ||
                               Object.values(errorData).flat().join(', ') ||
                               'Failed to create availability slot';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Create availability slot error:', error);
        throw error;
    }
};

// Export token management functions
export { getAccessToken, getRefreshToken, setTokens, clearTokens, refreshAccessToken };
