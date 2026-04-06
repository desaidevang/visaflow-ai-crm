import React, { useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Calendar, CheckCircle, 
  TrendingUp, Globe, MessageCircle, LogOut, Bell, Search, 
  Filter, Download, Eye, Star, Award, Target, Zap, Shield,
  UserPlus, Briefcase, GraduationCap, Plane, Building,
  ArrowUpRight, ArrowDownRight, MoreVertical, ChevronRight,
  Mail, Phone, MapPin, DollarSign, ThumbsUp, Heart,
  Menu, X, PieChart, Settings, HelpCircle, FolderKanban,
  BookOpen, UserCheck, Home, GitBranch, Library, BarChart,
  School, Users2, DoorOpen, BriefcaseBusiness,
  Globe2, Building2, Ticket, FolderTree, LogIn
} from 'lucide-react';
import MainDashboard from './MainDashboard';
import UserManagement from './UserManagement';
import Lead from './Lead';
import CounsellingPage from './CounsellingPage';
import CourseFinder from './CourseFinder';
import CoachingPage from './Coaching';
import ApplicationPage from './Application';
import StudentVisa from './StudentVisa';
import DependentVisa from './DependentVisa';
import VisitorVisa from './VisitorVisa';
import WorkVisa from './WorkVisa';

// Wrapper components to pass props
const UserManagementWrapper = ({ user }) => <UserManagement user={user} />;
const LeadWrapper = ({ user }) => <Lead user={user} />;
const CoachingWrapper = ({ user }) => <CoachingPage user={user} />;
const ApplicationWrapper = ({ user }) => <ApplicationPage user={user} />;
const StudentVisaWrapper = ({ user }) => <StudentVisa user={user} />;
const DependentVisaWrapper = ({ user }) => <DependentVisa user={user} />;
const VisitorVisaWrapper = ({ user }) => <VisitorVisa user={user} />;
const WorkVisaWrapper = ({ user }) => <WorkVisa user={user} />;
const CounsellingWrapper = ({ user }) => <CounsellingPage lead={null} user={user} />;

const Dashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('DashboardHome');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Complete menu structure based on your components
  const menuItems = [
    { id: 'DashboardHome', label: 'Dashboard', icon: LayoutDashboard, color: 'text-red-500', component: MainDashboard },
    { id: 'Leads', label: 'Leads', icon: TrendingUp, color: 'text-emerald-500', component: LeadWrapper },
    { id: 'Counselling', label: 'Counselling', icon: MessageCircle, color: 'text-purple-500', component: CounsellingWrapper },
    { id: 'Coaching', label: 'Coaching', icon: BookOpen, color: 'text-green-500', component: CoachingWrapper },
    { id: 'CourseFinder', label: 'Course Finder', icon: Library, color: 'text-yellow-500', component: CourseFinder },
    { id: 'Application', label: 'Application', icon: FileText, color: 'text-blue-500', component: ApplicationWrapper },
    { id: 'StudentVisa', label: 'Student Visa', icon: School, color: 'text-teal-500', component: StudentVisaWrapper },
    { id: 'DependentVisa', label: 'Dependent Visa', icon: Users2, color: 'text-pink-500', component: DependentVisaWrapper },
    { id: 'WorkVisa', label: 'Work Visa', icon: BriefcaseBusiness, color: 'text-rose-500', component: WorkVisaWrapper },
    { id: 'VisitorVisa', label: 'Visitor Visa', icon: Plane, color: 'text-sky-500', component: VisitorVisaWrapper },
    { id: 'UserManagement', label: 'User Management', icon: Users, color: 'text-slate-500', component: UserManagementWrapper },
  ];

  // Get current component to render
  const CurrentComponent = menuItems.find(item => item.id === activeMenuItem)?.component || MainDashboard;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-50 flex">
      {/* Sidebar */}
        <aside 
          className={`fixed left-0 top-0 h-full bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-xl transition-all duration-300 z-40 overflow-y-auto ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          {/* Logo Section */}
<div className="relative flex items-center p-4 border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-xl z-10">
  
  {/* Center Logo */}
  <div className="absolute left-1/2 transform -translate-x-1/2">
    <img 
      src="/logo.png" 
      alt="VisaFlow CRM" 
      className="w-28 h-auto object-contain"
    />
  </div>

  {/* Toggle Button */}
  <button 
    onClick={() => setSidebarOpen(!sidebarOpen)}
    className="ml-auto p-1 rounded-lg hover:bg-gray-100 transition"
  >
    {sidebarOpen 
      ? <X className="w-5 h-5 text-gray-500" /> 
      : <Menu className="w-5 h-5 text-gray-500" />
    }
  </button>

</div>

          {/* User Profile Section */}
        <div className={`p-4 border-b border-gray-200 flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Devang'}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'Admin'}</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenuItem(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeMenuItem === item.id
                  ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              } ${!sidebarOpen && 'justify-center'}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${activeMenuItem === item.id ? item.color : ''}`} />
              {sidebarOpen && (
                <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              )}
              {sidebarOpen && activeMenuItem === item.id && (
                <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition ${
              !sidebarOpen && 'justify-center'
            }`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Navbar */}
        <nav className="sticky top-0 bg-white/80 backdrop-blur-xl z-30 border-b border-white/20 shadow-lg">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-800">
                  {menuItems.find(item => item.id === activeMenuItem)?.label || 'Dashboard'}
                </h1>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  {user?.role === 'admin' ? 'Admin Access' : user?.role === 'agent' ? 'Agent Access' : 'View Only'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-gray-100/80 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Dynamic Content */}
        <div className="p-6">
          <CurrentComponent user={user} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;