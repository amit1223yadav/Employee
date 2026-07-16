import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  StickyNote,
  Plus,
  Trash2,
  Save,
  Palette
} from 'lucide-react';

interface NoteItem {
  _id: string;
  title: string;
  content: string;
  color: string;
  updatedAt: string;
}

const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  slate:  { bg: 'bg-slate-50 dark:bg-slate-900/60',      border: 'border-slate-200 dark:border-slate-700/60',   text: 'text-slate-800 dark:text-slate-200', dot: 'bg-slate-400' },
  brand:  { bg: 'bg-brand-50 dark:bg-brand-950/30',       border: 'border-brand-200 dark:border-brand-800/40',    text: 'text-brand-800 dark:text-brand-200',  dot: 'bg-brand-500' },
  emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-950/30',   border: 'border-emerald-200 dark:border-emerald-800/40',text: 'text-emerald-800 dark:text-emerald-200',dot: 'bg-emerald-500' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-950/30',       border: 'border-amber-200 dark:border-amber-800/40',    text: 'text-amber-800 dark:text-amber-200',  dot: 'bg-amber-500' },
  rose:   { bg: 'bg-rose-50 dark:bg-rose-950/30',         border: 'border-rose-200 dark:border-rose-800/40',      text: 'text-rose-800 dark:text-rose-200',    dot: 'bg-rose-500' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/30',     border: 'border-violet-200 dark:border-violet-800/40',  text: 'text-violet-800 dark:text-violet-200',dot: 'bg-violet-500' },
};

const NoteCard: React.FC<{
  note: NoteItem;
  onUpdate: (id: string, title: string, content: string, color: string) => void;
  onDelete: (id: string) => void;
}> = ({ note, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState(note.color);
  const [showPalette, setShowPalette] = useState(false);

  const colors = colorMap[color] || colorMap.slate;

  const handleSave = () => {
    onUpdate(note._id, title, content, color);
    setEditing(false);
    setShowPalette(false);
  };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-2xl p-4 space-y-3 relative group transition-all hover:shadow-md`}>
      {/* Top bar */}
      <div className="flex items-start justify-between gap-2">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`font-bold text-sm ${colors.text} bg-transparent border-b border-current/30 outline-none w-full`}
            placeholder="Note title..."
          />
        ) : (
          <h4 className={`font-bold text-sm ${colors.text} truncate flex-1`}>{note.title || 'Untitled Note'}</h4>
        )}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {editing && (
            <button
              onClick={() => setShowPalette(!showPalette)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          )}
          {editing ? (
            <button onClick={handleSave} className="p-1 rounded text-emerald-500 hover:text-emerald-700">
              <Save className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1 rounded text-slate-400 hover:text-brand-500">
              <StickyNote className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => onDelete(note._id)} className="p-1 rounded text-slate-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Color palette */}
      {showPalette && editing && (
        <div className="flex items-center space-x-2 py-1">
          {Object.entries(colorMap).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { setColor(key); setShowPalette(false); }}
              className={`w-5 h-5 rounded-full ${val.dot} border-2 ${color === key ? 'border-slate-600 dark:border-slate-300 scale-125' : 'border-transparent'} transition-transform`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      {editing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className={`w-full bg-transparent border border-current/20 rounded-xl p-2 text-xs ${colors.text} outline-none resize-none`}
          placeholder="Write your note here..."
        />
      ) : (
        <p
          className={`text-xs ${colors.text} opacity-80 leading-relaxed whitespace-pre-wrap line-clamp-6 cursor-pointer`}
          onClick={() => setEditing(true)}
        >
          {note.content || 'Click to add content...'}
        </p>
      )}

      <p className="text-[9px] text-slate-400 font-semibold">
        {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await api.get('notes');
      setNotes(data.notes || []);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreate = async () => {
    try {
      const data = await api.post('notes', {
        title: 'New Note',
        content: '',
        color: 'slate',
      });
      setNotes(prev => [data.note, ...prev]);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const handleUpdate = async (id: string, title: string, content: string, color: string) => {
    try {
      const data = await api.put(`notes/${id}`, { title, content, color });
      setNotes(prev => prev.map(n => n._id === id ? data.note : n));
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Personal Notes</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Your private sticky notes board. Click any note to edit it.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center glass-panel border rounded-2xl">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 glass-panel border rounded-2xl space-y-3">
          <StickyNote className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-slate-500 font-semibold">No notes yet.</p>
          <p className="text-xs text-slate-400">Click "+ New Note" to create your first sticky note.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {notes.map(note => (
            <NoteCard
              key={note._id}
              note={note}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
