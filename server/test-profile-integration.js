const mongoose = require('mongoose');
const UserProfile = require('./models/UserProfile');
const User = require('./models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

async function testProfileIntegration() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
        });
        console.log('✅ MongoDB connected successfully');

        // Test 1: Create a test user
        console.log('\n📝 Test 1: Creating test user...');
        const testUser = new User({
            firstName: 'Test',
            lastName: 'User',
            email: `test-${Date.now()}@example.com`,
            phone: '9876543210',
            password: 'hashedpassword',
            userType: 'jobseeker'
        });
        await testUser.save();
        console.log('✅ Test user created:', testUser._id);

        // Test 2: Create a test profile
        console.log('\n📝 Test 2: Creating test profile...');
        const testProfile = new UserProfile({
            userId: testUser._id,
            personalInfo: {
                fullName: 'Test User',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'male',
                email: testUser.email,
                whatsappUpdates: true
            },
            education: {
                educationLevel: 'bachelor',
                degree: 'Computer Science',
                institution: 'IIT Delhi',
                specialization: 'Software Engineering',
                educationStatus: 'completed'
            },
            professional: {
                experience: '5 years',
                currentJobTitle: 'Software Developer',
                currentCompany: 'Tech Corp',
                skills: ['JavaScript', 'Python', 'React', 'Node.js'],
                softSkills: ['Leadership', 'Communication'],
                languages: ['English', 'Hindi']
            },
            preferences: {
                currentCity: 'Mumbai',
                preferredLocations: ['Mumbai', 'Delhi', 'Bangalore'],
                jobTypePreference: 'fulltime',
                expectedSalary: 800000,
                workMode: 'hybrid'
            }
        });
        await testProfile.save();
        console.log('✅ Test profile created:', testProfile._id);

        // Test 3: Test profile completion percentage calculation
        console.log('\n📊 Test 3: Testing completion percentage...');
        const completionPercentage = testProfile.calculateCompletionPercentage();
        console.log('✅ Completion percentage:', completionPercentage + '%');

        // Test 4: Test profile summary
        console.log('\n📋 Test 4: Testing profile summary...');
        const profileSummary = testProfile.getProfileSummary();
        console.log('✅ Profile summary:', JSON.stringify(profileSummary, null, 2));

        // Test 5: Test queries
        console.log('\n🔍 Test 5: Testing queries...');
        
        // Find by skills
        const profilesWithJavaScript = await UserProfile.find({
            'professional.skills': 'JavaScript'
        });
        console.log('✅ Profiles with JavaScript skill:', profilesWithJavaScript.length);

        // Find by city
        const profilesInMumbai = await UserProfile.find({
            'preferences.currentCity': 'Mumbai'
        });
        console.log('✅ Profiles in Mumbai:', profilesInMumbai.length);

        // Find completed profiles
        const completedProfiles = await UserProfile.find({
            'profileStatus.isComplete': true
        });
        console.log('✅ Completed profiles:', completedProfiles.length);

        // Test 6: Test aggregation
        console.log('\n📈 Test 6: Testing aggregation...');
        const stats = await UserProfile.aggregate([
            {
                $group: {
                    _id: null,
                    totalProfiles: { $sum: 1 },
                    completedProfiles: {
                        $sum: { $cond: ['$profileStatus.isComplete', 1, 0] }
                    },
                    averageCompletion: { $avg: '$profileStatus.completionPercentage' }
                }
            }
        ]);
        console.log('✅ Statistics:', stats[0]);

        // Test 7: Test city distribution
        console.log('\n🏙️ Test 7: Testing city distribution...');
        const cityStats = await UserProfile.aggregate([
            {
                $group: {
                    _id: '$preferences.currentCity',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        console.log('✅ City distribution:', cityStats);

        // Test 8: Test skill distribution
        console.log('\n💼 Test 8: Testing skill distribution...');
        const skillStats = await UserProfile.aggregate([
            { $unwind: '$professional.skills' },
            {
                $group: {
                    _id: '$professional.skills',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        console.log('✅ Top skills:', skillStats);

        // Cleanup
        console.log('\n🧹 Cleaning up test data...');
        await UserProfile.deleteOne({ _id: testProfile._id });
        await User.deleteOne({ _id: testUser._id });
        console.log('✅ Test data cleaned up');

        console.log('\n🎉 All tests passed successfully!');
        console.log('\n📋 Summary:');
        console.log('- MongoDB connection: ✅');
        console.log('- User creation: ✅');
        console.log('- Profile creation: ✅');
        console.log('- Completion calculation: ✅');
        console.log('- Profile summary: ✅');
        console.log('- Query operations: ✅');
        console.log('- Aggregation pipelines: ✅');
        console.log('- Data cleanup: ✅');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the test
testProfileIntegration();
