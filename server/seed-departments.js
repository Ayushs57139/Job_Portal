require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department'); // Adjust path as necessary

const departmentData = {
    "Administration / Back Office": [
        "Admin", "Admin Management", "Back Office", "Data Entry", "Computer Operator", 
        "Front Office", "Receptionist", "Office Helper / Peon", "Administration", 
        "Facility Management", "MIS Operations", "Other"
    ],
    "Advertising / Digital Marketing": [
        "Advertising & Creative", "Copywriting", "Corporate Communication", "Marketing / Branding / Digital Marketing",
        "BTL", "Marketing", "Market Research / Insights", "SEO", "Conversion optimization",
        "Landing page / Lead Capture", "Social media marketing", "Email marketing", "Other"
    ],
    "Agriculture / Forestry / Fishing": [
        "Plant Nutrition", "Animal Nutrition", "Seaweed Cultivation", "Crop Health", "Crop Treatment",
        "Crop Scouting", "Crop Cutting", "Dairy", "Mixed Farming", "Plantation Farming",
        "Intensive Farming", "Extensive Farming", "Dryland Farming", "Wetland Farming",
        "Organic Farming", "Shifting Agriculture", "Cooperative Farming", "Cultivation",
        "Husbandry", "Gardening", "Tillage", "Agronomy", "Ranching", "Aquaculture",
        "Finfish", "Shellfish", "Algae / Plants", "Ornamental Fish", "Freshwater Aquaculture",
        "Brackishwater Aquaculture", "Marine Aquaculture", "Pond Farming", "Cage Farming",
        "Recirculating Aquaculture Systems (RAS)", "Aquaponics", "Integrated Multi-Trophic Aquaculture (IMTA)",
        "Raceways", "Fixed Fishing Cage", "Floating Fishing Cage", "Submersible Fishing Cage",
        "Submerged Fishing Cage", "Other"
    ],
    "Aviation / Airlines / Aerospace": [
        "Air Traffic Control", "Airline Services", "Airline Operations Control", "Airport Technical Operations",
        "Airport Fueling and Refueling Operations", "Airport Ground Services", "Airport Terminal Operations",
        "Aviation Engineering", "Flight & Airport Operations", "Flight Crew / Hostess", "In-flight Services",
        "Pilot", "Other"
    ],
    "Banking / Financial Services / Insurance": [
        "Banking / Loan Sales", "Banking - Treasury & Forex", "BFSI Project Management", "Credit Card Sales",
        "Debt Collections / Recovery", "General Insurance", "Health Insurance", "Insurance Sales",
        "Investment Banking / Private Equity / VC", "Lending Operations", "Life Insurance",
        "Treasury / Forex", "BFSI, Investments & Trading - Other", "CASA", "Current Account",
        "Savings Account", "Corporate Salary Account", "Credit Card", "Debit Cards", "Kisan Credit Card",
        "Auto Loan", "Tractor Loan", "Business Loan", "CD Loan", "Consumer Finance", "DSA",
        "Gold Loan", "Gold Loan Sales", "Group Loan", "Home Loan", "LAP", "Loan Approval",
        "Loan Processing", "Finance", "Mortgage", "Micro Finance", "MSME Loan", "Mutual Fund",
        "Personal Loan", "Education Loan", "Agriculture Loan", "Life Insurance", "Health Insurance",
        "General Insurance", "Motor Insurance", "Home Insurance", "Travel Insurance", "Property Insurance",
        "Liability Insurance", "Commercial Insurance", "Banking Operations", "Branch Operations",
        "Credit Operations", "Disbursement", "Gold Appraisal", "Gold Testing", "Gold Valuation",
        "Loan Verification", "Foreign Exchange Services", "Demat Account Service", "Investment Products",
        "Safe Deposit Locker", "Investment Banking", "Smart Banking / Digital Banking", "Recurring Deposit",
        "Term Deposit", "Secured Loan", "Unsecured Loan", "Cash Credit", "Bank Overdraft",
        "Reverse Mortgage", "CIBIL", "Hypothecation deed", "Term Loans", "Short Term Loan",
        "Medium Term Loan", "Long Term Loan", "Housing Loan", "Vehicle Loan", "Asset Management",
        "Broking", "Trading / Asset / Wealth Management", "Treasury / Forex", "Other"
    ],
    "Beauty / Personal Care / Fitness": [
        "Beauty & Personal Care", "Gym Trainer", "Hair Stylist / Barber", "Health & Fitness",
        "Makeup Artist", "Manicurist", "Massage Therapist", "Nail Technician / Artist",
        "Nutritionist", "Sports Science & Medicine", "Sports Staff and Management", "Yoga Instructor",
        "Eye Care", "Eye Care Products", "Sunglasses", "Eyeglasses", "Contact Lenses", "Frames",
        "Wellness", "Beauty and Wellness", "Beauty Products", "Cosmetics", "Fitness", "Sports",
        "Yoga", "Fitness / Wellness", "Beauty / Wellness / Personal Care", "Other"
    ],
    "Construction Engineering": [
        "Construction - Bricklayer", "Construction Engineering", "Construction - Labour / Factory Worker",
        "Construction Supervisor", "Construction Surveying", "Civil Engineering", "Structural Engineering",
        "Architecture", "Construction", "Project Management", "Real Estate Development",
        "Architecture / Planning", "Property Management", "Property Sales", "Highway / Street / Construction",
        "Bridge / Tunnel / Construction", "Railway Station Construction", "Railway Line Construction",
        "Infrastructure / Construction", "Other"
    ],
    "Consulting / Professional Services": [
        "Finance Consulting", "Human Resources Consulting", "IT Consulting", "Legal Consulting",
        "Management Consulting", "Marketing Consulting", "Tax Consulting", "Consumer services",
        "Business services", "Public services", "Business Consulting", "Management Consulting",
        "IT Services", "Advisory Services", "Background Verification", "Broking Services",
        "Collection", "Consulting", "Data Entry", "Environmental Service", "Facility Management",
        "Matrimonial Services", "Procurement", "Recovery", "Social Services", "Stock Maintaining",
        "Verification", "Liaison", "MIS", "Law Enforcement / Security Services",
        "Architecture / Interior Design", "Other"
    ],
    "Customer Support / ITES / BPO": [
        "Customer Success", "Customer Support - BPO / Voice / Blended", "Customer Support - International Voice Process",
        "Customer Support - Non Voice", "Customer Support - Non Voice / Chat", "Customer Support - Operations",
        "Customer Support - Service Delivery", "ITES", "Analytics", "BPO", "Business Process Outsourcing (BPO)",
        "Chat Process", "Customer Support", "Domestic BPO", "Game Process Outsourcing (GPO)",
        "In Bound", "International BPO", "Knowledge Process Outsourcing (KPO)", "KPO",
        "Legal Process Outsourcing (LPO)", "Out Bound", "Research", "Telesales", "Voice Process",
        "Call Centre", "Outsourcing", "Other"
    ],
    "Data Science / Analytics": [
        "Business Intelligence / Analytics", "Data Science & Machine Learning", "Methodology",
        "Data Analytics", "Data Collection / Cleaning", "Exploratory Data Analysis (EDA)",
        "Model Development", "Feature Engineering & Preprocessing", "Credit Card Fraud Detection",
        "Sales Forecasting", "Customer Segmentation", "Recommender Systems", "Fake News Detection",
        "Breast Cancer Classification", "Chatbot Development", "Sentiment analysis", "Other"
    ],
    "Defense / Security Services": [
        "Security Management", "Armed forces", "Private security", "Security Services", "Security System",
        "Home / Business Alarm Security", "Security Services Packages Sales", "Private Detective Agency",
        "Private Detective Services", "Defense / Security Services", "Security Alarm", "Security Devices",
        "QRT- Quick Response Team", "Other"
    ],
    "Designing / Architecture": [
        "Architecture & Interior Design", "Digital Design", "DTP Operator", "UI / UX Design",
        "Design", "Animation", "Graphic designing", "Printing", "Web Designing", "UI/UX",
        "Graphic Design", "Industrial Design", "Interior Design", "Interior Solutions",
        "Home Interior", "Laminates", "Other", "Designing / Architecture", "Other"
    ],
    "eCommerce / Sales / Operations": [
        "Digital Goods Sales", "Digital Services Sales", "Digital Subscriptions Sales",
        "Online Shopping", "Online Marketplaces", "Order Placing", "Order Management",
        "eCommerce Operations", "Customer Engagement", "Other", "Other", "Other",
        "eCommerce / Sales / Operations", "Other"
    ],
    "Education / Teaching / Training": [
        "Corporate Training", "Language Teacher", "Life Skills / ECA Teacher", "Online Teacher",
        "Preschool & Primary Education", "Teacher / Faculty / Tutor", "Teaching Admin & Staff",
        "University Level Educator", "Education", "Schools", "University / College",
        "Training institutes", "Professional Training and Coaching", "Technical and Vocational Training",
        "Training", "Other"
    ],
    "Emerging Technology": [
        "Biotechnology", "Electronic Components", "Semiconductors", "Robotics / Automation",
        "AI / ML", "Blockchain", "Cloud Technology", "loT", "Agri-tech", "Cybersecurity",
        "Drones / Robotics", "Nanotechnology", "AR / VR", "Emerging Technology", "Other"
    ],
    "Energy / Power": [
        "Railway Electrification", "Transmission / Distribution", "Electricity Distribution",
        "Electrical Technology", "Electrical Parts", "Electricity Systems", "Smart Metering",
        "DT Metering", "Tower / Poles", "PVC Pipes", "Geothermal", "Commercial Electricity / Power",
        "Residential Electricity / Power", "Power Supply", "Nuclear power", "Hydrocarbon",
        "Renewable Energy", "Solar power", "Wind energy", "Hydro Power", "Geothermal",
        "Potential energy", "Kinetic energy", "Other", "Energy / Power", "Other"
    ],
    "Environment Health & Safety (EHS)": [
        "Community Health & Safety", "Occupational Health & Safety", "Environmental Protection",
        "Occupational Health", "Workplace Safety", "Compliance", "Risk Mitigation",
        "Business Continuity", "Policy and Procedure Development", "Training and Awareness",
        "Monitoring and Review", "Other", "Environment Health & Safety (EHS)", "Other"
    ],
    "Fashion / Apparel / Home Furnishing": [
        "Fashion / Accessories", "Jewellery Design", "Tailoring / Garment Manufacturing",
        "Tailoring", "Fashion", "Handicraft", "Home Textile", "Technical Textile", "Other",
        "Fashion / Apparels", "Garments", "Fabrics", "Leather", "Textile / Apparel",
        "Yarn / Fabric", "Fashion", "Handicraft", "Home Textile", "Technical Textile", "Other"
    ],
    "Finance / Accounting / Taxation": [
        "Accounting / Auditing", "Cost Accounting", "Domestic / International Taxation",
        "Domestic Taxation", "International Taxation", "Management Accounting", "Taxation",
        "Accounting Services", "Bookkeeping Services", "Tax Advisory and Compliance",
        "Financial Statement Preparation", "Audit Support", "Financial Outsourcing (FAO)",
        "GST Advisory", "ITR Filling", "Finance", "Payroll & Transactions", "Treasury",
        "Billing / Cashier", "Finance", "Payables / Receivables Management", "Payroll & Transactions",
        "Account Receivable (AR)", "Finance & Accounting", "Finance / Accounting / Taxation", "Other"
    ],
    "Government / Public Administration": [
        "Government Sectors", "Indian Railways", "Marine Services", "Metro Rail",
        "Government Tender", "Government Tendering", "Tender Bidding", "Bidding",
        "Tender Analysis", "Public Relations (PR)", "Government Projects", "Government Affairs",
        "Current Affairs", "Civil Services", "Public Administration", "Defense Services",
        "Public Health", "Urban Planning", "Space Program", "Municipal services", "Other"
    ],
    "Hardware / Networks Engineering": [
        "Hardware", "IT Network", "Telecom", "Local Area Networks (LANs)", "Wide Area Networks (WANs)",
        "Cloud infrastructure", "Network diagrams", "Troubleshooting", "Design and Development",
        "Managing routers", "Diagnosing hardware Issues", "Computer components", "Circuit board design tools",
        "Other", "Hardware / Networks Engineering", "Other"
    ],
    "Healthcare / Doctor / Hospitals": [
        "Allergy Testing Technician", "Blood Testing Technician", "Brain Scan Technician",
        "Cancer Testing Technician", "CT Scan Technician", "Doctor", "Genetic Testing Technician",
        "Heart Scan Technician", "Hospital Admin", "Imaging & Diagnostics", "Lab Assistant / Technician",
        "Medical representative", "Minimally Invasive Scan Technician", "MRI Scan", "Nurse / Patient Care / Hospital Staff",
        "Pharmacist", "Tissue Testing Technician", "Ward Helper", "X-Ray Technician", "Healthcare",
        "Ayurveda", "Diagnostics", "Hospitals", "Life Sciences", "Medical Equipment",
        "Medical Transcription", "Pharmaceutical", "Mental health", "Telemedicine", "Biotech",
        "Medical Services / Hospital", "Clinical Research / Contract Research",
        "Pharmaceutical / Life Sciences", "Clinics, Chemist / Pharmacies", "Health Tech",
        "Mental Health Care", "Veterinary", "Other"
    ],
    "Heavy Machinery / Equipment": [
        "Heavy Equipment", "Heavy Machinery", "Heavy Vehicle", "Wheel Loaders", "Road Compactors",
        "Excavators", "Heavy Machinery Sales", "Heavy Vehicle Sales", "Heavy Equipment Sales",
        "Heavy Equipment Services", "Other", "Heavy Machinery / Equipment", "Other"
    ],
    "Hospitality / Tourism / Restaurant": [
        "Cook / Chef / Kitchen Help", "Events / Banquet", "Front Office / Guest Services",
        "Hospitality Management", "Housekeeping / Laundry", "Restaurant Staff / Waiter / Steward",
        "Tourism Services", "Visa Counselling", "Food Services", "Hotel Kitchen", "Restaurant",
        "Tourism", "Travel", "Food / Beverage", "Travel agencies", "Hotels / Restaurants",
        "Travel / Tourism", "Events / Live Entertainment", "Cruise Lines and Passenger Transportation",
        "Travel Agencies / Tour Operators", "Bed-and-Breakfasts / Hostels / Homestays", "Catering",
        "Hotels", "Bars / Pubs / Nightclubs", "Fast-Food Joints (QSR)", "Restaurants", "Resorts",
        "Clubs", "Cloud Kitchen", "Other"
    ],
    "Human Resources Management": [
        "Compensation / Benefits", "Employee Relations", "Events / Banquet", "HR Business Advisory",
        "HR Operations", "Recruitment Marketing / Branding", "US IT", "US IT Bench Sales",
        "US IT Recruiter", "Human Resource", "HR Operations", "HR Recruitment", "Recruitment",
        "Manpower Hiring", "Non IT Recruitment", "IT Recruitment", "Payroll / Compliances",
        "Recruitment / RPO", "Sourcing", "Staffing", "Employee Relations", "Training / Development",
        "Temp Recruitment", "Perm Recruitment", "Payroll Processing", "Recruitment / Staffing",
        "HR Tech", "Manpower Consultants", "Other"
    ],
    "IT / Information Security": [
        "IT Infrastructure Services", "IT Security", "Information Security (InfoSec)",
        "Technical infrastructure", "The CIA Triad", "Comprehensive Protection", "Data Security",
        "Threat /Virus Detection", "Threat /Virus Prevention", "Threat /Virus Protection",
        "Security Architect", "Cybersecurity Architect", "Penetration Tester", "Network Security",
        "Application Security", "Application security (AppSec)", "Cloud Security",
        "Virtual Private Networks (VPNs)", "Firewalls Management", "Access Control",
        "Detection and Monitoring", "Protection of Networks", "Other", "IT / Information Security", "Other"
    ],
    "Laboratory Testing Services": [
        "Non-Destructive Testing", "Industrial Radiography Test", "X-ray", "Gamma Ray",
        "Ultrasonic Test", "Magnetic Particle Test", "Dye Penetrant Test", "Heat Treatment",
        "Resistance heating", "Induction heating", "Training / Certification", "ISNT", "ASNT",
        "Advanced NDT Systems", "Acoustic emission testing", "Field measurement",
        "Low voltage inducting heating", "Flange face inspection", "Hydrogen induced crack detection",
        "Tube inspection", "Vacuum box testing", "Other", "Laboratory Testing Services", "Other"
    ],
    "Law / Legal / Regulatory": [
        "Civil Law", "Corporate Affairs", "Crime / Arbitration", "Legal Operations",
        "Dispute Solutions", "Debt Resolution", "Arbitration Consultancy", "Property Disputes",
        "Mediation Services", "Loan Settlement Services", "Recovery Calling", "Loan Recovery",
        "Lawyers", "Legal Advisors", "Paralegals", "Compliance Officers", "Corporate Law",
        "Law firms", "Compliance", "Law Enforcement", "Law Firm", "Legal", "Regulatory Compliance",
        "Other", "Law / Legal / Regulatory", "Other"
    ],
    "Logistics / Delivery / Transportation": [
        "Delivery", "Driver", "Cargo", "Courier", "Food Delivery", "Freight", "General Trading",
        "Grocery / Hyperlocal Delivery", "Import / Export", "Milk Delivery", "Milk Supply",
        "Movers", "Packers", "Purchase", "Transportation", "Warehouse Operations", "Supply Chain",
        "Logistics Management", "Warehousing", "Fleet Management", "Car, Bike / Taxi Services",
        "Urban Transport", "Railways / Roadways", "Logistics Tech", "Courier / Logistics",
        "3rd Party Logistics", "Cold Storage", "Inbound Logistics", "Outbound Logistics",
        "Inward", "Outward", "Other", "Logistics / Delivery / Transportation", "Other"
    ],
    "Maintenance / Facility Services": [
        "Carpenter", "CCTV Technician", "DTH Technician", "Electrician / Wireman",
        "Heating / Ventilation / Air conditioning (HVAC)", "Home & Office Maintenance",
        "Installation Services", "Kitchen Appliance Technician", "Laptop Technician", "Lift / Elevator Technician / Operator",
        "Maintenance Turner / Fitter", "Mobile Technician", "Painter", "Plumber", "RO Technician",
        "Service & Repair", "Solar Energy Technician", "Facility Management", "Property Maintenance / Operations",
        "Maintenance / Facility Services", "Other"
    ],
    "Media Production / Entertainment": [
        "Actors / Artists / Creative", "Animation / Effects", "Make Up / Costume", "Media Direction",
        "Media Editing", "Media Production", "Photographer", "Sound / Light / Technical Support",
        "Videographer", "Artists", "Direction", "Content, Editorial & Journalism", "Editing",
        "Content Writing", "Editing (Print / Online)", "Journalism", "Media Production / Entertainment - Other",
        "Media / Entertainment", "Advertisement", "Advertising", "Entertainment", "Events",
        "Media", "News Channel", "News Paper", "Publishing", "Social Media", "Acting",
        "TV Shows", "Movies", "Journalism", "Film / Television", "Radio / Broadcasting",
        "TV / Radio", "Animation / Multimedia", "Film production", "OTT", "Advertising / Marketing",
        "Public Relations", "Digital Marketing", "Printing / Publishing", "Content Development / Language",
        "Animation / VFX", "Gaming", "Film / Music / Entertainment", "Sports / Leisure / Recreation",
        "Broadcast Media", "Sports Teams and Clubs", "Social media marketing", "Email marketing", "Other"
    ],
    "Manufacturing / Production": [
        "Assembly Line Operator", "CNC Machine Operator", "Cutting Machine Operator",
        "Foundry", "Grinding Machine Operators", "Instrumentation Mechanic", "Lathe Operator",
        "Manufacturing - Engineering", "Manufacturing Labour / Factory Worker", "Manufacturing Maintenance",
        "Manufacturing Management", "Manufacturing Operations", "Manufacturing Quality",
        "Manufacturing R&D", "Manufacturing Support", "Moulding Machine Operator",
        "Operations, Maintenance & Support", "Power Press Operator", "Production", "Quality",
        "Tool & Die maker", "Turner / Fitter", "VMC Machine Operator", "Welder", "OEMs",
        "Bearings / Gears", "Machinery", "Other", "Manufacturing / Production", "Other"
    ],
    "Mining / Quarrying": [
        "Surface mining", "Underground mining", "Placer mining", "In-situ mining", "Drilling",
        "Blasting", "Crushing", "Mining Site Screening", "Copper", "Iron", "Steel", "Zinc",
        "Material Handling", "Safety Equipment", "Ground Support", "Ancillary Services",
        "Crushing and Grinding", "Concentrating Ores", "Liquefaction", "Agglomeration",
        "Mining Transportation", "Extraction Equipment", "Processing Equipment", "Conventional Resources",
        "Unconventional Resources", "Offshore Resources", "Mining", "Mining - Downstream",
        "Mining - Midstream", "Mining - Upstream", "Other", "Mining / Quarrying", "Other"
    ],
    "Oil / Gas Resourses": [
        "Oil / Gas Extraction", "Engine Oil", "Lubricant", "Petrol", "Oil / Gas",
        "Upstream (Exploration / Production)", "Midstream (Transportation / Processing)",
        "Downstream (Refining / Distribution)", "Petrochemicals", "Liquefied Natural Gas (LNG)",
        "Gasoline Fuel", "Diesel Fuel", "Jet Fuel", "Oil Sands", "Other", "Oil / Gas Resourses", "Other"
    ],
    "Operations Management": [
        "Agriculture Operations", "Logistics Operations", "Manufacturing/Production",
        "Operations Planning & Control", "Operations Quality Control", "Telecom Operations",
        "Other", "Operations Management", "Other"
    ],
    "Product Management": [
        "Product Management", "Product Management - Technology", "Product Lifecycle Management",
        "Cross-Functional Collaboration", "Customer Focus", "Market and User Research",
        "Collaborate and Communicate", "Customer Empathy", "Business Alignment", "Market success",
        "Eventual launch", "Other", "Product Management", "Other"
    ],
    "Project / Program Management": [
        "Construction / Manufacturing Management", "Finance Project Management",
        "Other Program / Project Management", "Technology / IT Project Management",
        "Project Management", "Program Management", "Project Planning / Execution",
        "Proposal Writing", "Planning & Estimation", "Scope Management", "Estimation",
        "Quality Management", "Resource Management", "Execution & Tracking", "Project Execution",
        "Resource Allocation & Management", "Task Execution", "Monitoring & Control",
        "Change Control", "Configuration Management", "Audits and Reviews", "Project Closure",
        "Release Management", "Distribution Planning", "Other", "Project / Program Management", "Other"
    ],
    "Purchase / Supply Chain": [
        "Dispatch Management", "Import / Export", "Procurement / Purchase", "Purchase",
        "Stores / Material Management", "Strategic Sourcing", "Acquisition of Goods",
        "Acquisition of Services", "Sourcing and qualifying suppliers", "Negotiating contracts and pricing",
        "Placing orders and ensuring quality", "Identifying company needs", "Supply Chain Management (SCM)",
        "Other", "Purchase / Supply Chain", "Other"
    ],
    "Quality Assurance (QA)": [
        "Business Process Quality", "Production & Manufacturing Quality", "Quality Assurance Other",
        "Quality Checker", "Quality Control", "Quality Planning", "Quality Monitoring",
        "Corrective & Preventive Actions", "Supplier Management", "Product Lifecycle Management",
        "Training & Improvemen", "QA Analyst", "Other", "Quality Assurance (QA)", "Other"
    ],
    "Retail / Sales / Operations": [
        "Category Management / Operations", "Merchandising / Planning", "Storage",
        "Merchandising / Display", "Buying / Sourcing", "Inventory Management", "Order Fulfillment",
        "Order Generation", "Customer Experience / Engagement", "Retail Activities", "Retail Events",
        "Loyalty Programs", "Omnichannel Experiences", "Feedback / Improvement", "Customer Interaction",
        "After-Sales Services", "Selling and Merchandising", "Other", "Retail / Sales / Operations", "Other"
    ],
    "Research & Development (R&D)": [
        "Engineering & Manufacturing Research", "Pharma & Biotech Research", "Scientific research",
        "Technology innovation", "R&D Consulting", "Experimentation Research", "Pre-Experimental Research",
        "True Experimental Research", "Quasi-Experimental Research", "Research & Development - Other",
        "Research & Development (R&D)", "Other"
    ],
    "Risk Management / Compliance": [
        "Business Risk Management", "Risk Compliance", "Risk Management - Assessment / Advisory",
        "Risk Management - Finance", "Risk Management - Operations / Strategy", "Risk Management - Security / Fraud",
        "Compliance Risk Management (CRM)", "Risk Management", "Risk Identification", "Risk Analysis and Assessment",
        "Risk Evaluation and Prioritization", "Risk Treatment / Response", "Risk Monitoring and Review",
        "Reporting and Communication", "Legal liabilities", "Other", "Risk Management / Compliance", "Other"
    ],
    "Sales / Business Development": [
        "B2C / Retail / Counter Sales", "BD / Pre Sales", "Enterprise / B2B Sales", "Field Sales",
        "Inside Sales", "Real Estate Sales", "Sales", "Sales Management", "Sales Support / Operations",
        "Marketing", "Network Marketing", "Direct Marketing", "Merchant Onboarding", "Market Research",
        "Business Development", "Channel Sales", "Distributors Management", "Other", "Sales / Business Development", "Other"
    ],
    "Shipping / Maritime": [
        "Port / Maritime Operations", "Shipping Deck", "Shipping Engineering / Technical",
        "Shipping / Ports", "Shipping / Freight", "Shipbuilding", "Shipping", "Maritime Transport",
        "Global Trade", "Deep Water Ports", "Container Ports", "Bulk Cargo Ports", "Other", "Shipping / Maritime", "Other"
    ],
    "Software Engineering": [
        "DBA / Data warehousing", "DevOps", "Frontend Development", "Software Backend Development",
        "Software Development", "Software Project Management", "Software Quality Assurance and Testing",
        "Software Configuration Management (SCM)", "Documentation", "Code Review", "Measurement and Metrics",
        "Software Validation", "Software Evolution", "Requirement Analysis and Specification",
        "Software Development", "Android Development", "iOS Development", "Web Development",
        "Windows Development", "Apps Development", "Other", "Software Engineering", "Other"
    ],
    "Social Services / NGOs": [
        "CSR / Sustainability", "Non Profit Organizations (NGOs)", "Charitable foundations",
        "Charitable Trust", "International NGOs", "National NGOs", "Environmental NGOs",
        "Developmental NGOs", "Humanitarian NGOs", "Human Rights NGOs", "Education NGOs", "Charity",
        "Industry Associations", "Company Associations", "CSR & Social Services", "Other", "Social Services / NGOs", "Other"
    ],
    "Strategic / Top Management": [
        "Strategic Management", "Top Management", "Entrepreneurship", "Startup Management",
        "Unicorn Management", "Services Startup", "SAAS Startup", "eCommerce Startup",
        "Manufacturing Startup", "Pharma Startup", "Defence Startup", "Strategic / Top Management", "Other"
    ],
    "Telecom / ISP": [
        "Telecom", "Broadband", "D2H", "Mobile / Headset", "Landline Phone", "Mobile Accessories",
        "Network Solutions", "Network Distribution", "WiFi", "Network Engineering", "Telecom Sales",
        "Field Operations", "Telecom Infrastructure", "Telecommunications", "Internet services",
        "Mobile networks", "Other", "Telecom / ISP", "Other"
    ],
    "UAV / UAS Technology": [
        "UAV", "UAS", "Drone", "Drone Pilot", "Drone Operator", "Drone Flying", "Drone Engineering",
        "Drone Spraying", "Agriculture Drone", "Army Drone", "Defence Drone", "Fighter Drone",
        "Robotic Drone", "Surveillance Drone", "Videography Drone", "Camera Drone", "Other", "UAV / UAS Technology", "Other"
    ],
    "Utility Services": [
        "Baby Care", "Cleaning", "Elder Care", "Gardener", "Home Caretaker", "Home Helper",
        "Home Maintenance", "Water supply", "Waste management", "Fire / Safety", "Fire", "Safety",
        "Other", "Utility Services", "Other"
    ],
    "Other Department": [
        "Other Department"
    ]
};

async function seedDepartments() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
        });
        console.log('Connected to MongoDB');

        await Department.deleteMany({});
        console.log('Existing departments cleared');

        for (const categoryName in departmentData) {
            const subcategories = departmentData[categoryName];
            console.log(`Creating department: ${categoryName} with ${subcategories.length} subcategories`);
            try {
                const department = new Department({
                    name: categoryName,
                    subcategories: subcategories,
                    isActive: true
                });
                await department.save();
                console.log(`Department saved: ${categoryName}`);
            } catch (error) {
                console.error(`Error saving department ${categoryName}:`, error.message);
            }
        }

        console.log('Departments seeded successfully');
        console.log('✅ Departments seeded successfully!');
    } catch (error) {
        console.error('Error seeding departments:', error);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

seedDepartments();