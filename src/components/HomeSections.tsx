import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import directorImg from '@/assets/director-asif-naveed.jpeg';
import hopeLogo from '@/assets/hope-logo-banner.jpeg';

const courses = [
  { icon: 'fa-landmark', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop', title: 'CSS / PMS', desc: 'Complete preparation for Civil Services with expert guidance, notes, mock tests and interview prep.', duration: '6 Months', mode: 'On-Campus & Online' },
  { icon: 'fa-pen-to-square', img: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=300&fit=crop', title: 'PCS: One Paper MCQs (FPSC/PPSC/PCS)', desc: 'Specialized MCQ preparation for all one-paper competitive exams including FPSC, PPSC, PCS, NTS and PTS.', duration: '4 Months', mode: 'On-Campus & Online' },
  { icon: 'fa-globe', img: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop', title: 'IELTS / PTE / Spoken English', desc: 'Academic, General, UKVI and Life Skills modules. Certified by IDP and British Council.', duration: '8 Weeks', mode: 'On-Campus & Online' },
  { icon: 'fa-balance-scale', img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop', title: 'LAT / GAT / HAT / NAT / USAT / PMA / ISSB', desc: 'Law Admission Test, Graduate Assessment Test, HAT, NAT, USAT, PMA Long Course and ISSB preparations.', duration: '30 Days – 3 Months', mode: 'On-Campus & Online' },
  { icon: 'fa-laptop-code', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop', title: 'Computer Courses', desc: 'Computer Science for competitive exams + Computer Skills & Training courses for all levels.', duration: 'Flexible', mode: 'On-Campus & Online' },
];

export const WebsiteAdsSection = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase.from('website_ads').select('*').eq('is_active', true).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setAds(data);
    });
  }, []);

  useEffect(() => {
    if (ads.length <= 2) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % Math.ceil(ads.length / 2)), 5000);
    return () => clearInterval(t);
  }, [ads.length]);

  if (ads.length === 0) return null;

  // Show all ads — if ≤2 just render grid; if >2 paginate 2 at a time with smooth transition
  if (ads.length <= 2) {
    return (
      <section className="py-4 bg-off-white">
        <div className="container">
          <div className={`grid gap-4 ${ads.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {ads.map(ad => (
              <div key={ad.id} className="rounded-xl overflow-hidden shadow-hope-sm border border-border bg-card hover:shadow-hope-md transition-shadow flex items-center justify-center">
                <img src={ad.image_url} alt={ad.title || 'Advertisement'} className="w-full h-auto max-h-80 object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const pages = Math.ceil(ads.length / 2);
  return (
    <section className="py-4 bg-off-white overflow-hidden">
      <div className="container">
        <div className="relative">
          <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
            {Array.from({ length: pages }).map((_, p) => (
              <div key={p} className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0 w-full px-1">
                {ads.slice(p * 2, p * 2 + 2).map(ad => (
                  <div key={ad.id} className="rounded-xl overflow-hidden shadow-hope-sm border border-border bg-card flex items-center justify-center">
                    <img src={ad.image_url} alt={ad.title || 'Advertisement'} className="w-full h-auto max-h-80 object-contain" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`Page ${i+1}`} className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-accent scale-125' : 'bg-muted-foreground/30'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const CoursesSection = () => (
  <section className="py-20 bg-off-white" id="courses">
    <div className="container">
      <div className="text-center mb-14">
        <span className="inline-block bg-gradient-cta text-primary-foreground text-xs font-extrabold tracking-widest uppercase px-4 py-1 rounded-full mb-3">What We Offer</span>
        <h2 className="font-display text-3xl md:text-4xl text-text-dark mb-3">Our Courses</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Comprehensive preparation programs for all major competitive and academic examinations</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {courses.map(c => (
          <div key={c.title} className="bg-card rounded-lg p-8 shadow-hope-sm border border-border hover:-translate-y-2 hover:shadow-hope-lg transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-cta opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground mb-4 overflow-hidden relative">
              <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <i className={`fas ${c.icon} text-2xl relative z-10 drop-shadow-md`}></i>
            </div>
            <h3 className="font-display text-lg text-text-dark font-bold mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground flex-1 mb-4">{c.desc}</p>
            <div className="flex gap-4 text-xs text-muted-foreground font-semibold border-t border-border pt-3">
              <span><i className="fas fa-clock text-primary mr-1"></i>{c.duration}</span>
              <span><i className="fas fa-chalkboard-teacher text-primary mr-1"></i>{c.mode}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const WhySection = () => (
  <section className="py-20" id="about">
    <div className="container">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-14 items-center">
        <div>
          <span className="inline-block bg-gradient-cta text-primary-foreground text-xs font-extrabold tracking-widest uppercase px-4 py-1 rounded-full mb-3">Why Choose Us</span>
          <h2 className="font-display text-3xl md:text-4xl text-text-dark mb-4">Why HOPE Preparations?</h2>
          <p className="text-muted-foreground mb-6">HOPE – House of Progressive Education – has been Sahiwal's most trusted name for competitive exam preparation for 8+ years.</p>
          <ul className="space-y-3 mb-8">
            {['Expert faculty with government service backgrounds', 'Both on-campus and online classes via LMS', 'Daily newspapers, notes & handouts provided', 'Daily individual assessment & evaluation', 'Preparation: 7:00AM–3:00PM Online via LMS', 'Lectures: 3:00PM–7:00PM On-Campus & Online', 'Mock tests, quizzes & interview preparation', 'Free demo class available'].map(item => (
              <li key={item} className="flex items-start gap-3 text-sm font-semibold text-text-body">
                <i className="fas fa-check-circle text-green mt-0.5 shrink-0"></i>{item}
              </li>
            ))}
          </ul>
          <a href="#admissions" className="inline-block px-8 py-3.5 rounded-full font-bold text-sm bg-accent text-accent-foreground shadow-lg hover:bg-accent-dark hover:-translate-y-0.5 transition-all">Apply Now</a>
        </div>
        <div className="relative">
          <div className="w-full rounded-2xl shadow-hope-lg overflow-hidden aspect-[4/5]">
            <img src={hopeLogo} alt="HOPE Preparations - House of Progressive Education" className="w-full h-full object-contain bg-background" />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-5 py-3.5 rounded-lg font-extrabold text-sm flex items-center gap-2 shadow-hope-md">
            <i className="fas fa-star text-gold"></i> 8+ Years of Excellence
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const DirectorSection = () => (
  <section className="py-20 bg-off-white">
    <div className="container">
      <div className="text-center mb-14">
        <span className="inline-block bg-gradient-cta text-primary-foreground text-xs font-extrabold tracking-widest uppercase px-4 py-1 rounded-full mb-3">From the Director</span>
        <h2 className="font-display text-3xl md:text-4xl text-text-dark">Director's Message</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12 bg-card rounded-2xl p-10 md:p-12 shadow-hope-md border border-border">
        <div>
          <img src={directorImg} alt="Asif Naveed" className="w-full rounded-2xl shadow-hope-sm object-cover aspect-[3/4]" />
          <div className="mt-4 text-center">
            <strong className="block text-lg text-text-dark font-display">Asif Naveed</strong>
            <span className="text-sm text-primary font-bold">Director, HOPE Preparations</span>
          </div>
        </div>
        <div>
          <i className="fas fa-quote-left text-5xl text-accent/25 mb-2 block"></i>
          <p className="text-base text-text-body leading-relaxed mb-4">At HOPE – House of Progressive Education – we believe every aspirant deserves the best chance to achieve their dreams. Our mission is simple: provide the highest quality education and guidance for competitive exams, backed by expert faculty, structured study plans, and an environment that fosters growth and confidence.</p>
          <p className="text-base text-text-body leading-relaxed mb-4">Over the years, we have helped thousands of aspirants from Sahiwal and surrounding areas crack the toughest competitive exams in Pakistan. Whether it is CSS, PMS, FPSC, PPSC, IELTS, or any other professional examination, our team of dedicated mentors ensures you are fully prepared.</p>
          <p className="text-base text-text-body leading-relaxed mb-4">We offer both on-campus and online learning through our modern LMS platform, ensuring that every aspirant – regardless of location – gets the same level of attention and quality. At HOPE, your success is our success.</p>
          <p className="text-primary italic font-semibold"><strong>— Asif Naveed</strong>, Director HOPE Preparations</p>
        </div>
      </div>
    </div>
  </section>
);

export const FacultySection = () => {
  const [dbFaculty, setDbFaculty] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('faculty').select('*').order('display_order').then(({ data }) => {
      if (data && data.length > 0) setDbFaculty(data);
    });
  }, []);

  if (dbFaculty.length === 0) return null;

  return (
    <section className="py-20" id="faculty">
      <div className="container">
        <div className="text-center mb-14">
          <span className="inline-block bg-gradient-cta text-primary-foreground text-xs font-extrabold tracking-widest uppercase px-4 py-1 rounded-full mb-3">Meet Our Experts</span>
          <h2 className="font-display text-3xl md:text-4xl text-text-dark mb-3">Our Faculty</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Learn from the best – experienced professionals with government service and academic backgrounds</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {dbFaculty.map(f => (
            <div key={f.id} className="bg-off-white rounded-lg overflow-hidden shadow-hope-sm border border-border hover:-translate-y-1 hover:shadow-hope-md transition-all text-center">
              {f.photo_url ? (
                <img src={f.photo_url} alt={f.name} className="aspect-square w-full object-cover object-top" />
              ) : (
                <div className="aspect-square bg-gradient-primary flex items-center justify-center text-primary-foreground text-3xl">
                  <i className="fas fa-user-tie"></i>
                </div>
              )}
              <div className="p-3">
                <h3 className="font-display text-sm text-text-dark font-bold leading-tight">{f.name}</h3>
                <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">{f.subject}</span>
                {f.description && <p className="text-[10px] text-muted-foreground leading-snug mt-1 line-clamp-2">{f.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ScheduleSection = () => (
  <section className="py-20 bg-off-white" id="schedule">
    <div className="container">
      <div className="text-center mb-14">
        <span className="inline-block bg-gradient-cta text-primary-foreground text-xs font-extrabold tracking-widest uppercase px-4 py-1 rounded-full mb-3">Timetable</span>
        <h2 className="font-display text-3xl md:text-4xl text-text-dark mb-3">Class Schedule</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Both online and on-campus classes available</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
        <div className="bg-card rounded-lg p-10 shadow-hope-md border-t-[5px] border-primary">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl mb-5 relative">
            <i className="fas fa-laptop"></i>
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold flex items-center justify-center text-primary-dark text-xs shadow-md border-2 border-card"><i className="fas fa-clock"></i></span>
          </div>
          <h3 className="font-display text-xl text-text-dark mb-2">Online Preparation</h3>
          <div className="text-xl font-black text-primary mb-3 flex items-center gap-2"><i className="fas fa-sun text-base"></i> 7:00 AM – 3:00 PM</div>
          <p className="text-sm text-muted-foreground mb-5">Daily online classes via LMS platform. Access notes, newspapers, quizzes & recorded lectures anytime.</p>
          <ul className="space-y-2">
            {['Live sessions on Google Meet', 'LMS access 24/7', 'Daily newspapers uploaded', 'Mock tests online'].map(i => (
              <li key={i} className="text-sm font-semibold text-text-body flex items-center gap-2"><i className="fas fa-check text-green text-xs"></i>{i}</li>
            ))}
          </ul>
        </div>
        <div className="bg-card rounded-lg p-10 shadow-hope-md border-t-[5px] border-accent">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground text-2xl mb-5 relative">
            <i className="fas fa-school"></i>
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold flex items-center justify-center text-primary-dark text-xs shadow-md border-2 border-card"><i className="fas fa-stopwatch"></i></span>
          </div>
          <h3 className="font-display text-xl text-text-dark mb-2">On-Campus Lectures</h3>
          <div className="text-xl font-black text-accent mb-3 flex items-center gap-2"><i className="fas fa-moon text-base"></i> 3:00 PM – 7:00 PM</div>
          <p className="text-sm text-muted-foreground mb-5">Daily on-campus lectures at our Sahiwal campus with expert faculty, interactive sessions and assessments.</p>
          <ul className="space-y-2">
            {['Face-to-face expert teaching', 'Daily assessment & evaluation', 'Free handouts & notes', 'Interview preparation'].map(i => (
              <li key={i} className="text-sm font-semibold text-text-body flex items-center gap-2"><i className="fas fa-check text-green text-xs"></i>{i}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export const SuccessStoriesSection = () => {
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('success_stories').select('*').eq('is_active', true).order('display_order').then(({ data }) => {
      if (data) setStories(data);
    });
  }, []);

  if (stories.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-14">
          <span className="inline-block bg-gradient-cta text-primary-foreground text-xs font-extrabold tracking-widest uppercase px-4 py-1 rounded-full mb-3">Our Achievers</span>
          <h2 className="font-display text-3xl md:text-4xl text-text-dark mb-3">Success Stories</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Proud moments from our aspirants who achieved their dreams with HOPE Preparations</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {stories.map(s => (
            <div key={s.id} className="rounded-xl overflow-hidden shadow-hope-sm border border-border hover:-translate-y-1 hover:shadow-hope-md transition-all">
              <img src={s.image_url} alt={s.title || 'Success Story'} className="w-full h-56 object-cover" />
              {s.title && <div className="bg-card px-4 py-2.5 text-center text-sm font-bold text-text-dark">{s.title}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const StatsBar = () => (
  <div className="bg-gradient-primary py-7">
    <div className="container flex justify-around flex-wrap gap-5">
      {[
        { num: '500+', label: 'Aspirants Enrolled' },
        { num: '8+', label: 'Years of Excellence' },
        { num: '15+', label: 'Expert Faculty' },
        { num: '12+', label: 'Courses Offered' },
        { num: '95%', label: 'Success Rate' },
      ].map(s => (
        <div key={s.label} className="text-center text-primary-foreground">
          <span className="block font-display text-4xl font-black text-gold leading-none">{s.num}</span>
          <span className="text-xs font-semibold opacity-90 mt-1 block">{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export const AnnouncementBar = () => (
  <div className="bg-accent text-accent-foreground flex items-center overflow-hidden h-11">
    <span className="bg-accent-dark px-5 h-full flex items-center font-extrabold text-xs tracking-wide whitespace-nowrap gap-2"><i className="fas fa-bullhorn"></i> ADMISSIONS OPEN</span>
    <div className="overflow-hidden flex-1">
      <span className="inline-block animate-marquee text-sm font-semibold whitespace-nowrap pl-5">
        🎓 New Sessions Starting – CSS/PMS | One Paper MCQs (FPSC/PPSC/NTS) | IELTS/PTE/Spoken English | LAT/GAT/HAT/NAT/USAT | Computer Courses &nbsp;&nbsp; 📞 0345-7345203 | 0321-7345203 &nbsp;&nbsp; 📍 05-Q Masjid Shuhhada Chowk, Farid Town, Sahiwal &nbsp;&nbsp;
      </span>
    </div>
  </div>
);

export const CTASection = () => (
  <section className="py-20 bg-off-white">
    <div className="container">
      <div className="bg-gradient-cta rounded-3xl p-14 md:p-16 flex items-center justify-between gap-10 flex-wrap relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full bg-primary-foreground/5"></div>
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-primary-foreground mb-2">Ready to Start Your Journey?</h2>
          <p className="text-primary-foreground/85 max-w-lg">Join thousands of successful aspirants who achieved their dreams with HOPE Preparations. New sessions starting soon!</p>
        </div>
        <div className="flex gap-3.5 flex-wrap shrink-0">
          <a href="#admissions" className="inline-block px-8 py-3.5 rounded-full font-extrabold text-sm bg-background text-primary hover:-translate-y-0.5 transition-all">Apply Now</a>
          <a href="https://wa.me/923457345203" target="_blank" rel="noopener" className="inline-block px-8 py-3.5 rounded-full font-extrabold text-sm border-2 border-primary-foreground/75 text-primary-foreground hover:bg-primary-foreground/15 hover:-translate-y-0.5 transition-all"><i className="fab fa-whatsapp mr-1"></i>WhatsApp</a>
        </div>
      </div>
    </div>
  </section>
);
