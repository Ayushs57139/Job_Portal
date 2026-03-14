// Quick test script for Job Events API
// Run with: node test-job-events.js

const mongoose = require('mongoose');
require('dotenv').config();

const JobEvent = require('./models/JobEvent');
const EventRegistration = require('./models/EventRegistration');

async function testJobEvents() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Create a sample event
    console.log('Test 1: Creating sample event...');
    const sampleEvent = new JobEvent({
      title: 'Tech Job Fair 2024',
      description: 'Annual technology job fair featuring top companies',
      eventType: 'job_fair',
      startDate: new Date('2024-12-15T09:00:00'),
      endDate: new Date('2024-12-15T17:00:00'),
      startTime: '09:00',
      endTime: '17:00',
      venue: 'Mumbai Convention Center',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      organizerType: 'company',
      organizerName: 'Tech Corp India',
      contactEmail: 'events@techcorp.com',
      contactPhone: '+91-9876543210',
      registrationRequired: true,
      registrationDeadline: new Date('2024-12-10T23:59:59'),
      maxParticipants: 500,
      tags: ['technology', 'software', 'IT'],
      status: 'active'
    });

    await sampleEvent.save();
    console.log('✅ Event created:', sampleEvent.title);
    console.log('   Event ID:', sampleEvent._id);
    console.log('   Computed Status:', sampleEvent.computedStatus);
    console.log('   Registration Open:', sampleEvent.isRegistrationOpen);
    console.log('');

    // Test 2: Get statistics
    console.log('Test 2: Getting statistics...');
    const stats = {
      total: await JobEvent.countDocuments(),
      active: await JobEvent.countDocuments({ status: 'active' }),
      upcoming: await JobEvent.countDocuments({
        startDate: { $gt: new Date() },
        status: { $nin: ['cancelled', 'closed'] }
      })
    };
    console.log('✅ Statistics:', stats);
    console.log('');

    // Test 3: Create a registration
    console.log('Test 3: Creating sample registration...');
    const sampleRegistration = new EventRegistration({
      eventId: sampleEvent._id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91-9876543210',
      company: 'ABC Corp',
      designation: 'Software Engineer',
      experience: '3 years'
    });

    await sampleRegistration.save();
    console.log('✅ Registration created for:', sampleRegistration.name);
    console.log('   Registration ID:', sampleRegistration._id);
    console.log('   Status:', sampleRegistration.status);
    console.log('');

    // Test 4: Update event with registration
    console.log('Test 4: Updating event registration count...');
    await sampleEvent.incrementRegistrations();
    console.log('✅ Event updated');
    console.log('   Current Participants:', sampleEvent.currentParticipants);
    console.log('   Total Registrations:', sampleEvent.registrations);
    console.log('');

    // Test 5: Get upcoming events
    console.log('Test 5: Getting upcoming events...');
    const upcomingEvents = await JobEvent.getUpcoming(5);
    console.log('✅ Found', upcomingEvents.length, 'upcoming events');
    upcomingEvents.forEach(event => {
      console.log('   -', event.title, '(', event.startDate.toDateString(), ')');
    });
    console.log('');

    // Test 6: Search events
    console.log('Test 6: Searching events...');
    const searchResults = await JobEvent.find({
      $or: [
        { title: { $regex: 'Tech', $options: 'i' } },
        { city: { $regex: 'Mumbai', $options: 'i' } }
      ]
    });
    console.log('✅ Found', searchResults.length, 'events matching search');
    console.log('');

    // Test 7: Get registrations for event
    console.log('Test 7: Getting registrations for event...');
    const registrations = await EventRegistration.find({ eventId: sampleEvent._id });
    console.log('✅ Found', registrations.length, 'registrations');
    console.log('');

    console.log('🎉 All tests passed successfully!\n');
    console.log('Summary:');
    console.log('- Event Model: ✅ Working');
    console.log('- Registration Model: ✅ Working');
    console.log('- Statistics: ✅ Working');
    console.log('- Search: ✅ Working');
    console.log('- Relationships: ✅ Working');
    console.log('\nYou can now use the API endpoints!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run tests
testJobEvents();
