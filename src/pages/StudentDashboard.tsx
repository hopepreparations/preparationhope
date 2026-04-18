import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

const StudentDashboard = () => {
  const { user, role, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notes, setNotes] = useState<any[]>([]);
  const [newspapers, setNewspapers] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [meetLinks, setMeetLinks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && (!user || role !== 'student')) navigate('/login');
  }, [user, role, loading]);

  useEffect(() => {
    if (user && role === 'student') loadData();
  }, [user, role]);

  const loadData = async () => {
    const [n, np, t, a, m] = await Promise.all([
      supabase.from('notes').select('*').order('created_at', { ascending: false }),
      supabase.from('newspapers').select('*').order('publication_date', { ascending: false }),
      supabase.from('tests').select('*').order('test_date', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('meet_links').select('*').order('date', { ascending: false }).limit(5),
    ]);
    setNotes(n.data || []);
    setNewspapers(np.data || []);
    setTests(t.data || []);
    setAnnouncements(a.data || []);
    setMeetLinks(m.data || []);
  };

  const filtered = (items: any[]) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(i => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
    { id: 'notes', label: 'Notes & PDFs', icon: 'fa-book' },
    { id: 'newspapers', label: 'Newspapers', icon: 'fa-newspaper' },
    { id: 'tests', label: 'Tests & Quizzes', icon: 'fa-clipboard-check' },
    { id: 'class', label: 'Online Class', icon: 'fa-video' },
  ];

  return (
    <div className="flex min-h-screen bg-off-white">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-dark text-primary-foreground sticky top-0 h-screen overflow-y-auto shrink-0 hidden md:block">
        <div className="p-5 border-b border-primary-foreground/10">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-black text-gold">HOPE</span>
            <span className="text-xs font-bold opacity-70">Student</span>
          </div>
        </div>
        <div className="p-4 bg-primary-foreground/5 border-b border-primary-foreground/10">
          <div className="text-sm font-bold">{profile?.full_name || 'Student'}</div>
          <div className="text-xs opacity-60">{profile?.student_id || ''} • {profile?.course || ''}</div>
        </div>
        <nav className="py-3">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all border-l-[3px] ${activeTab === t.id ? 'bg-primary-foreground/10 text-primary-foreground border-gold' : 'text-primary-foreground/70 border-transparent hover:bg-primary-foreground/5'}`}>
              <i className={`fas ${t.icon} w-4 text-center`}></i>{t.label}
            </button>
          ))}
          <div className="border-t border-primary-foreground/10 mt-4 pt-4">
            <Link to="/" className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-primary-foreground/70 hover:text-primary-foreground transition-colors border-l-[3px] border-transparent">
              <i className="fas fa-home w-4 text-center"></i>Home
            </Link>
            <button onClick={signOut} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-primary-foreground/70 hover:text-accent transition-colors border-l-[3px] border-transparent">
              <i className="fas fa-sign-out-alt w-4 text-center"></i>Logout
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-9 overflow-auto">
        {/* Mobile nav */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeTab === t.id ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'}`}>
              <i className={`fas ${t.icon} mr-1`}></i>{t.label}
            </button>
          ))}
          <button onClick={signOut} className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap bg-accent/10 text-accent">
            <i className="fas fa-sign-out-alt mr-1"></i>Logout
          </button>
        </div>

        {/* Search bar */}
        {['notes', 'newspapers', 'tests'].includes(activeTab) && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notes, newspapers, tests..." className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-full text-sm focus:border-primary outline-none transition-colors bg-card" />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            <h1 className="font-display text-2xl text-text-dark mb-1">Welcome, {profile?.full_name || 'Student'}!</h1>
            <p className="text-muted-foreground text-sm mb-6">Student ID: {profile?.student_id} • Course: {profile?.course}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { icon: 'fa-book', num: notes.length, label: 'Notes Available', color: 'border-primary' },
                { icon: 'fa-newspaper', num: newspapers.length, label: 'Newspapers', color: 'border-accent' },
                { icon: 'fa-clipboard-check', num: tests.length, label: 'Tests/Quizzes', color: 'border-green' },
                { icon: 'fa-bullhorn', num: announcements.length, label: 'Announcements', color: 'border-gold' },
              ].map(c => (
                <div key={c.label} className={`bg-card rounded-lg p-6 shadow-hope-sm border-l-4 ${c.color}`}>
                  <div className="text-2xl mb-2"><i className={`fas ${c.icon}`}></i></div>
                  <div className="font-display text-3xl font-black text-text-dark">{c.num}</div>
                  <div className="text-xs font-semibold text-muted-foreground">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Announcements */}
            <div className="bg-card rounded-lg p-6 shadow-hope-sm mb-6">
              <h2 className="font-display text-lg text-text-dark mb-4 pb-3 border-b border-border"><i className="fas fa-bullhorn text-accent mr-2"></i>Announcements</h2>
              {announcements.length === 0 ? <p className="text-sm text-muted-foreground">No announcements</p> : announcements.slice(0, 5).map(a => (
                <div key={a.id} className="p-4 bg-off-white rounded-lg mb-3">
                  <strong className="text-sm text-text-dark">{a.title}</strong>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${a.priority === 'urgent' ? 'bg-accent/10 text-accent' : a.priority === 'important' ? 'bg-gold/10 text-gold' : 'bg-primary/10 text-primary'}`}>{a.priority}</span>
                  <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
                  <span className="text-[10px] text-muted-foreground/60 mt-1 block">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Meet Link */}
            {meetLinks.length > 0 && (
              <div className="bg-card rounded-lg p-6 shadow-hope-sm">
                <h2 className="font-display text-lg text-text-dark mb-4 pb-3 border-b border-border"><i className="fas fa-video text-green mr-2"></i>Online Class</h2>
                {meetLinks.slice(0, 1).map(m => (
                  <div key={m.id} className="flex items-center gap-4 p-4 bg-green/5 rounded-lg">
                    <div className="w-14 h-14 rounded-xl bg-green/20 flex items-center justify-center text-green text-2xl"><i className="fas fa-video"></i></div>
                    <div className="flex-1">
                      <strong className="block text-sm text-text-dark">{m.title}</strong>
                      <span className="text-xs text-muted-foreground">{m.date}</span>
                    </div>
                    <a href={m.link} target="_blank" rel="noopener" className="px-6 py-3 rounded-full font-bold text-sm bg-green text-primary-foreground hover:opacity-90 transition-all">Join Class <i className="fas fa-external-link-alt ml-1"></i></a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'notes' && (
          <div className="bg-card rounded-lg p-6 shadow-hope-sm">
            <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Notes & PDFs</h2>
            {filtered(notes).map(n => {
              const url = n.file_url || n.drive_link;
              return (
                <div key={n.id} onClick={() => url && window.open(url, '_blank', 'noopener')} className={`flex items-center gap-4 p-4 bg-off-white rounded-lg mb-3 hover:shadow-hope-sm transition-all hover:translate-x-1 ${url ? 'cursor-pointer' : ''}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg shrink-0"><i className="fas fa-file-pdf"></i></div>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-sm text-text-dark truncate">{n.title}</strong>
                    <span className="text-xs text-muted-foreground">{n.category} • {new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  {url && (
                    <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      <a href={url} target="_blank" rel="noopener" className="px-3 py-2 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all"><i className="fas fa-eye mr-1"></i>Open</a>
                      <a href={url} download target="_blank" rel="noopener" className="px-3 py-2 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-dark transition-all"><i className="fas fa-download mr-1"></i>Download</a>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered(notes).length === 0 && <p className="text-center py-8 text-muted-foreground">No notes found</p>}
          </div>
        )}

        {activeTab === 'newspapers' && (
          <div className="bg-card rounded-lg p-6 shadow-hope-sm">
            <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Newspapers</h2>
            {filtered(newspapers).map(n => {
              const url = n.file_url || n.drive_link;
              return (
                <div key={n.id} onClick={() => url && window.open(url, '_blank', 'noopener')} className={`flex items-center gap-4 p-4 bg-off-white rounded-lg mb-3 hover:shadow-hope-sm transition-all hover:translate-x-1 ${url ? 'cursor-pointer' : ''}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg shrink-0"><i className="fas fa-newspaper"></i></div>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-sm text-text-dark truncate">{n.title}</strong>
                    <span className="text-xs text-muted-foreground">{n.publication_date}</span>
                  </div>
                  {url && (
                    <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      <a href={url} target="_blank" rel="noopener" className="px-3 py-2 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all"><i className="fas fa-eye mr-1"></i>Open</a>
                      <a href={url} download target="_blank" rel="noopener" className="px-3 py-2 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-dark transition-all"><i className="fas fa-download mr-1"></i>Download</a>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered(newspapers).length === 0 && <p className="text-center py-8 text-muted-foreground">No newspapers found</p>}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="bg-card rounded-lg p-6 shadow-hope-sm">
            <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Tests & Quizzes</h2>
            {filtered(tests).map(t => {
              const url = t.file_url || t.drive_link;
              return (
                <div key={t.id} onClick={() => url && window.open(url, '_blank', 'noopener')} className={`flex items-center gap-4 p-4 bg-off-white rounded-lg mb-3 hover:shadow-hope-sm transition-all hover:translate-x-1 ${url ? 'cursor-pointer' : ''}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg shrink-0"><i className="fas fa-clipboard-check"></i></div>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-sm text-text-dark truncate">{t.title}</strong>
                    <span className="text-xs text-muted-foreground">{t.test_date}</span>
                  </div>
                  {url && (
                    <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      <a href={url} target="_blank" rel="noopener" className="px-3 py-2 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all"><i className="fas fa-eye mr-1"></i>Open</a>
                      <a href={url} download target="_blank" rel="noopener" className="px-3 py-2 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-dark transition-all"><i className="fas fa-download mr-1"></i>Download</a>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered(tests).length === 0 && <p className="text-center py-8 text-muted-foreground">No tests found</p>}
          </div>
        )}

        {activeTab === 'class' && (
          <div className="bg-card rounded-lg p-6 shadow-hope-sm">
            <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border"><i className="fas fa-video text-green mr-2"></i>Online Classes</h2>
            {meetLinks.length === 0 ? <p className="text-center py-8 text-muted-foreground">No class links available</p> : meetLinks.map(m => (
              <div key={m.id} className="flex items-center gap-4 p-5 bg-green/5 rounded-lg mb-3">
                <div className="w-14 h-14 rounded-xl bg-green/20 flex items-center justify-center text-green text-2xl shrink-0"><i className="fas fa-video"></i></div>
                <div className="flex-1">
                  <strong className="block text-sm text-text-dark">{m.title}</strong>
                  <span className="text-xs text-muted-foreground">{m.date}</span>
                </div>
                <a href={m.link} target="_blank" rel="noopener" className="px-6 py-3 rounded-full font-bold text-sm bg-green text-primary-foreground hover:opacity-90 transition-all">Join Class <i className="fas fa-external-link-alt ml-1"></i></a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
