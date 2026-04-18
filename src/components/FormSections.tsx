import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdmissionsSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const { error } = await supabase.from('applications').insert({
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string || null,
      course: formData.get('course') as string,
      preferred_mode: formData.get('preferred_mode') as string,
      city: formData.get('city') as string || null,
      message: formData.get('message') as string || null,
    });
    setLoading(false);
    if (error) { toast.error('Failed to submit. Please try again.'); return; }
    setSubmitted(true);
    toast.success('Application submitted successfully!');
  };

  return (
    <section className="py-20 bg-off-white" id="admissions">
      <div className="container">
        <div className="text-center mb-14">
          <span className="inline-block bg-gradient-cta text-primary-foreground text-xs font-extrabold tracking-widest uppercase px-4 py-1 rounded-full mb-3">Join Us</span>
          <h2 className="font-display text-3xl md:text-4xl text-text-dark mb-3">Apply for Admission</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Fill in the form below to apply – our team will contact you within 24 hours</p>
        </div>
        <div className="max-w-[700px] mx-auto bg-card rounded-2xl p-10 shadow-hope-md">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="font-display text-xl text-primary">Application Submitted!</h3>
              <p className="text-muted-foreground mt-2">Thank you! Our team will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-bold text-text-dark mb-1.5">Full Name *</label><input name="full_name" type="text" placeholder="Your full name" required className="w-full px-4 py-3 border-2 border-border rounded-md text-sm focus:border-primary outline-none transition-colors" /></div>
                <div><label className="block text-sm font-bold text-text-dark mb-1.5">Phone *</label><input name="phone" type="tel" placeholder="03XX-XXXXXXX" required className="w-full px-4 py-3 border-2 border-border rounded-md text-sm focus:border-primary outline-none transition-colors" /></div>
              </div>
              <div className="mb-4"><label className="block text-sm font-bold text-text-dark mb-1.5">Email</label><input name="email" type="email" placeholder="your@email.com" className="w-full px-4 py-3 border-2 border-border rounded-md text-sm focus:border-primary outline-none transition-colors" /></div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-text-dark mb-1.5">Course Applying For *</label>
                <select name="course" required className="w-full px-4 py-3 border-2 border-border rounded-md text-sm focus:border-primary outline-none transition-colors bg-card">
                  <option value="">-- Select Course --</option>
                  {['CSS / PMS', 'One Paper MCQs (FPSC/PPSC/NTS)', 'IELTS / PTE / Spoken English', 'LAT / GAT / HAT / NAT / USAT', 'Computer Courses'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-bold text-text-dark mb-1.5">Preferred Mode</label>
                  <select name="preferred_mode" className="w-full px-4 py-3 border-2 border-border rounded-md text-sm focus:border-primary outline-none transition-colors bg-card">
                    <option>On-Campus + Online</option><option>Online Only</option><option>On-Campus Only</option>
                  </select>
                </div>
                <div><label className="block text-sm font-bold text-text-dark mb-1.5">City / Area</label><input name="city" type="text" placeholder="Your city" className="w-full px-4 py-3 border-2 border-border rounded-md text-sm focus:border-primary outline-none transition-colors" /></div>
              </div>
              <div className="mb-6"><label className="block text-sm font-bold text-text-dark mb-1.5">Message (optional)</label><textarea name="message" placeholder="Any questions..." className="w-full px-4 py-3 border-2 border-border rounded-md text-sm focus:border-primary outline-none transition-colors resize-y min-h-[80px]"></textarea></div>
              <button type="submit" disabled={loading} className="w-full py-4 rounded-full font-bold bg-accent text-accent-foreground shadow-lg hover:bg-accent-dark transition-all disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Application'} <i className="fas fa-paper-plane ml-1"></i>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export const ContactSection = () => (
  <section className="py-20 bg-off-white" id="contact">
    <div className="container">
      <div className="text-center mb-14">
        <span className="inline-block bg-gradient-cta text-primary-foreground text-xs font-extrabold tracking-widest uppercase px-4 py-1 rounded-full mb-3">Get In Touch</span>
        <h2 className="font-display text-3xl md:text-4xl text-text-dark">Contact Us</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
        <div className="bg-card rounded-2xl p-7 shadow-hope-sm">
          <h3 className="font-display text-lg text-text-dark mb-4">Contact Information</h3>
          <ul className="space-y-3.5">
            <li className="flex gap-3 items-start text-sm"><i className="fas fa-map-marker-alt text-accent mt-0.5 w-4 shrink-0"></i>05-Q Masjid Shuhhada Chowk, Farid Town, Sahiwal</li>
            <li className="flex gap-3 items-center text-sm"><i className="fas fa-phone text-primary w-4 shrink-0"></i><a href="tel:03457345203">0345-7345203</a></li>
            <li className="flex gap-3 items-center text-sm"><i className="fas fa-mobile-alt text-primary w-4 shrink-0"></i><a href="tel:03217345203">0321-7345203</a></li>
            <li className="flex gap-3 items-center text-sm"><i className="fas fa-phone-volume text-primary w-4 shrink-0"></i><a href="tel:0404555203">040-4555203</a></li>
            <li className="flex gap-3 items-center text-sm"><i className="fas fa-envelope text-primary w-4 shrink-0"></i><a href="mailto:hopepreparations@gmail.com">hopepreparations@gmail.com</a></li>
            <li className="flex gap-3 items-center text-sm"><i className="fas fa-clock text-gold w-4 shrink-0"></i>Mon–Sat: 7:00 AM – 7:00 PM</li>
          </ul>
        </div>
        <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground text-center flex flex-col justify-center">
          <i className="fab fa-whatsapp text-5xl mb-3 text-green block"></i>
          <h3 className="font-display text-xl mb-2">WhatsApp Us</h3>
          <p className="opacity-90 text-sm mb-4">Quick enquiries via WhatsApp</p>
          <a href="https://wa.me/923457345203" target="_blank" rel="noopener" className="inline-block px-6 py-2.5 rounded-full font-extrabold text-sm bg-background text-primary hover:-translate-y-0.5 transition-all mb-2">Chat on WhatsApp</a>
          <p className="text-xs opacity-70 mt-2">0345-7345203 | 0321-7345203</p>
        </div>
      </div>
    </div>
  </section>
);
