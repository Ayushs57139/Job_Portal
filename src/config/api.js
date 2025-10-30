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

  async companyLogin(credentials) {
    const data = await this.request('/company/login', {
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

  async consultancyLogin(credentials) {
    const data = await this.request('/consultancy/login', {
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

  async companyRegister(userData) {
    console.log('companyRegister called with:', userData);
    const data = await this.request('/company/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    console.log('companyRegister response data:', data);

    if (data && data.token) {
      console.log('Token received, saving to storage...');
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      console.log('Token and user data saved successfully');
    } else {
      console.log('No token in response data');
    }

    return data;
  }

  async consultancyRegister(userData) {
    console.log('consultancyRegister called with:', userData);
    const data = await this.request('/consultancy/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    console.log('consultancyRegister response data:', data);

    if (data && data.token) {
      console.log('Token received, saving to storage...');
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      console.log('Token and user data saved successfully');
    } else {
      console.log('No token in response data');
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

  // Job Alert APIs
  async createJobAlert(formData) {
    const url = `${this.baseURL}/job-alerts`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : undefined,
      },
      body: formData,
    });
    return await response.json();
  }

  async getJobAlerts(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/job-alerts?${params}`);
  }

  async getJobAlert(id) {
    return await this.request(`/job-alerts/${id}`);
  }

  async updateJobAlert(id, data) {
    return await this.request(`/job-alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJobAlert(id) {
    return await this.request(`/job-alerts/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleJobAlertStatus(id) {
    return await this.request(`/job-alerts/${id}/toggle-status`, {
      method: 'POST',
    });
  }

  async getJobAlertStats() {
    return await this.request('/job-alerts/stats/summary');
  }

  async exportJobAlerts() {
    const url = `${this.baseURL}/job-alerts/export/csv`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return await response.blob();
  }

  // Chat APIs - Live Chat Support
  async getConversations(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/chat/conversations?${params}`);
  }

  async getConversation(conversationId) {
    return await this.request(`/chat/conversations/${conversationId}`);
  }

  async getConversationMessages(conversationId, page = 1, limit = 50) {
    return await this.request(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  }

  async sendMessage(conversationId, content, replyTo = null) {
    return await this.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, replyTo }),
    });
  }

  async createConversation(participants, conversationType, subject = null, metadata = {}) {
    return await this.request('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ participants, conversationType, subject, metadata }),
    });
  }

  async getChatPartners(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return await this.request(`/chat/chat-partners${params}`);
  }

  async markConversationAsRead(conversationId) {
    return await this.request(`/chat/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  }

  async getChatRooms(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/chat/rooms?${params}`);
  }

  async createChatRoom(name, description, roomType, isPublic = false, settings = {}, metadata = {}) {
    return await this.request('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, description, roomType, isPublic, settings, metadata }),
    });
  }

  async joinChatRoom(roomId) {
    return await this.request(`/chat/rooms/${roomId}/join`, {
      method: 'POST',
    });
  }

  async leaveChatRoom(roomId) {
    return await this.request(`/chat/rooms/${roomId}/leave`, {
      method: 'POST',
    });
  }

  // Platform Settings APIs
  async getSettings() {
    return await this.request('/settings');
  }

  async updateGeneralSettings(data) {
    return await this.request('/settings/general', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateSecuritySettings(data) {
    return await this.request('/settings/security', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateEmailSettings(data) {
    return await this.request('/settings/email', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async sendTestEmail(testEmail) {
    return await this.request('/settings/email/test', {
      method: 'POST',
      body: JSON.stringify({ testEmail }),
    });
  }

  async updatePaymentSettings(data) {
    return await this.request('/settings/payment', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateNotificationSettings(data) {
    return await this.request('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async resetSettings(section = null) {
    return await this.request('/settings/reset', {
      method: 'POST',
      body: JSON.stringify({ section }),
    });
  }

  // Theme & Logo Management APIs
  async getActiveTheme() {
    return await this.request('/theme/active');
  }

  async getAllThemes() {
    return await this.request('/theme');
  }

  async createTheme(data) {
    return await this.request('/theme', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTheme(id, data) {
    return await this.request(`/theme/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async activateTheme(id) {
    return await this.request(`/theme/${id}/activate`, {
      method: 'PUT',
    });
  }

  async deleteTheme(id) {
    return await this.request(`/theme/${id}`, {
      method: 'DELETE',
    });
  }

  // Logo Management APIs
  async getActiveLogo() {
    return await this.request('/logos/active');
  }

  async getAllLogos(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/logos?${params}`);
  }

  async getLogoById(id) {
    return await this.request(`/admin/logos/${id}`);
  }

  async createLogo(data) {
    return await this.request('/admin/logos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLogo(id, data) {
    return await this.request(`/admin/logos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadLogoImage(file) {
    const formData = new FormData();
    formData.append('logo', file);
    
    const url = `${this.baseURL}/admin/logos/upload`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : undefined,
      },
      body: formData,
    });
    return await response.json();
  }

  // Generic Upload API
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${this.baseURL}/upload/${type}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : undefined,
      },
      body: formData,
    });
    return await response.json();
  }

  async deleteUploadedFile(type, filename) {
    return await this.request(`/upload/${type}/${filename}`, {
      method: 'DELETE',
    });
  }

  async activateLogo(id) {
    return await this.request(`/admin/logos/${id}/activate`, {
      method: 'PUT',
    });
  }

  async deleteLogo(id) {
    return await this.request(`/admin/logos/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== EMAIL TEMPLATE MANAGEMENT APIs ====================
  
  async getEmailTemplates(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/email-templates?${params}`);
  }

  async getEmailTemplate(id) {
    return await this.request(`/admin/email-templates/${id}`);
  }

  async createEmailTemplate(data) {
    return await this.request('/admin/email-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmailTemplate(id, data) {
    return await this.request(`/admin/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmailTemplate(id) {
    return await this.request(`/admin/email-templates/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultEmailTemplate(id) {
    return await this.request(`/admin/email-templates/${id}/set-default`, {
      method: 'POST',
    });
  }

  async getEmailTemplateStats() {
    return await this.request('/admin/email-templates/stats');
  }

  async testEmailTemplate(templateId, testEmail, variables = {}) {
    return await this.request('/admin/email-templates/test', {
      method: 'POST',
      body: JSON.stringify({ templateId, testEmail, variables }),
    });
  }

  async initializeDefaultEmailTemplates() {
    return await this.request('/admin/email-templates/initialize-defaults', {
      method: 'POST',
    });
  }

  // ==================== EMAIL LOG APIs ====================
  
  async getEmailLogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/email-logs?${params}`);
  }

  async getEmailLog(id) {
    return await this.request(`/admin/email-logs/${id}`);
  }

  async getEmailLogStats(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return await this.request(`/admin/email-logs/stats?${params}`);
  }

  async retryEmailLog(id) {
    return await this.request(`/admin/email-logs/${id}/retry`, {
      method: 'POST',
    });
  }

  async deleteOldEmailLogs(olderThanDays) {
    return await this.request(`/admin/email-logs?olderThan=${olderThanDays}`, {
      method: 'DELETE',
    });
  }

  // ==================== SMTP SETTINGS APIs ====================
  
  async getSMTPSettings() {
    return await this.request('/settings');
  }

  async updateSMTPSettings(data) {
    return await this.request('/settings/email', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async testSMTPConnection(testEmail) {
    return await this.request('/settings/email/test', {
      method: 'POST',
      body: JSON.stringify({ testEmail }),
    });
  }

  // ==================== SOCIAL UPDATES ADMIN APIs ====================
  
  async getAdminSocialUpdates(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/social-updates/public/all?${params}`);
  }

  async getSocialUpdateStats() {
    // Calculate stats from recent data
    try {
      const response = await this.request('/social-updates/public/all?limit=1000');
      const updates = response.socialUpdates || [];
      
      return {
        total: response.pagination?.totalItems || 0,
        published: updates.filter(u => u.status === 'published').length,
        draft: updates.filter(u => u.status === 'draft').length,
        totalLikes: updates.reduce((sum, u) => sum + (u.engagement?.likes || 0), 0),
        totalComments: updates.reduce((sum, u) => sum + (u.engagement?.comments || 0), 0),
        totalShares: updates.reduce((sum, u) => sum + (u.engagement?.shares || 0), 0),
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        total: 0,
        published: 0,
        draft: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
      };
    }
  }

  async moderateSocialUpdate(id, action, notes = '') {
    return await this.request(`/social-updates/admin/${id}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ action, notes }),
    });
  }

  async deleteSocialUpdate(id) {
    return await this.request(`/social-updates/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== KYC APIs ====================
  
  async submitKYC(formData) {
    const url = `${this.baseURL}/kyc/submit`;
    const formDataToSend = new FormData();
    
    // Add text fields
    if (formData.userType) formDataToSend.append('userType', formData.userType);
    if (formData.companyType) formDataToSend.append('companyType', formData.companyType);
    if (formData.documents) {
      Object.keys(formData.documents).forEach(key => {
        const doc = formData.documents[key];
        if (doc && doc.idNumber) {
          formDataToSend.append(`documents[${key}]`, JSON.stringify({ idNumber: doc.idNumber }));
        }
      });
    }
    
    // Add files
    if (formData.files) {
      Object.keys(formData.files).forEach(key => {
        if (formData.files[key]) {
          formDataToSend.append(key, {
            uri: formData.files[key].uri,
            type: formData.files[key].type,
            name: formData.files[key].name,
          });
        }
      });
    }
    
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formDataToSend,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'KYC submission failed');
    }
    
    return data;
  }

  async uploadKYCDocument(documentType, file, idNumber) {
    const url = `${this.baseURL}/kyc/upload`;
    const formData = new FormData();
    
    formData.append('documentType', documentType);
    if (idNumber) formData.append('idNumber', idNumber);
    formData.append(documentType, {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });
    
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Document upload failed');
    }
    
    return data;
  }

  async getKYCStatus() {
    return await this.request('/kyc/status');
  }
}

const apiInstance = new JobWalaAPI();

// Export both the API instance and the base URL for direct use
export default apiInstance;
export const API_URL = API_BASE_URL;
export const api = apiInstance;

