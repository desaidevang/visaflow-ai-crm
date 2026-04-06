// services/visaApi.js
const API_BASE_URL =  'http://localhost:5000/api';

class VisaApiService {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('visaflow_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visaflow_session_id', sessionId);
    }
    return sessionId;
  }

  async sendMessage(message) {
    try {
      console.log('Sending message:', message);
      console.log('API URL:', `${API_BASE_URL}/chat/chat`);
      
      const response = await fetch(`${API_BASE_URL}/chat/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: this.sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Update session ID if server returns a new one
      if (data.sessionId) {
        this.sessionId = data.sessionId;
        localStorage.setItem('visaflow_session_id', data.sessionId);
      }

      return {
        text: data.response,
        suggestions: this.extractSuggestions(data.response),
        leadCollected: data.dataCollected || false
      };
    } catch (error) {
      console.error('API Error Details:', error);
      return {
        text: "I'm having trouble connecting right now. Please check:\n\n1️⃣ Backend server is running (npm run dev)\n2️⃣ MongoDB is connected\n3️⃣ Gemini API key is valid\n\nError: " + error.message,
        suggestions: ["Try again", "Check server status", "Student Visa"],
        error: true
      };
    }
  }

  async getRecommendations(profession, currentCountry, destination) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profession,
          currentCountry,
          destination
        })
      });

      if (!response.ok) throw new Error('Recommendations request failed');
      const data = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error('Recommendations error:', error);
      return null;
    }
  }

  async getUniversities(country, course = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/universities?country=${encodeURIComponent(country)}&course=${encodeURIComponent(course)}`);
      if (!response.ok) throw new Error('Universities request failed');
      const data = await response.json();
      return data.universities;
    } catch (error) {
      console.error('Universities error:', error);
      return null;
    }
  }

  async getVisaInfo(fromCountry, toCountry, visaType = 'tourist') {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/visa-info?fromCountry=${encodeURIComponent(fromCountry)}&toCountry=${encodeURIComponent(toCountry)}&visaType=${encodeURIComponent(visaType)}`);
      if (!response.ok) throw new Error('Visa info request failed');
      const data = await response.json();
      return data.visaInfo;
    } catch (error) {
      console.error('Visa info error:', error);
      return null;
    }
  }

  extractSuggestions(responseText) {
    const countries = ['Canada', 'Australia', 'Germany', 'UK', 'USA', 'UAE', 'France', 'Japan'];
    const suggestions = [];
    
    for (const country of countries) {
      if (responseText.includes(country) && !suggestions.includes(country)) {
        suggestions.push(country);
        if (suggestions.length >= 3) break;
      }
    }
    
    if (suggestions.length === 0) {
      if (responseText.toLowerCase().includes('student')) {
        suggestions.push('Student Visa', 'University Rankings', 'Scholarships');
      } else if (responseText.toLowerCase().includes('work')) {
        suggestions.push('Work Permit', 'Job Market', 'Salary Expectations');
      } else if (responseText.toLowerCase().includes('business')) {
        suggestions.push('Business Visa', 'Investment Options', 'Company Setup');
      } else {
        suggestions.push('Student Visa', 'Work Visa', 'Tourist Visa', 'Processing Time');
      }
    }
    
    return suggestions.slice(0, 4);
  }

  resetSession() {
    this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visaflow_session_id', this.sessionId);
  }

  async checkServerStatus() {
    try {
      const response = await fetch('http://localhost:5000/');
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new VisaApiService();