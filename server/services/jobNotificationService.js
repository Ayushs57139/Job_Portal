const FreejobwalaChat = require('../models/FreejobwalaChat');
const JobAlert = require('../models/JobAlert');
const Job = require('../models/Job');
const User = require('../models/User');
const notificationService = require('./notificationService');

class JobNotificationService {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
    }

    // Start the notification service
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('Job Notification Service started');
        
        // Check for new jobs every 5 minutes
        this.intervalId = setInterval(() => {
            this.checkForNewJobs();
        }, 5 * 60 * 1000);
        
        // Initial check
        this.checkForNewJobs();
    }

    // Stop the notification service
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('Job Notification Service stopped');
    }

    // Check for new jobs and send notifications
    async checkForNewJobs() {
        try {
            console.log('Checking for new jobs...');
            
            // Get jobs posted in the last 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const newJobs = await Job.find({
                createdAt: { $gte: fiveMinutesAgo },
                isActive: true
            }).populate('postedBy', 'firstName lastName email userType');

            if (newJobs.length === 0) {
                console.log('No new jobs found');
                return;
            }

            console.log(`Found ${newJobs.length} new job(s)`);

            // Process each new job
            for (const job of newJobs) {
                await this.processNewJob(job);
            }

        } catch (error) {
            console.error('Error checking for new jobs:', error);
        }
    }

    // Process a new job and send notifications
    async processNewJob(job) {
        try {
            console.log(`Processing new job: ${job.title}`);

            // Get all active Freejobwala Chat users
            const chatUsers = await FreejobwalaChat.findActiveUsers();
            console.log(`Found ${chatUsers.length} active chat users`);

            // Get matching job alerts
            const matchingAlerts = await JobAlert.findMatchingAlerts({
                title: job.title,
                industry: job.industry,
                department: job.department,
                location: job.location,
                salary: job.salary,
                jobRoles: job.jobRoles,
                keySkills: job.keySkills
            });

            console.log(`Found ${matchingAlerts.length} matching job alerts`);

            // Send notifications to chat users
            for (const chatUser of chatUsers) {
                await this.sendJobUpdateToUser(chatUser, job);
            }

            // Send notifications to job alert subscribers
            for (const alert of matchingAlerts) {
                await this.sendJobAlertToSubscriber(alert, job);
            }

        } catch (error) {
            console.error(`Error processing job ${job._id}:`, error);
        }
    }

    // Send job update to a Freejobwala Chat user
    async sendJobUpdateToUser(chatUser, job) {
        try {
            // Check if user wants job updates
            if (!chatUser.chatPreferences.jobUpdates.enabled || 
                !chatUser.chatPreferences.notifications.newJobs) {
                return;
            }

            // Prepare message
            const message = `🎯 New job matching your preferences has been posted!`;
            
            // Determine channels based on user preferences
            const channels = [];
            if (chatUser.chatPreferences.jobUpdates.channels.email) channels.push('email');
            if (chatUser.chatPreferences.jobUpdates.channels.whatsapp) channels.push('whatsapp');
            if (chatUser.chatPreferences.jobUpdates.channels.sms) channels.push('sms');

            // Send notifications
            const results = await notificationService.sendJobUpdateNotification(
                chatUser, 
                job, 
                message, 
                channels
            );

            // Add to chat history
            const messageContent = this.prepareJobUpdateMessage(job);
            await chatUser.addChatMessage({
                messageType: 'job_update',
                content: messageContent,
                jobId: job._id,
                sentVia: 'system',
                status: 'sent'
            });

            console.log(`Job update sent to user ${chatUser.userId}:`, results);

        } catch (error) {
            console.error(`Error sending job update to user ${chatUser.userId}:`, error);
        }
    }

    // Send job alert to a job alert subscriber
    async sendJobAlertToSubscriber(alert, job) {
        try {
            // Check if alert is active
            if (!alert.isActive) return;

            // Check if we've already notified this alert recently (within 1 hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (alert.lastNotified && alert.lastNotified > oneHourAgo) {
                return;
            }

            // Create a temporary chat user object for notification service
            const tempChatUser = {
                firstName: alert.email.split('@')[0], // Use email prefix as name
                email: alert.email,
                mobile: alert.mobile,
                whatsappNumber: alert.mobile, // Use mobile as WhatsApp number
                chatPreferences: {
                    jobUpdates: {
                        enabled: true,
                        channels: {
                            email: true,
                            whatsapp: true,
                            sms: false
                        }
                    },
                    notifications: {
                        newJobs: true,
                        applicationUpdates: true,
                        interviewReminders: true,
                        jobRecommendations: true
                    }
                }
            };

            // Prepare message
            const message = `🎯 New job matching your job alert "${alert.alertName}" has been posted!`;
            
            // Send notifications
            const results = await notificationService.sendJobUpdateNotification(
                tempChatUser, 
                job, 
                message, 
                ['email', 'whatsapp']
            );

            // Update alert statistics
            await alert.incrementNotificationCount();

            console.log(`Job alert sent to ${alert.email}:`, results);

        } catch (error) {
            console.error(`Error sending job alert to ${alert.email}:`, error);
        }
    }

    // Prepare job update message content
    prepareJobUpdateMessage(job) {
        return `🎯 *New Job Alert - Freejobwala*

*Job Details:*
📋 *Title:* ${job.title}
🏢 *Company:* ${job.postedBy.firstName} ${job.postedBy.lastName}
📍 *Location:* ${job.location}
💰 *Salary:* ₹${job.salary.toLocaleString()}
💼 *Experience:* ${job.experience}
⏰ *Job Type:* ${job.jobType}
📅 *Posted:* ${new Date(job.createdAt).toLocaleDateString()}

${job.description ? `📝 *Description:* ${job.description.substring(0, 200)}...` : ''}

Apply now: ${process.env.CLIENT_URL || 'http://localhost:3000'}/jobs/${job._id}

Good luck with your application! 🍀

Best regards,
Freejobwala Team`;
    }

    // Send application update notification
    async sendApplicationUpdate(application, status, message) {
        try {
            // Get user's chat profile
            const chatUser = await FreejobwalaChat.findByUserId(application.userId);
            if (!chatUser || !chatUser.isActive) return;

            // Check if user wants application updates
            if (!chatUser.chatPreferences.notifications.applicationUpdates) return;

            // Determine channels
            const channels = [];
            if (chatUser.chatPreferences.jobUpdates.channels.email) channels.push('email');
            if (chatUser.chatPreferences.jobUpdates.channels.whatsapp) channels.push('whatsapp');
            if (chatUser.chatPreferences.jobUpdates.channels.sms) channels.push('sms');

            // Send notifications
            const results = await notificationService.sendApplicationUpdateNotification(
                chatUser,
                application,
                message,
                channels
            );

            // Add to chat history
            await chatUser.addChatMessage({
                messageType: 'notification',
                content: message,
                jobId: application.jobId,
                sentVia: 'system',
                status: 'sent'
            });

            console.log(`Application update sent to user ${application.userId}:`, results);

        } catch (error) {
            console.error(`Error sending application update to user ${application.userId}:`, error);
        }
    }

    // Send interview reminder
    async sendInterviewReminder(interview) {
        try {
            // Get user's chat profile
            const chatUser = await FreejobwalaChat.findByUserId(interview.userId);
            if (!chatUser || !chatUser.isActive) return;

            // Check if user wants interview reminders
            if (!chatUser.chatPreferences.notifications.interviewReminders) return;

            // Determine channels
            const channels = [];
            if (chatUser.chatPreferences.jobUpdates.channels.email) channels.push('email');
            if (chatUser.chatPreferences.jobUpdates.channels.whatsapp) channels.push('whatsapp');
            if (chatUser.chatPreferences.jobUpdates.channels.sms) channels.push('sms');

            // Send notifications
            const results = await notificationService.sendInterviewReminder(
                chatUser,
                interview,
                channels
            );

            // Add to chat history
            const message = `📅 Interview reminder: ${interview.job.title} at ${interview.job.postedBy.firstName} ${interview.job.postedBy.lastName} on ${new Date(interview.date).toLocaleDateString()}`;
            await chatUser.addChatMessage({
                messageType: 'reminder',
                content: message,
                jobId: interview.jobId,
                sentVia: 'system',
                status: 'sent'
            });

            console.log(`Interview reminder sent to user ${interview.userId}:`, results);

        } catch (error) {
            console.error(`Error sending interview reminder to user ${interview.userId}:`, error);
        }
    }

    // Send bulk job update (Admin function)
    async sendBulkJobUpdate(jobId, message, channels = ['email', 'whatsapp']) {
        try {
            const job = await Job.findById(jobId).populate('postedBy', 'firstName lastName');
            if (!job) {
                throw new Error('Job not found');
            }

            // Get all active chat users
            const chatUsers = await FreejobwalaChat.findActiveUsers();
            let sentCount = 0;
            let failedCount = 0;

            for (const chatUser of chatUsers) {
                try {
                    // Check if user wants job updates
                    if (!chatUser.chatPreferences.jobUpdates.enabled || 
                        !chatUser.chatPreferences.notifications.newJobs) {
                        continue;
                    }

                    // Send notifications
                    const results = await notificationService.sendJobUpdateNotification(
                        chatUser,
                        job,
                        message,
                        channels
                    );

                    // Add to chat history
                    await chatUser.addChatMessage({
                        messageType: 'job_update',
                        content: this.prepareJobUpdateMessage(job),
                        jobId: jobId,
                        sentVia: 'system',
                        status: 'sent'
                    });

                    sentCount++;
                } catch (error) {
                    console.error(`Error sending bulk update to user ${chatUser.userId}:`, error);
                    failedCount++;
                }
            }

            return {
                sent: sentCount,
                failed: failedCount,
                total: chatUsers.length
            };

        } catch (error) {
            console.error('Error sending bulk job update:', error);
            throw error;
        }
    }

    // Get notification statistics
    async getNotificationStats() {
        try {
            const totalChatUsers = await FreejobwalaChat.countDocuments({ isActive: true });
            const totalJobAlerts = await JobAlert.countDocuments({ isActive: true });
            const totalJobs = await Job.countDocuments({ isActive: true });

            // Get recent activity
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentJobs = await Job.countDocuments({
                createdAt: { $gte: oneDayAgo },
                isActive: true
            });

            return {
                totalChatUsers,
                totalJobAlerts,
                totalJobs,
                recentJobs,
                isRunning: this.isRunning
            };

        } catch (error) {
            console.error('Error getting notification stats:', error);
            throw error;
        }
    }
}

module.exports = new JobNotificationService();
