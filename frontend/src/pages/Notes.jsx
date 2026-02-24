import React, { useState, useRef, useEffect } from 'react';
import {
    Plus,
    Search,
    Trash2,
    Pin,
    Tag,
    Folder,
    Layout,
    X,
    StickyNote,
    FileText,
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Code,
    Quote,
    Link as LinkIcon,
    Image as ImageIcon,
    CheckSquare,
    MoreVertical
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';

const initialNotes = [
    {
        id: uuidv4(),
        title: 'Project Ideas',
        content: '1. AI Personal Assistant\n2. Smart Home Dashboard\n3. Crypto Portfolio Tracker',
        type: 'sticky', // 'sticky' or 'rich'
        color: 'bg-amber-50',
        category: 'Ideas',
        tags: ['dev', 'planning'],
        pinned: true,
        date: new Date()
    },
    {
        id: uuidv4(),
        title: 'Grocery List',
        content: '- Milk\n- Eggs\n- Bread\n- Coffee',
        type: 'sticky',
        color: 'bg-indigo-50',
        category: 'Personal',
        tags: ['shopping'],
        pinned: false,
        date: subDays(new Date(), 2)
    },
    {
        id: uuidv4(),
        title: 'Meeting Notes',
        content: '# Q3 Planning Meeting\n\n**Date:** January 15, 2026\n\n## Key Points\n- Focus on performance optimization\n- New feature rollout timeline\n- Team expansion plans\n\n## Action Items\n- [ ] Review performance metrics\n- [ ] Draft feature specs\n- [ ] Schedule follow-up meeting',
        type: 'rich',
        color: 'bg-white',
        category: 'Work',
        tags: ['meeting', 'roadmap'],
        pinned: false,
        date: subDays(new Date(), 5)
    },
];

const categories = ['All', 'Personal', 'Work', 'Ideas', 'Journal'];

const Notes = () => {
    const [notes, setNotes] = useState(initialNotes);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState('all'); // 'all', 'sticky', 'rich'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState({
        title: '', content: '', type: 'sticky', color: 'bg-white', category: 'Personal', tags: [], pinned: false
    });
    const [tagInput, setTagInput] = useState('');
    const textareaRef = useRef(null);

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
        const matchesView = viewMode === 'all' || note.type === viewMode;
        return matchesSearch && matchesCategory && matchesView;
    }).sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    const colors = [
        'bg-white', 'bg-red-50', 'bg-orange-50', 'bg-amber-50',
        'bg-emerald-50', 'bg-indigo-50', 'bg-violet-50', 'bg-pink-50',
    ];

    const handleSaveNote = () => {
        if (!currentNote.title.trim() && !currentNote.content.trim()) return;
        if (currentNote.id) {
            setNotes(notes.map(n => n.id === currentNote.id ? { ...currentNote, date: new Date() } : n));
        } else {
            setNotes([{ ...currentNote, id: uuidv4(), date: new Date() }, ...notes]);
        }
        closeModal();
    };

    const deleteNote = (id) => setNotes(notes.filter(n => n.id !== id));

    const togglePin = (e, note) => {
        e.stopPropagation();
        setNotes(notes.map(n => n.id === note.id ? { ...n, pinned: !n.pinned } : n));
    };

    const openModal = (note = null, type = 'sticky') => {
        if (note) {
            setCurrentNote(note);
        } else {
            setCurrentNote({
                title: '', content: '', type: type,
                color: type === 'sticky' ? 'bg-white' : 'bg-white',
                category: selectedCategory === 'All' ? 'Personal' : selectedCategory,
                tags: [], pinned: false
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setTagInput(''); };

    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!currentNote.tags.includes(tagInput.trim())) {
                setCurrentNote({ ...currentNote, tags: [...currentNote.tags, tagInput.trim()] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setCurrentNote({ ...currentNote, tags: currentNote.tags.filter(tag => tag !== tagToRemove) });
    };

    // Rich text formatting functions
    const insertFormatting = (format) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = currentNote.content.substring(start, end);
        let newText = currentNote.content;
        let newCursorPos = start;

        switch (format) {
            case 'bold':
                newText = currentNote.content.substring(0, start) + `**${selectedText || 'bold text'}**` + currentNote.content.substring(end);
                newCursorPos = start + (selectedText ? 2 : 2);
                break;
            case 'italic':
                newText = currentNote.content.substring(0, start) + `*${selectedText || 'italic text'}*` + currentNote.content.substring(end);
                newCursorPos = start + (selectedText ? 1 : 1);
                break;
            case 'h1':
                newText = currentNote.content.substring(0, start) + `# ${selectedText || 'Heading 1'}` + currentNote.content.substring(end);
                newCursorPos = start + 2;
                break;
            case 'h2':
                newText = currentNote.content.substring(0, start) + `## ${selectedText || 'Heading 2'}` + currentNote.content.substring(end);
                newCursorPos = start + 3;
                break;
            case 'list':
                newText = currentNote.content.substring(0, start) + `- ${selectedText || 'List item'}` + currentNote.content.substring(end);
                newCursorPos = start + 2;
                break;
            case 'ordered':
                newText = currentNote.content.substring(0, start) + `1. ${selectedText || 'List item'}` + currentNote.content.substring(end);
                newCursorPos = start + 3;
                break;
            case 'checkbox':
                newText = currentNote.content.substring(0, start) + `- [ ] ${selectedText || 'Task'}` + currentNote.content.substring(end);
                newCursorPos = start + 6;
                break;
            case 'code':
                newText = currentNote.content.substring(0, start) + `\`${selectedText || 'code'}\`` + currentNote.content.substring(end);
                newCursorPos = start + 1;
                break;
            case 'quote':
                newText = currentNote.content.substring(0, start) + `> ${selectedText || 'Quote'}` + currentNote.content.substring(end);
                newCursorPos = start + 2;
                break;
            case 'link':
                newText = currentNote.content.substring(0, start) + `[${selectedText || 'link text'}](url)` + currentNote.content.substring(end);
                newCursorPos = start + 1;
                break;
            default:
                break;
        }

        setCurrentNote({ ...currentNote, content: newText });
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    // Render markdown preview for rich notes
    const renderMarkdown = (text) => {
        if (!text) return '';
        
        // Simple markdown rendering
        let html = text
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-800 mt-3 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-800 mt-4 mb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-slate-900 mt-4 mb-3">$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            // Code
            .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-600">$1</code>')
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-600 hover:underline">$1</a>')
            // Checkboxes
            .replace(/- \[ \] (.*$)/gim, '<div class="flex items-center gap-2"><input type="checkbox" class="rounded" disabled /> <span>$1</span></div>')
            .replace(/- \[x\] (.*$)/gim, '<div class="flex items-center gap-2"><input type="checkbox" class="rounded" checked disabled /> <span class="line-through text-slate-500">$1</span></div>')
            // Unordered lists
            .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
            // Ordered lists
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
            // Quotes
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-300 pl-4 italic text-slate-600 my-2">$1</blockquote>')
            // Line breaks
            .replace(/\n/g, '<br />');

        return html;
    };

    return (
        <div className="flex h-[calc(100vh-72px)] gap-5 overflow-hidden p-6">
            {/* Sidebar */}
            <div className="w-56 hidden md:flex flex-col gap-3 flex-shrink-0">
                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notes</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Organize your thoughts.</p>
                </div>

                {/* View Mode Filter */}
                <div className="bg-white rounded-2xl p-3 border border-slate-200/60">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">View</h3>
                    <div className="space-y-0.5">
                        <button
                            onClick={() => setViewMode('all')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all ${
                                viewMode === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <Layout size={14} />
                            All Notes
                        </button>
                        <button
                            onClick={() => setViewMode('sticky')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all ${
                                viewMode === 'sticky' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <StickyNote size={14} />
                            Sticky Notes
                        </button>
                        <button
                            onClick={() => setViewMode('rich')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all ${
                                viewMode === 'rich' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <FileText size={14} />
                            Rich Notes
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/60 flex-1">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Folders</h3>
                    <div className="space-y-0.5">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all ${
                                    selectedCategory === category
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                {category === 'All' ? <Layout size={14} /> : <Folder size={14} />}
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex flex-col md:flex-row gap-3 mb-5 shrink-0">
                    <div className="md:hidden">
                        <h1 className="text-2xl font-bold text-slate-900">Notes</h1>
                    </div>
                    <div className="flex flex-1 gap-3">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search notes, tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-4 py-2.5 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-200/60"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => openModal(null, 'sticky')} 
                                className="btn bg-amber-500 hover:bg-amber-600 text-white gap-2 whitespace-nowrap shadow-md shadow-amber-200/50"
                                title="Create Sticky Note"
                            >
                                <StickyNote size={16} />
                                <span className="hidden sm:inline">Sticky</span>
                            </button>
                            <button 
                                onClick={() => openModal(null, 'rich')} 
                                className="btn btn-primary gap-2 whitespace-nowrap shadow-md shadow-indigo-200/50"
                                title="Create Rich Note"
                            >
                                <FileText size={16} />
                                <span className="hidden sm:inline">Rich Note</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notes Grid */}
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredNotes.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                                No notes found in "{selectedCategory}".
                            </div>
                        ) : (
                            filteredNotes.map((note) => (
                                <div
                                    key={note.id}
                                    className={`group flex flex-col h-56 p-5 rounded-2xl border border-slate-200/40 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${note.color}`}
                                    onClick={() => openModal(note)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            {note.type === 'sticky' ? (
                                                <StickyNote size={14} className="text-amber-500 flex-shrink-0" />
                                            ) : (
                                                <FileText size={14} className="text-indigo-500 flex-shrink-0" />
                                            )}
                                            <h3 className="font-bold text-slate-800 truncate text-sm">{note.title || 'Untitled'}</h3>
                                        </div>
                                        <button
                                            onClick={(e) => togglePin(e, note)}
                                            className={`p-1 rounded-full transition-colors flex-shrink-0 ${
                                                note.pinned ? 'text-indigo-600 bg-white' : 'text-slate-300 hover:text-slate-500'
                                            }`}
                                        >
                                            <Pin size={14} className={note.pinned ? 'fill-current' : ''} />
                                        </button>
                                    </div>

                                    <div className="text-slate-500 text-xs overflow-hidden flex-1 leading-relaxed mb-2">
                                        {note.type === 'rich' ? (
                                            <div 
                                                className="prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content.substring(0, 200)) }}
                                            />
                                        ) : (
                                            <p className="whitespace-pre-wrap">{note.content}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2 mt-auto">
                                        {note.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {note.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[10px] bg-black/5 px-2 py-0.5 rounded-full text-slate-600 font-medium">#{tag}</span>
                                                ))}
                                                {note.tags.length > 3 && (
                                                    <span className="text-[10px] text-slate-400">+{note.tags.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-black/5">
                                            <span>{format(note.date, 'MMM dd')}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="bg-white/60 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider">{note.category}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                                                    className="p-1 bg-white/50 rounded-lg hover:bg-white hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Note Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div
                        className={`w-full max-w-4xl ${currentNote.type === 'sticky' ? currentNote.color : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200/30`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-black/5 flex justify-between items-center bg-white/50">
                            <div className="flex items-center gap-3 flex-1">
                                {currentNote.type === 'sticky' ? (
                                    <StickyNote size={20} className="text-amber-500" />
                                ) : (
                                    <FileText size={20} className="text-indigo-500" />
                                )}
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={currentNote.title}
                                    onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                                    className="bg-transparent text-lg font-bold text-slate-800 placeholder-slate-400 outline-none w-full"
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentNote({ ...currentNote, type: currentNote.type === 'sticky' ? 'rich' : 'sticky' })}
                                    className="p-2 text-slate-400 hover:bg-black/5 rounded-xl transition-colors"
                                    title={`Switch to ${currentNote.type === 'sticky' ? 'Rich' : 'Sticky'} Note`}
                                >
                                    {currentNote.type === 'sticky' ? <FileText size={16} /> : <StickyNote size={16} />}
                                </button>
                                <button
                                    onClick={() => setCurrentNote({ ...currentNote, pinned: !currentNote.pinned })}
                                    className={`p-2 rounded-xl transition-colors ${
                                        currentNote.pinned ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-black/5'
                                    }`}
                                >
                                    <Pin size={16} className={currentNote.pinned ? 'fill-current' : ''} />
                                </button>
                                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-black/5 rounded-xl transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="px-5 py-2 bg-white/30 flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <Folder size={12} />
                                <select
                                    value={currentNote.category}
                                    onChange={(e) => setCurrentNote({ ...currentNote, category: e.target.value })}
                                    className="bg-transparent outline-none font-semibold cursor-pointer"
                                >
                                    {categories.slice(1).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Rich Text Toolbar (only for rich notes) */}
                        {currentNote.type === 'rich' && (
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1 flex-wrap">
                                <button onClick={() => insertFormatting('h1')} className="p-2 hover:bg-white rounded-lg transition-colors" title="Heading 1">
                                    <Heading1 size={16} className="text-slate-600" />
                                </button>
                                <button onClick={() => insertFormatting('h2')} className="p-2 hover:bg-white rounded-lg transition-colors" title="Heading 2">
                                    <Heading2 size={16} className="text-slate-600" />
                                </button>
                                <div className="w-px h-6 bg-slate-300 mx-1" />
                                <button onClick={() => insertFormatting('bold')} className="p-2 hover:bg-white rounded-lg transition-colors" title="Bold">
                                    <Bold size={16} className="text-slate-600" />
                                </button>
                                <button onClick={() => insertFormatting('italic')} className="p-2 hover:bg-white rounded-lg transition-colors" title="Italic">
                                    <Italic size={16} className="text-slate-600" />
                                </button>
                                <button onClick={() => insertFormatting('code')} className="p-2 hover:bg-white rounded-lg transition-colors" title="Code">
                                    <Code size={16} className="text-slate-600" />
                                </button>
                                <div className="w-px h-6 bg-slate-300 mx-1" />
                                <button onClick={() => insertFormatting('list')} className="p-2 hover:bg-white rounded-lg transition-colors" title="Bullet List">
                                    <List size={16} className="text-slate-600" />
                                </button>
                                <button onClick={() => insertFormatting('ordered')} className="p-2 hover:bg-white rounded-lg transition-colors" title="Numbered List">
                                    <ListOrdered size={16} className="text-slate-600" />
                                </button>
                                <button onClick={() => insertFormatting('checkbox')} className="p-2 hover:bg-white rounded-lg transition-colors" title="Checkbox">
                                    <CheckSquare size={16} className="text-slate-600" />
                                </button>
                                <div className="w-px h-6 bg-slate-300 mx-1" />
                                <button onClick={() => insertFormatting('quote')} className="p-2 hover:bg-white rounded-lg transition-colors" title="Quote">
                                    <Quote size={16} className="text-slate-600" />
                                </button>
                                <button onClick={() => insertFormatting('link')} className="p-2 hover:bg-white rounded-lg transition-colors" title="Link">
                                    <LinkIcon size={16} className="text-slate-600" />
                                </button>
                            </div>
                        )}

                        {/* Editor */}
                        <textarea
                            ref={textareaRef}
                            placeholder={currentNote.type === 'rich' ? "Start typing... Use markdown for formatting" : "Start typing..."}
                            value={currentNote.content}
                            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                            className="flex-1 p-5 bg-transparent resize-none outline-none text-slate-700 leading-relaxed text-sm min-h-[300px] font-mono"
                            style={{ fontFamily: currentNote.type === 'rich' ? 'ui-monospace, monospace' : 'inherit' }}
                        />

                        {/* Tags */}
                        <div className="px-5 py-2 flex flex-wrap gap-1.5 items-center min-h-[36px] border-t border-black/5">
                            {currentNote.tags.map(tag => (
                                <span key={tag} className="bg-white/60 text-slate-600 text-[11px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium">
                                    #{tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                                        <X size={10} />
                                    </button>
                                </span>
                            ))}
                            <div className="flex items-center gap-1 text-slate-400">
                                <Tag size={12} />
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={addTag}
                                    placeholder="Add tag..."
                                    className="bg-transparent outline-none text-xs placeholder-slate-400 w-20 focus:w-32 transition-all"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-black/5 flex justify-between items-center bg-white/50">
                            {currentNote.type === 'sticky' ? (
                                <div className="flex gap-1.5">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setCurrentNote({ ...currentNote, color })}
                                            className={`w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110 ${color} ${
                                                currentNote.color === color ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
                                            }`}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500">
                                    Supports Markdown formatting
                                </div>
                            )}
                            <button onClick={handleSaveNote} className="btn btn-primary px-5 text-sm">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notes;
