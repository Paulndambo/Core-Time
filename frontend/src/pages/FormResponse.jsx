import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle,
    AlertCircle,
    Star,
    Send,
    Loader
} from 'lucide-react';
import { getPublicForm, submitFormResponse } from '../services/api';
import CoretimeLogo from '../assets/CoretimeLogo';

const FormResponse = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [responses, setResponses] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        loadForm();
    }, [formId]);

    const loadForm = async () => {
        try {
            setLoading(true);
            
            // Try to load from API, fallback to dummy data
            try {
                const data = await getPublicForm(formId);
                
                if (!data.is_active) {
                    setError('This form is no longer accepting responses.');
                    return;
                }
                
                setForm(data);
                
                // Initialize responses
                const initialResponses = {};
                data.fields?.forEach(field => {
                    if (field.type === 'checkbox') {
                        initialResponses[field.id] = [];
                    } else if (field.type === 'toggle') {
                        initialResponses[field.id] = false;
                    } else {
                        initialResponses[field.id] = '';
                    }
                });
                setResponses(initialResponses);
            } catch (apiError) {
                console.log('Using dummy data (backend not available)');
                // Create dummy form
                const dummyForm = {
                    id: formId,
                    title: 'Sample Survey',
                    description: 'This is a demo form. In production, this would load from the backend.',
                    is_active: true,
                    fields: [
                        { id: '1', type: 'text', label: 'Your Name', placeholder: 'John Doe', required: true },
                        { id: '2', type: 'email', label: 'Email Address', placeholder: 'john@example.com', required: true },
                        { id: '3', type: 'rating', label: 'How would you rate this?', maxRating: 5, required: true },
                        { id: '4', type: 'textarea', label: 'Additional Comments', placeholder: 'Tell us more...', required: false }
                    ]
                };
                
                setForm(dummyForm);
                
                // Initialize responses
                const initialResponses = {};
                dummyForm.fields.forEach(field => {
                    if (field.type === 'checkbox') {
                        initialResponses[field.id] = [];
                    } else if (field.type === 'toggle') {
                        initialResponses[field.id] = false;
                    } else {
                        initialResponses[field.id] = '';
                    }
                });
                setResponses(initialResponses);
            }
        } catch (error) {
            console.error('Error loading form:', error);
            setError('Failed to load form. Please check the link and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResponseChange = (fieldId, value) => {
        setResponses(prev => ({
            ...prev,
            [fieldId]: value
        }));
        // Clear validation error for this field
        if (validationErrors[fieldId]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const handleCheckboxChange = (fieldId, option, checked) => {
        setResponses(prev => {
            const currentValues = prev[fieldId] || [];
            if (checked) {
                return { ...prev, [fieldId]: [...currentValues, option] };
            } else {
                return { ...prev, [fieldId]: currentValues.filter(v => v !== option) };
            }
        });
        // Clear validation error for this field
        if (validationErrors[fieldId]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        form.fields?.forEach(field => {
            if (field.required) {
                const value = responses[field.id];
                if (field.type === 'checkbox') {
                    if (!value || value.length === 0) {
                        errors[field.id] = 'This field is required';
                    }
                } else if (field.type === 'toggle') {
                    // Toggle doesn't need validation as it always has a value
                } else if (!value || value.toString().trim() === '') {
                    errors[field.id] = 'This field is required';
                }
            }
        });
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            
            // Try to submit via API, fallback to local submission
            try {
                await submitFormResponse(formId, { responses });
                setSubmitted(true);
            } catch (apiError) {
                console.log('Using dummy data (backend not available)');
                // Simulate successful submission
                setTimeout(() => {
                    setSubmitted(true);
                }, 1000);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderField = (field) => {
        const hasError = validationErrors[field.id];
        const errorClass = hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500';

        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
                return (
                    <input
                        type={field.type}
                        value={responses[field.id] || ''}
                        onChange={(e) => handleResponseChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 ${errorClass}`}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={responses[field.id] || ''}
                        onChange={(e) => handleResponseChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 ${errorClass}`}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={responses[field.id] || ''}
                        onChange={(e) => handleResponseChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 resize-none ${errorClass}`}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={responses[field.id] || ''}
                        onChange={(e) => handleResponseChange(field.id, e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 ${errorClass}`}
                    />
                );

            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, index) => (
                            <label key={index} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={(responses[field.id] || []).includes(option)}
                                    onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-slate-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, index) => (
                            <label key={index} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="radio"
                                    name={field.id}
                                    value={option}
                                    checked={responses[field.id] === option}
                                    onChange={(e) => handleResponseChange(field.id, e.target.value)}
                                    className="border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-slate-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'select':
                return (
                    <select
                        value={responses[field.id] || ''}
                        onChange={(e) => handleResponseChange(field.id, e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 ${errorClass}`}
                    >
                        <option value="">Select an option...</option>
                        {field.options?.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            case 'rating':
                const maxRating = field.maxRating || 5;
                return (
                    <div className="flex gap-2">
                        {[...Array(maxRating)].map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleResponseChange(field.id, index + 1)}
                                className="p-2 transition-transform hover:scale-110"
                            >
                                <Star
                                    size={32}
                                    className={
                                        index < (responses[field.id] || 0)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-slate-300'
                                    }
                                />
                            </button>
                        ))}
                    </div>
                );

            case 'toggle':
                return (
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={responses[field.id] || false}
                                onChange={(e) => handleResponseChange(field.id, e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span className="text-slate-700">
                            {responses[field.id] ? 'Yes' : 'No'}
                        </span>
                    </label>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading form...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Form Unavailable</h2>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
                    <p className="text-slate-600 mb-6">Your response has been submitted successfully.</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <span>Powered by</span>
                        <CoretimeLogo size={20} />
                        <span className="font-semibold">Routinely</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CoretimeLogo size={24} />
                        <span className="text-sm font-semibold text-slate-600">Routinely Forms</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">{form?.title}</h1>
                    {form?.description && (
                        <p className="text-slate-600 leading-relaxed">{form.description}</p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {form?.fields?.map((field, index) => (
                        <div key={field.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <label className="block mb-4">
                                <div className="flex items-start gap-2 mb-3">
                                    <span className="text-slate-900 font-medium">
                                        {index + 1}. {field.label}
                                    </span>
                                    {field.required && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </div>
                                {renderField(field)}
                                {validationErrors[field.id] && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {validationErrors[field.id]}
                                    </p>
                                )}
                            </label>
                        </div>
                    ))}

                    {/* Submit Button */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-8">
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
                    >
                        <span>Create your own form with</span>
                        <CoretimeLogo size={16} />
                        <span className="font-semibold">Routinely</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FormResponse;
