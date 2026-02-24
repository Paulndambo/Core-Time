import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertTriangle, CheckCircle, Search, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../constants/currency';
import Modal from '../components/Modal';
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Inventory = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        item_name: '',
        category: 'Electronics',
        quantity: '',
        location: '',
        estimated_value: '',
        status: 'Available'
    });

    const categories = ['Electronics', 'Furniture', 'Appliances', 'Supplies', 'Kitchenware', 'Bedding', 'Decor', 'Tools', 'Clothing', 'Books', 'Other'];
    const statusOptions = ['Available', 'Low Stock', 'Out of Stock', 'In Use', 'In Storage'];

    // Fetch inventory on component mount
    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getInventoryItems();
            // Handle paginated response
            const itemsList = data.results || data || [];
            setInventory(itemsList);
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err.message || 'Failed to load inventory items. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddOrUpdateItem = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!user || !user.id) {
            setError('User not found. Please log in again.');
            return;
        }

        setIsSubmitting(true);

        try {
            const userId = user.id || user.user_id || user.uuid || user.pk;
            
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }

            const itemData = {
                user: String(userId),
                item_name: newItem.item_name.trim(),
                category: newItem.category,
                quantity: parseFloat(newItem.quantity),
                location: newItem.location.trim(),
                estimated_value: parseFloat(newItem.estimated_value),
                status: newItem.status
            };

            if (editingItem) {
                // Update existing item
                await updateInventoryItem(editingItem.id, itemData);
            } else {
                // Create new item
                await createInventoryItem(itemData);
            }
            
            // Refresh inventory list
            await fetchInventory();
            
            // Close modal and reset form
            handleCloseModal();
        } catch (err) {
            console.error('Error saving inventory item:', err);
            setError(err.message || 'Failed to save inventory item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setNewItem({
            item_name: item.item_name,
            category: item.category,
            quantity: item.quantity.toString(),
            location: item.location,
            estimated_value: item.estimated_value,
            status: item.status
        });
        setIsModalOpen(true);
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        setError(null);
        try {
            await deleteInventoryItem(itemId);
            await fetchInventory();
        } catch (err) {
            console.error('Error deleting inventory item:', err);
            setError(err.message || 'Failed to delete inventory item. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setNewItem({
            item_name: '',
            category: 'Electronics',
            quantity: '',
            location: '',
            estimated_value: '',
            status: 'Available'
        });
        setError(null);
    };

    const filteredInventory = inventory.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(item => 
        item.status === 'Low Stock' || item.status === 'Out of Stock'
    ).length;
    const totalValue = inventory.reduce((sum, item) => 
        sum + (parseFloat(item.estimated_value || 0) * parseFloat(item.quantity || 0)), 0
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available':
                return 'bg-green-100 text-green-700';
            case 'Low Stock':
                return 'bg-yellow-100 text-yellow-700';
            case 'Out of Stock':
                return 'bg-red-100 text-red-700';
            case 'In Use':
                return 'bg-blue-100 text-blue-700';
            case 'In Storage':
                return 'bg-slate-100 text-slate-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Household Inventory</h1>
                    <p className="text-slate-600">Keep track of your household items and belongings</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchInventory}
                        className="btn btn-secondary gap-2"
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span>Add Item</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600">Total Items</h3>
                        <Package className="text-blue-600" size={20} />
                    </div>
                    {isLoading ? (
                        <div className="h-9 bg-slate-200 animate-pulse rounded"></div>
                    ) : (
                        <p className="text-3xl font-bold text-slate-900">{totalItems}</p>
                    )}
                </div>
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600">Items to Restock</h3>
                        <AlertTriangle className="text-orange-600" size={20} />
                    </div>
                    {isLoading ? (
                        <div className="h-9 bg-slate-200 animate-pulse rounded"></div>
                    ) : (
                        <p className="text-3xl font-bold text-slate-900">{lowStockItems}</p>
                    )}
                </div>
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600">Total Estimated Value</h3>
                        <CheckCircle className="text-green-600" size={20} />
                    </div>
                    {isLoading ? (
                        <div className="h-9 bg-slate-200 animate-pulse rounded"></div>
                    ) : (
                        <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search household items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Household Items */}
            <div className="card">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Household Items</h2>
                </div>
                {isLoading ? (
                    <div className="p-8 text-center">
                        <RefreshCw size={32} className="animate-spin mx-auto text-slate-400 mb-2" />
                        <p className="text-slate-500">Loading inventory...</p>
                    </div>
                ) : filteredInventory.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 mb-4">
                            {searchTerm ? 'No items match your search.' : 'No items in inventory yet. Start tracking your belongings!'}
                        </p>
                        {!searchTerm && (
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="btn btn-primary inline-flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Your First Item
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Item Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Quantity</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Location</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Estimated Value</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredInventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900">{item.item_name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900">{item.quantity}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-700">{item.location}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900">
                                                {formatCurrency(parseFloat(item.estimated_value || 0))}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditItem(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Item Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? 'Edit Inventory Item' : 'Add Household Item'}
                size="xl"
            >
                <form onSubmit={handleAddOrUpdateItem} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Item Name</label>
                        <input
                            type="text"
                            required
                            value={newItem.item_name}
                            onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none"
                            placeholder="e.g., MAC Mini 2015, Coffee Maker"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <select
                                required
                                value={newItem.category}
                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none"
                                disabled={isSubmitting}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none"
                                placeholder="1"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                        <input
                            type="text"
                            required
                            value={newItem.location}
                            onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none"
                            placeholder="e.g., Home Office, Kitchen, Bedroom"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Value</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={newItem.estimated_value}
                                onChange={(e) => setNewItem({ ...newItem, estimated_value: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none"
                                placeholder="50000.00"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <select
                                required
                                value={newItem.status}
                                onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none"
                                disabled={isSubmitting}
                            >
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="flex-1 btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Inventory;
