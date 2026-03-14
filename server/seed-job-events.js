const mongoose = require('mongoose');
const JobEvent = require('./models/JobEvent');
require('dotenv').config();

// MongoDB connection string - uses the same as your server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://ayushs57139_db_user:7nWvVOGm9hkXupwv@ac-r75tb3w-shard-00-00.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-01.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-02.vy1jecc.mongodb.net:27017/jobwala?ssl=true&replicaSet=atlas-p9a5jz-shard-0&authSource=admin&appName=Cluster0';

// Dummy job events data
const dummyEvents = [
  {
    title: 'Tech Career Fair 2026',
    description: 'Join us for the biggest technology career fair of the year! Meet top tech companies, attend workshops, and explore exciting career opportunities in software development, data science, AI, and more.',
    eventType: 'job_fair',
    startDate: new Date('2026-03-15T09:00:00'),
    endDate: new Date('2026-03-15T17:00:00'),
    startTime: '09:00',
    endTime: '17:00',
    venue: 'Mumbai Convention Center',
    address: 'BKC, Bandra East',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    organizerType: 'admin',
    organizerName: 'FreeJobWala',
    contactEmail: 'events@freejobwala.com',
    contactPhone: '+91 9876543210',
    registrationRequired: true,
    maxParticipants: 500,
    currentParticipants: 127,
    status: 'active',
    featured: true,
  },
  {
    title: 'Banking & Finance Recruitment Drive',
    description: 'Leading banks and financial institutions are hiring! This exclusive recruitment drive offers opportunities for freshers and experienced professionals in banking, finance, accounting, and investment sectors.',
    eventType: 'recruitment_drive',
    startDate: new Date('2026-03-20T10:00:00'),
    endDate: new Date('2026-03-20T16:00:00'),
    startTime: '10:00',
    endTime: '16:00',
    venue: 'Hotel Taj Palace',
    address: 'Nariman Point',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    organizerType: 'company',
    organizerName: 'HDFC Bank',
    contactEmail: 'recruitment@hdfcbank.com',
    contactPhone: '+91 9876543211',
    registrationRequired: true,
    maxParticipants: 300,
    currentParticipants: 89,
    status: 'active',
  },
  {
    title: 'Digital Marketing Workshop & Hiring',
    description: 'Learn the latest digital marketing strategies and get hired! This workshop covers SEO, social media marketing, content marketing, and analytics. Top companies will be hiring immediately after the workshop.',
    eventType: 'career_workshop',
    startDate: new Date('2026-03-25T11:00:00'),
    endDate: new Date('2026-03-25T15:00:00'),
    startTime: '11:00',
    endTime: '15:00',
    venue: 'WeWork BKC',
    address: 'Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    organizerType: 'consultancy',
    organizerName: 'Digital Marketing Hub',
    contactEmail: 'info@dmhub.com',
    contactPhone: '+91 9876543212',
    registrationRequired: true,
    maxParticipants: 100,
    currentParticipants: 67,
    status: 'active',
  },
  {
    title: 'Healthcare Professionals Mega Job Fair',
    description: 'Hospitals, clinics, and healthcare organizations are looking for doctors, nurses, pharmacists, lab technicians, and healthcare administrators. Walk-in interviews available!',
    eventType: 'job_fair',
    startDate: new Date('2026-04-05T09:00:00'),
    endDate: new Date('2026-04-05T18:00:00'),
    startTime: '09:00',
    endTime: '18:00',
    venue: 'Nehru Centre',
    address: 'Worli',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    organizerType: 'admin',
    organizerName: 'Healthcare Careers India',
    contactEmail: 'careers@healthcareindia.com',
    contactPhone: '+91 9876543213',
    registrationRequired: true,
    maxParticipants: 800,
    currentParticipants: 234,
    status: 'active',
    featured: true,
  },
  {
    title: 'IT Campus Placement Drive - IIT Bombay',
    description: 'Top IT companies visiting IIT Bombay for campus placements. Open for final year students in Computer Science, IT, and Electronics. Pre-placement talks and technical rounds.',
    eventType: 'campus_placement',
    startDate: new Date('2026-04-10T08:00:00'),
    endDate: new Date('2026-04-12T20:00:00'),
    startTime: '08:00',
    endTime: '20:00',
    venue: 'IIT Bombay Campus',
    address: 'Powai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    organizerType: 'company',
    organizerName: 'TCS, Infosys, Wipro',
    contactEmail: 'placements@iitb.ac.in',
    contactPhone: '+91 9876543214',
    registrationRequired: true,
    maxParticipants: 200,
    currentParticipants: 156,
    status: 'active',
  },
  {
    title: 'Sales & Marketing Networking Event',
    description: 'Network with industry leaders, learn about new opportunities, and showcase your skills. Perfect for sales professionals, marketing managers, and business development executives.',
    eventType: 'networking_event',
    startDate: new Date('2026-04-18T18:00:00'),
    endDate: new Date('2026-04-18T21:00:00'),
    startTime: '18:00',
    endTime: '21:00',
    venue: 'The Leela Hotel',
    address: 'Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    organizerType: 'consultancy',
    organizerName: 'Sales Leaders Network',
    contactEmail: 'connect@salesleaders.com',
    contactPhone: '+91 9876543215',
    registrationRequired: true,
    maxParticipants: 150,
    currentParticipants: 98,
    status: 'active',
  },
  {
    title: 'Remote Work Opportunities Webinar',
    description: 'Discover remote job opportunities from companies worldwide. Learn about work-from-home best practices, tools, and how to land your dream remote job. Live Q&A session included.',
    eventType: 'webinar',
    startDate: new Date('2026-04-22T16:00:00'),
    endDate: new Date('2026-04-22T18:00:00'),
    startTime: '16:00',
    endTime: '18:00',
    venue: 'Online',
    address: 'Virtual Event',
    city: 'Online',
    state: 'Pan India',
    country: 'India',
    organizerType: 'admin',
    organizerName: 'Remote Careers India',
    contactEmail: 'webinar@remotecareers.in',
    contactPhone: '+91 9876543216',
    registrationRequired: true,
    maxParticipants: 1000,
    currentParticipants: 567,
    status: 'active',
    isVirtual: true,
    eventLink: 'https://zoom.us/j/example',
  },
  {
    title: 'Engineering Graduates Job Fair',
    description: 'Exclusive job fair for engineering graduates (Mechanical, Civil, Electrical, Electronics). Top manufacturing and engineering companies are hiring for various positions.',
    eventType: 'job_fair',
    startDate: new Date('2026-05-02T10:00:00'),
    endDate: new Date('2026-05-02T17:00:00'),
    startTime: '10:00',
    endTime: '17:00',
    venue: 'VJTI Campus',
    address: 'Matunga',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    organizerType: 'company',
    organizerName: 'L&T, Siemens, ABB',
    contactEmail: 'recruitment@engineering.com',
    contactPhone: '+91 9876543217',
    registrationRequired: true,
    maxParticipants: 400,
    currentParticipants: 178,
    status: 'active',
  },
  {
    title: 'Hospitality & Tourism Career Expo',
    description: 'Hotels, resorts, airlines, and travel companies are hiring! Opportunities for hotel management graduates, chefs, front office staff, travel consultants, and more.',
    eventType: 'job_fair',
    startDate: new Date('2026-05-10T09:00:00'),
    endDate: new Date('2026-05-10T16:00:00'),
    startTime: '09:00',
    endTime: '16:00',
    venue: 'Sahara Star Hotel',
    address: 'Vile Parle East',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    organizerType: 'consultancy',
    organizerName: 'Hospitality Careers',
    contactEmail: 'jobs@hospitalitycareers.com',
    contactPhone: '+91 9876543218',
    registrationRequired: true,
    maxParticipants: 250,
    currentParticipants: 112,
    status: 'active',
  },
  {
    title: 'Startup Hiring Festival',
    description: 'Meet innovative startups and explore exciting career opportunities! Perfect for those who want to work in a dynamic, fast-paced environment. Roles in tech, marketing, sales, and operations.',
    eventType: 'job_fair',
    startDate: new Date('2026-05-20T11:00:00'),
    endDate: new Date('2026-05-20T19:00:00'),
    startTime: '11:00',
    endTime: '19:00',
    venue: '91Springboard',
    address: 'Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    organizerType: 'admin',
    organizerName: 'Startup Mumbai',
    contactEmail: 'hello@startupmumbai.com',
    contactPhone: '+91 9876543219',
    registrationRequired: true,
    maxParticipants: 300,
    currentParticipants: 145,
    status: 'active',
    featured: true,
  },
];

// Function to seed the database
async function seedJobEvents() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Clear existing events (optional - comment out if you want to keep existing data)
    console.log('\nClearing existing job events...');
    const deleteResult = await JobEvent.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing events`);

    // Insert dummy events
    console.log('\nInserting dummy job events...');
    const insertedEvents = await JobEvent.insertMany(dummyEvents);
    console.log(`Successfully inserted ${insertedEvents.length} job events!`);

    // Display summary
    console.log('\n=== Job Events Summary ===');
    console.log(`Total Events: ${insertedEvents.length}`);
    console.log(`Active Events: ${insertedEvents.filter(e => e.status === 'active').length}`);
    console.log(`Featured Events: ${insertedEvents.filter(e => e.featured).length}`);
    console.log(`Virtual Events: ${insertedEvents.filter(e => e.isVirtual).length}`);
    
    console.log('\n=== Events by Type ===');
    const eventTypes = {};
    insertedEvents.forEach(event => {
      eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
    });
    Object.entries(eventTypes).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });

    console.log('\n=== Events by Organizer Type ===');
    const organizerTypes = {};
    insertedEvents.forEach(event => {
      organizerTypes[event.organizerType] = (organizerTypes[event.organizerType] || 0) + 1;
    });
    Object.entries(organizerTypes).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Open admin panel: cd admin && npm start');
    console.log('2. Navigate to Job Events section');
    console.log('3. View all the dummy events');
    console.log('4. Open main website to see events on homepage and Job Events page');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MongoDB is running');
    console.error('2. Check your MongoDB connection string');
    console.error('3. Verify the JobEvent model is correct');
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
  }
}

// Run the seed function
seedJobEvents();
