import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
  { id: 'applications', label: 'Applications', icon: 'fa-file-alt' },
  { id: 'students', label: 'Aspirants', icon: 'fa-users' },
  { id: 'notes', label: 'Notes & PDFs', icon: 'fa-book' },
  { id: 'newspapers', label: 'Newspapers', icon: 'fa-newspaper' },
  { id: 'tests', label: 'Tests & Quizzes', icon: 'fa-clipboard-check' },
  { id: 'announcements', label: 'Announcements', icon: 'fa-bullhorn' },
  { id: 'faculty', label: 'Faculty', icon: 'fa-chalkboard-teacher' },
  { id: 'meet', label: 'Google Meet', icon: 'fa-video' },
  { id: 'ads', label: 'Website Ads', icon: 'fa-ad' },
  { id: 'stories', label: 'Success Stories', icon: 'fa-trophy' },
];

const AdminDashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newspapers, setNewspapers] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [meetLinks, setMeetLinks] = useState<any[]>([]);
  const [adsList, setAdsList] = useState<any[]>([]);
  const [storiesList, setStoriesList] = useState<any[]>([]);
  const [credentialModal, setCredentialModal] = useState<{ username: string; password: string; name: string } | null>(null);

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      navigate('/login');
    }
  }, [user, role, loading]);

  useEffect(() => {
    if (user && role === 'admin') loadAll();
  }, [user, role]);

  const loadAll = async () => {
    const [a, s, n, np, t, an, f, m, ads, st] = await Promise.all([
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('notes').select('*').order('created_at', { ascending: false }),
      supabase.from('newspapers').select('*').order('publication_date', { ascending: false }),
      supabase.from('tests').select('*').order('test_date', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('faculty').select('*').order('display_order'),
      supabase.from('meet_links').select('*').order('date', { ascending: false }),
      supabase.from('website_ads').select('*').order('created_at', { ascending: false }),
      supabase.from('success_stories').select('*').order('created_at', { ascending: false }),
    ]);
    setApplications(a.data || []);
    setStudents(s.data || []);
    setNotes(n.data || []);
    setNewspapers(np.data || []);
    setTests(t.data || []);
    setAnnouncements(an.data || []);
    setFacultyList(f.data || []);
    setMeetLinks(m.data || []);
    setAdsList(ads.data || []);
    setStoriesList(st.data || []);
  };

  const handleAcceptApplication = async (app: any) => {
    const username = `STU${Date.now().toString().slice(-6)}`;
    const password = `hope${Math.random().toString(36).slice(-6)}`;
    const email = `${username.toLowerCase()}@hopeacademy.local`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) { toast.error('Failed to create aspirant account: ' + authError.message); return; }
    
    const studentUserId = authData.user?.id;
    if (!studentUserId) { toast.error('Failed to get user ID'); return; }

    await supabase.auth.signInWithPassword({ email: 'hopeacademy@hopeacademy.local', password: 'AsifNaveed125' });

    await supabase.from('user_roles').insert({ user_id: studentUserId, role: 'student' as any });

    await supabase.from('profiles').insert({
      user_id: studentUserId,
      full_name: app.full_name,
      phone: app.phone,
      email: app.email,
      course: app.course,
      city: app.city,
      student_id: username,
      fee_status: 'Pending',
      login_username: username,
      login_password: password,
      enrollment_status: 'enrolled',
    } as any);

    await supabase.from('applications').update({ status: 'accepted' }).eq('id', app.id);

    setCredentialModal({ username, password, name: app.full_name });
    loadAll();
  };

  const handleRejectApplication = async (id: string) => {
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', id);
    toast.info('Application rejected');
    loadAll();
  };

  const handleToggleEnrollment = async (student: any) => {
    const newStatus = student.enrollment_status === 'enrolled' ? 'un-enrolled' : 'enrolled';
    if (newStatus === 'un-enrolled') {
      // Clear credentials so the aspirant can no longer login
      await supabase.from('profiles').update({ 
        enrollment_status: newStatus,
        login_username: null,
        login_password: null,
      } as any).eq('id', student.id);
      toast.success('Aspirant expelled – login credentials removed');
    } else {
      await supabase.from('profiles').update({ enrollment_status: newStatus } as any).eq('id', student.id);
      toast.success('Aspirant re-enrolled successfully');
    }
    loadAll();
  };

  const handleDeleteStudent = async (student: any) => {
    if (!confirm(`Are you sure you want to delete ${student.full_name}? This will remove the record.`)) return;
    await supabase.from('profiles').delete().eq('id', student.id);
    toast.info('Aspirant record deleted');
    loadAll();
  };

  const handleUploadFile = async (file: File, path: string) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('uploads').upload(`${path}/${fileName}`, file);
    if (error) { toast.error('Upload failed'); return null; }
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(`${path}/${fileName}`);
    return urlData.publicUrl;
  };

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get('file') as File;
    let fileUrl = fd.get('drive_link') as string || null;
    if (file && file.size > 0) {
      fileUrl = await handleUploadFile(file, 'notes');
    }
    await supabase.from('notes').insert({
      title: fd.get('title') as string,
      description: fd.get('description') as string || null,
      category: fd.get('category') as string || 'notes',
      file_url: fileUrl,
      drive_link: fd.get('drive_link') as string || null,
      uploaded_by: user?.id,
    });
    toast.success('Note uploaded!');
    (e.target as HTMLFormElement).reset();
    loadAll();
  };

  const handleAddNewspaper = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get('file') as File;
    let fileUrl = null;
    if (file && file.size > 0) fileUrl = await handleUploadFile(file, 'newspapers');
    await supabase.from('newspapers').insert({
      title: fd.get('title') as string,
      publication_date: fd.get('date') as string,
      file_url: fileUrl,
      drive_link: fd.get('drive_link') as string || null,
      uploaded_by: user?.id,
    });
    toast.success('Newspaper uploaded!');
    (e.target as HTMLFormElement).reset();
    loadAll();
  };

  const handleAddTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get('file') as File;
    let fileUrl = null;
    if (file && file.size > 0) fileUrl = await handleUploadFile(file, 'tests');
    await supabase.from('tests').insert({
      title: fd.get('title') as string,
      description: fd.get('description') as string || null,
      file_url: fileUrl,
      drive_link: fd.get('drive_link') as string || null,
      test_date: fd.get('date') as string,
      uploaded_by: user?.id,
    });
    toast.success('Test uploaded!');
    (e.target as HTMLFormElement).reset();
    loadAll();
  };

  const handleAddAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await supabase.from('announcements').insert({
      title: fd.get('title') as string,
      content: fd.get('content') as string,
      priority: fd.get('priority') as string || 'normal',
      created_by: user?.id,
    });
    toast.success('Announcement posted!');
    (e.target as HTMLFormElement).reset();
    loadAll();
  };

  const handleAddMeetLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await supabase.from('meet_links').insert({
      title: fd.get('title') as string,
      link: fd.get('link') as string,
      date: fd.get('date') as string,
      created_by: user?.id,
    });
    toast.success('Meet link added!');
    (e.target as HTMLFormElement).reset();
    loadAll();
  };

  const handleAddFaculty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const photoFile = fd.get('photo') as File;
    let photoUrl = null;
    if (photoFile && photoFile.size > 0) {
      photoUrl = await handleUploadFile(photoFile, 'faculty');
    }
    await supabase.from('faculty').insert({
      name: fd.get('name') as string,
      subject: fd.get('subject') as string,
      description: fd.get('description') as string || null,
      display_order: parseInt(fd.get('display_order') as string || '0'),
      photo_url: photoUrl,
    });
    toast.success('Faculty member added!');
    (e.target as HTMLFormElement).reset();
    loadAll();
  };

  const handleAddAd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const imageFile = fd.get('image') as File;
    if (!imageFile || imageFile.size === 0) { toast.error('Please select an image'); return; }
    const imageUrl = await handleUploadFile(imageFile, 'ads');
    if (!imageUrl) return;
    await supabase.from('website_ads').insert({
      title: fd.get('title') as string || '',
      image_url: imageUrl,
      created_by: user?.id,
    } as any);
    toast.success('Ad/Flyer uploaded!');
    (e.target as HTMLFormElement).reset();
    loadAll();
  };

  const handleUpdateFacultyPhoto = async (facultyId: string, file: File) => {
    const photoUrl = await handleUploadFile(file, 'faculty');
    if (!photoUrl) return;
    await supabase.from('faculty').update({ photo_url: photoUrl }).eq('id', facultyId);
    toast.success('Faculty photo updated!');
    loadAll();
  };

  const handleAddStory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const imageFile = fd.get('image') as File;
    if (!imageFile || imageFile.size === 0) { toast.error('Please select an image'); return; }
    const imageUrl = await handleUploadFile(imageFile, 'stories');
    if (!imageUrl) return;
    await supabase.from('success_stories').insert({
      title: fd.get('title') as string || '',
      image_url: imageUrl,
      created_by: user?.id,
    } as any);
    toast.success('Success story uploaded!');
    (e.target as HTMLFormElement).reset();
    loadAll();
  };

  const handleDeleteItem = async (table: string, id: string) => {
    await supabase.from(table as any).delete().eq('id', id);
    toast.info('Deleted');
    loadAll();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  const inputCls = "w-full px-3 py-2.5 border-2 border-border rounded-md text-sm focus:border-primary outline-none transition-colors bg-card";
  const btnCls = "px-6 py-2.5 rounded-full font-bold text-sm bg-accent text-accent-foreground hover:bg-accent-dark transition-all";
  const cardCls = "bg-card rounded-lg p-6 shadow-hope-sm mb-6";

  return (
    <div className="flex min-h-screen bg-off-white">
      {/* Credential Modal */}
      {credentialModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full shadow-hope-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-4"><i className="fas fa-check-circle text-green text-3xl"></i></div>
              <h3 className="font-display text-xl text-text-dark">Aspirant Accepted!</h3>
              <p className="text-sm text-muted-foreground mt-1">{credentialModal.name}</p>
            </div>
            <div className="bg-off-white rounded-lg p-5 mb-6 space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Username</label>
                <div className="text-lg font-bold text-text-dark font-mono bg-card px-3 py-2 rounded border border-border mt-1">{credentialModal.username}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
                <div className="text-lg font-bold text-text-dark font-mono bg-card px-3 py-2 rounded border border-border mt-1">{credentialModal.password}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mb-4">⚠️ Please save these credentials and share them with the aspirant. They are also stored in the Enrolled Aspirants section.</p>
            <button onClick={() => setCredentialModal(null)} className="w-full py-3 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary-dark transition-all">Got it, Close</button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-primary-dark text-primary-foreground sticky top-0 h-screen overflow-y-auto shrink-0 hidden md:block">
        <div className="p-5 border-b border-primary-foreground/10">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-black text-gold">HOPE</span>
            <span className="text-xs font-bold opacity-70">Admin</span>
          </div>
        </div>
        <div className="p-4 bg-primary-foreground/5 border-b border-primary-foreground/10">
          <div className="text-sm font-bold">Admin Panel</div>
          <div className="text-xs opacity-60">hopeacademy</div>
        </div>
        <nav className="py-3">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all border-l-[3px] ${activeTab === t.id ? 'bg-primary-foreground/10 text-primary-foreground border-gold' : 'text-primary-foreground/70 border-transparent hover:bg-primary-foreground/5 hover:text-primary-foreground'}`}>
              <i className={`fas ${t.icon} w-4 text-center`}></i>{t.label}
            </button>
          ))}
          <div className="border-t border-primary-foreground/10 mt-4 pt-4">
            <Link to="/" className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-primary-foreground/70 hover:text-primary-foreground transition-colors border-l-[3px] border-transparent">
              <i className="fas fa-home w-4 text-center"></i>View Website
            </Link>
            <button onClick={signOut} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-primary-foreground/70 hover:text-accent transition-colors border-l-[3px] border-transparent">
              <i className="fas fa-sign-out-alt w-4 text-center"></i>Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main */}
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

        {activeTab === 'dashboard' && (
          <>
            <h1 className="font-display text-2xl text-text-dark mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mb-6">Welcome back, Admin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { icon: 'fa-users', num: students.filter((s: any) => s.enrollment_status !== 'un-enrolled').length, label: 'Aspirants', color: 'border-primary' },
                { icon: 'fa-file-alt', num: applications.filter(a => a.status === 'pending').length, label: 'Pending Applications', color: 'border-accent' },
                { icon: 'fa-book', num: notes.length, label: 'Notes Uploaded', color: 'border-green' },
                { icon: 'fa-newspaper', num: newspapers.length, label: 'Newspapers', color: 'border-gold' },
              ].map(c => (
                <div key={c.label} className={`bg-card rounded-lg p-6 shadow-hope-sm border-l-4 ${c.color}`}>
                  <div className="text-2xl mb-2"><i className={`fas ${c.icon}`}></i></div>
                  <div className="font-display text-3xl font-black text-text-dark">{c.num}</div>
                  <div className="text-xs font-semibold text-muted-foreground">{c.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'applications' && (
          <div className={cardCls}>
            <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Applications</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-off-white">
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Phone</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Course</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(a => (
                    <tr key={a.id} className="hover:bg-off-white">
                      <td className="px-3 py-3 border-b border-border">{a.full_name}</td>
                      <td className="px-3 py-3 border-b border-border">{a.phone}</td>
                      <td className="px-3 py-3 border-b border-border">{a.course}</td>
                      <td className="px-3 py-3 border-b border-border">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.status === 'accepted' ? 'bg-green/10 text-green' : a.status === 'rejected' ? 'bg-accent/10 text-accent' : 'bg-gold/10 text-gold'}`}>{a.status}</span>
                      </td>
                      <td className="px-3 py-3 border-b border-border">
                        {a.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleAcceptApplication(a)} className="px-3 py-1 rounded-full text-xs font-bold bg-green/10 text-green hover:bg-green hover:text-primary-foreground transition-all">Accept</button>
                            <button onClick={() => handleRejectApplication(a.id)} className="px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No applications yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className={cardCls}>
            <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Enrolled Aspirants</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-off-white">
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Student ID</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Course</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Phone</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Email</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Username</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Password</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Fee</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s: any) => (
                    <tr key={s.id} className={`hover:bg-off-white ${s.enrollment_status === 'un-enrolled' ? 'opacity-50' : ''}`}>
                      <td className="px-3 py-3 border-b border-border font-bold">{s.student_id || '—'}</td>
                      <td className="px-3 py-3 border-b border-border">{s.full_name}</td>
                      <td className="px-3 py-3 border-b border-border">{s.course || '—'}</td>
                      <td className="px-3 py-3 border-b border-border">{s.phone || '—'}</td>
                      <td className="px-3 py-3 border-b border-border">{s.email || '—'}</td>
                      <td className="px-3 py-3 border-b border-border font-mono text-xs">{s.login_username || '— (expelled)'}</td>
                      <td className="px-3 py-3 border-b border-border font-mono text-xs">{s.login_password || '— (expelled)'}</td>
                      <td className="px-3 py-3 border-b border-border">
                        <button
                          onClick={async () => {
                            const newStatus = s.fee_status === 'Paid' ? 'Pending' : 'Paid';
                            await supabase.from('profiles').update({ fee_status: newStatus }).eq('id', s.id);
                            toast.success(`Fee status updated to ${newStatus}`);
                            loadAll();
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${s.fee_status === 'Paid' ? 'bg-green/10 text-green' : 'bg-gold/10 text-gold'}`}
                        >
                          {s.fee_status} <i className="fas fa-sync-alt ml-1 text-[10px]"></i>
                        </button>
                      </td>
                      <td className="px-3 py-3 border-b border-border">
                        <button
                          onClick={() => handleToggleEnrollment(s)}
                          className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${s.enrollment_status === 'enrolled' ? 'bg-green/10 text-green' : 'bg-accent/10 text-accent'}`}
                        >
                          {s.enrollment_status === 'enrolled' ? 'Enrolled' : 'Expelled'}
                        </button>
                      </td>
                      <td className="px-3 py-3 border-b border-border">
                        <button onClick={() => handleDeleteStudent(s)} className="px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">No aspirants enrolled yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Upload Notes / PDFs</h2>
              <form onSubmit={handleAddNote} className="space-y-4">
                <input name="title" placeholder="Title *" required className={inputCls} />
                <textarea name="description" placeholder="Description" className={inputCls + " min-h-[80px] resize-y"}></textarea>
                <select name="category" className={inputCls}><option value="notes">Notes</option><option value="pdf">PDF</option><option value="handout">Handout</option></select>
                <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png" className={inputCls} />
                <input name="drive_link" placeholder="Or paste Google Drive link" className={inputCls} />
                <button type="submit" className={btnCls}>Upload <i className="fas fa-upload ml-1"></i></button>
              </form>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Uploaded Notes ({notes.length})</h2>
              {notes.map(n => (
                <div key={n.id} className="flex items-center gap-4 p-4 bg-off-white rounded-lg mb-3 hover:shadow-hope-sm transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg shrink-0"><i className="fas fa-file-pdf"></i></div>
                  <div className="flex-1">
                    <strong className="block text-sm text-text-dark">{n.title}</strong>
                    <span className="text-xs text-muted-foreground">{n.category} • {new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    {(n.file_url || n.drive_link) && <a href={n.file_url || n.drive_link} target="_blank" rel="noopener" className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"><i className="fas fa-download"></i></a>}
                    <button onClick={() => handleDeleteItem('notes', n.id)} className="px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'newspapers' && (
          <>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Upload Newspaper</h2>
              <form onSubmit={handleAddNewspaper} className="space-y-4">
                <input name="title" placeholder="Newspaper Title *" required className={inputCls} />
                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className={inputCls} />
                <input name="file" type="file" accept=".pdf,.jpg,.png" className={inputCls} />
                <input name="drive_link" placeholder="Or paste Google Drive link" className={inputCls} />
                <button type="submit" className={btnCls}>Upload <i className="fas fa-upload ml-1"></i></button>
              </form>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Newspapers ({newspapers.length})</h2>
              {newspapers.map(n => (
                <div key={n.id} className="flex items-center gap-4 p-4 bg-off-white rounded-lg mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg shrink-0"><i className="fas fa-newspaper"></i></div>
                  <div className="flex-1">
                    <strong className="block text-sm text-text-dark">{n.title}</strong>
                    <span className="text-xs text-muted-foreground">{n.publication_date}</span>
                  </div>
                  <div className="flex gap-2">
                    {(n.file_url || n.drive_link) && <a href={n.file_url || n.drive_link} target="_blank" rel="noopener" className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"><i className="fas fa-download"></i></a>}
                    <button onClick={() => handleDeleteItem('newspapers', n.id)} className="px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'tests' && (
          <>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Upload Test / Quiz</h2>
              <form onSubmit={handleAddTest} className="space-y-4">
                <input name="title" placeholder="Test Title *" required className={inputCls} />
                <textarea name="description" placeholder="Description" className={inputCls + " min-h-[80px] resize-y"}></textarea>
                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className={inputCls} />
                <input name="file" type="file" accept=".pdf,.doc,.docx" className={inputCls} />
                <input name="drive_link" placeholder="Or paste Google Drive link" className={inputCls} />
                <button type="submit" className={btnCls}>Upload <i className="fas fa-upload ml-1"></i></button>
              </form>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Tests & Quizzes ({tests.length})</h2>
              {tests.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-4 bg-off-white rounded-lg mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg shrink-0"><i className="fas fa-clipboard-check"></i></div>
                  <div className="flex-1">
                    <strong className="block text-sm text-text-dark">{t.title}</strong>
                    <span className="text-xs text-muted-foreground">{t.test_date}</span>
                  </div>
                  <div className="flex gap-2">
                    {(t.file_url || t.drive_link) && <a href={t.file_url || t.drive_link} target="_blank" rel="noopener" className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"><i className="fas fa-download"></i></a>}
                    <button onClick={() => handleDeleteItem('tests', t.id)} className="px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'announcements' && (
          <>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Post Announcement</h2>
              <form onSubmit={handleAddAnnouncement} className="space-y-4">
                <input name="title" placeholder="Title *" required className={inputCls} />
                <textarea name="content" placeholder="Content *" required className={inputCls + " min-h-[120px] resize-y"}></textarea>
                <select name="priority" className={inputCls}><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option></select>
                <button type="submit" className={btnCls}>Post <i className="fas fa-bullhorn ml-1"></i></button>
              </form>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Announcements ({announcements.length})</h2>
              {announcements.map(a => (
                <div key={a.id} className="p-4 bg-off-white rounded-lg mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-sm text-text-dark">{a.title}</strong>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${a.priority === 'urgent' ? 'bg-accent/10 text-accent' : a.priority === 'important' ? 'bg-gold/10 text-gold' : 'bg-primary/10 text-primary'}`}>{a.priority}</span>
                    </div>
                    <button onClick={() => handleDeleteItem('announcements', a.id)} className="text-accent/50 hover:text-accent"><i className="fas fa-trash text-xs"></i></button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{a.content}</p>
                  <span className="text-[10px] text-muted-foreground/60 mt-1 block">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'faculty' && (
          <>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Add Faculty Member</h2>
              <form onSubmit={handleAddFaculty} className="space-y-4">
                <input name="name" placeholder="Full Name *" required className={inputCls} />
                <input name="subject" placeholder="Expertise / Subject *" required className={inputCls} />
                <textarea name="description" placeholder="Job Expertise & Qualifications" className={inputCls + " min-h-[80px] resize-y"}></textarea>
                <div>
                  <label className="block text-sm font-bold text-text-dark mb-1.5">Faculty Photo</label>
                  <input name="photo" type="file" accept=".jpg,.jpeg,.png,.webp" className={inputCls} />
                </div>
                <input name="display_order" type="number" placeholder="Display Order (0, 1, 2...)" defaultValue="0" className={inputCls} />
                <button type="submit" className={btnCls}>Add Faculty <i className="fas fa-plus ml-1"></i></button>
              </form>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Faculty ({facultyList.length})</h2>
              {facultyList.map(f => (
                <div key={f.id} className="flex items-center gap-4 p-4 bg-off-white rounded-lg mb-3">
                  {f.photo_url ? (
                    <img src={f.photo_url} alt={f.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg shrink-0"><i className="fas fa-user-tie"></i></div>
                  )}
                  <div className="flex-1">
                    <strong className="block text-sm text-text-dark">{f.name}</strong>
                    <span className="text-xs text-muted-foreground">{f.subject}</span>
                    {f.description && <p className="text-[11px] text-muted-foreground/70 mt-1">{f.description}</p>}
                  </div>
                  <label className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                    <i className="fas fa-camera mr-1"></i>Photo
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpdateFacultyPhoto(f.id, file);
                    }} />
                  </label>
                  <button onClick={() => handleDeleteItem('faculty', f.id)} className="px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all"><i className="fas fa-trash"></i></button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'meet' && (
          <>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Add Google Meet Link</h2>
              <form onSubmit={handleAddMeetLink} className="space-y-4">
                <input name="title" placeholder="Class Title *" required defaultValue="Daily Class" className={inputCls} />
                <input name="link" placeholder="Google Meet Link *" required className={inputCls} />
                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className={inputCls} />
                <button type="submit" className={btnCls}>Add Link <i className="fas fa-video ml-1"></i></button>
              </form>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Meet Links ({meetLinks.length})</h2>
              {meetLinks.map(m => (
                <div key={m.id} className="flex items-center gap-4 p-4 bg-off-white rounded-lg mb-3">
                  <div className="w-12 h-12 rounded-xl bg-green/20 flex items-center justify-center text-green text-lg shrink-0"><i className="fas fa-video"></i></div>
                  <div className="flex-1">
                    <strong className="block text-sm text-text-dark">{m.title}</strong>
                    <span className="text-xs text-muted-foreground">{m.date}</span>
                  </div>
                  <a href={m.link} target="_blank" rel="noopener" className="px-3 py-1 rounded-full text-xs font-bold bg-green/10 text-green hover:bg-green hover:text-primary-foreground transition-all"><i className="fas fa-external-link-alt mr-1"></i>Open</a>
                  <button onClick={() => handleDeleteItem('meet_links', m.id)} className="px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all"><i className="fas fa-trash"></i></button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'ads' && (
          <>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Upload Flyer / Advertisement</h2>
              <p className="text-sm text-muted-foreground mb-4">Upload images that will be displayed on the main website for all visitors to see.</p>
              <form onSubmit={handleAddAd} className="space-y-4">
                <input name="title" placeholder="Ad Title (optional)" className={inputCls} />
                <div>
                  <label className="block text-sm font-bold text-text-dark mb-1.5">Flyer / Ad Image *</label>
                  <input name="image" type="file" accept=".jpg,.jpeg,.png,.webp" required className={inputCls} />
                </div>
                <button type="submit" className={btnCls}>Upload Ad <i className="fas fa-upload ml-1"></i></button>
              </form>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Active Ads ({adsList.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adsList.map(ad => (
                  <div key={ad.id} className="bg-off-white rounded-lg overflow-hidden border border-border">
                    <img src={ad.image_url} alt={ad.title || 'Ad'} className="w-full h-40 object-cover" />
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-dark">{ad.title || 'Untitled'}</span>
                      <button onClick={() => handleDeleteItem('website_ads', ad.id)} className="px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
              {adsList.length === 0 && <p className="text-center py-8 text-muted-foreground">No ads uploaded yet</p>}
            </div>
          </>
        )}

        {activeTab === 'stories' && (
          <>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Upload Success Story</h2>
              <p className="text-sm text-muted-foreground mb-4">Upload images of success stories that will be displayed on the main website.</p>
              <form onSubmit={handleAddStory} className="space-y-4">
                <input name="title" placeholder="Caption / Title (optional)" className={inputCls} />
                <div>
                  <label className="block text-sm font-bold text-text-dark mb-1.5">Success Story Image *</label>
                  <input name="image" type="file" accept=".jpg,.jpeg,.png,.webp" required className={inputCls} />
                </div>
                <button type="submit" className={btnCls}>Upload <i className="fas fa-upload ml-1"></i></button>
              </form>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-lg text-text-dark mb-5 pb-3 border-b border-border">Success Stories ({storiesList.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {storiesList.map(s => (
                  <div key={s.id} className="bg-off-white rounded-lg overflow-hidden border border-border">
                    <img src={s.image_url} alt={s.title || 'Story'} className="w-full h-40 object-cover" />
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-dark">{s.title || 'Untitled'}</span>
                      <button onClick={() => handleDeleteItem('success_stories', s.id)} className="px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
              {storiesList.length === 0 && <p className="text-center py-8 text-muted-foreground">No success stories uploaded yet</p>}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
