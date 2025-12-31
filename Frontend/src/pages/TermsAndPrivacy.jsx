import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Shield,
  BookOpen,
  Server,
  Eye,
  AlertCircle,
  CreditCard,
  Scale,
  UserX,
  Database,
  Globe,
  FileText,
  Lock,
  Cpu,
  Activity,
  HelpCircle,
  Terminal,
  Zap,
  Copyright,
  Check,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
// NOTE: Ensure these paths match your project structure
import MainLogo from '../assets/Main/logo-without-bg.png';

// --- Styles for Animations & Layout ---
const styles = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-scroll {
    animation: scroll 30s linear infinite;
  }
  
  /* Soft blob animation (Same as Home) */
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  /* Custom Scrollbar for the sticky sidebar */
  .sidebar-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .sidebar-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .sidebar-scroll::-webkit-scrollbar-thumb {
    background-color: #f3f4f6;
    border-radius: 20px;
  }
  .sidebar-scroll::-webkit-scrollbar-thumb:hover {
    background-color: #e5e7eb;
  }

  html {
    scroll-behavior: smooth;
  }
`;

// --- Components ---

const TopBanner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#ffb6e6] text-gray-900 border-b border-pink-300/50">
      <div className="relative flex items-center h-10 overflow-hidden">
        <div className="flex w-full whitespace-nowrap overflow-hidden">
          <div className="flex animate-scroll min-w-full items-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-8 mx-4 text-xs font-bold uppercase tracking-widest text-pink-950"
              >
                <span className="flex items-center gap-2">
                  📜 Reviewing Legal Documentation
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                <span>Local-First Data Policy</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                <span>Transparency is our priority</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Minimal Header replacing the complex Navbar
const SimpleHeader = () => (
  <div className="absolute top-14 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 pt-4">
    {/* Logo */}
    <div className="flex items-center gap-2 font-bold text-gray-900 tracking-tight text-lg select-none">
      <img src={MainLogo} alt="JobPilot Logo" className='w-5 h-5' />
      JOBPILOT
    </div>

    {/* Back Button */}
    <Link 
      to="/" 
      className="group flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 hover:border-gray-300 text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md"
    >
      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
      Back to Home
    </Link>
  </div>
);

const SidebarLink = ({ id, activeId, label, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`text-left w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200`}
  >
    {label}
  </button>
);

const SectionBlock = ({ id, title, icon: Icon, children }) => (
  <div id={id} className="scroll-mt-32 mb-16 border-b border-gray-100 pb-16 last:border-0 last:pb-0">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 shrink-0 border border-gray-100">
        <Icon size={20} className="text-gray-700" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
    </div>
    <div className="text-gray-600 leading-relaxed space-y-5 text-[15px]">
      {children}
    </div>
  </div>
);

const SubHeading = ({ children }) => (
  <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">{children}</h3>
);

// --- Main Page Component ---

const TermsAndPrivacy = () => {
  const [activeSection, setActiveSection] = useState('intro');

  // Handle scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'intro', 'definitions', 'privacy', 'data-retention', 'processing',
        'account', 'billing', 'cancellation', 'license', 'restrictions',
        'content-ownership', 'dmca', 'third-party', 'disclaimer',
        'limitation', 'indemnification', 'governing-law', 'arbitration',
        'changes', 'contact'
      ];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-pink-100 selection:text-pink-900 overflow-x-hidden">
      <style>{styles}</style>
      
      <TopBanner />
      <SimpleHeader />

      {/* Header Section (Matching Main Site Style) */}
      <header className="relative pt-48 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob"></div>
          <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 shadow-sm mb-6">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
             <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Last Updated: January 2025</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.05]">
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Privacy</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We believe your career data is your intellectual property. Our policies reflect our commitment to local-first storage, transparency, and user rights.
          </p>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 pb-32 flex flex-col md:flex-row gap-16">
        
        {/* Sticky Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-32 space-y-1 sidebar-scroll max-h-[calc(100vh-150px)] overflow-y-auto pr-2">
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation</div>
            <SidebarLink id="intro" activeId={activeSection} label="1. Introduction" onClick={scrollToSection} />
            <SidebarLink id="definitions" activeId={activeSection} label="2. Definitions" onClick={scrollToSection} />
            <SidebarLink id="privacy" activeId={activeSection} label="3. Privacy Policy" onClick={scrollToSection} />
            <SidebarLink id="data-retention" activeId={activeSection} label="4. Data Retention" onClick={scrollToSection} />
            <SidebarLink id="processing" activeId={activeSection} label="5. AI Processing" onClick={scrollToSection} />
            <SidebarLink id="account" activeId={activeSection} label="6. Account Terms" onClick={scrollToSection} />
            <SidebarLink id="billing" activeId={activeSection} label="7. Payment Terms" onClick={scrollToSection} />
            <SidebarLink id="cancellation" activeId={activeSection} label="8. Cancellation" onClick={scrollToSection} />
            <SidebarLink id="license" activeId={activeSection} label="9. License Grant" onClick={scrollToSection} />
            <SidebarLink id="restrictions" activeId={activeSection} label="10. Restrictions" onClick={scrollToSection} />
            <SidebarLink id="content-ownership" activeId={activeSection} label="11. Ownership" onClick={scrollToSection} />
            <SidebarLink id="dmca" activeId={activeSection} label="12. DMCA" onClick={scrollToSection} />
            <SidebarLink id="third-party" activeId={activeSection} label="13. Third Parties" onClick={scrollToSection} />
            <SidebarLink id="disclaimer" activeId={activeSection} label="14. Disclaimers" onClick={scrollToSection} />
            <SidebarLink id="limitation" activeId={activeSection} label="15. Limitations" onClick={scrollToSection} />
            <SidebarLink id="indemnification" activeId={activeSection} label="16. Indemnification" onClick={scrollToSection} />
            <SidebarLink id="governing-law" activeId={activeSection} label="17. Governing Law" onClick={scrollToSection} />
            <SidebarLink id="arbitration" activeId={activeSection} label="18. Arbitration" onClick={scrollToSection} />
            <SidebarLink id="changes" activeId={activeSection} label="19. Changes" onClick={scrollToSection} />
            <SidebarLink id="contact" activeId={activeSection} label="20. Contact" onClick={scrollToSection} />
          </div>
        </aside>

        {/* Text Content */}
        <div className="flex-1 max-w-3xl">
          
          <SectionBlock id="intro" title="1. Introduction" icon={BookOpen}>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and JobPilot Inc. ("Company," "we," "us," or "our"), concerning your access to and use of the JobPilot website as well as any other media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
            </p>
            <p>
              You agree that by accessing the Site and installing our Browser Extension, you have read, understood, and agreed to be bound by all of these Terms of Service. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
            </p>
          </SectionBlock>

          <SectionBlock id="definitions" title="2. Definitions" icon={Terminal}>
            <p>For the purposes of this Agreement:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 marker:text-pink-400">
              <li><strong>"Service"</strong> refers to the JobPilot browser extension, the dashboard located at app.jobpilot.ai, and the reasoning engine API.</li>
              <li><strong>"User Content"</strong> means any resumes, cover letters, job descriptions, or application notes that you upload, import, or generate using the Service.</li>
              <li><strong>"Personal Data"</strong> means data about a living individual who can be identified from those data.</li>
              <li><strong>"Local Storage"</strong> refers to the browser-based storage (IndexedDB, localStorage) on your personal device where your sensitive documents are retained.</li>
            </ul>
          </SectionBlock>

          <SectionBlock id="privacy" title="3. Privacy Policy" icon={Shield}>
            <SubHeading>3.1 Philosophy: Local-First</SubHeading>
            <p>
              Our architecture is designed around a "Local-First" philosophy. This means that your primary career documents (Resumes and generated Cover Letters) are stored locally on your device's filesystem or browser storage. We do not maintain a centralized database of your resumes in plain text.
            </p>
            
            <SubHeading>3.2 Information We Collect</SubHeading>
            <p>We collect only the following information:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 marker:text-pink-400">
              <li><strong>Authentication Data:</strong> Your email address and a bcrypt-hashed password.</li>
              <li><strong>Subscription Data:</strong> Payment status, plan type, and renewal dates via Stripe.</li>
              <li><strong>Telemetry:</strong> Anonymized error logs (e.g., "Extension failed to parse LinkedIn DOM") to help us fix bugs.</li>
            </ul>
          </SectionBlock>

          <SectionBlock id="data-retention" title="4. Data Retention" icon={Database}>
            <p>
              <strong>Server-Side:</strong> We retain your account metadata (email, subscription status) for as long as your account is active. Upon deletion request, this data is purged from our production databases within 30 days.
            </p>
            <p>
              <strong>Client-Side:</strong> Data stored on your device (resumes, application history) remains there until you uninstall the extension or clear your browser data. Because we do not sync this data to a central cloud, <strong>we cannot recover this data if you lose your device.</strong>
            </p>
          </SectionBlock>

          <SectionBlock id="processing" title="5. AI Processing & Security" icon={Cpu}>
            <p>
              JobPilot uses Large Language Models (LLMs) to generate content. By using the Service, you acknowledge the following:
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 my-4">
              <h4 className="font-bold text-gray-900 mb-2">Zero Retention API Protocol</h4>
              <p className="text-sm">
                Our agreements with model providers are "Zero Retention." This means the input data (your resume) is processed in memory to generate the response and is immediately discarded. Your data is <strong>not</strong> used to train their models.
              </p>
            </div>
            <p>
              All transmission of data between your client and the inference engine is encrypted via TLS 1.3.
            </p>
          </SectionBlock>

          <SectionBlock id="account" title="6. Account Terms" icon={UserX}>
            <p>
              To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.
            </p>
            <p>
              You are responsible for safeguarding your password. You agree that you will not disclose your password to any third party and that you will take sole responsibility for any activities or actions under your account.
            </p>
          </SectionBlock>

          <SectionBlock id="billing" title="7. Payment Terms" icon={CreditCard}>
            <p>
              <strong>Subscriptions:</strong> Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle").
            </p>
            <p>
              <strong>Payment Processor:</strong> We use Stripe, Inc. as our third-party payment processor. We do not store your credit card details.
            </p>
            <p>
              We reserve the right to modify Subscription fees. You will be provided with reasonable prior notice of any change in fees to give you an opportunity to terminate your Subscription before such change becomes effective.
            </p>
          </SectionBlock>

          <SectionBlock id="cancellation" title="8. Cancellation & Refunds" icon={Activity}>
            <p>
              You may cancel your Subscription renewal either through your online account management page or by contacting our customer support team.
            </p>
            <div className="flex gap-3 items-start p-4 bg-green-50 rounded-xl border border-green-100">
               <Check className="text-green-600 mt-1" size={16} />
               <p className="text-sm text-green-900 font-medium">
                 We offer a 7-day money-back guarantee for first-time subscribers. If you are not satisfied with the Service, you may request a full refund within 7 days of your initial purchase.
               </p>
            </div>
          </SectionBlock>

          <SectionBlock id="license" title="9. License Grant" icon={FileText}>
            <p>
              Subject to your compliance with these Terms, JobPilot Inc. grants you a limited, non-exclusive, non-transferable, non-sublicensable license to download and install a copy of the browser extension on a computer that you own or control and to run such copy of the application solely for your own personal, non-commercial purposes.
            </p>
          </SectionBlock>

          <SectionBlock id="restrictions" title="10. Restrictions" icon={AlertCircle}>
            <p>You agree not to, and you will not permit others to:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 marker:text-pink-400">
              <li>License, sell, rent, lease, or otherwise commercially exploit the Service.</li>
              <li>Modify, make derivative works of, disassemble, or reverse engineer any part of the Service.</li>
              <li>Use the Service for "spamming" or automating applications in a manner that violates the Terms of Service of third-party job boards (e.g., LinkedIn, Indeed).</li>
            </ul>
          </SectionBlock>

          <SectionBlock id="content-ownership" title="11. Ownership" icon={Copyright}>
            <SubHeading>11.1 Our IP</SubHeading>
            <p>
              The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of JobPilot Inc.
            </p>
            <SubHeading>11.2 Your IP</SubHeading>
            <p>
              You retain all rights to the resumes, cover letters, and application data you create using the Service. We claim no intellectual property rights over the material you provide to the Service.
            </p>
          </SectionBlock>

          <SectionBlock id="dmca" title="12. DMCA Notice" icon={Lock}>
            <p>
              If you are a copyright owner or an agent thereof and believe that any Content on our Service infringes upon your copyrights, you may submit a notification pursuant to the Digital Millennium Copyright Act ("DMCA") by providing our Copyright Agent with the necessary information in writing.
            </p>
          </SectionBlock>

          <SectionBlock id="third-party" title="13. Third Parties" icon={Globe}>
            <p>
              The Service may contain links to third-party web sites or services (such as Job Boards like LinkedIn, Greenhouse, Lever) that are not owned or controlled by JobPilot.
            </p>
            <p>
              JobPilot Inc. has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services.
            </p>
          </SectionBlock>

          <SectionBlock id="disclaimer" title="14. Disclaimers" icon={Eye}>
            <p className="font-medium text-gray-900">
              THE SERVICE IS PROVIDED TO YOU "AS IS" AND "AS AVAILABLE" AND WITH ALL FAULTS AND DEFECTS WITHOUT WARRANTY OF ANY KIND.
            </p>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, JOBPILOT INC. EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT.
            </p>
          </SectionBlock>

          <SectionBlock id="limitation" title="15. Limitations" icon={Zap}>
            <p>
              TO THE EXTENT NOT PROHIBITED BY LAW, IN NO EVENT SHALL JOBPILOT INC. BE LIABLE FOR PERSONAL INJURY OR ANY INCIDENTAL, SPECIAL, INDIRECT, OR CONSEQUENTIAL DAMAGES WHATSOEVER, INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, LOSS OF DATA, BUSINESS INTERRUPTION, OR ANY OTHER COMMERCIAL DAMAGES OR LOSSES.
            </p>
          </SectionBlock>

          <SectionBlock id="indemnification" title="16. Indemnification" icon={Shield}>
            <p>
              You agree to indemnify and hold JobPilot Inc. and its parents, subsidiaries, affiliates, officers, employees, agents, partners, and licensors (if any) harmless from any claim or demand, including reasonable attorneys' fees, due to or arising out of your: (a) use of the Service; (b) violation of these Terms; or (c) violation of any right of a third party.
            </p>
          </SectionBlock>

          <SectionBlock id="governing-law" title="17. Governing Law" icon={Scale}>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
            </p>
          </SectionBlock>

          <SectionBlock id="arbitration" title="18. Arbitration" icon={Scale}>
            <p>
              <strong>Binding Arbitration:</strong> Any dispute, controversy or claim arising out of or relating to these Terms will be referred to and finally determined by arbitration in accordance with the JAMS International Arbitration Rules.
            </p>
            <p>
              <strong>Class Action Waiver:</strong> You agree that any arbitration or proceeding shall be limited to the Dispute between us and you individually.
            </p>
          </SectionBlock>

          <SectionBlock id="changes" title="19. Changes" icon={Activity}>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </SectionBlock>

          <SectionBlock id="contact" title="20. Contact" icon={Mail}>
            <p>
              If you have any questions about these Terms, please contact us.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <a className="cursor-pointer bg-gray-900 text-white px-6 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Email Legal Team
              </a>
              <div className="text-xs text-gray-500 flex items-center">
                 JobPilot Inc. <br/> San Francisco, CA
              </div>
            </div>
          </SectionBlock>
        </div>
      </main>

      {/* Footer (Matching Main Site Style) */}
      <footer className="relative overflow-hidden pt-20 pb-16 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-2 font-bold text-gray-900 tracking-tight mb-6 md:mb-0 text-lg">
            <img src={MainLogo} alt="JobPilot Logo" className='w-4 h-4' />
            JOBPILOT
          </div>
          <div className="flex gap-8 font-medium">
            <a href="/privacy" className="hover:text-black transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-black transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-black transition-colors">Contact Us</a>
            <a href="/soon" className="hover:text-black transition-colors">X</a>
            <a href="/soon" className="hover:text-black transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndPrivacy;