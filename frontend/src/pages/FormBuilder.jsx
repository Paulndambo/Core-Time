import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Trash2,
    GripVertical,
    Type,
    Mail,
    Phone,
    Calendar,
    CheckSquare,
    Circle,
    List,
    Hash,
    FileText,
    Star,
    ToggleLeft,
    Save,
    Eye,
    ArrowLeft,
    Settings,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { getFormDetails, updateForm } from '../services/api';

const FIELD_TYPES = [
    { type: 'text', label: 'Short Text', icon: Type, description: 'Single line text input' },
    { type: 'textarea', label: 'Long Text', icon: FileText, description: 'Multi-line text input' },
    { type: 'email', label: 'Email', icon: Mail, description: 'Email address input' },
    { type: 'phone', label: 'Phone', icon: Phone, description: 'Phone number input' },
    { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
    { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
    { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, description: 'Multiple selection' },
    { type: 'radio', label: 'Multiple Choice', icon: Circle, description: 'Single selection' },
    { type: 'select', label: 'Dropdown', icon: List, description: 'Dropdown selection' },
    { type: 'rating', label: 'Rating', icon: Star, description: 'Star rating' },
    { type: 'toggle', label: 'Yes/No', icon: ToggleLeft, description: 'Toggle switch' }
];

const FormBuilder = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showFieldTypes, setShowFieldTypes] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        loadForm();
    }, [formId]);

    const loadForm = async () => {
        try {
            setLoading(true);
            
            // Try to load from API, fallback to dummy data
            try {
                const data = await getFormDetails(formId);
                setForm(data);
                setFormTitle(data.title);
                setFormDescription(data.description || '');
                setIsActive(data.is_active);
                setFields(data.fields || []);
            } catch (apiError) {
                console.log('Using dummy data (backend not available)');
                // Create dummy form based on formId
                const dummyForm = {
                    id: formId,
                    title: 'Sample Form',
                    description: 'This is a sample form for demonstration',
                    is_active: true,
                    fields: [],
                    created_at: new Date().toISOString()
                };
                setForm(dummyForm);
                setFormTitle(dummyForm.title);
                setFormDescription(dummyForm.description);
                setIsActive(dummyForm.is_active);
                setFields(dummyForm.fields);
            }
        } catch (error) {
            console.error('Error loading form:', error);
            alert('Failed to load form. Please try again.');
            navigate('/forms');
        } finally {
            setLoading(false);
        }
    };

    const addField = (fieldType) => {
        const newField = {
            id: Date.now().toString(),
            type: fieldType.type,
            label: fieldType.label,
            placeholder: '',
            required: false,
            options: fieldType.type === 'checkbox' || fieldType.type === 'radio' || fieldType.type === 'select'
                ? ['Option 1', 'Option 2']
                : [],
            maxRating: fieldType.type === 'rating' ? 5 : undefined
        };
        setFields([...fields, newField]);
        setEditingField(newField.id);
        setShowFieldTypes(false);
    };

    const updateField = (fieldId, updates) => {
        setFields(fields.map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
        ));
    };

    const deleteField = (fieldId) => {
        setFields(fields.filter(field => field.id !== fieldId));
        if (editingField === fieldId) {
            setEditingField(null);
        }
    };

    const moveField = (fieldId, direction) => {
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return;
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= fields.length) return;

        const newFields = [...fields];
        [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
        setFields(newFields);
    };

    const addOption = (fieldId) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field) return;
        
        const newOption = `Option ${(field.options?.length || 0) + 1}`;
        updateField(fieldId, {
            options: [...(field.options || []), newOption]
        });
    };

    const updateOption = (fieldId, optionIndex, value) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field) return;
        
        const newOptions = [...(field.options || [])];
        newOptions[optionIndex] = value;
        updateField(fieldId, { options: newOptions });
    };

    const deleteOption = (fieldId, optionIndex) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field || !field.options) return;
        
        const newOptions = field.options.filter((_, i) => i !== optionIndex);
        updateField(fieldId, { options: newOptions });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const formData = {
                title: formTitle,
                description: formDescription,
                is_active: isActive,
                fields: fields
            };
            
            // Try to save via API, fallback to local save
            try {
                await updateForm(formId, formData);
                alert('Form saved successfully!');
            } catch (apiError) {
                console.log('Using dummy data (backend not available)');
                // Simulate successful save
                alert('Form saved successfully! (Demo mode - changes are not persisted)');
            }
        } catch (error) {
            console.error('Error saving form:', error);
            alert('Failed to save form. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = () => {
        // Open form in new tab
        window.open(`/forms/${formId}/respond`, '_blank');
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
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/forms')}
                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="text-xl font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 -ml-2"
                                    placeholder="Form Title"
                                />
                                <p className="text-sm text-slate-500 ml-2">Form Builder</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-slate-700">Active</span>
                            </label>
                            <button
                                onClick={handlePreview}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                            >
                                <Eye size={18} />
                                Preview
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Builder Content */}
            <div className="flex-1 overflow-auto px-6 py-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Form Description */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Form Description
                        </label>
                        <textarea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Add a description to help respondents understand the purpose of this form..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                    </div>

                    {/* Fields */}
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className={`bg-white rounded-xl border-2 transition-all ${
                                editingField === field.id
                                    ? 'border-indigo-500 shadow-lg'
                                    : 'border-slate-200'
                            }`}
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex flex-col gap-1 pt-2">
                                        <button
                                            onClick={() => moveField(field.id, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <GripVertical size={18} className="text-slate-400" />
                                        <button
                                            onClick={() => moveField(field.id, 'down')}
                                            disabled={index === fields.length - 1}
                                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {/* Field Label */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                    onFocus={() => setEditingField(field.id)}
                                                    placeholder="Question"
                                                    className="flex-1 text-base font-medium text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none px-2 py-1"
                                                />
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                    {field.type}
                                                </span>
                                            </div>

                                            {editingField === field.id && (
                                                <input
                                                    type="text"
                                                    value={field.placeholder || ''}
                                                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                    placeholder="Placeholder text (optional)"
                                                    className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            )}
                                        </div>

                                        {/* Field Options (for checkbox, radio, select) */}
                                        {(field.type === 'checkbox' || field.type === 'radio' || field.type === 'select') && editingField === field.id && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Options</label>
                                                {field.options?.map((option, optionIndex) => (
                                                    <div key={optionIndex} className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                        <button
                                                            onClick={() => deleteOption(field.id, optionIndex)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addOption(field.id)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                                >
                                                    + Add Option
                                                </button>
                                            </div>
                                        )}

                                        {/* Rating Max Value */}
                                        {field.type === 'rating' && editingField === field.id && (
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                                    Maximum Rating
                                                </label>
                                                <input
                                                    type="number"
                                                    min="3"
                                                    max="10"
                                                    value={field.maxRating || 5}
                                                    onChange={(e) => updateField(field.id, { maxRating: parseInt(e.target.value) })}
                                                    className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        )}

                                        {/* Field Settings */}
                                        {editingField === field.id && (
                                            <div className="flex items-center gap-4 pt-2">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-slate-700">Required</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => deleteField(field.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Field Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFieldTypes(!showFieldTypes)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-slate-600 hover:text-indigo-600 font-medium"
                        >
                            <Plus size={20} />
                            Add Field
                        </button>

                        {/* Field Types Dropdown */}
                        {showFieldTypes && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
                                <div className="p-2 grid grid-cols-2 gap-2">
                                    {FIELD_TYPES.map((fieldType) => {
                                        const Icon = fieldType.icon;
                                        return (
                                            <button
                                                key={fieldType.type}
                                                onClick={() => addField(fieldType)}
                                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                                            >
                                                <div className="p-2 bg-indigo-50 rounded-lg">
                                                    <Icon size={18} className="text-indigo-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 text-sm">
                                                        {fieldType.label}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {fieldType.description}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;
