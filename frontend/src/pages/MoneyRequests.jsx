import React, { useState, useEffect } from 'react';
import {
    Plus,
    RefreshCw,
    ArrowDownLeft,
    ArrowUpLeft,
    CheckCircle,
    XCircle,
    Wallet
} from 'lucide-react';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { getMoneyRequests, createMoneyRequest, updateMoneyRequest } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../constants/currency';

const MoneyRequests = () => {
    const { user } = useAuth();
    const [moneyRequests, setMoneyRequests] = useState([]);
    const [isMoneyRequestModalOpen, setIsMoneyRequestModalOpen] = useState(false);
    const [isMoneyRequestSubmitting, setIsMoneyRequestSubmitting] = useState(false);
    const [moneyRequestError, setMoneyRequestError] = useState(null);
    const [isLoadingMoneyRequests, setIsLoadingMoneyRequests] = useState(false);
    const [newMoneyRequest, setNewMoneyRequest] = useState({
        from_whom: '',
        amount: '',
        direction: 'Incoming',
        status: 'Pending'
    });

    // Fetch money requests on component mount
    useEffect(() => {
        fetchMoneyRequests();
    }, []);

    const fetchMoneyRequests = async () => {
        setIsLoadingMoneyRequests(true);
        setMoneyRequestError(null);
        try {
            const data = await getMoneyRequests();
            const requestsList = data.results || data || [];
            setMoneyRequests(requestsList);
        } catch (err) {
            console.error('Error fetching money requests:', err);
            setMoneyRequestError(err.message || 'Failed to load money requests. Please try again.');
        } finally {
            setIsLoadingMoneyRequests(false);
        }
    };

    const handleAddMoneyRequest = async (e) => {
        e.preventDefault();
        setMoneyRequestError(null);
        
        if (!user || !user.id) {
            setMoneyRequestError('User not found. Please log in again.');
            return;
        }

        setIsMoneyRequestSubmitting(true);

        try {
            const userId = user.id || user.user_id || user.uuid || user.pk;
            
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }

            const moneyRequestData = {
                user: String(userId),
                from_whom: newMoneyRequest.from_whom.trim(),
                amount: parseFloat(newMoneyRequest.amount),
                direction: newMoneyRequest.direction,
                status: newMoneyRequest.status
            };

            await createMoneyRequest(moneyRequestData);
            await fetchMoneyRequests();
            
            setIsMoneyRequestModalOpen(false);
            setNewMoneyRequest({
                from_whom: '',
                amount: '',
                direction: 'Incoming',
                status: 'Pending'
            });
        } catch (err) {
            console.error('Error creating money request:', err);
            setMoneyRequestError(err.message || 'Failed to create money request. Please try again.');
        } finally {
            setIsMoneyRequestSubmitting(false);
        }
    };

    const handleUpdateMoneyRequestStatus = async (requestId, newStatus) => {
        try {
            const request = moneyRequests.find(r => r.id === requestId);
            if (!request) return;

            const userId = user?.id || user?.user_id || user?.uuid || user?.pk;
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }

            const updateData = {
                user: String(userId),
                from_whom: request.from_whom,
                amount: parseFloat(request.amount),
                direction: request.direction,
                status: newStatus
            };

            await updateMoneyRequest(requestId, updateData);
            await fetchMoneyRequests();
        } catch (err) {
            console.error('Error updating money request:', err);
            setMoneyRequestError(err.message || 'Failed to update money request. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'confirmed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'declined':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getDirectionIcon = (direction) => {
        return direction === 'Incoming' ? <ArrowDownLeft size={16} /> : <ArrowUpLeft size={16} />;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Money Requests</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Track and manage your money requests.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchMoneyRequests}
                        className="btn btn-secondary gap-2"
                        disabled={isLoadingMoneyRequests}
                    >
                        <RefreshCw size={16} className={isLoadingMoneyRequests ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setIsMoneyRequestModalOpen(true)}
                        className="btn btn-primary gap-2 shadow-md shadow-indigo-200/50"
                    >
                        <Plus size={16} />
                        New Money Request
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {moneyRequestError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {moneyRequestError}
                </div>
            )}

            {/* Money Requests Table */}
            {isLoadingMoneyRequests ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw size={24} className="animate-spin text-indigo-600" />
                    <span className="ml-3 text-slate-600">Loading money requests...</span>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                    {moneyRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Wallet size={48} className="mb-3 opacity-50" />
                            <p className="text-sm font-medium">No money requests found</p>
                            <p className="text-xs mt-1">Create your first money request to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="text-left text-xs text-slate-400 border-b border-slate-100 bg-slate-50/50">
                                    <tr>
                                        <th className="pb-3 pl-6 font-semibold">From/To</th>
                                        <th className="pb-3 font-semibold">Direction</th>
                                        <th className="pb-3 font-semibold">Amount</th>
                                        <th className="pb-3 font-semibold">Status</th>
                                        <th className="pb-3 font-semibold">Date</th>
                                        <th className="pb-3 pr-6 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-50">
                                    {moneyRequests.map((request) => (
                                        <tr 
                                            key={request.id} 
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="py-4 pl-6 font-semibold text-slate-900">
                                                {request.from_whom}
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${
                                                    request.direction === 'Incoming'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                    {getDirectionIcon(request.direction)}
                                                    {request.direction}
                                                </span>
                                            </td>
                                            <td className="py-4 font-bold text-slate-900">
                                                {formatCurrency(parseFloat(request.amount))}
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-slate-500">
                                                {request.created_at 
                                                    ? format(new Date(request.created_at), 'MMM dd, yyyy')
                                                    : 'N/A'}
                                            </td>
                                            <td className="py-4 pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    {request.status === 'Pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateMoneyRequestStatus(request.id, 'Confirmed')}
                                                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                                                                title="Confirm"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateMoneyRequestStatus(request.id, 'Declined')}
                                                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                                                                title="Decline"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Add Money Request Modal */}
            <Modal
                isOpen={isMoneyRequestModalOpen}
                onClose={() => {
                    setIsMoneyRequestModalOpen(false);
                    setMoneyRequestError(null);
                    setNewMoneyRequest({
                        from_whom: '',
                        amount: '',
                        direction: 'Incoming',
                        status: 'Pending'
                    });
                }}
                title="New Money Request"
                size="xl"
            >
                <form onSubmit={handleAddMoneyRequest} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">From/To</label>
                        <input
                            type="text"
                            required
                            value={newMoneyRequest.from_whom}
                            onChange={(e) => setNewMoneyRequest({ ...newMoneyRequest, from_whom: e.target.value })}
                            className="input"
                            placeholder="e.g., Joshua"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={newMoneyRequest.amount}
                                onChange={(e) => setNewMoneyRequest({ ...newMoneyRequest, amount: e.target.value })}
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Direction</label>
                            <select
                                value={newMoneyRequest.direction}
                                onChange={(e) => setNewMoneyRequest({ ...newMoneyRequest, direction: e.target.value })}
                                className="select"
                            >
                                <option value="Incoming">Incoming</option>
                                <option value="Outgoing">Outgoing</option>
                            </select>
                        </div>
                    </div>
                    {moneyRequestError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {moneyRequestError}
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsMoneyRequestModalOpen(false);
                                setMoneyRequestError(null);
                                setNewMoneyRequest({
                                    from_whom: '',
                                    amount: '',
                                    direction: 'Incoming',
                                    status: 'Pending'
                                });
                            }}
                            className="flex-1 btn btn-secondary"
                            disabled={isMoneyRequestSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 btn btn-primary"
                            disabled={isMoneyRequestSubmitting}
                        >
                            {isMoneyRequestSubmitting ? 'Creating...' : 'Create Request'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MoneyRequests;
