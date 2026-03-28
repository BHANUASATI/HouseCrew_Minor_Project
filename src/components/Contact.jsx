import React, { useState } from "react";
import { FaPaperPlane, FaEnvelope, FaUser, FaBriefcase, FaCheck, FaExclamationTriangle } from "react-icons/fa";

const Contact = () => {
  const [focused, setFocused] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        console.error('Submission error:', data);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Network error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-28 bg-gradient-to-b from-black via-slate-900 to-black font-[Inter]">
      <div className="max-w-6xl mx-auto px-4">

        {/* ================= HEADING ================= */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Let's Start a{" "}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
              Conversation
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-300 text-lg">
            Whether you need a service, want to join as a professional, or explore partnerships —  
            the HouseCrew team is here to help.
          </p>
        </div>

        {/* ================= MAIN ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ================= LEFT INFO ================= */}
          <div className="space-y-10">
            <h3 className="text-2xl font-bold text-white">
              We'd Love to Hear From You
            </h3>

            <p className="text-slate-300 leading-relaxed">
              HouseCrew connects households with trusted service professionals.
              If you have questions about bookings, services, joining as a worker,
              or business collaborations — reach out and our team will respond quickly.
            </p>

            <div className="space-y-6">

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <FaEnvelope className="text-white" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold">Email Support</p>
                  <p className="text-slate-400 text-sm">support@housecrew.com</p>
                </div>
              </div>

              {/* Customer Support */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <FaUser className="text-white" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold">Customer & Service Help</p>
                  <p className="text-slate-400 text-sm">Booking issues, service questions, feedback</p>
                </div>
              </div>

              {/* Partner / Professional */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <FaBriefcase className="text-white" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold">Work With HouseCrew</p>
                  <p className="text-slate-400 text-sm">Join as a professional or explore partnerships</p>
                </div>
              </div>

            </div>
          </div>

          {/* ================= RIGHT FORM ================= */}
          <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            
            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3">
                <FaCheck className="text-green-400 text-xl" />
                <div>
                  <p className="text-green-400 font-semibold">Message Sent Successfully!</p>
                  <p className="text-green-300 text-sm">We'll get back to you within 24 hours.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3">
                <FaExclamationTriangle className="text-red-400 text-xl" />
                <div>
                  <p className="text-red-400 font-semibold">Submission Failed</p>
                  <p className="text-red-300 text-sm">Please try again or contact us directly.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* NAME */}
              <div className="relative">
                <label className={`absolute left-4 transition-all text-sm ${
                  focused === "name" || formData.name 
                    ? "text-orange-400 -top-2 bg-slate-900 px-2" 
                    : "text-slate-400 top-3"
                }`}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 pt-5 pb-2 rounded-xl bg-transparent border border-white/20 text-white focus:border-orange-400 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* EMAIL */}
              <div className="relative">
                <label className={`absolute left-4 transition-all text-sm ${
                  focused === "email" || formData.email 
                    ? "text-orange-400 -top-2 bg-slate-900 px-2" 
                    : "text-slate-400 top-3"
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 pt-5 pb-2 rounded-xl bg-transparent border border-white/20 text-white focus:border-orange-400 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* MESSAGE */}
              <div className="relative">
                <label className={`absolute left-4 transition-all text-sm ${
                  focused === "message" || formData.message 
                    ? "text-orange-400 -top-2 bg-slate-900 px-2" 
                    : "text-slate-400 top-3"
                }`}>
                  How can we help you?
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  rows="4"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 pt-5 pb-2 rounded-xl bg-transparent border border-white/20 text-white focus:border-orange-400 focus:outline-none transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-orange-500/40 hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                We usually reply within 24 hours.
              </p>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
