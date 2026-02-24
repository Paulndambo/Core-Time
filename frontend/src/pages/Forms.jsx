import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Share2,
    Eye,
    Copy,
    BarChart3,
    FileText,
    Calendar,
    MoreVertical,
    X,
    ExternalLink
} from 'lucide-react';
import Modal from '../components/Modal';
import { getForms, deleteForm, createForm } from '../services/api';

const Forms = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [formToDelete, setFormToDelete] = useState(null);
    const [newFormTitle, setNewFormTitle] = useState('');
    const [newFormDescription, setNewFormDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            setLoading(true);
            // Use dummy data since backend is not implemented yet
            const dummyForms = [
                {
                    id: '1',
                    title: 'Customer Feedback Survey',
                    description: 'Help us improve our service by sharing your feedback',
                    is_active: true,
                    fields: [
                        { id: '1', type: 'text', label: 'Your Name', required: true },
                        { id: '2', type: 'email', label: 'Email Address', required: true },
                        { id: '3', type: 'rating', label: 'Overall Rating', maxRating: 5, required: true }
                    ],
                    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    response_count: 24
                },
                {
                    id: '2',
                    title: 'Event Registration',
                    description: 'Register for our upcoming annual conference',
                    is_active: true,
                    fields: [
                        { id: '1', type: 'text', label: 'Full Name', required: true },
                        { id: '2', type: 'email', label: 'Email', required: true },
                        { id: '3', type: 'phone', label: 'Phone Number', required: false },
                        { id: '4', type: 'number', label: 'Number of Guests', required: true }
                    ],
                    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    response_count: 47
                },
                {
                    id: '3',
                    title: 'Product Feedback Form',
                    description: 'Share your thoughts about our new product',
                    is_active: false,
                    fields: [
                        { id: '1', type: 'text', label: 'Product Name', required: true },
                        { id: '2', type: 'rating', label: 'Quality Rating', maxRating: 5, required: true },
                        { id: '3', type: 'textarea', label: 'Comments', required: false }
                    ],
                    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                    response_count: 12
                }
            ];
            
            // Try to load from API, fallback to dummy data
            try {
                const data = await getForms();
                setForms(data.results || data || dummyForms);
            } catch (apiError) {
                console.log('Using dummy data (backend not available)');
                setForms(dummyForms);
            }
        } catch (error) {
            console.error('Error loading forms:', error);
            setForms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateForm = async () => {
        if (!newFormTitle.trim()) return;

        try {
            setCreating(true);
            const formData = {
                title: newFormTitle,
                description: newFormDescription,
                fields: [],
                is_active: true
            };
            
            // Try to create via API, fallback to dummy data
            try {
                const newForm = await createForm(formData);
                setForms([newForm, ...forms]);
                setShowCreateModal(false);
                setNewFormTitle('');
                setNewFormDescription('');
                navigate(`/forms/${newForm.id}/edit`);
            } catch (apiError) {
                console.log('Using dummy data (backend not available)');
                // Create dummy form
                const newForm = {
                    id: Date.now().toString(),
                    ...formData,
                    created_at: new Date().toISOString(),
                    response_count: 0
                };
                setForms([newForm, ...forms]);
                setShowCreateModal(false);
                setNewFormTitle('');
                setNewFormDescription('');
                navigate(`/forms/${newForm.id}/edit`);
            }
        } catch (error) {
            console.error('Error creating form:', error);
            alert('Failed to create form. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteForm = async () => {
        if (!formToDelete) return;

        try {
            // Try to delete via API, fallback to local deletion
            try {
                await deleteForm(formToDelete.id);
            } catch (apiError) {
                console.log('Using dummy data (backend not available)');
            }
            setForms(forms.filter(f => f.id !== formToDelete.id));
            setShowDeleteConfirm(false);
            setFormToDelete(null);
        } catch (error) {
            console.error('Error deleting form:', error);
            alert('Failed to delete form. Please try again.');
        }
    };

    const handleShare = (form) => {
        setSelectedForm(form);
        setShowShareModal(true);
    };

    const getFormLink = (form) => {
        return `${window.location.origin}/forms/${form.id}/respond`;
    };

    const copyFormLink = (form) => {
        const link = getFormLink(form);
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const filteredForms = forms.filter(form =>
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getResponseCount = (form) => {
        return form.response_count || 0;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Forms</h1>
                            <p className="text-slate-500 mt-1">Create custom forms and collect data</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <Plus size={18} />
                            Create Form
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mt-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search forms..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Forms Grid */}
            <div className="flex-1 overflow-auto px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    {filteredForms.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto text-slate-300 mb-4" size={64} />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {searchQuery ? 'No forms found' : 'No forms yet'}
                            </h3>
                            <p className="text-slate-500 mb-6">
                                {searchQuery ? 'Try a different search term' : 'Create your first form to start collecting data'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    <Plus size={18} />
                                    Create Form
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredForms.map((form) => (
                                <div
                                    key={form.id}
                                    className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-shadow overflow-hidden group"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-900 truncate mb-1">
                                                    {form.title}
                                                </h3>
                                                {form.description && (
                                                    <p className="text-sm text-slate-500 line-clamp-2">
                                                        {form.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className={`ml-2 px-2 py-1 rounded-lg text-xs font-medium ${
                                                form.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {form.is_active ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <BarChart3 size={14} />
                                                <span>{getResponseCount(form)} responses</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{formatDate(form.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/forms/${form.id}/edit`)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => navigate(`/forms/${form.id}/responses`)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleShare(form)}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                                            >
                                                <Share2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFormToDelete(form);
                                                    setShowDeleteConfirm(true);
                                                }}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Form Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setNewFormTitle('');
                    setNewFormDescription('');
                }}
                title="Create New Form"
            >
                <div className="space-y-6 p-1">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2.5">
                            Form Title *
                        </label>
                        <input
                            type="text"
                            value={newFormTitle}
                            onChange={(e) => setNewFormTitle(e.target.value)}
                            placeholder="e.g., Customer Feedback Survey"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2.5">
                            Description (Optional)
                        </label>
                        <textarea
                            value={newFormDescription}
                            onChange={(e) => setNewFormDescription(e.target.value)}
                            placeholder="Brief description of what this form is for..."
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => {
                                setShowCreateModal(false);
                                setNewFormTitle('');
                                setNewFormDescription('');
                            }}
                            className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateForm}
                            disabled={!newFormTitle.trim() || creating}
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating ? 'Creating...' : 'Create & Edit'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Share Modal */}
            <Modal
                isOpen={showShareModal}
                onClose={() => {
                    setShowShareModal(false);
                    setSelectedForm(null);
                    setCopiedLink(false);
                }}
                title="Share Form"
            >
                {selectedForm && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-600 mb-3">
                                Share this link with anyone to collect responses:
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={getFormLink(selectedForm)}
                                    readOnly
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                />
                                <button
                                    onClick={() => copyFormLink(selectedForm)}
                                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    {copiedLink ? (
                                        <>
                                            <span className="text-sm font-medium">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            <span className="text-sm font-medium">Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="pt-2">
                            <a
                                href={getFormLink(selectedForm)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                <ExternalLink size={14} />
                                Open form in new tab
                            </a>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setFormToDelete(null);
                }}
                title="Delete Form"
            >
                {formToDelete && (
                    <div className="space-y-4">
                        <p className="text-slate-600">
                            Are you sure you want to delete <strong>{formToDelete.title}</strong>? 
                            This will also delete all responses. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setFormToDelete(null);
                                }}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteForm}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                            >
                                Delete Form
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Forms;
