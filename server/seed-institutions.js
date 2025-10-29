const mongoose = require('mongoose');
const Institution = require('./models/Institution');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

const institutions = [
  // AIIMS
  { name: 'AIIMS Bhopal', type: 'Institute', location: { city: 'Bhopal', state: 'Madhya Pradesh' } },
  { name: 'AIIMS Bhubaneswar', type: 'Institute', location: { city: 'Bhubaneswar', state: 'Odisha' } },
  { name: 'AIIMS Jodhpur', type: 'Institute', location: { city: 'Jodhpur', state: 'Rajasthan' } },
  { name: 'AIIMS New Delhi', type: 'Institute', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'All India Institute of Medical Sciences, Raipur', type: 'Institute', location: { city: 'Raipur', state: 'Chhattisgarh' } },

  // Universities
  { name: 'Aligarh Muslim University', type: 'University', location: { city: 'Aligarh', state: 'Uttar Pradesh' } },
  { name: 'Aligarh Muslim University (AMU)', type: 'University', location: { city: 'Aligarh', state: 'Uttar Pradesh' } },
  { name: 'Amrita Vishwa Vidyapeetham (Coimbatore)', type: 'University', location: { city: 'Coimbatore', state: 'Tamil Nadu' } },
  { name: 'Anna University', type: 'University', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'Anna University Chennai', type: 'University', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'Annamalai University', type: 'University', location: { city: 'Annamalainagar', state: 'Tamil Nadu' } },
  { name: 'Banaras Hindu University', type: 'University', location: { city: 'Varanasi', state: 'Uttar Pradesh' } },
  { name: 'Banaras Hindu University - Faculty of Arts', type: 'University', location: { city: 'Varanasi', state: 'Uttar Pradesh' } },
  { name: 'Banaras Hindu University (BHU)', type: 'University', location: { city: 'Varanasi', state: 'Uttar Pradesh' } },
  { name: 'Bangalore University', type: 'University', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'Bharathiar University', type: 'University', location: { city: 'Coimbatore', state: 'Tamil Nadu' } },
  { name: 'Calicut University', type: 'University', location: { city: 'Kozhikode', state: 'Kerala' } },
  { name: 'Central University of Haryana', type: 'University', location: { city: 'Mahendragarh', state: 'Haryana' } },
  { name: 'Central University of Himachal Pradesh', type: 'University', location: { city: 'Dharamshala', state: 'Himachal Pradesh' } },
  { name: 'Central University of South Bihar', type: 'University', location: { city: 'Gaya', state: 'Bihar' } },
  { name: 'Chandigarh University', type: 'University', location: { city: 'Chandigarh', state: 'Punjab' } },
  { name: 'Christ (Deemed to be University) Bengaluru', type: 'University', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'Christ University', type: 'University', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'Christ University, Bengaluru', type: 'University', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'Delhi Technological University (DTU)', type: 'University', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'DIT University Dehradun', type: 'University', location: { city: 'Dehradun', state: 'Uttarakhand' } },
  { name: 'Dr. Babasaheb Ambedkar Marathwada University', type: 'University', location: { city: 'Aurangabad', state: 'Maharashtra' } },
  { name: 'GITAM University Visakhapatnam', type: 'University', location: { city: 'Visakhapatnam', state: 'Andhra Pradesh' } },
  { name: 'Gujarat University', type: 'University', location: { city: 'Ahmedabad', state: 'Gujarat' } },
  { name: 'Jadavpur University', type: 'University', location: { city: 'Kolkata', state: 'West Bengal' } },
  { name: 'Jamia Millia Islamia', type: 'University', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Jamia Millia Islamia University', type: 'University', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Jawaharlal Nehru University', type: 'University', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Jawaharlal Nehru University (JNU)', type: 'University', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'JSS Academy of Higher Education & Research', type: 'University', location: { city: 'Mysore', state: 'Karnataka' } },
  { name: 'Kalinga Institute of Industrial Technology (KIIT)', type: 'University', location: { city: 'Bhubaneswar', state: 'Odisha' } },
  { name: 'Kannur University', type: 'University', location: { city: 'Kannur', state: 'Kerala' } },
  { name: 'Lovely Professional University', type: 'University', location: { city: 'Phagwara', state: 'Punjab' } },
  { name: 'Lovely Professional University (LPU) Jalandhar', type: 'University', location: { city: 'Jalandhar', state: 'Punjab' } },
  { name: 'Maharaja Sayajirao University of Baroda', type: 'University', location: { city: 'Vadodara', state: 'Gujarat' } },
  { name: 'Mahatma Gandhi Kashi Vidyapeeth', type: 'University', location: { city: 'Varanasi', state: 'Uttar Pradesh' } },
  { name: 'Mahatma Gandhi University', type: 'University', location: { city: 'Kottayam', state: 'Kerala' } },
  { name: 'Mahatma Gandhi University, Kerala', type: 'University', location: { city: 'Kottayam', state: 'Kerala' } },
  { name: 'Mangalore University', type: 'University', location: { city: 'Mangalore', state: 'Karnataka' } },
  { name: 'Manipur University', type: 'University', location: { city: 'Imphal', state: 'Manipur' } },
  { name: 'Nagaland University', type: 'University', location: { city: 'Kohima', state: 'Nagaland' } },
  { name: 'Osmania University', type: 'University', location: { city: 'Hyderabad', state: 'Telangana' } },
  { name: 'Panjab Technical University', type: 'University', location: { city: 'Jalandhar', state: 'Punjab' } },
  { name: 'Panjab University', type: 'University', location: { city: 'Chandigarh', state: 'Punjab' } },
  { name: 'PEC University of Technology', type: 'University', location: { city: 'Chandigarh', state: 'Punjab' } },
  { name: 'Pondicherry University', type: 'University', location: { city: 'Puducherry', state: 'Puducherry' } },
  { name: 'Presidency University Kolkata', type: 'University', location: { city: 'Kolkata', state: 'West Bengal' } },
  { name: 'Punjab University (Panjab University)', type: 'University', location: { city: 'Chandigarh', state: 'Punjab' } },
  { name: 'Rajiv Gandhi University (Arunachal Pradesh)', type: 'University', location: { city: 'Itanagar', state: 'Arunachal Pradesh' } },
  { name: 'Sambalpur University', type: 'University', location: { city: 'Sambalpur', state: 'Odisha' } },
  { name: 'Sardar Patel University', type: 'University', location: { city: 'Vallabh Vidyanagar', state: 'Gujarat' } },
  { name: 'Savitribai Phule Pune University', type: 'University', location: { city: 'Pune', state: 'Maharashtra' } },
  { name: 'Sikkim University', type: 'University', location: { city: 'Gangtok', state: 'Sikkim' } },
  { name: 'Tezpur University', type: 'University', location: { city: 'Tezpur', state: 'Assam' } },
  { name: 'University of Calcutta', type: 'University', location: { city: 'Kolkata', state: 'West Bengal' } },
  { name: 'University of Delhi', type: 'University', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'University of Goa', type: 'University', location: { city: 'Goa', state: 'Goa' } },
  { name: 'University of Hyderabad', type: 'University', location: { city: 'Hyderabad', state: 'Telangana' } },
  { name: 'University of Hyderabad (UoH)', type: 'University', location: { city: 'Hyderabad', state: 'Telangana' } },
  { name: 'University of Jammu', type: 'University', location: { city: 'Jammu', state: 'Jammu and Kashmir' } },
  { name: 'University of Kerala', type: 'University', location: { city: 'Thiruvananthapuram', state: 'Kerala' } },
  { name: 'University of Lucknow', type: 'University', location: { city: 'Lucknow', state: 'Uttar Pradesh' } },
  { name: 'University of Madras', type: 'University', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'University of Mumbai', type: 'University', location: { city: 'Mumbai', state: 'Maharashtra' } },
  { name: 'University of Rajasthan', type: 'University', location: { city: 'Jaipur', state: 'Rajasthan' } },
  { name: 'Utkal University', type: 'University', location: { city: 'Bhubaneswar', state: 'Odisha' } },

  // IITs
  { name: 'IIT (ISM) Dhanbad', type: 'Institute', location: { city: 'Dhanbad', state: 'Jharkhand' } },
  { name: 'IIT Bhilai', type: 'Institute', location: { city: 'Bhilai', state: 'Chhattisgarh' } },
  { name: 'IIT BHU (Varanasi)', type: 'Institute', location: { city: 'Varanasi', state: 'Uttar Pradesh' } },
  { name: 'IIT Bhubaneswar', type: 'Institute', location: { city: 'Bhubaneswar', state: 'Odisha' } },
  { name: 'IIT Bombay', type: 'Institute', location: { city: 'Mumbai', state: 'Maharashtra' } },
  { name: 'IIT Delhi', type: 'Institute', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'IIT Dhanbad (ISM)', type: 'Institute', location: { city: 'Dhanbad', state: 'Jharkhand' } },
  { name: 'IIT Dharwad', type: 'Institute', location: { city: 'Dharwad', state: 'Karnataka' } },
  { name: 'IIT Goa', type: 'Institute', location: { city: 'Goa', state: 'Goa' } },
  { name: 'IIT Goa (new)', type: 'Institute', location: { city: 'Goa', state: 'Goa' } },
  { name: 'IIT Guwahati', type: 'Institute', location: { city: 'Guwahati', state: 'Assam' } },
  { name: 'IIT Hyderabad', type: 'Institute', location: { city: 'Hyderabad', state: 'Telangana' } },
  { name: 'IIT Indore', type: 'Institute', location: { city: 'Indore', state: 'Madhya Pradesh' } },
  { name: 'IIT Jammu', type: 'Institute', location: { city: 'Jammu', state: 'Jammu and Kashmir' } },
  { name: 'IIT Jodhpur', type: 'Institute', location: { city: 'Jodhpur', state: 'Rajasthan' } },
  { name: 'IIT Kanpur', type: 'Institute', location: { city: 'Kanpur', state: 'Uttar Pradesh' } },
  { name: 'IIT Kharagpur', type: 'Institute', location: { city: 'Kharagpur', state: 'West Bengal' } },
  { name: 'IIT Madras', type: 'Institute', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'IIT Mandi', type: 'Institute', location: { city: 'Mandi', state: 'Himachal Pradesh' } },
  { name: 'IIT Palakkad', type: 'Institute', location: { city: 'Palakkad', state: 'Kerala' } },
  { name: 'IIT Patna', type: 'Institute', location: { city: 'Patna', state: 'Bihar' } },
  { name: 'IIT Roorkee', type: 'Institute', location: { city: 'Roorkee', state: 'Uttarakhand' } },
  { name: 'IIT Ropar', type: 'Institute', location: { city: 'Ropar', state: 'Punjab' } },
  { name: 'IIT Tirupati', type: 'Institute', location: { city: 'Tirupati', state: 'Andhra Pradesh' } },
  { name: 'IIT(ian) affiliated research centres', type: 'Institute', location: { city: 'Various', state: 'India' } },

  // NITs
  { name: 'NIT Calicut', type: 'Institute', location: { city: 'Kozhikode', state: 'Kerala' } },
  { name: 'NIT Hamirpur', type: 'Institute', location: { city: 'Hamirpur', state: 'Himachal Pradesh' } },
  { name: 'NIT Kurukshetra', type: 'Institute', location: { city: 'Kurukshetra', state: 'Haryana' } },
  { name: 'NIT Meghalaya', type: 'Institute', location: { city: 'Shillong', state: 'Meghalaya' } },
  { name: 'NIT Nagaland', type: 'Institute', location: { city: 'Dimapur', state: 'Nagaland' } },
  { name: 'NIT Rourkela', type: 'Institute', location: { city: 'Rourkela', state: 'Odisha' } },
  { name: 'NIT Surathkal', type: 'Institute', location: { city: 'Surathkal', state: 'Karnataka' } },
  { name: 'NIT Trichy', type: 'Institute', location: { city: 'Tiruchirappalli', state: 'Tamil Nadu' } },
  { name: 'NIT Warangal', type: 'Institute', location: { city: 'Warangal', state: 'Telangana' } },
  { name: 'National Institute of Technology Silchar', type: 'Institute', location: { city: 'Silchar', state: 'Assam' } },
  { name: 'National Institute of Technology, Durgapur', type: 'Institute', location: { city: 'Durgapur', state: 'West Bengal' } },
  { name: 'Sardar Vallabhbhai National Institute of Technology (SVNIT) Surat', type: 'Institute', location: { city: 'Surat', state: 'Gujarat' } },

  // IIMs
  { name: 'IIM Ahmedabad', type: 'Institute', location: { city: 'Ahmedabad', state: 'Gujarat' } },
  { name: 'IIM Bangalore', type: 'Institute', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'IIM Calcutta', type: 'Institute', location: { city: 'Kolkata', state: 'West Bengal' } },
  { name: 'IIM Indore', type: 'Institute', location: { city: 'Indore', state: 'Madhya Pradesh' } },
  { name: 'IIM Kozhikode', type: 'Institute', location: { city: 'Kozhikode', state: 'Kerala' } },
  { name: 'IIM Lucknow', type: 'Institute', location: { city: 'Lucknow', state: 'Uttar Pradesh' } },
  { name: 'IIM Udaipur', type: 'Institute', location: { city: 'Udaipur', state: 'Rajasthan' } },

  // IISERs
  { name: 'IISc Bangalore', type: 'Institute', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'IISER Bhopal', type: 'Institute', location: { city: 'Bhopal', state: 'Madhya Pradesh' } },
  { name: 'IISER Kolkata', type: 'Institute', location: { city: 'Kolkata', state: 'West Bengal' } },
  { name: 'IISER Mohali', type: 'Institute', location: { city: 'Mohali', state: 'Punjab' } },
  { name: 'IISER Thiruvananthapuram', type: 'Institute', location: { city: 'Thiruvananthapuram', state: 'Kerala' } },

  // IIITs
  { name: 'IIIT Allahabad (Prayagraj)', type: 'Institute', location: { city: 'Prayagraj', state: 'Uttar Pradesh' } },
  { name: 'IIIT Bangalore', type: 'Institute', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'IIIT Bhubaneswar', type: 'Institute', location: { city: 'Bhubaneswar', state: 'Odisha' } },
  { name: 'IIIT Delhi', type: 'Institute', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'IIIT Kancheepuram', type: 'Institute', location: { city: 'Kancheepuram', state: 'Tamil Nadu' } },
  { name: 'IIIT Una', type: 'Institute', location: { city: 'Una', state: 'Himachal Pradesh' } },
  { name: 'Indian Institute of Information Technology (IIIT) Hyderabad', type: 'Institute', location: { city: 'Hyderabad', state: 'Telangana' } },

  // Other Institutes
  { name: 'Indian Institute of Foreign Trade (IIFT) Delhi', type: 'Institute', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Indian Institute of Science Education and Research (IISER) Bhopal', type: 'Institute', location: { city: 'Bhopal', state: 'Madhya Pradesh' } },
  { name: 'Indian Institute of Science Education and Research (IISER) Pune', type: 'Institute', location: { city: 'Pune', state: 'Maharashtra' } },
  { name: 'Indian Institute of Space Science and Technology (IIST) Thiruvananthapuram', type: 'Institute', location: { city: 'Thiruvananthapuram', state: 'Kerala' } },
  { name: 'Indian Institute of Toxicology Research (IITR)', type: 'Institute', location: { city: 'Lucknow', state: 'Uttar Pradesh' } },
  { name: 'Indian Maritime University', type: 'University', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'Indian School of Business (ISB) Hyderabad', type: 'Institute', location: { city: 'Hyderabad', state: 'Telangana' } },
  { name: 'Indian Statistical Institute (ISI) Kolkata', type: 'Institute', location: { city: 'Kolkata', state: 'West Bengal' } },
  { name: 'Institute of Chemical Technology (ICT) Mumbai', type: 'Institute', location: { city: 'Mumbai', state: 'Maharashtra' } },
  { name: 'National Academy of Legal Studies and Research (NALSAR)', type: 'Institute', location: { city: 'Hyderabad', state: 'Telangana' } },
  { name: 'National Institute of Design (NID) Ahmedabad', type: 'Institute', location: { city: 'Ahmedabad', state: 'Gujarat' } },
  { name: 'National Institute of Fashion Technology (NIFT) Delhi', type: 'Institute', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'National Institute of Mental Health and Neuro Sciences (NIMHANS) Bengaluru', type: 'Institute', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'National Institute of Pharmaceutical Education and Research (NIPER) Mohali', type: 'Institute', location: { city: 'Mohali', state: 'Punjab' } },
  { name: 'National Law School of India University, Bengaluru', type: 'Institute', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'National Law University (NLU) Delhi', type: 'Institute', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Netaji Subhas University of Technology (NSUT)', type: 'University', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'North-Eastern Hill University (NEHU)', type: 'University', location: { city: 'Shillong', state: 'Meghalaya' } },
  { name: 'S.N. Bose National Centre for Basic Sciences', type: 'Institute', location: { city: 'Kolkata', state: 'West Bengal' } },
  { name: 'Tata Institute of Social Sciences (TISS) Mumbai', type: 'Institute', location: { city: 'Mumbai', state: 'Maharashtra' } },
  { name: 'Thapar Institute of Engineering and Technology', type: 'Institute', location: { city: 'Patiala', state: 'Punjab' } },
  { name: 'TIFR Mumbai', type: 'Institute', location: { city: 'Mumbai', state: 'Maharashtra' } },

  // Medical Colleges
  { name: 'Armed Forces Medical College Pune', type: 'College', location: { city: 'Pune', state: 'Maharashtra' } },
  { name: 'Bangalore Medical College and Research Institute', type: 'College', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'BHU Institute of Medical Sciences', type: 'Institute', location: { city: 'Varanasi', state: 'Uttar Pradesh' } },
  { name: 'Christian Medical College Vellore', type: 'College', location: { city: 'Vellore', state: 'Tamil Nadu' } },
  { name: 'Christian Medical College, Ludhiana', type: 'College', location: { city: 'Ludhiana', state: 'Punjab' } },
  { name: 'Government Medical College, Kozhikode', type: 'College', location: { city: 'Kozhikode', state: 'Kerala' } },
  { name: 'King George\'s Medical University (KGMU), Lucknow', type: 'University', location: { city: 'Lucknow', state: 'Uttar Pradesh' } },
  { name: 'Kolkata Medical College', type: 'College', location: { city: 'Kolkata', state: 'West Bengal' } },
  { name: 'Lady Hardinge Medical College, Delhi', type: 'College', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Manipal College of Dental Sciences', type: 'College', location: { city: 'Manipal', state: 'Karnataka' } },
  { name: 'St. John\'s Medical College Bengaluru', type: 'College', location: { city: 'Bangalore', state: 'Karnataka' } },

  // Engineering Colleges
  { name: 'College of Engineering, Guindy (CEG)', type: 'College', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'M S Ramaiah Institute of Technology', type: 'Institute', location: { city: 'Bangalore', state: 'Karnataka' } },
  { name: 'Manipal Institute of Management', type: 'Institute', location: { city: 'Manipal', state: 'Karnataka' } },
  { name: 'Manipal Institute of Technology', type: 'Institute', location: { city: 'Manipal', state: 'Karnataka' } },
  { name: 'Manipal University Jaipur', type: 'University', location: { city: 'Jaipur', state: 'Rajasthan' } },
  { name: 'SRM Institute of Science and Technology, Chennai', type: 'Institute', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'Vellore Institute of Technology (VIT)', type: 'Institute', location: { city: 'Vellore', state: 'Tamil Nadu' } },

  // BITS
  { name: 'Birla Institute of Technology and Science - Pilani (BITS)', type: 'Institute', location: { city: 'Pilani', state: 'Rajasthan' } },
  { name: 'BITS Goa', type: 'Institute', location: { city: 'Goa', state: 'Goa' } },
  { name: 'BITS Hyderabad', type: 'Institute', location: { city: 'Hyderabad', state: 'Telangana' } },
  { name: 'BITS Pilani', type: 'Institute', location: { city: 'Pilani', state: 'Rajasthan' } },

  // Colleges
  { name: 'Fergusson College, Pune', type: 'College', location: { city: 'Pune', state: 'Maharashtra' } },
  { name: 'Hindu College, DU', type: 'College', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Lady Irwin College, Delhi', type: 'College', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Lady Shri Ram College (LSR)', type: 'College', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Loyola College Chennai', type: 'College', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'Madras Christian College', type: 'College', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'Maitreyi College', type: 'College', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Manipal Academy of Higher Education (MAHE) - Manipal', type: 'University', location: { city: 'Manipal', state: 'Karnataka' } },
  { name: 'NALSAR University of Law, Hyderabad', type: 'University', location: { city: 'Hyderabad', state: 'Telangana' } },
  { name: 'SCMS Cochin School of Business', type: 'College', location: { city: 'Kochi', state: 'Kerala' } },
  { name: 'Shillong College (example)', type: 'College', location: { city: 'Shillong', state: 'Meghalaya' } },
  { name: 'Shri Ram College of Commerce (SRCC)', type: 'College', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'SRCC', type: 'College', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'St. Stephen\'s College, Delhi', type: 'College', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'St. Xavier\'s College, Mumbai', type: 'College', location: { city: 'Mumbai', state: 'Maharashtra' } },
  { name: 'Symbiosis International University, Pune', type: 'University', location: { city: 'Pune', state: 'Maharashtra' } },
  { name: 'Symbiosis Law School Pune', type: 'College', location: { city: 'Pune', state: 'Maharashtra' } },
  { name: 'XLRI Jamshedpur', type: 'Institute', location: { city: 'Jamshedpur', state: 'Jharkhand' } },

  // Additional institutions from user request
  { name: 'GNLU Gandhinagar', type: 'University', location: { city: 'Gandhinagar', state: 'Gujarat' } }
];

async function seedInstitutions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing institutions
    await Institution.deleteMany({});
    console.log('Cleared existing institutions');

    // Insert new institutions
    for (const institution of institutions) {
      await Institution.create({
        ...institution,
        isVerified: true,
        usageCount: Math.floor(Math.random() * 100) + 1
      });
    }

    console.log(`Seeded ${institutions.length} institutions successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding institutions:', error);
    process.exit(1);
  }
}

// Run the seeder
seedInstitutions();
