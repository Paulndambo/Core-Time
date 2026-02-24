import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Trash2,
    Calendar,
    User,
    Filter,
    Search,
    FileText,
    CheckCircle,
    XCircle,
    Star
} from 'lucide-react';
import { getFormDetails, getFormResponses, deleteFormResponse } from '../services/api';
import Modal from '../components/Modal';

const FormResponses = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [responseToDelete, setResponseToDelete] = useState(null);

    useEffect(() => {
        loadFormAndResponses();
    }, [formId]);

    const loadFormAndResponses = async () => {
        try {
            setLoading(true);
            
            // Try to load from API, fallback to dummy data
            try {
                const [formData, responsesData] = await Promise.all([
                    getFormDetails(formId),
                    getFormResponses(formId)
                ]);
                setForm(formData);
                setResponses(responsesData.results || responsesData || []);
            } catch (apiError) {
                console.log('Using dummy data (backend not available)');
                // Create dummy form and responses
                const dummyForm = {
                    id: formId,
                    title: 'Sample Form',
                    description: 'Demo form with sample responses',
                    fields: [
                        { id: '1', type: 'text', label: 'Your Name', required: true },
                        { id: '2', type: 'email', label: 'Email Address', required: true },
                        { id: '3', type: 'rating', label: 'Rating', maxRating: 5, required: true },
                        { id: '4', type: 'textarea', label: 'Comments', required: false }
                    ]
                };
                
                const dummyResponses = [
                    {
                        id: '1',
                        form: formId,
                        responses: {
                            '1': 'John Smith',
                            '2': 'john@example.com',
                            '3': 5,
                            '4': 'Great experience! Very satisfied with the service.'
                        },
                        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '2',
                        form: formId,
                        responses: {
                            '1': 'Jane Doe',
                            '2': 'jane@example.com',
                            '3': 4,
                            '4': 'Good overall, but could be improved in some areas.'
                        },
                        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '3',
                        form: formId,
                        responses: {
                            '1': 'Bob Johnson',
                            '2': 'bob@example.com',
                            '3': 5,
                            '4': 'Excellent! Exceeded my expectations.'
                        },
                        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    }
                ];
                
                setForm(dummyForm);
                setResponses(dummyResponses);
            }
        } catch (error) {
            console.error('Error loading form responses:', error);
            alert('Failed to load form responses. Please try again.');
            navigate('/forms');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResponse = async () => {
        if (!responseToDelete) return;

        try {
            // Try to delete via API, fallback to local deletion
            try {
                await deleteFormResponse(formId, responseToDelete.id);
            } catch (apiError) {
                console.log('Using dummy data (backend not available)');
            }
            setResponses(responses.filter(r => r.id !== responseToDelete.id));
            setShowDeleteConfirm(false);
            setResponseToDelete(null);
        } catch (error) {
            console.error('Error deleting response:', error);
            alert('Failed to delete response. Please try again.');
        }
    };

    const exportToCSV = () => {
        if (!form || !responses.length) return;

        // Create CSV headers
        const headers = ['Submission Date', ...form.fields.map(f => f.label)];
        
        // Create CSV rows
        const rows = responses.map(response => {
            const row = [new Date(response.created_at).toLocaleString()];
            form.fields.forEach(field => {
                const value = response.responses[field.id];
                if (Array.isArray(value)) {
                    row.push(value.join(', '));
                } else if (typeof value === 'boolean') {
                    row.push(value ? 'Yes' : 'No');
                } else {
                    row.push(value || '');
                }
            });
            return row;
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_responses.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderResponseValue = (field, value) => {
        if (value === null || value === undefined || value === '') {
            return <span className="text-slate-400 italic">No response</span>;
        }

        switch (field.type) {
            case 'checkbox':
                return Array.isArray(value) && value.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {value.map((item, index) => (
                            <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">
                                {item}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-slate-400 italic">None selected</span>
                );

            case 'toggle':
                return (
                    <div className="flex items-center gap-2">
                        {value ? (
                            <>
                                <CheckCircle size={16} className="text-green-500" />
                                <span className="text-green-700 font-medium">Yes</span>
                            </>
                        ) : (
                            <>
                                <XCircle size={16} className="text-red-500" />
                                <span className="text-red-700 font-medium">No</span>
                            </>
                        )}
                    </div>
                );

            case 'rating':
                return (
                    <div className="flex gap-1">
                        {[...Array(field.maxRating || 5)].map((_, index) => (
                            <Star
                                key={index}
                                size={16}
                                className={
                                    index < value
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-300'
                                }
                            />
                        ))}
                        <span className="ml-2 text-sm text-slate-600">({value}/{field.maxRating || 5})</span>
                    </div>
                );

            case 'date':
                return <span className="text-slate-700">{new Date(value).toLocaleDateString()}</span>;

            default:
                return <span className="text-slate-700">{value.toString()}</span>;
        }
    };

    const filteredResponses = responses.filter(response => {
        if (!searchQuery) return true;
        
        const searchLower = searchQuery.toLowerCase();
        return form?.fields?.some(field => {
            const value = response.responses[field.id];
            if (Array.isArray(value)) {
                return value.some(v => v.toLowerCase().includes(searchLower));
            }
            return value?.toString().toLowerCase().includes(searchLower);
        });
    });

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
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate('/forms')}
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-slate-900">{form?.title}</h1>
                            <p className="text-slate-500 mt-1">
                                {responses.length} {responses.length === 1 ? 'response' : 'responses'}
                            </p>
                        </div>
                        <button
                            onClick={exportToCSV}
                            disabled={responses.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search responses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Responses */}
            <div className="flex-1 overflow-auto px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    {filteredResponses.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto text-slate-300 mb-4" size={64} />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {responses.length === 0 ? 'No responses yet' : 'No matching responses'}
                            </h3>
                            <p className="text-slate-500">
                                {responses.length === 0
                                    ? 'Share your form to start collecting responses'
                                    : 'Try a different search term'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredResponses.map((response, index) => (
                                <div
                                    key={response.id}
                                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        {/* Response Header */}
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="text-indigo-600 font-semibold">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Calendar size={14} />
                                                        <span>{formatDate(response.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedResponse(response)}
                                                    className="px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setResponseToDelete(response);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Response Preview - Show first 3 fields */}
                                        <div className="space-y-3">
                                            {form?.fields?.slice(0, 3).map((field) => (
                                                <div key={field.id}>
                                                    <p className="text-sm font-medium text-slate-600 mb-1">
                                                        {field.label}
                                                    </p>
                                                    <div className="text-sm">
                                                        {renderResponseValue(field, response.responses[field.id])}
                                                    </div>
                                                </div>
                                            ))}
                                            {form?.fields?.length > 3 && (
                                                <p className="text-sm text-slate-500 italic">
                                                    +{form.fields.length - 3} more {form.fields.length - 3 === 1 ? 'field' : 'fields'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Response Detail Modal */}
            <Modal
                isOpen={selectedResponse !== null}
                onClose={() => setSelectedResponse(null)}
                title="Response Details"
            >
                {selectedResponse && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500 pb-4 border-b border-slate-200">
                            <Calendar size={14} />
                            <span>Submitted on {formatDate(selectedResponse.created_at)}</span>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {form?.fields?.map((field) => (
                                <div key={field.id}>
                                    <p className="font-medium text-slate-900 mb-2">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </p>
                                    <div className="pl-4">
                                        {renderResponseValue(field, selectedResponse.responses[field.id])}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setResponseToDelete(null);
                }}
                title="Delete Response"
            >
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Are you sure you want to delete this response? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setResponseToDelete(null);
                            }}
                            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteResponse}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FormResponses;
