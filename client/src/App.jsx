// App.jsx - Premium White + Red Theme with Glassmorphism
import React, { useState, useRef, useEffect } from 'react';
import AICounselor from './components/AICounselor';
import ContactForm from './components/ContactForm';
import { 
  Globe, 
  Shield, 
  Clock, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  MessageCircle, 
  X, 
  Send, 
  Zap, 
  Building, 
  GraduationCap, 
  Briefcase,
  Star,
  ChevronRight,
  MapPin,
  Award,
  Headphones,
  Sparkles,
  Rocket,
  Plane,
  FileText,
  Calendar,
  ArrowRight,
  Play,
  ThumbsUp,
  Coffee,
  Target,
  BarChart3,
  LineChart,
  Activity,
  Crown,
  Heart,
  ShieldCheck,
  Truck
} from 'lucide-react';

const App = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hello! I'm VisaFlow AI Counselor. How can I help with your visa journey today? 🌍" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setMessages(prev => [...prev, { type: 'user', text: inputMessage }]);
    
    setTimeout(() => {
      let response = "";
      const lowerMsg = inputMessage.toLowerCase();
      
      if (lowerMsg.includes("student") || lowerMsg.includes("study")) {
        response = "🎓 For students, Canada, Germany, and Australia offer excellent post-study work visas! Canada's PGWP and Germany's Job Seeker Visa are top choices.";
      } else if (lowerMsg.includes("work") || lowerMsg.includes("professional") || lowerMsg.includes("job")) {
        response = "💼 Professionals: Check out Canada Express Entry, Germany EU Blue Card, or Australia's SkillSelect. What's your profession?";
      } else if (lowerMsg.includes("business") || lowerMsg.includes("invest")) {
        response = "🏢 For business/investment: UAE Golden Visa, Portugal D7, or USA EB-5 are excellent options. Need specific country details?";
      } else if (lowerMsg.includes("tourist") || lowerMsg.includes("visit")) {
        response = "✈️ Tourist visas: Schengen (Europe), USA B1/B2, UK Standard Visitor. Each has different requirements. Which country interests you?";
      } else {
        response = "I can help with student, work, business, or tourist visas! Just ask me anything about visa requirements, processing times, or best destinations for your profile.";
      }
      
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 500);
    
    setInputMessage('');
  };

  const successStories = [
    { name: "Priya Sharma", country: "Canada", visa: "Student Visa (SDS)", days: 18, status: "Approved", image: "👩‍🎓", score: 98, review: "VisaFlow made my Canadian dream a reality!" },
    { name: "Rahul Mehta", country: "Germany", visa: "Job Seeker Visa", days: 32, status: "Approved", image: "👨‍💻", score: 95, review: "Got my visa in just 32 days!" },
    { name: "Anjali Patel", country: "Australia", visa: "Skilled Independent", days: 45, status: "Approved", image: "👩‍⚕️", score: 97, review: "Best decision to choose VisaFlow" },
    { name: "Vikram Singh", country: "UAE", visa: "Golden Visa", days: 21, status: "Approved", image: "👨‍💼", score: 99, review: "Premium service, premium results!" }
  ];

  const topDestinations = [
    { country: "Canada", bestFor: "Students & Tech Pros", score: 4.9, processing: "4-8 weeks", success: "92%", flag: "🇨🇦", color: "from-red-500 to-red-600" },
    { country: "Germany", bestFor: "Engineers & IT", score: 4.8, processing: "6-10 weeks", success: "89%", flag: "🇩🇪", color: "from-red-400 to-red-500" },
    { country: "Australia", bestFor: "Healthcare & Construction", score: 4.7, processing: "5-9 weeks", success: "87%", flag: "🇦🇺", color: "from-red-500 to-red-600" },
    { country: "UAE", bestFor: "Entrepreneurs & Investors", score: 4.9, processing: "2-4 weeks", success: "94%", flag: "🇦🇪", color: "from-red-600 to-red-700" }
  ];

  const visaTypes = [
    { icon: GraduationCap, title: "Student Visa", desc: "Study abroad opportunities", color: "from-red-500 to-rose-500", features: ["Post-study work rights", "Part-time work allowed", "Family accompaniment"] },
    { icon: Briefcase, title: "Work Visa", desc: "Professional opportunities", color: "from-red-600 to-red-500", features: ["Full working rights", "Path to PR", "Family sponsorship"] },
    { icon: Building, title: "Business Visa", desc: "Investment & entrepreneurship", color: "from-rose-600 to-red-600", features: ["Business setup", "Investor pathways", "Golden visa options"] },
    { icon: Plane, title: "Tourist Visa", desc: "Travel & exploration", color: "from-red-400 to-rose-500", features: ["Multiple entries", "Extended stays", "Family included"] }
  ];

  const features = [
    { icon: Zap, title: "AI-Powered Matching", desc: "Smart algorithm matches you with best visa options" },
    { icon: Clock, title: "Fast Processing", desc: "48-hour average response time" },
    { icon: Shield, title: "100% Secure", desc: "Your data is encrypted and protected" },
    { icon: Award, title: "98% Success Rate", desc: "Proven track record of approvals" },
    { icon: Headphones, title: "24/7 Support", desc: "Round-the-clock expert assistance" },
    { icon: TrendingUp, title: "Real-time Tracking", desc: "Monitor your application progress" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Glassmorphism Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
           
    <div className="flex items-center justify-center">
  <img 
    src="/logo.png" 
    alt="VisaFlow"
    className="w-24 h-auto object-contain"
  />
</div>
     
            
              <span className="text-xs bg-gradient-to-r from-red-500 to-rose-500 text-white px-2 py-1 rounded-full ml-2 shadow-md">AI-Powered</span>
            </div>
            <div className="hidden md:flex gap-8">
              {['Services', 'Destinations', 'Success', 'Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-gray-600 hover:text-red-600 transition font-medium relative group">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
            <button className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2 rounded-full hover:shadow-xl transition shadow-md font-medium hover:scale-105 transform">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Glassmorphism Effects */}
      <section className="pt-28 pb-20 px-4 bg-gradient-to-br from-white via-red-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-red-200/50 px-4 py-2 rounded-full mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">AI-Powered Visa Consultation</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-red-800 to-rose-800 bg-clip-text text-transparent">
                Your Global Journey
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              AI-powered visa assistance with 95% success rate. Get personalized guidance for student, work, business, and tourist visas.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="#contact" className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl transition shadow-lg flex items-center gap-2 group hover:scale-105 transform">
                Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </a>
              <button className="backdrop-blur-md bg-white/50 border-2 border-red-200 text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-red-50 hover:border-red-400 transition flex items-center gap-2">
                <Play className="w-4 h-4" /> Watch Demo
              </button>
            </div>
          </div>

          {/* Animated Timeline - Get Free Consultation with Glassmorphism */}
          <div className="mt-20">
            <div className="text-center mb-8">
              <p className="text-sm font-semibold text-red-600 uppercase tracking-wider">Simple Process</p>
              <h3 className="text-2xl font-bold text-gray-800">Get Your Free Consultation in 3 Easy Steps</h3>
            </div>
            <div className="relative">
              {/* Animated Red Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-100 -translate-y-1/2 hidden md:block">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-rose-500 to-red-500 rounded-full animate-progress" style={{ width: '100%', animation: 'progress 2s ease-in-out infinite' }}></div>
              </div>
              
              <div className="relative grid md:grid-cols-3 gap-8">
                {[
                  { step: "01", title: "Fill Quick Form", desc: "Share basic details - takes 2 minutes", icon: FileText, color: "from-red-500 to-rose-500" },
                  { step: "02", title: "AI Assessment", desc: "Our AI analyzes your profile", icon: BarChart3, color: "from-rose-500 to-red-500" },
                  { step: "03", title: "Get Free Consultation", desc: "Expert guidance within 24 hours", icon: Calendar, color: "from-red-600 to-rose-600" }
                ].map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="backdrop-blur-md bg-white/70 rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 group-hover:border-red-200/50">
                      <div className={`bg-gradient-to-r ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition duration-300`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-rose-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        {item.step}
                      </div>
                      <h4 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats with Glassmorphism */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { icon: Users, value: "50K+", label: "Happy Clients", color: "text-red-500", trend: "+25%" },
              { icon: CheckCircle, value: "95%", label: "Success Rate", color: "text-rose-500", trend: "+5%" },
              { icon: Clock, value: "48hr", label: "Avg Processing", color: "text-red-600", trend: "-30%" },
              { icon: Globe, value: "40+", label: "Countries", color: "text-rose-600", trend: "+12" }
            ].map((stat, idx) => (
              <div key={idx} className="backdrop-blur-md bg-white/60 rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group hover:bg-white/80">
                <div className="flex justify-between items-start mb-2">
                  <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
                  <span className="text-xs text-green-600 bg-green-50/80 backdrop-blur-sm px-2 py-0.5 rounded-full">{stat.trend}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visa Types Section with Glassmorphism */}
      <section id="services" className="py-20 px-4 bg-gradient-to-br from-white via-red-50/20 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-red-200/50 px-4 py-1.5 rounded-full mb-4 shadow-md">
              <Crown className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">Premium Services</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Visa Services We Offer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Tailored solutions for every dream and destination</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visaTypes.map((type, idx) => (
              <div key={idx} className="group backdrop-blur-md bg-white/60 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-red-200/50 hover:bg-white/80">
                <div className={`bg-gradient-to-r ${type.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300 shadow-md`}>
                  <type.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{type.title}</h3>
                <p className="text-gray-500 mb-4">{type.desc}</p>
                <ul className="space-y-2 mb-4">
                  {type.features.map((feature, fIdx) => (
                    <li key={fIdx} className="text-xs text-gray-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-red-400" /> {feature}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className="text-red-500 font-medium flex items-center gap-1 group-hover:gap-2 transition">
                  Learn More <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section - Integrated with Glassmorphism */}
      <ContactForm id="contact" />

      {/* Features Grid with Glassmorphism */}
      <section className="py-20 px-4 bg-gradient-to-tr from-white via-red-50/20 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Why Choose VisaFlow?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We combine AI technology with human expertise for best results</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="group backdrop-blur-md bg-white/60 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:bg-white/80 hover:border-red-200/50">
                <div className="bg-gradient-to-r from-red-500 to-rose-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300 shadow-md">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section with Glassmorphism */}
      <section id="success" className="py-20 px-4 bg-gradient-to-bl from-white via-red-50/20 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-red-200/50 px-4 py-1.5 rounded-full mb-4 shadow-md">
              <Star className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">Real Success Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Our Visa Success Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Join thousands of satisfied clients who achieved their dreams</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {successStories.map((story, idx) => (
              <div key={idx} className="group backdrop-blur-md bg-white/60 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:bg-white/80 hover:border-red-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl bg-gradient-to-r from-red-100 to-rose-100 w-12 h-12 rounded-full flex items-center justify-center">
                    {story.image}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{story.name}</h3>
                    <p className="text-xs text-red-500">{story.country}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{story.review}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">{story.visa}</span>
                  <span className="text-green-500 font-semibold">{story.status}</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(story.score/20) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{story.days} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Destinations Section */}
      <section id="destinations" className="py-20 px-4 bg-gradient-to-br from-white via-red-50/20 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-red-200/50 px-4 py-1.5 rounded-full mb-4 shadow-md">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">Top Destinations</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Most Popular Visa Destinations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose from our most successful visa programs</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topDestinations.map((dest, idx) => (
              <div key={idx} className="group backdrop-blur-md bg-white/60 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:bg-white/80 hover:border-red-200/50">
                <div className="text-4xl mb-3">{dest.flag}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{dest.country}</h3>
                <p className="text-xs text-red-500 mb-3">{dest.bestFor}</p>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Success Rate</span>
                  <span className="text-red-500 font-semibold">{dest.success}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-500">Processing</span>
                  <span className="text-gray-700">{dest.processing}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(dest.score) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{dest.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with Glassmorphism */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-2 rounded-xl">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VisaFlow</span>
              </div>
              <p className="text-gray-400 text-sm">AI-powered visa consultation platform helping people achieve their global dreams.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#services" className="hover:text-red-400 transition">Services</a></li>
                <li><a href="#destinations" className="hover:text-red-400 transition">Destinations</a></li>
                <li><a href="#success" className="hover:text-red-400 transition">Success Stories</a></li>
                <li><a href="#contact" className="hover:text-red-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>help@visaflow.com</li>
                <li>+1 (888) 123-4567</li>
                <li>24/7 Customer Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm flex-1" />
                <button className="bg-red-500 px-3 py-2 rounded-lg hover:bg-red-600 transition">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-800 text-sm text-gray-500">
            © 2024 VisaFlow. All rights reserved. Made with <Heart className="w-3 h-3 inline text-red-500" /> for global dreams.
          </div>
        </div>
      </footer>

     <AICounselor/>

      <style jsx>{`
        @keyframes progress {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-progress {
          background-size: 200% auto;
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;