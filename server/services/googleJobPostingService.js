const axios = require('axios');

class GoogleJobPostingService {
    constructor() {
        this.baseUrl = 'https://jobs.googleapis.com/v4';
        this.apiKey = process.env.GOOGLE_JOBS_API_KEY;
        this.publisherId = process.env.GOOGLE_JOBS_PUBLISHER_ID;
    }

    /**
     * Post a job to Google for Jobs
     * @param {Object} jobData - The job data from our system
     * @returns {Object} - Response from Google Jobs API
     */
    async postJobToGoogle(jobData) {
        try {
            if (!this.apiKey || !this.publisherId) {
                throw new Error('Google Jobs API credentials not configured');
            }

            // Transform our job data to Google Jobs format
            const googleJobData = this.transformJobDataToGoogleFormat(jobData);

            const response = await axios.post(
                `${this.baseUrl}/jobs`,
                googleJobData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                googleJobId: response.data.name,
                googleJobUrl: response.data.uri,
                data: response.data
            };

        } catch (error) {
            console.error('Error posting job to Google:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Transform our job data to Google Jobs API format
     * @param {Object} jobData - Our job data
     * @returns {Object} - Google Jobs API format
     */
    transformJobDataToGoogleFormat(jobData) {
        return {
            requisitionId: `job_${jobData._id || Date.now()}`,
            title: jobData.title,
            description: jobData.description,
            companyName: jobData.company.name,
            applicationInfo: {
                emails: [jobData.hrContact.email],
                instruction: `Please apply through our website or contact ${jobData.hrContact.name} at ${jobData.hrContact.number}`
            },
            jobLocation: {
                address: `${jobData.location.locality || ''}, ${jobData.location.city}, ${jobData.location.state}, India`.trim(),
                latLng: {
                    latitude: 0, // Would need geocoding service
                    longitude: 0
                }
            },
            jobBenefits: jobData.additionalBenefits || [],
            compensationInfo: {
                currency: jobData.salary?.currency || 'INR',
                range: {
                    maxCompensation: {
                        currency: jobData.salary?.currency || 'INR',
                        nanos: 0,
                        units: jobData.salary?.max || 0
                    },
                    minCompensation: {
                        currency: jobData.salary?.currency || 'INR',
                        nanos: 0,
                        units: jobData.salary?.min || 0
                    }
                }
            },
            employmentTypes: [this.mapEmploymentType(jobData.employmentType)],
            jobLevel: this.mapJobLevel(jobData.experienceType),
            publishingOptions: {
                disableStreetAddressResolution: false
            }
        };
    }

    /**
     * Map our employment type to Google's format
     * @param {String} employmentType - Our employment type
     * @returns {String} - Google employment type
     */
    mapEmploymentType(employmentType) {
        const mapping = {
            'Permanent': 'FULL_TIME',
            'Temporary/Contract Job': 'CONTRACTOR',
            'Freelance': 'CONTRACTOR',
            'Apprenticeship': 'INTERN',
            'Internship': 'INTERN',
            'NAPS': 'INTERN',
            'Trainee': 'INTERN',
            'Fresher': 'ENTRY_LEVEL'
        };
        return mapping[employmentType] || 'FULL_TIME';
    }

    /**
     * Map our experience level to Google's job level
     * @param {String} experienceType - Our experience type
     * @returns {String} - Google job level
     */
    mapJobLevel(experienceType) {
        const mapping = {
            'Fresher': 'ENTRY_LEVEL',
            '0-1': 'ENTRY_LEVEL',
            '1-3': 'EXPERIENCED',
            '3-5': 'EXPERIENCED',
            '5-10': 'SENIOR',
            '10+': 'EXECUTIVE'
        };
        return mapping[experienceType] || 'ENTRY_LEVEL';
    }

    /**
     * Update a job posting on Google
     * @param {String} googleJobId - The Google job ID
     * @param {Object} jobData - Updated job data
     * @returns {Object} - Response from Google Jobs API
     */
    async updateJobOnGoogle(googleJobId, jobData) {
        try {
            const googleJobData = this.transformJobDataToGoogleFormat(jobData);

            const response = await axios.patch(
                `${this.baseUrl}/${googleJobId}`,
                googleJobData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('Error updating job on Google:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Delete a job posting from Google
     * @param {String} googleJobId - The Google job ID
     * @returns {Object} - Response from Google Jobs API
     */
    async deleteJobFromGoogle(googleJobId) {
        try {
            await axios.delete(
                `${this.baseUrl}/${googleJobId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );

            return {
                success: true
            };

        } catch (error) {
            console.error('Error deleting job from Google:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Get job posting status from Google
     * @param {String} googleJobId - The Google job ID
     * @returns {Object} - Job status from Google
     */
    async getJobStatusFromGoogle(googleJobId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/${googleJobId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('Error getting job status from Google:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }
}

module.exports = new GoogleJobPostingService();
