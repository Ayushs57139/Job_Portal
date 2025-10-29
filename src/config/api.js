// API Configuration and Service for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Auto-detect API URL based on platform and environment
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    // For web, use relative URL or localhost
    return window.location.origin.includes('localhost') 
      ? 'http://localhost:5000/api' 
      : '/api';
  } else if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 to access host machine
    return 'http://10.0.2.2:5000/api';
  } else {
    // For iOS simulator and physical devices, use localhost or your server IP
    return 'http://localhost:5000/api';
  }
};

const API_BASE_URL = getApiUrl();

class JobWalaAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.init();
  }

  async init() {
    this.token = await AsyncStorage.getItem('token');
  }
  
  // Set custom API URL (useful for production)
  setApiUrl(url) {
    this.baseURL = url;
  }

  // Format currency in Indian format
  formatIndianCurrency(amount) {
    if (!amount || isNaN(amount)) return '₹0';
    return '₹' + parseInt(amount).toLocaleString('en-IN');
  }

  // Format date in Indian format
  formatIndianDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Format date with time in Indian format
  formatIndianDateTime(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  // Set authentication token
  async setToken(token) {
    this.token = token;
    await AsyncStorage.setItem('token', token);
  }

  // Clear authentication token
  async clearToken() {
    this.token = null;
    await AsyncStorage.multiRemove(['token', 'user', 'currentUser']);
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication APIs
  async login(credentials) {
    let endpoint = '/auth/login';
    if (credentials.userType === 'jobseeker') {
      endpoint = '/jobseeker/login';
    } else if (credentials.userType === 'employer') {
      endpoint = '/employer/login';
    }

    const data = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (data.token) {
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearToken();
    }
  }

  async getCurrentUser() {
    try {
      const data = await this.request('/auth/me');
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      await this.clearToken();
      throw error;
    }
  }

  // Job APIs
  async getJobs(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/jobs?${params}`);
  }

  async getJob(id) {
    return await this.request(`/jobs/${id}`);
  }

  async createJob(jobData) {
    return await this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id, jobData) {
    return await this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id) {
    return await this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyJobs() {
    return await this.request('/jobs/employer/my-jobs');
  }

  async searchJobs(query) {
    return await this.request(`/jobs/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Application APIs
  async applyForJob(jobId, applicationData) {
    return await this.request('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, ...applicationData }),
    });
  }

  async applyForJobDirect(jobId, applicationData) {
    return await this.request('/applications/direct', {
      method: 'POST',
      body: JSON.stringify({ jobId, ...applicationData }),
    });
  }

  async getMyApplications() {
    return await this.request('/applications/my-applications');
  }

  async getJobApplications(jobId) {
    return await this.request(`/applications/job/${jobId}`);
  }

  async updateApplicationStatus(applicationId, status) {
    return await this.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Company APIs
  async getCompanies(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/company?${params}`);
  }

  async getCompany(id) {
    return await this.request(`/company/${id}`);
  }

  async createCompany(companyData) {
    return await this.request('/company', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(id, companyData) {
    return await this.request(`/company/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  // Blog APIs
  async getBlogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/blogs?${params}`);
  }

  async getBlog(slug) {
    return await this.request(`/blogs/${slug}`);
  }

  async createBlog(blogData) {
    return await this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  }

  // Admin APIs
  async getAdminStats() {
    return await this.request('/admin/stats');
  }

  async getAdminDashboard() {
    return await this.request('/admin/dashboard');
  }

  async getAllUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/users?${params}`);
  }

  async getAllJobs(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/jobs?${params}`);
  }

  // Utility methods
  async isAuthenticated() {
    return !!this.token;
  }

  async getCurrentUserFromStorage() {
    const user = await AsyncStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  async hasRole(role) {
    const user = await this.getCurrentUserFromStorage();
    return user && user.userType === role;
  }

  async hasAnyRole(roles) {
    const user = await this.getCurrentUserFromStorage();
    return user && roles.includes(user.userType);
  }

  async isEmployer() {
    return await this.hasAnyRole(['company', 'consultancy']);
  }

  async isAdmin() {
    return await this.hasAnyRole(['admin', 'superadmin']);
  }

  // Employer Dashboard APIs
  async getEmployerDashboard() {
    return await this.request('/employers/dashboard');
  }

  async getEmployerStats() {
    return await this.request('/employers/stats');
  }

  async getEmployerJobs(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/employers/jobs?${params}`);
  }

  async getJobApplicationsForEmployer(jobId) {
    return await this.request(`/employers/jobs/${jobId}/applications`);
  }

  // Admin Dashboard APIs
  async getAdminDashboardData() {
    return await this.request('/admin/dashboard');
  }

  async getUsersForAdmin(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/users?${params}`);
  }

  async getJobsForAdmin(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/jobs?${params}`);
  }

  async getApplicationsForAdmin(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/applications?${params}`);
  }

  async updateUserStatus(userId, status) {
    return await this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteUser(userId) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async approveJob(jobId) {
    return await this.request(`/admin/jobs/${jobId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectJob(jobId, reason) {
    return await this.request(`/admin/jobs/${jobId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Saved Jobs APIs
  async getSavedJobs() {
    return await this.request('/saved-jobs');
  }

  async saveJob(jobId) {
    return await this.request('/saved-jobs', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });
  }

  async unsaveJob(jobId) {
    return await this.request(`/saved-jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  // Profile APIs
  async updateProfile(profileData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadProfilePicture(formData) {
    const url = `${this.baseURL}/users/profile-picture`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    return await response.json();
  }

  // Package APIs
  async getPackages(type) {
    const params = type ? `?type=${type}` : '';
    return await this.request(`/packages${params}`);
  }

  // Chat/Messaging APIs
  async getConversations() {
    return await this.request('/chat/conversations');
  }

  async getMessages(conversationId) {
    return await this.request(`/chat/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId, content) {
    return await this.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async createConversation(participantId) {
    return await this.request('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
  }

  // Social Updates APIs
  async getSocialUpdates(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/social-updates?${params}`);
  }

  async getSocialUpdate(id) {
    return await this.request(`/social-updates/${id}`);
  }

  async createSocialUpdate(formData) {
    const url = `${this.baseURL}/social-updates`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    return await response.json();
  }

  async updateSocialUpdate(id, formData) {
    const url = `${this.baseURL}/social-updates/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    return await response.json();
  }

  async deleteSocialUpdate(id) {
    return await this.request(`/social-updates/${id}`, {
      method: 'DELETE',
    });
  }

  async likeSocialUpdate(id) {
    return await this.request(`/social-updates/${id}/like`, {
      method: 'POST',
    });
  }

  async commentOnSocialUpdate(id, content) {
    return await this.request(`/social-updates/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async shareSocialUpdate(id, platform) {
    return await this.request(`/social-updates/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    });
  }

  async getMySocialUpdates(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/social-updates/user/me?${params}`);
  }

  async getTrendingSocialUpdates(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/social-updates/trending?${params}`);
  }
}

export default new JobWalaAPI();

