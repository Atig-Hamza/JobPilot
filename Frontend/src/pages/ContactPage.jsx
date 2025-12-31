import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Send,
  MapPin,
  HelpCircle,
  Check,
  Twitter,
  Linkedin,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
// NOTE: Ensure these paths match your project structure
import MainLogo from '../assets/Main/logo-without-bg.png';

// --- Styles (Same as Terms Page) ---
const styles = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-scroll {
    animation: scroll 30s linear infinite;
  }
  
  /* Soft blob animation */
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
  
  /* Form Focus Styles */
  .input-focus-ring:focus-within {
    box-shadow: 0 0 0 4px rgba(244, 114, 182, 0.1);
    border-color: #f9a8d4;
  }
`;

// --- Reused Components ---

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
                  👋 We'd love to hear from you
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                <span>24/7 Support for Pro Users</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                <span>Feedback drives our roadmap</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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

// --- Main Page Component ---

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'support', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-pink-100 selection:text-pink-900 overflow-x-hidden">
      <style>{styles}</style>
      
      <TopBanner />
      <SimpleHeader />

      {/* Header Section */}
      <header className="relative pt-48 pb-16 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob"></div>
          <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 shadow-sm mb-6">
             <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
             <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Response time: ~24 hours</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.05]">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Touch</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Have a question about the browser extension? Found a bug? Or just want to say hi? We are here to help.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-32">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          
          {/* Left Column: Contact Form */}
          <div className="flex-1 order-2 md:order-1">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
              
              {isSent ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-blob">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mb-8">
                    Thanks for reaching out, {formData.name}. We'll get back to {formData.email} shortly.
                  </p>
                  <button 
                    onClick={() => { setIsSent(false); setFormData({name: '', email: '', subject: 'support', message: ''}); }}
                    className="text-sm font-bold text-gray-900 underline hover:text-pink-600 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900 ml-1">Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 outline-none transition-all input-focus-ring placeholder:text-gray-400 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900 ml-1">Email</label>
                      <input 
                        required
                        type="email" 
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 outline-none transition-all input-focus-ring placeholder:text-gray-400 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 ml-1">Subject</label>
                    <div className="relative">
                      <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 outline-none transition-all input-focus-ring appearance-none font-medium"
                      >
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="feedback">Product Feedback</option>
                        <option value="partnership">Partnerships</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 ml-1">Message</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="How can we help you today?"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 outline-none transition-all input-focus-ring placeholder:text-gray-400 font-medium resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Contact Info */}
          <div className="w-full md:w-80 lg:w-96 shrink-0 space-y-6 order-1 md:order-2">
            
            {/* Direct Email Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-pink-500 mb-4 shadow-sm">
                <Mail size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Email Us Directly</h3>
              <p className="text-sm text-gray-500 mb-4">Prefer your email client?</p>
              <div className="space-y-3">
                <a href="mailto:hamzaatig58@gmail.com" className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  hamzaatig58@gmail.com
                </a>
                <a href="mailto:hamzaatig@icloud.com" className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  hamzaatig@icloud.com
                </a>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-purple-500 mb-4 shadow-sm">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Our HQ</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                JobPilot Inc.<br />
                123 Innovation Drive, Suite 400<br />
                San Francisco, CA 94103
              </p>
            </div>

             {/* Help Card */}
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle size={20} className="text-pink-300"/>
                <h3 className="font-bold">Need fast answers?</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                Check out our documentation for guides on how to install the extension and troubleshoot common issues.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/10">
                Visit Help Center <ArrowLeft size={12} className="rotate-180" />
              </a>
            </div>

          </div>
        </div>
      </main>

      {/* Footer (Same as Terms Page) */}
      <footer className="relative overflow-hidden pt-20 pb-16 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-2 font-bold text-gray-900 tracking-tight mb-6 md:mb-0 text-lg">
            <img src={MainLogo} alt="JobPilot Logo" className='w-4 h-4' />
            JOBPILOT
          </div>
          <div className="flex gap-8 font-medium">
            <Link to="/privacy" className="hover:text-black transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link to="/contact" className="hover:text-black transition-colors">Contact Us</Link>
            <a href="/soon" className="hover:text-black transition-colors flex items-center gap-1">X</a>
            <a href="/soon" className="hover:text-black transition-colors flex items-center gap-1">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;