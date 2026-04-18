import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSlider from '@/components/HeroSlider';
import { WebsiteAdsSection, CoursesSection, WhySection, DirectorSection, FacultySection, ScheduleSection, SuccessStoriesSection, StatsBar, AnnouncementBar, CTASection } from '@/components/HomeSections';
import { AdmissionsSection, ContactSection } from '@/components/FormSections';

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSlider />
    <WebsiteAdsSection />
    <StatsBar />
    <AnnouncementBar />
    <CoursesSection />
    <WhySection />
    <DirectorSection />
    <FacultySection />
    <ScheduleSection />
    <SuccessStoriesSection />
    <AdmissionsSection />
    <CTASection />
    <ContactSection />
    <Footer />
  </div>
);

export default Index;
