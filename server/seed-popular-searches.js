const mongoose = require('mongoose');
const PopularSearch = require('./models/PopularSearch');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

const popularSearches = [
  {
    searchQuery: 'fresher jobs',
    searchCategory: 'fresher',
    title: 'Jobs for Freshers',
    description: 'Discover entry-level opportunities to start your career',
    icon: 'school-outline',
    color: '#FFB84D',
    searchParams: {
      search: '',
      experience: 'Fresher (0-1 year)',
    },
    trendingRank: 1,
    enabled: true,
    order: 1,
    clickCount: 0,
    searchCount: 0,
  },
  {
    searchQuery: 'work from home',
    searchCategory: 'work-from-home',
    title: 'Work from Home Jobs',
    description: 'Find remote opportunities that fit your lifestyle',
    icon: 'home-outline',
    color: '#4ECDC4',
    searchParams: {
      search: '',
      workMode: 'Work From Home',
    },
    trendingRank: 2,
    enabled: true,
    order: 2,
    clickCount: 0,
    searchCount: 0,
  },
  {
    searchQuery: 'part time jobs',
    searchCategory: 'part-time',
    title: 'Part Time Jobs',
    description: 'Flexible part-time positions for students and professionals',
    icon: 'time-outline',
    color: '#95E1D3',
    searchParams: {
      search: '',
      jobType: 'Part Time',
    },
    trendingRank: 3,
    enabled: true,
    order: 3,
    clickCount: 0,
    searchCount: 0,
  },
  {
    searchQuery: 'jobs for women',
    searchCategory: 'women',
    title: 'Jobs for Women',
    description: 'Empowering career opportunities for women',
    icon: 'people-outline',
    color: '#F38181',
    searchParams: {
      search: 'jobs for women',
    },
    trendingRank: 4,
    enabled: true,
    order: 4,
    clickCount: 0,
    searchCount: 0,
  },
  {
    searchQuery: 'full time jobs',
    searchCategory: 'full-time',
    title: 'Full Time Jobs',
    description: 'Explore full-time career opportunities',
    icon: 'briefcase-outline',
    color: '#AA96DA',
    searchParams: {
      search: '',
      jobType: 'Full Time',
    },
    trendingRank: 5,
    enabled: true,
    order: 5,
    clickCount: 0,
    searchCount: 0,
  },
];

async function seedPopularSearches() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing popular searches
    await PopularSearch.deleteMany({});
    console.log('Cleared existing popular searches');

    // Insert new popular searches
    const inserted = await PopularSearch.insertMany(popularSearches);
    console.log(`Successfully seeded ${inserted.length} popular searches`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding popular searches:', error);
    process.exit(1);
  }
}

seedPopularSearches();

