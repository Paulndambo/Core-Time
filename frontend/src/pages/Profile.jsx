import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, getCurrentUser } from '../services/api';
import {
    User,
    Mail,
    Calendar,
    Edit2,
    Save,
    X,
    CheckCircle,
    AlertCircle,
    Camera,
    Globe,
    Phone,
    MapPin,
    Briefcase,
} from 'lucide-react';

const Profile = () => {
    const { user: authUser, updateUser } = useAuth();
    const [user, setUser] = useState(authUser || {});
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        bio: '',
        location: '',
        website: '',
        company: '',
        date_joined: ''
    });

    // Fetch latest user data
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const userData = await getCurrentUser();
                if (userData) {
                    setUser(userData);
                    setFormData({
                        first_name: userData.first_name || userData.name?.split(' ')[0] || '',
                        last_name: userData.last_name || userData.name?.split(' ').slice(1).join(' ') || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        bio: userData.bio || '',
                        location: userData.location || '',
                        website: userData.website || '',
                        company: userData.company || '',
                        date_joined: userData.date_joined || userData.created_at || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Update form data when user changes
    useEffect(() => {
        if (authUser) {
            setUser(authUser);
            setFormData(prev => ({
                ...prev,
                first_name: authUser.first_name || authUser.name?.split(' ')[0] || prev.first_name,
                last_name: authUser.last_name || authUser.name?.split(' ').slice(1).join(' ') || prev.last_name,
                email: authUser.email || prev.email,
            }));
        }
    }, [authUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (error) setError(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Prepare update data (only include fields that have changed)
            const updateData = {};
            Object.keys(formData).forEach(key => {
                if (formData[key] !== (user[key] || '')) {
                    updateData[key] = formData[key];
                }
            });

            // If name fields changed, also update the full name
            if (updateData.first_name || updateData.last_name) {
                updateData.name = `${formData.first_name} ${formData.last_name}`.trim();
            }

            const updatedUser = await updateUserProfile(updateData);
            
            // Update local state
            setUser(updatedUser);
            
            // Update auth context
            if (updateUser) {
                await updateUser();
            }

            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to current user data
        setFormData({
            first_name: user.first_name || user.name?.split(' ')[0] || '',
            last_name: user.last_name || user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
            location: user.location || '',
            website: user.website || '',
            company: user.company || '',
            date_joined: user.date_joined || user.created_at || ''
        });
        setIsEditing(false);
        setError(null);
        setSuccess(null);
    };

    const getInitials = () => {
        const firstName = formData.first_name || user.first_name || user.name?.split(' ')[0] || '';
        const lastName = formData.last_name || user.last_name || user.name?.split(' ').slice(1).join(' ') || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
    };

    const displayName = () => {
        if (isEditing) {
            return `${formData.first_name} ${formData.last_name}`.trim() || user.name || 'User';
        }
        return user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                        Profile Settings
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Manage your account information and preferences
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Edit2 size={18} />
                        <span>Edit Profile</span>
                    </button>
                )}
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">{success}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="card p-6 text-center">
                        <div className="relative inline-block mb-4">
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={displayName()}
                                    className="w-32 h-32 rounded-full border-4 border-blue-200 object-cover mx-auto shadow-lg"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-lg">
                                    {getInitials()}
                                </div>
                            )}
                            {isEditing && (
                                <button
                                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                                    title="Change profile picture"
                                >
                                    <Camera size={16} />
                                </button>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                            {displayName()}
                        </h2>
                        <p className="text-slate-600 mb-4">{user.email || formData.email}</p>
                        
                        {user.date_joined && (
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-200">
                                <Calendar size={16} />
                                <span>Member since {new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Information */}
                <div className="lg:col-span-2">
                    <div className="card p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                            {isEditing && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <X size={18} />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="btn btn-primary flex items-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        First Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className="input w-full"
                                            placeholder="Enter first name"
                                        />
                                    ) : (
                                        <div className="input w-full bg-slate-50 flex items-center gap-2">
                                            <User size={18} className="text-slate-400" />
                                            <span className="text-slate-900">{user.first_name || user.name?.split(' ')[0] || 'Not set'}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Last Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className="input w-full"
                                            placeholder="Enter last name"
                                        />
                                    ) : (
                                        <div className="input w-full bg-slate-50 flex items-center gap-2">
                                            <User size={18} className="text-slate-400" />
                                            <span className="text-slate-900">{user.last_name || user.name?.split(' ').slice(1).join(' ') || 'Not set'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <div className="input w-full bg-slate-50 flex items-center gap-2">
                                    <Mail size={18} className="text-slate-400" />
                                    <span className="text-slate-900">{user.email || formData.email || 'Not set'}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="input w-full"
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <div className="input w-full bg-slate-50 flex items-center gap-2">
                                        <Phone size={18} className="text-slate-400" />
                                        <span className="text-slate-900">{user.phone || 'Not set'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Location
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="input w-full"
                                        placeholder="Enter location"
                                    />
                                ) : (
                                    <div className="input w-full bg-slate-50 flex items-center gap-2">
                                        <MapPin size={18} className="text-slate-400" />
                                        <span className="text-slate-900">{user.location || 'Not set'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Company
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        className="input w-full"
                                        placeholder="Enter company name"
                                    />
                                ) : (
                                    <div className="input w-full bg-slate-50 flex items-center gap-2">
                                        <Briefcase size={18} className="text-slate-400" />
                                        <span className="text-slate-900">{user.company || 'Not set'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Website */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Website
                                </label>
                                {isEditing ? (
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        className="input w-full"
                                        placeholder="https://example.com"
                                    />
                                ) : (
                                    <div className="input w-full bg-slate-50 flex items-center gap-2">
                                        <Globe size={18} className="text-slate-400" />
                                        {user.website ? (
                                            <a
                                                href={user.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                {user.website}
                                            </a>
                                        ) : (
                                            <span className="text-slate-900">Not set</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Bio
                                </label>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="input w-full min-h-[100px] resize-y"
                                        placeholder="Tell us about yourself..."
                                        rows={4}
                                    />
                                ) : (
                                    <div className="input w-full bg-slate-50 min-h-[100px] p-4">
                                        <p className="text-slate-900 whitespace-pre-wrap">
                                            {user.bio || 'No bio added yet.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
