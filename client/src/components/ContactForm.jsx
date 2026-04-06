// ContactForm.jsx - High-Impact Interactive Design (Red Theme)
import React, { useState } from 'react';
import { 
  GraduationCap, Briefcase, Building, Plane, ChevronRight, 
  Mail, Phone, User, MapPin, Send, Sparkles, ShieldCheck, 
  Clock, Globe, ArrowRight, CheckCircle2 
} from 'lucide-react';

const ContactForm = () => {
  const [profile, setProfile] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    destination: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'student', label: 'Student', icon: GraduationCap, emoji: '🎓', color: 'from-blue-500 to-blue-600' },
    { id: 'professional', label: 'Working', icon: Briefcase, emoji: '💼', color: 'from-emerald-500 to-emerald-600' },
    { id: 'business', label: 'Business', icon: Building, emoji: '🏢', color: 'from-purple-500 to-purple-600' },
    { id: 'tourist', label: 'Tourist', icon: Plane, emoji: '✈️', color: 'from-amber-500 to-amber-600' },
  ];

  const destinations = {
    student: ['Canada 🇨🇦', 'Australia 🇦🇺', 'UK 🇬🇧', 'USA 🇺🇸', 'Germany 🇩🇪', 'Ireland 🇮🇪'],
    professional: ['Canada 🇨🇦', 'Australia 🇦🇺', 'UAE 🇦🇪', 'UK 🇬🇧', 'Germany 🇩🇪', 'Singapore 🇸🇬'],
    business: ['UAE 🇦🇪', 'Canada 🇨🇦', 'USA 🇺🇸', 'UK 🇬🇧', 'Singapore 🇸🇬', 'Australia 🇦🇺'],
    tourist: ['Thailand 🇹🇭', 'UAE 🇦🇪', 'Switzerland 🇨🇭', 'Japan 🇯🇵', 'Italy 🇮🇹', 'France 🇫🇷'],
  };

  const getPlaceholder = () => {
    const placeholders = {
      student: "e.g., Masters in Computer Science",
      professional: "e.g., Software Engineer, 5+ years experience",
      business: "e.g., $100k - $500k investment",
      tourist: "e.g., Planning next 3 months"
    };
    return placeholders[profile];
  };

  const getLabel = () => {
    const labels = {
      student: "📚 What would you like to study?",
      professional: "💼 Your profession & experience level",
      business: "💰 Approximate investment range",
      tourist: "🗓️ When do you plan to travel?"
    };
    return labels[profile];
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on new input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Prepare the payload
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      destination: formData.destination,
      profile: profile,
      message: formData.message || getPlaceholder()
    };

    console.log('Sending payload:', payload);

    try {
      // Make fetch request to backend
      const response = await fetch('http://localhost:5000/api/leads/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Server responded with status ${response.status}`);
      }

      // Success
      console.log('Form submitted successfully:', data);
      setSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        country: '',
        destination: '',
        message: ''
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
      
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-gray-50/50 hover:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2 ml-1";

  return (
    <section id="contact" className="py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-3xl w-full mx-auto">
        
        {/* Header with visual impact */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 px-5 py-2 rounded-full text-sm font-bold mb-5 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>✨ FREE VISA CONSULTATION — LIMITED SLOTS</span>
            <Sparkles className="w-4 h-4" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Your Dream Destination
            <span className="block text-red-500">Starts Here</span>
          </h2>
          
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Get personalized visa guidance from our experts — absolutely free.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Response in 24h</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Globe className="w-4 h-4 text-purple-500" />
              <span>20+ Countries</span>
            </div>
          </div>
        </div>

        {/* Form Card with enhanced interactivity */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
          
          {/* Profile Tabs - More interactive */}
          <div className="grid grid-cols-4 gap-3 mb-10">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProfile(tab.id)}
                className={`group relative flex flex-col items-center gap-2 py-3.5 rounded-xl transition-all duration-200 ${
                  profile === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                <span className="text-2xl">{tab.emoji}</span>
                <span className="text-xs font-bold">{tab.label}</span>
                {profile === tab.id && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Form Fields - Clean & Fast */}
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  <User className="inline w-4 h-4 mr-1 text-red-400" /> Full name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="John Doe"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Mail className="inline w-4 h-4 mr-1 text-red-400" /> Email address
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="john@example.com"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  <Phone className="inline w-4 h-4 mr-1 text-red-400" /> Phone number
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  <MapPin className="inline w-4 h-4 mr-1 text-red-400" /> Current country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select your country</option>
                  <option>🇮🇳 India</option>
                  <option>🇵🇰 Pakistan</option>
                  <option>🇧🇩 Bangladesh</option>
                  <option>🇳🇵 Nepal</option>
                  <option>🇱🇰 Sri Lanka</option>
                  <option>🇳🇬 Nigeria</option>
                  <option>🇵🇭 Philippines</option>
                  <option>🌍 Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                <Globe className="inline w-4 h-4 mr-1 text-red-400" /> Where do you want to go?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {destinations[profile].map((dest, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, destination: dest })}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                      formData.destination === dest
                        ? 'border-red-500 bg-red-50 text-red-600 font-medium'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50/30'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
              <input
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                type="text"
                placeholder="Or type your preferred destination"
                className={`${inputClass} mt-2`}
              />
            </div>

            <div>
              <label className={labelClass}>{getLabel()}</label>
              <input
                name="message"
                value={formData.message}
                onChange={handleChange}
                type="text"
                placeholder={getPlaceholder()}
                className={inputClass}
              />
            </div>
          </div>

          {/* Micro-copy for reassurance */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <p className="text-xs text-gray-400">
              We'll collect remaining details during your free consultation 🤝
            </p>
          </div>

          {/* High-impact CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-8 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : submitted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Request Sent! We'll Call You Soon
              </>
            ) : (
              <>
                Get Free Visa Consultation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Final reassurance */}
          <p className="text-center text-xs text-gray-400 mt-5">
            🔒 No obligation • Your data is safe • Expert guidance
          </p>
        </form>

        {/* Success floating message */}
        {submitted && (
          <div className="fixed bottom-5 right-5 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg animate-bounce z-50">
            ✅ Consultation request sent! We'll connect shortly.
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactForm;