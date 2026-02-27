import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Plus,
    Search,
    Trash2,
    CheckCircle,
    Clock,
    Book,
    Star,
    AlertCircle,
    DollarSign,
    Eye,
    Edit
} from 'lucide-react';
import { getBooks, createBook, patchBook, deleteBook as deleteBookAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { formatCurrency } from '../constants/currency';

// Generate a consistent color for a book based on its ID
const getBookColor = (bookId) => {
    const colors = ['bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-yellow-600', 'bg-purple-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600', 'bg-emerald-600', 'bg-orange-600'];
    // Use book ID to consistently assign a color
    const index = parseInt(bookId) % colors.length;
    return colors[index] || colors[0];
};

const Library = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [newBook, setNewBook] = useState({ 
        title: '', 
        author: '', 
        pages: '', 
        cost: '',
        status: 'Want to Read' 
    });
    const [editingBook, setEditingBook] = useState(null);

    // Fetch books on component mount
    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getBooks();
            // Handle paginated response
            const booksData = response.results || response;
            
            // Map API response to UI format
            const mappedBooks = booksData.map(book => ({
                ...book,
                coverColor: getBookColor(book.id),
                rating: 0 // Rating not in API response, default to 0
            }));
            
            setBooks(mappedBooks);
        } catch (error) {
            console.error('Error fetching books:', error);
            setError(error.message || 'Failed to load books. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || book.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: books.length,
        reading: books.filter(b => b.status === 'Reading').length,
        completed: books.filter(b => b.status === 'Completed').length
    };

    const openAddBookModal = () => {
        setEditingBook(null);
        setNewBook({
            title: '',
            author: '',
            pages: '',
            cost: '',
            status: 'Want to Read'
        });
        setIsModalOpen(true);
    };

    const openEditBookModal = (book) => {
        setEditingBook(book);
        setNewBook({
            title: book.title || '',
            author: book.author || '',
            pages: book.pages ? String(book.pages) : '',
            cost: book.cost ? String(book.cost) : '',
            status: book.status || 'Want to Read'
        });
        setIsModalOpen(true);
    };

    const handleSaveBook = async (e) => {
        e.preventDefault();
        if (!newBook.title || !newBook.author) return;

        setIsSaving(true);
        setError(null);

        try {
            // Get user ID - try multiple possible field names
            const userId = user?.id || user?.user_id || user?.uuid || user?.pk;
            
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }

            const bookData = {
                title: newBook.title.trim(),
                author: newBook.author.trim(),
                pages: parseInt(newBook.pages) || 0,
                cost: newBook.cost ? String(newBook.cost) : '0', // Ensure cost is a string
                status: newBook.status,
                user: String(userId) // Ensure user ID is a string
            };

            if (editingBook) {
                const updatedBook = await patchBook(editingBook.id, bookData);

                const updatedBookWithColor = {
                    ...updatedBook,
                    coverColor: getBookColor(updatedBook.id),
                    rating: editingBook.rating ?? 0
                };

                setBooks(books.map(b => b.id === editingBook.id ? updatedBookWithColor : b));
            } else {
                console.log('Creating book with data:', bookData); // Debug log

                const createdBook = await createBook(bookData);
                
                // Add the new book to the list with UI formatting
                const newBookWithColor = {
                    ...createdBook,
                    coverColor: getBookColor(createdBook.id),
                    rating: 0
                };
                
                setBooks([...books, newBookWithColor]);
            }

            setNewBook({ title: '', author: '', pages: '', cost: '', status: 'Want to Read' });
            setEditingBook(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving book:', error);
            setError(error.message || 'Failed to save book. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBook = async (id) => {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            await deleteBookAPI(id);
            setBooks(books.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error deleting book:', error);
            setError(error.message || 'Failed to delete book. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-[var(--color-text-muted)]">Loading library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Library</h1>
                    <p className="text-[var(--color-text-secondary)]">Track your reading journey.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-[var(--color-bg-tertiary)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)] w-full md:w-64"
                        />
                    </div>
                    <button onClick={openAddBookModal} className="btn btn-primary gap-2">
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Book</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                        <Book size={24} />
                    </div>
                    <span className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{stats.total}</span>
                    <span className="text-sm text-[var(--color-text-muted)] font-medium">Total Books</span>
                </div>
                <div className="card p-5 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-3">
                        <Clock size={24} />
                    </div>
                    <span className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{stats.reading}</span>
                    <span className="text-sm text-[var(--color-text-muted)] font-medium">Reading Now</span>
                </div>
                <div className="card p-5 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                        <CheckCircle size={24} />
                    </div>
                    <span className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{stats.completed}</span>
                    <span className="text-sm text-[var(--color-text-muted)] font-medium">Books Read</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['All', 'Reading', 'Want to Read', 'Completed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status
                                ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)]'
                                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Books Table */}
            <div className="card overflow-hidden">
                <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">All Books</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">{filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}</p>
                </div>
                <div className="overflow-x-auto">
                    {filteredBooks.length === 0 ? (
                        <div className="text-center py-16 text-[var(--color-text-muted)]">
                            <BookOpen className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" size={56} />
                            <p className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No books found</p>
                            <p className="text-sm">Add your first book to get started!</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg-secondary)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Author</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Pages</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Cost</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {filteredBooks.map((book) => (
                                    <tr key={book.id} className="group hover:bg-[var(--color-bg-tertiary)] transition-colors duration-150">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg ${book.coverColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                    <BookOpen className="text-white" size={22} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[var(--color-text-primary)] text-base mb-0.5">{book.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[var(--color-text-secondary)] font-medium">{book.author}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[var(--color-text-secondary)]">{book.pages || 0} <span className="text-[var(--color-text-muted)]">pages</span></span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {book.cost ? (
                                                <div className="flex items-center gap-1.5 text-[var(--color-text-primary)] font-semibold">
                                                    <DollarSign size={16} className="text-[var(--color-text-muted)]" />
                                                    <span>{parseFloat(book.cost).toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[var(--color-text-muted)]">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span
                                                className={`inline-flex items-center text-xs font-semibold border rounded-full px-3.5 py-1.5 ${
                                                    book.status === 'Reading'
                                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                        : book.status === 'Completed'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-gray-50 text-gray-700 border-gray-200'
                                                }`}
                                            >
                                                {book.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => navigate(`/library/books/${book.id}`)}
                                                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150 hover:scale-105"
                                                    title="View details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openEditBookModal(book)}
                                                    className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-150 hover:scale-105"
                                                    title="Edit book"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBook(book.id)}
                                                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 hover:scale-105"
                                                    title="Delete book"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add/Edit Book Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBook(null);
                    setNewBook({ title: '', author: '', pages: '', cost: '', status: 'Want to Read' });
                }}
                title={editingBook ? "Edit Book" : "Add New Book"}
                size="xl"
            >
                <form onSubmit={handleSaveBook} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newBook.title}
                                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                                <input
                                    type="text"
                                    required
                                    value={newBook.author}
                                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pages</label>
                                    <input
                                        type="number"
                                        value={newBook.pages}
                                        onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., 304"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newBook.cost}
                                        onChange={(e) => setNewBook({ ...newBook, cost: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., 3500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={newBook.status}
                                    onChange={(e) => setNewBook({ ...newBook, status: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Want to Read">Want to Read</option>
                                    <option value="Reading">Reading</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full btn btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        {editingBook ? 'Saving changes...' : 'Adding...'}
                                    </span>
                                ) : (
                                    editingBook ? 'Save Changes' : 'Add to Library'
                                )}
                            </button>
                        </form>
            </Modal>
        </div>
    );
};

export default Library;
