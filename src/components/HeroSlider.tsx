import React, { useState, useEffect } from 'react';

const slides = [
  {
    bg: 'bg-gradient-hero',
    badge: "Sahiwal's #1 Competitive Exam Academy",
    title: <>Transform Your Future<br/><span className="text-gold">With HOPE</span><br/><span className="font-black text-2xl md:text-4xl text-[hsl(0,85%,55%)]">CSS, PMS & PCS</span></>,
    desc: "Pakistan's most dedicated coaching academy for CSS, PMS, FPSC, PPSC, IELTS and all competitive exams – guiding aspirants both on-campus & online.",
  },
  {
    bg: 'bg-[linear-gradient(120deg,hsla(220,100%,20%,0.88)_40%,hsla(145,65%,29%,0.6)_100%)]',
    badge: 'IDP & British Council Certified',
    title: <>IELTS / PTE<br/><span className="text-gold">Spoken English</span></>,
    desc: 'Academic | General | UKVI | Life Skills – Under Expert Certified Instructors with 10+ years experience.',
  },
  {
    bg: 'bg-[linear-gradient(120deg,hsla(220,100%,20%,0.88)_40%,hsla(280,100%,25%,0.55)_100%)]',
    badge: 'HEC Affiliated Universities',
    title: <>Law Admission<br/><span className="text-gold">Test (LAT)</span></>,
    desc: '4-Year LLB degree program preparation for HEC affiliated universities. 30-Day intensive course. Admissions Open 2026!',
  },
  {
    bg: 'bg-[linear-gradient(120deg,hsla(220,100%,20%,0.88)_40%,hsla(195,80%,30%,0.6)_100%)]',
    badge: 'Tech Skills for the Future',
    title: <>Computer<br/><span className="text-gold">Courses</span></>,
    desc: 'Computer Science for competitive exams + Computer Skills & Training: MS Office, Web Development, Graphic Design and more.',
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[calc(100vh-108px)] min-h-[560px] max-h-[780px] overflow-hidden">
      {slides.map((slide, i) => (
        <div key={i} className={`absolute inset-0 ${slide.bg} flex items-center transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="max-w-[700px] px-6 md:px-14 text-primary-foreground animate-fade-up">
            <span className="inline-block bg-gold text-primary-dark text-xs font-extrabold tracking-wider uppercase px-4 py-1 rounded-full mb-5">{slide.badge}</span>
            <h1 className="font-display text-4xl md:text-6xl font-black leading-[1.1] mb-4 drop-shadow-lg">{slide.title}</h1>
            <p className="text-base md:text-lg opacity-90 mb-8 max-w-[560px] leading-relaxed">{slide.desc}</p>
            <div className="flex gap-3.5 flex-wrap">
              <a href="#admissions" className="inline-block px-8 py-3.5 rounded-full font-bold text-sm bg-accent text-accent-foreground shadow-lg hover:bg-accent-dark hover:-translate-y-0.5 transition-all">Apply Now</a>
              <a href="#courses" className="inline-block px-8 py-3.5 rounded-full font-bold text-sm border-2 border-primary-foreground/75 text-primary-foreground hover:bg-primary-foreground/15 hover:-translate-y-0.5 transition-all">Explore Courses</a>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)} className="absolute top-1/2 left-5 -translate-y-1/2 w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground border border-primary-foreground/30 hover:bg-accent transition-colors z-10"><i className="fas fa-chevron-left"></i></button>
      <button onClick={() => setCurrent(c => (c + 1) % slides.length)} className="absolute top-1/2 right-5 -translate-y-1/2 w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground border border-primary-foreground/30 hover:bg-accent transition-colors z-10"><i className="fas fa-chevron-right"></i></button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-gold scale-125' : 'bg-primary-foreground/50'}`}></button>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
