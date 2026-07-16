import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Star,
  Target,
  Zap,
  Crown,
  Medal,
  TrendingUp,
  Award,
  Gift,
  Heart,
  Plus,
  X,
  CheckCircle,
  Megaphone,
  Sparkles
} from 'lucide-react';

interface AnnouncementItem {
  _id: string;
  title: string;
  content: string;
  type: 'Announcement' | 'Motivation' | 'Award' | 'Celebration';
  sender: {
    name: string;
    designation: string;
  };
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ElementType; bg: string; text: string; badge: string }> = {
  Announcement: { icon: Megaphone,    bg: 'bg-brand-500/10',   text: 'text-brand-500',   badge: 'bg-brand-500/10 text-brand-600 border-brand-500/20' },
  Motivation:   { icon: Zap,          bg: 'bg-amber-500/10',   text: 'text-amber-500',   badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  Award:        { icon: Trophy,        bg: 'bg-yellow-500/10',  text: 'text-yellow-500',  badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  Celebration:  { icon: Sparkles,      bg: 'bg-rose-500/10',    text: 'text-rose-500',    badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
};

const kpiCards = [
  { icon: Target, label: 'Tasks Completed', value: '87%', change: '+5%', color: 'text-brand-500', bg: 'bg-brand-500/10' },
  { icon: TrendingUp, label: 'Attendance Rate', value: '96%', change: '+2%', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  { icon: Star, label: 'Performance Score', value: '4.6/5', change: '+0.3', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: Heart, label: 'Team Satisfaction', value: '91%', change: '+8%', color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

const achievements = [
  { icon: Crown,  title: 'Top Performer',      desc: 'Ranked #1 in task completion rate',          color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', earned: true  },
  { icon: Medal,  title: 'Consistency Star',   desc: '30-day perfect attendance streak',            color: 'text-brand-500',  bg: 'bg-brand-500/10',  border: 'border-brand-500/20',  earned: true  },
  { icon: Zap,    title: 'Quick Responder',    desc: 'Resolved 10 helpdesk tickets in a week',      color: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  earned: true  },
  { icon: Gift,   title: 'Team Player',        desc: 'Received 5+ positive peer reviews',           color: 'text-emerald-500',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',earned: false },
  { icon: Trophy, title: 'Project Champion',   desc: 'Led successful delivery of major project',    color: 'text-rose-500',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   earned: false },
  { icon: Award,  title: 'Innovation Award',   desc: 'Submitted 3+ approved process improvements',  color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20', earned: false },
];

export const Rewards: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrHR = ['Super Admin', 'HR Manager'].includes(user?.role || '');

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('Motivation');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await api.get('announcements');
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!postTitle.trim() || !postContent.trim()) {
      setFormError('Title and content are required');
      return;
    }
    try {
      await api.post('announcements', { title: postTitle, content: postContent, type: postType });
      setSuccessMsg('Post published successfully!');
      setShowPost(false);
      setPostTitle('');
      setPostContent('');
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to post announcement');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Rewards & Recognition</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">KPI insights, achievements, and company-wide updates.</p>
        </div>
        {isAdminOrHR && (
          <button
            onClick={() => { setShowPost(true); setFormError(null); }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-brand-500" />
          <span>Key Performance Indicators</span>
        </h4>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="glass-panel border rounded-2xl p-5 space-y-3 hover:border-brand-500/30 transition-all">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{kpi.label}</p>
                </div>
                <div className={`text-[10px] font-bold ${kpi.color} flex items-center space-x-1`}>
                  <TrendingUp className="w-3 h-3" />
                  <span>{kpi.change} this month</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>Your Achievements</span>
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.title}
                className={`glass-panel border ${a.border} rounded-2xl p-5 flex items-center space-x-4 transition-all ${
                  a.earned ? 'opacity-100 hover:shadow-md' : 'opacity-40 grayscale'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${a.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h5 className="font-bold text-sm text-slate-800 dark:text-white truncate">{a.title}</h5>
                    {a.earned && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{a.desc}</p>
                  {!a.earned && <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 mt-1 uppercase tracking-wider">Locked</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Announcements feed */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center space-x-2">
          <Megaphone className="w-4 h-4 text-brand-500" />
          <span>Company Announcements & Motivation</span>
        </h4>
        {loading ? (
          <div className="py-16 flex items-center justify-center glass-panel border rounded-2xl">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 glass-panel border rounded-2xl space-y-3">
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-slate-500 font-semibold">No announcements yet.</p>
            {isAdminOrHR && <p className="text-xs text-slate-400">Post motivational messages or awards for your team!</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => {
              const cfg = typeConfig[ann.type] || typeConfig.Announcement;
              const Icon = cfg.icon;
              return (
                <div key={ann._id} className="glass-panel border rounded-2xl p-5 space-y-3 hover:border-brand-500/20 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4.5 h-4.5 ${cfg.text}`} />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 dark:text-white text-sm">{ann.title}</h5>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          By {ann.sender?.name} · {new Date(ann.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge} flex-shrink-0`}>
                      {ann.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{ann.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POST MODAL */}
      {showPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-panel border rounded-3xl w-full max-w-md shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-brand-500" />
                <span>Post Announcement</span>
              </h3>
              <button onClick={() => setShowPost(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePost} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="glass-input w-full text-xs"
                >
                  <option value="Announcement">Announcement</option>
                  <option value="Motivation">Motivation</option>
                  <option value="Award">Award</option>
                  <option value="Celebration">Celebration</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Title *</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Great news for the team!"
                  className="glass-input w-full text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message *</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write your message to the team..."
                  rows={4}
                  className="glass-input w-full text-xs resize-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <button type="button" onClick={() => setShowPost(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all">Publish Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
