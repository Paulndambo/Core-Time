import React, { useState, useEffect } from 'react';
import { Plus, Users, Mail, Phone, Calendar, Edit2, Trash2, X, Save, Search, Heart, User, Sparkles, Gift, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

const Family = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [familyMembers, setFamilyMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [newMember, setNewMember] = useState({
        first_name: '',
        last_name: '',
        relationship: 'Sibling',
        email: '',
        phone: '',
        birthday: '',
        notes: ''
    });

    const relationships = [
        'Parent',
        'Child',
        'Sibling',
        'Spouse',
        'Partner',
        'Grandparent',
        'Grandchild',
        'Aunt/Uncle',
        'Niece/Nephew',
        'Cousin',
        'Other'
    ];

    // Load family members from localStorage on mount
    useEffect(() => {
        loadFamilyMembers();
    }, []);

    // Auto-dismiss success message
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const loadFamilyMembers = () => {
        setIsLoading(true);
        try {
            const stored = localStorage.getItem('familyMembers');
            if (stored) {
                setFamilyMembers(JSON.parse(stored));
            }
        } catch (err) {
            console.error('Error loading family members:', err);
            setError('Failed to load family members');
        } finally {
            setIsLoading(false);
        }
    };

    const saveFamilyMembers = (members) => {
        try {
            localStorage.setItem('familyMembers', JSON.stringify(members));
            setFamilyMembers(members);
        } catch (err) {
            console.error('Error saving family members:', err);
            setError('Failed to save family members');
        }
    };

    const handleAddOrUpdateMember = (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (editingMember) {
                // Update existing member
                const updatedMembers = familyMembers.map(member =>
                    member.id === editingMember.id
                        ? { ...newMember, id: editingMember.id, created_at: member.created_at }
                        : member
                );
                saveFamilyMembers(updatedMembers);
                setSuccess('Family member updated successfully!');
            } else {
                // Add new member
                const memberToAdd = {
                    ...newMember,
                    id: Date.now().toString(),
                    created_at: new Date().toISOString()
                };
                saveFamilyMembers([...familyMembers, memberToAdd]);
                setSuccess('Family member added successfully!');
            }

            handleCloseModal();
        } catch (err) {
            console.error('Error saving family member:', err);
            setError('Failed to save family member. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditMember = (member) => {
        setEditingMember(member);
        setNewMember({
            first_name: member.first_name,
            last_name: member.last_name,
            relationship: member.relationship,
            email: member.email || '',
            phone: member.phone || '',
            birthday: member.birthday || '',
            notes: member.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (memberToDelete) {
            const updatedMembers = familyMembers.filter(member => member.id !== memberToDelete.id);
            saveFamilyMembers(updatedMembers);
            setSuccess('Family member removed successfully!');
            setIsDeleteModalOpen(false);
            setMemberToDelete(null);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMember(null);
        setNewMember({
            first_name: '',
            last_name: '',
            relationship: 'Sibling',
            email: '',
            phone: '',
            birthday: '',
            notes: ''
        });
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMember(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError(null);
    };

    const filteredMembers = familyMembers.filter(member => {
        const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
        const relationship = member.relationship.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || relationship.includes(search);
    });

    const getInitials = (firstName, lastName) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getAvatarGradient = (firstName, lastName) => {
        const colors = [
            'from-indigo-500 to-purple-600',
            'from-pink-500 to-rose-600',
            'from-blue-500 to-cyan-600',
            'from-emerald-500 to-teal-600',
            'from-amber-500 to-orange-600',
            'from-violet-500 to-purple-600',
            'from-red-500 to-pink-600',
            'from-green-500 to-emerald-600',
        ];
        const hash = (firstName + lastName).split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        return colors[hash % colors.length];
    };

    const formatBirthday = (birthday) => {
        if (!birthday) return null;
        const date = new Date(birthday);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const calculateAge = (birthday) => {
        if (!birthday) return null;
        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const getUpcomingBirthdays = () => {
        const today = new Date();
        const next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);
        
        return familyMembers.filter(member => {
            if (!member.birthday) return false;
            const birthday = new Date(member.birthday);
            const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
            if (thisYearBirthday < today) {
                thisYearBirthday.setFullYear(today.getFullYear() + 1);
            }
            return thisYearBirthday >= today && thisYearBirthday <= next30Days;
        }).length;
    };

    const getRelationshipColor = (relationship) => {
        const colors = {
            'Parent': 'bg-purple-100 text-purple-700 border-purple-200',
            'Child': 'bg-pink-100 text-pink-700 border-pink-200',
            'Sibling': 'bg-blue-100 text-blue-700 border-blue-200',
            'Spouse': 'bg-red-100 text-red-700 border-red-200',
            'Partner': 'bg-rose-100 text-rose-700 border-rose-200',
            'Grandparent': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'Grandchild': 'bg-teal-100 text-teal-700 border-teal-200',
            'Aunt/Uncle': 'bg-green-100 text-green-700 border-green-200',
            'Niece/Nephew': 'bg-cyan-100 text-cyan-700 border-cyan-200',
            'Cousin': 'bg-amber-100 text-amber-700 border-amber-200',
            'Other': 'bg-slate-100 text-slate-700 border-slate-200'
        };
        return colors[relationship] || colors['Other'];
    };

    const getRelationshipIcon = (relationship) => {
        const icons = {
            'Parent': '👨‍👩',
            'Child': '👶',
            'Sibling': '👫',
            'Spouse': '💑',
            'Partner': '💑',
            'Grandparent': '👴',
            'Grandchild': '👶',
            'Aunt/Uncle': '👨',
            'Niece/Nephew': '👧',
            'Cousin': '👨',
            'Other': '👤'
        };
        return icons[relationship] || '👤';
    };

    const stats = {
        total: familyMembers.length,
        upcomingBirthdays: getUpcomingBirthdays(),
        withContact: familyMembers.filter(m => m.email || m.phone).length
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-600">Loading family members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <Users className="text-indigo-600" size={28} />
                        </div>
                        Family
                    </h1>
                    <p className="text-slate-600 text-lg">Manage your family members and relationships</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                    <Plus size={18} />
                    Add Family Member
                </button>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 size={18} className="flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Statistics Cards */}
            {familyMembers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Total Members</h3>
                            <Users className="text-indigo-600" size={20} />
                        </div>
                        <p className="text-4xl font-bold text-indigo-900">{stats.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-pink-700 uppercase tracking-wide">Upcoming Birthdays</h3>
                            <Gift className="text-pink-600" size={20} />
                        </div>
                        <p className="text-4xl font-bold text-pink-900">{stats.upcomingBirthdays}</p>
                        <p className="text-xs text-pink-600 mt-1">Next 30 days</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">With Contact Info</h3>
                            <Phone className="text-emerald-600" size={20} />
                        </div>
                        <p className="text-4xl font-bold text-emerald-900">{stats.withContact}</p>
                        <p className="text-xs text-emerald-600 mt-1">Email or phone</p>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            {familyMembers.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or relationship..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-12 w-full text-base py-3 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            )}

            {/* Family Members Grid */}
            {filteredMembers.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-6">
                        <Users size={40} className="text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {searchTerm ? 'No family members found' : 'No family members yet'}
                    </h3>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                        {searchTerm
                            ? 'Try adjusting your search terms or clear the search to see all members'
                            : 'Start building your family tree by adding your first family member'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                            <Plus size={18} />
                            Add Your First Family Member
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map((member, index) => {
                        const age = calculateAge(member.birthday);
                        const gradient = getAvatarGradient(member.first_name, member.last_name);
                        return (
                            <div
                                key={member.id}
                                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Member Header */}
                                <div className="flex items-start gap-4 mb-5">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {getInitials(member.first_name, member.last_name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-slate-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">
                                            {member.first_name} {member.last_name}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${getRelationshipColor(member.relationship)}`}>
                                                <span className="text-base">{getRelationshipIcon(member.relationship)}</span>
                                                {member.relationship}
                                            </span>
                                            {age && (
                                                <span className="text-xs text-slate-500 font-medium">
                                                    Age {age}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Member Details */}
                                <div className="space-y-3 mb-5">
                                    {member.email && (
                                        <a
                                            href={`mailto:${member.email}`}
                                            className="flex items-center gap-3 text-sm text-slate-600 hover:text-indigo-600 transition-colors group/item"
                                        >
                                            <div className="p-1.5 bg-slate-100 rounded-lg group-hover/item:bg-indigo-100 transition-colors">
                                                <Mail size={14} className="text-slate-500 group-hover/item:text-indigo-600" />
                                            </div>
                                            <span className="truncate flex-1">{member.email}</span>
                                        </a>
                                    )}
                                    {member.phone && (
                                        <a
                                            href={`tel:${member.phone}`}
                                            className="flex items-center gap-3 text-sm text-slate-600 hover:text-indigo-600 transition-colors group/item"
                                        >
                                            <div className="p-1.5 bg-slate-100 rounded-lg group-hover/item:bg-indigo-100 transition-colors">
                                                <Phone size={14} className="text-slate-500 group-hover/item:text-indigo-600" />
                                            </div>
                                            <span>{member.phone}</span>
                                        </a>
                                    )}
                                    {member.birthday && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <div className="p-1.5 bg-slate-100 rounded-lg">
                                                <Calendar size={14} className="text-slate-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{formatBirthday(member.birthday)}</div>
                                                {age && (
                                                    <div className="text-xs text-slate-400">Turning {age + 1} this year</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {member.notes && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{member.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleEditMember(member)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105"
                                    >
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(member)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105"
                                    >
                                        <Trash2 size={16} />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingMember ? 'Edit Family Member' : 'Add Family Member'}
                size="lg"
            >
                <form onSubmit={handleAddOrUpdateMember} className="p-6 space-y-5">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={newMember.first_name}
                                onChange={handleInputChange}
                                className="input w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                                placeholder="Enter first name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={newMember.last_name}
                                onChange={handleInputChange}
                                className="input w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                                placeholder="Enter last name"
                                required
                            />
                        </div>
                    </div>

                    {/* Relationship */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Relationship <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="relationship"
                            value={newMember.relationship}
                            onChange={handleInputChange}
                            className="input w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                            required
                        >
                            {relationships.map(rel => (
                                <option key={rel} value={rel}>{rel}</option>
                            ))}
                        </select>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Mail size={14} className="inline mr-1.5 text-slate-400" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={newMember.email}
                                onChange={handleInputChange}
                                className="input w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Phone size={14} className="inline mr-1.5 text-slate-400" />
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={newMember.phone}
                                onChange={handleInputChange}
                                className="input w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    {/* Birthday */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <Calendar size={14} className="inline mr-1.5 text-slate-400" />
                            Birthday
                        </label>
                        <input
                            type="date"
                            name="birthday"
                            value={newMember.birthday}
                            onChange={handleInputChange}
                            className="input w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={newMember.notes}
                            onChange={handleInputChange}
                            className="input w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none"
                            rows="4"
                            placeholder="Add any additional notes or information about this family member..."
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all duration-200 hover:scale-105"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {editingMember ? 'Update Member' : 'Add Member'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setMemberToDelete(null);
                }}
                title="Remove Family Member"
                size="md"
            >
                <div className="p-6">
                    {memberToDelete && (
                        <>
                            <div className="flex items-center gap-4 mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                                    {getInitials(memberToDelete.first_name, memberToDelete.last_name)}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {memberToDelete.first_name} {memberToDelete.last_name}
                                    </p>
                                    <p className="text-sm text-slate-600">{memberToDelete.relationship}</p>
                                </div>
                            </div>
                            <p className="text-slate-700 mb-6">
                                Are you sure you want to remove <span className="font-semibold">{memberToDelete.first_name} {memberToDelete.last_name}</span> from your family list? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setMemberToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Remove Member
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Family;
