// components/CourseFinder.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, Filter, ExternalLink, DollarSign, Calendar, Clock, 
  BookOpen, Globe, MapPin, ChevronLeft, ChevronRight, X, 
  Sparkles, TrendingUp, Award, Layers, Loader2, GraduationCap,
  SlidersHorizontal, Briefcase
} from 'lucide-react';

const CourseFinder = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(84);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedIntake, setSelectedIntake] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Available filter options (populated from data)
  const [countries, setCountries] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [intakes, setIntakes] = useState([]);

  // Format currency - converts ? to £
  const formatCurrency = useCallback((fees) => {
    if (!fees) return 'Not specified';
    return fees.replace(/^\?/, '£').replace(/\?/g, '£');
  }, []);

  // Fetch courses from API
  const fetchCourses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ajax-courses-form.php?page_no=${page}`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setCourses(data.data);
        setTotalRecords(data.num_record || 0);
        setRecordsPerPage(data.total_records_per_page || 84);
        
        // Extract unique filter options
        const uniqueCountries = [...new Set(data.data.map(c => c.country_name).filter(Boolean))];
        const uniqueCourseTypes = [...new Set(data.data.map(c => c.course_type_name).filter(Boolean))];
        const uniqueIntakes = [...new Set(data.data.flatMap(c => 
          c.intake ? c.intake.split(',').map(i => i.trim()) : []
        ).filter(Boolean))];
        
        setCountries(uniqueCountries);
        setCourseTypes(uniqueCourseTypes);
        setIntakes(uniqueIntakes);
      } else {
        setCourses([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage, fetchCourses]);

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = searchTerm === '' || 
        course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.university_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = selectedCountry === '' || course.country_name === selectedCountry;
      const matchesCourseType = selectedCourseType === '' || course.course_type_name === selectedCourseType;
      const matchesIntake = selectedIntake === '' || 
        (course.intake && course.intake.includes(selectedIntake));
      
      return matchesSearch && matchesCountry && matchesCourseType && matchesIntake;
    });
  }, [courses, searchTerm, selectedCountry, selectedCourseType, selectedIntake]);

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedCourseType('');
    setSelectedIntake('');
  }, []);

  const activeFilterCount = useMemo(() => 
    [searchTerm, selectedCountry, selectedCourseType, selectedIntake].filter(Boolean).length,
    [searchTerm, selectedCountry, selectedCourseType, selectedIntake]
  );

  // Get course type color
  const getCourseTypeColor = (type) => {
    const colors = {
      'FOUNDATION': 'bg-emerald-100 text-emerald-700',
      'UNDERGRADUATE': 'bg-blue-100 text-blue-700',
      'POSTGRADUATE': 'bg-purple-100 text-purple-700',
      'DIPLOMA': 'bg-amber-100 text-amber-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div>
            <GraduationCap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-red-500" />
          </div>
          <p className="mt-4 text-gray-500 font-medium">Loading amazing courses...</p>
          <p className="text-sm text-gray-400 mt-1">Discover your perfect program</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-red-600 font-medium mb-2">Unable to load courses</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button 
          onClick={() => fetchCourses(currentPage)}
          className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Animated Header */}
      <div className="text-center space-y-3 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full text-red-600 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Explore Your Future
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Course Finder
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Discover thousands of courses from top universities worldwide
        </p>
      </div>

      {/* Enhanced Search Bar */}
      <div className="sticky top-4 z-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 p-2">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by course name, university, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all duration-200 ${
              showFilters || activeFilterCount > 0
                ? 'bg-red-500 text-white shadow-md shadow-red-200'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-white text-red-500 text-xs rounded-full px-2 py-0.5 min-w-[20px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel - Glassmorphism */}
        {showFilters && (
          <div className="mt-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 animate-slide-down">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-red-500" />
                Refine Your Search
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear all filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Type</label>
                <select
                  value={selectedCourseType}
                  onChange={(e) => setSelectedCourseType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                >
                  <option value="">All Types</option>
                  {courseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Intake</label>
                <select
                  value={selectedIntake}
                  onChange={(e) => setSelectedIntake(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                >
                  <option value="">All Intakes</option>
                  {intakes.map(intake => (
                    <option key={intake} value={intake}>{intake}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
          Showing <span className="font-semibold text-gray-800">{filteredCourses.length}</span> of{' '}
          <span className="font-semibold text-gray-800">{totalRecords.toLocaleString()}</span> courses
        </div>
        {filteredCourses.length > 0 && (
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Matches found
          </div>
        )}
      </div>

      {/* Course Cards Grid - Enhanced Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course, index) => (
          <div
            key={`${course.course_id}-${index}`}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="p-6">
              {/* Header Section */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCourseTypeColor(course.course_type_name)}`}>
                      {course.course_type_name || 'Course'}
                    </span>
                    {course.country_name && (
                      <span className="text-xs flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        <Globe className="w-3 h-3" />
                        {course.country_name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
                    {course.course_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {course.university_name?.replace(' (STUDY GROUP)', '') || 'University'}
                  </p>
                </div>
                {course.flag_icon && (
                  <span className={`fi ${course.flag_icon} fi fis text-2xl opacity-80`}></span>
                )}
              </div>

              {/* Course Details Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                {course.course_fees && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 bg-emerald-50 rounded-lg">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Fees</p>
                      <p className="font-semibold text-gray-800">{formatCurrency(course.course_fees)}</p>
                    </div>
                  </div>
                )}
                {course.course_length && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Duration</p>
                      <p className="font-semibold text-gray-800">{course.course_length} {parseInt(course.course_length) === 1 ? 'year' : 'years'}</p>
                    </div>
                  </div>
                )}
                {course.intake && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 bg-purple-50 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Intake</p>
                      <p className="font-semibold text-gray-800">{course.intake}</p>
                    </div>
                  </div>
                )}
                {course.campusName && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 bg-red-50 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Campus</p>
                      <p className="font-semibold text-gray-800 truncate">{course.campusName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* IELTS Requirements - Enhanced */}
              {(course.coaching_requirements || course.not_less_than_ielts) && (
                <div className="mt-4 flex items-center gap-2 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-gray-700 font-medium">
                    IELTS {course.coaching_requirements}
                    {course.not_less_than_ielts && ` (min ${course.not_less_than_ielts} each)`}
                  </span>
                </div>
              )}

              {/* Action Buttons - Enhanced */}
              <div className="flex items-center gap-3 mt-5 pt-2">
                {course.weblink && (
                  <a
                    href={course.weblink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Details
                  </a>
                )}
                <button className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State - Enhanced */}
      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-lg">No courses found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="mt-6 px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-sm font-medium"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination - Enhanced */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 pb-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-200'
                      : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseFinder;