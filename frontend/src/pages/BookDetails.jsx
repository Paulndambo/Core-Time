import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    BookOpen, 
    User, 
    Calendar, 
    DollarSign, 
    FileText,
    Star,
    Trash2,
    Edit,
    Plus,
    AlertCircle
} from 'lucide-react';
import { getBookDetails, createBookReview, updateBookReview, deleteBookReview as deleteReviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import Modal from '../components/Modal';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState(null);
    const [editingReview, setEditingReview] = useState(null);
    const [newReview, setNewReview] = useState({
        rating: 5,
        review_text: ''
    });

    useEffect(() => {
        fetchBookDetails();
    }, [id]);

    const fetchBookDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const bookData = await getBookDetails(id);
            setBook(bookData);
        } catch (error) {
            console.error('Error fetching book details:', error);
            setError(error.message || 'Failed to load book details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Reading':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Completed':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getBookColor = (bookId) => {
        const colors = ['bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-yellow-600', 'bg-purple-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600', 'bg-emerald-600', 'bg-orange-600'];
        const index = parseInt(bookId) % colors.length;
        return colors[index] || colors[0];
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!newReview.review_text.trim()) {
            setReviewError('Please enter a review');
            return;
        }

        setIsSubmitting(true);
        setReviewError(null);

        try {
            // Get user ID - try multiple possible field names
            const userId = user?.id || user?.user_id || user?.uuid || user?.pk;
            
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }

            const reviewData = {
                book: parseInt(id),
                user: String(userId),
                rating: parseInt(newReview.rating),
                review_text: newReview.review_text.trim()
            };

            if (editingReview) {
                // Update existing review
                await updateBookReview(editingReview.id, reviewData);
            } else {
                // Create new review
                await createBookReview(reviewData);
            }
            
            // Refresh book details to show the updated review
            await fetchBookDetails();
            
            // Reset form and close modal
            setNewReview({ rating: 5, review_text: '' });
            setEditingReview(null);
            setIsReviewModalOpen(false);
        } catch (error) {
            console.error('Error saving review:', error);
            setReviewError(error.message || 'Failed to save review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setNewReview({
            rating: review.rating,
            review_text: review.review_text
        });
        setIsReviewModalOpen(true);
        setReviewError(null);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteReviewAPI(reviewId);
            // Refresh book details to remove the deleted review
            await fetchBookDetails();
        } catch (error) {
            console.error('Error deleting review:', error);
            setError(error.message || 'Failed to delete review. Please try again.');
        }
    };

    const isUserReview = (review) => {
        const userId = user?.id || user?.user_id || user?.uuid || user?.pk;
        return review.user === userId || String(review.user) === String(userId);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-[var(--color-text-muted)]">Loading book details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/library')}
                    className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Library</span>
                </button>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                        <button
                            onClick={fetchBookDetails}
                            className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/library')}
                    className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Library</span>
                </button>
                <div className="text-center py-12">
                    <p className="text-[var(--color-text-muted)]">Book not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/library')}
                    className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Book Details</h1>
                    <p className="text-[var(--color-text-secondary)]">View book information and reviews</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Book Information Card */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <div className={`h-64 ${getBookColor(book.id)} rounded-t-xl flex items-center justify-center mb-6 relative`}>
                            <div className="absolute inset-0 bg-black/10 rounded-t-xl"></div>
                            <BookOpen className="text-white relative z-10" size={64} />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">{book.title}</h2>
                                <p className="text-lg text-[var(--color-text-secondary)] flex items-center gap-2">
                                    <User size={16} />
                                    {book.author}
                                </p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--color-text-muted)]">Status</span>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(book.status)}`}>
                                        {book.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                                        <FileText size={14} />
                                        Pages
                                    </span>
                                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{book.pages || 0}</span>
                                </div>
                                {book.cost && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                                            <DollarSign size={14} />
                                            Cost
                                        </span>
                                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                            {parseFloat(book.cost).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                                        <Calendar size={14} />
                                        Added
                                    </span>
                                    <span className="text-sm text-[var(--color-text-primary)]">
                                        {format(new Date(book.created_at), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-border)]">
                            <div>
                                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Reviews</h3>
                                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                    {book.book_reviews?.length || 0} {book.book_reviews?.length === 1 ? 'review' : 'reviews'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsReviewModalOpen(true)}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <Plus size={18} />
                                <span>Add Review</span>
                            </button>
                        </div>

                        {!book.book_reviews || book.book_reviews.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="mx-auto mb-4 text-[var(--color-text-muted)]" size={48} />
                                <p className="text-lg font-medium text-[var(--color-text-primary)] mb-2">No reviews yet</p>
                                <p className="text-sm text-[var(--color-text-muted)]">Be the first to review this book!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {book.book_reviews.map((review) => (
                                    <div key={review.id} className="border border-[var(--color-border)] rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center">
                                                    <User className="text-[var(--color-accent)]" size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={16}
                                                                    className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                                            {review.rating}/5
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                                        {format(new Date(review.created_at), 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                            {isUserReview(review) && (
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleEditReview(review)}
                                                        className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-secondary)] transition-colors"
                                                        title="Edit review"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                        title="Delete review"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="prose prose-sm max-w-none">
                                            <p className="text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                                                {review.review_text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Review Modal */}
            <Modal
                isOpen={isReviewModalOpen}
                onClose={() => {
                    setIsReviewModalOpen(false);
                    setNewReview({ rating: 5, review_text: '' });
                    setEditingReview(null);
                    setReviewError(null);
                }}
                title={editingReview ? 'Edit Review' : 'Write a Review'}
                size="xl"
            >
                <form onSubmit={handleAddReview} className="p-6 space-y-6">
                    {reviewError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{reviewError}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                            Rating
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setNewReview({ ...newReview, rating })}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={32}
                                        className={rating <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm font-medium text-[var(--color-text-primary)]">
                                {newReview.rating}/5
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Review
                        </label>
                        <textarea
                            required
                            value={newReview.review_text}
                            onChange={(e) => {
                                setNewReview({ ...newReview, review_text: e.target.value });
                                if (reviewError) setReviewError(null);
                            }}
                            className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none resize-y min-h-[150px]"
                            placeholder="Share your thoughts about this book... (Markdown supported)"
                            rows={6}
                        />
                        <p className="text-xs text-[var(--color-text-muted)] mt-2">
                            You can use markdown formatting (e.g., **bold**, *italic*)
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsReviewModalOpen(false);
                                setNewReview({ rating: 5, review_text: '' });
                                setReviewError(null);
                            }}
                            className="flex-1 px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border)] transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {editingReview ? 'Updating...' : 'Submitting...'}
                                </span>
                            ) : (
                                editingReview ? 'Update Review' : 'Submit Review'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default BookDetails;
