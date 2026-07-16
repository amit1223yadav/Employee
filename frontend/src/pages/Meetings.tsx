import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  Plus,
  Users,
  Copy,
  Check,
  PhoneOff,
  Loader2,
  LogIn,
  X,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MonitorSmartphone
} from 'lucide-react';

interface MeetingItem {
  _id: string;
  title: string;
  host: {
    _id: string;
    name: string;
    designation: string;
    profileImage?: string;
  };
  type: 'Everyone' | 'HR Only' | 'Individual';
  roomCode: string;
  status: 'Active' | 'Ended';
  participantsCount: number;
  createdAt: string;
}

export const Meetings: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrHR = ['Super Admin', 'HR Manager'].includes(user?.role || '');

  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState('Everyone');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<MeetingItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.get('meetings');
      setMeetings(data.meetings || []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!meetingTitle.trim()) {
      setFormError('Meeting title is required');
      return;
    }
    try {
      await api.post('meetings', { title: meetingTitle, type: meetingType });
      setSuccessMsg('Meeting room created! Share the room code with participants.');
      setShowCreate(false);
      setMeetingTitle('');
      fetchMeetings();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create meeting');
    }
  };

  const handleJoin = async (meeting: MeetingItem) => {
    setJoiningId(meeting._id);
    try {
      await api.put(`meetings/${meeting._id}/join`, {});
      setActiveSession(meeting);
      fetchMeetings();
    } catch (err: any) {
      console.error('Error joining meeting:', err);
    } finally {
      setJoiningId(null);
    }
  };

  const handleEndMeeting = async (id: string) => {
    try {
      await api.put(`meetings/${id}/end`, {});
      if (activeSession?._id === id) setActiveSession(null);
      fetchMeetings();
    } catch (err: any) {
      console.error('Failed to end meeting:', err);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Meeting Rooms</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Join or host virtual collaboration sessions with your team.
          </p>
        </div>
        {isAdminOrHR && (
          <button
            onClick={() => { setShowCreate(true); setFormError(null); }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Meeting Room</span>
          </button>
        )}
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Session Panel */}
      {activeSession && (
        <div className="glass-panel border-2 border-brand-500/30 rounded-3xl p-6 space-y-4 relative overflow-hidden">
          {/* Animated pulse rings */}
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-emerald-500">
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
              <Video className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">● Live Session</div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">{activeSession.title}</h4>
            </div>
          </div>

          {/* Simulated video grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[user?.name, 'Participant 2', 'Participant 3'].map((name, idx) => (
              <div key={idx} className="aspect-video rounded-2xl bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden border border-slate-700">
                <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-400" />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-2 truncate px-2">{name || 'You'}</p>
                {idx === 0 && isMuted && (
                  <div className="absolute top-2 right-2 p-1 rounded bg-red-500/80">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`p-3 rounded-2xl border transition-all ${isCameraOff ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              {isCameraOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </button>
            <button className="p-3 rounded-2xl border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-all">
              <MonitorSmartphone className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveSession(null)}
              className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center space-x-2 transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      )}

      {/* Meetings Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center glass-panel border rounded-2xl">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-20 glass-panel border rounded-2xl space-y-3">
          <Video className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-slate-500 font-semibold">No active meeting rooms.</p>
          <p className="text-xs text-slate-400">{isAdminOrHR ? 'Create a meeting room to get started.' : 'Wait for a host to start a meeting.'}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {meetings.map((meeting) => (
            <div key={meeting._id} className="glass-panel border rounded-2xl p-5 space-y-4 hover:border-brand-500/30 transition-all">
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0 border border-brand-500/20">
                    <Video className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{meeting.title}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{meeting.type} · {timeAgo(meeting.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE</span>
                </div>
              </div>

              {/* Room Code */}
              <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40">
                <code className="text-xs font-bold text-brand-500 flex-1 truncate">{meeting.roomCode}</code>
                <button
                  onClick={() => copyCode(meeting.roomCode, meeting._id)}
                  className="p-1 rounded text-slate-400 hover:text-brand-500 transition-colors"
                >
                  {copiedId === meeting._id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Host & Participants */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <img
                    src={meeting.host?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${meeting.host?.name}`}
                    alt={meeting.host?.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">{meeting.host?.name}</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-semibold">{meeting.participantsCount}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleJoin(meeting)}
                  disabled={joiningId === meeting._id}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {joiningId === meeting._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                  <span>Join Room</span>
                </button>
                {(isAdminOrHR || meeting.host?._id === user?._id) && (
                  <button
                    onClick={() => handleEndMeeting(meeting._id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                    title="End Meeting"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MEETING MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-panel border rounded-3xl w-full max-w-sm shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Video className="w-5 h-5 text-brand-500" />
                <span>Create Meeting Room</span>
              </h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Meeting Title *</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Q3 Strategy Review"
                  className="glass-input w-full text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Audience</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="glass-input w-full text-xs"
                >
                  <option value="Everyone">Everyone</option>
                  <option value="HR Only">HR Only</option>
                  <option value="Individual">Individual</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all">Create Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
