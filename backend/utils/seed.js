require('dotenv').config();
const mongoose = require('mongoose');
const KnowledgeBase = require('../models/KnowledgeBase.model');
const { generateEmbedding } = require('../services/ai.service');
const dbConfig = require('../config/db');

// Knowledge base entries
const initialKnowledge = [
  {
    category: 'admission',
    title: 'B.Tech Admission Process and Eligibility',
    content: 'For B.Tech admissions at AIT, candidates must have passed 10+2 with Physics and Mathematics as compulsory subjects, along with Chemistry/Biotechnology/Biology/Technical Vocational subject. Minimum aggregate of 60% (55% for SC/ST) is required. Admission is through AIT Entrance Exam (AITEE) or JEE Main scores. The application process begins in March online at www.ait.edu.in. Application fee is ₹1000.',
    tags: ['btech', 'admission', 'eligibility', 'jee', 'entrance exam'],
  },
  {
    category: 'courses',
    title: 'Computer Science and Engineering (CSE) Program',
    content: 'The B.Tech CSE program is a 4-year undergraduate degree focusing on software development, AI/ML, cloud computing, and data science. The curriculum includes practical labs, industry internships in the 6th semester, and a major project in the final year. We have specialized labs in partnership with IBM and Microsoft.',
    tags: ['cse', 'computer science', 'btech', 'curriculum', 'labs'],
  },
  {
    category: 'fees',
    title: 'Fee Structure for B.Tech Programs',
    content: 'The fee structure for B.Tech programs is ₹1,20,000 per academic year. This includes tuition fees, library charges, and lab fees. Examination fees of ₹2,500 per semester are extra. Fees can be paid in two installments. Education loan assistance is provided through our tie-ups with SBI and HDFC bank.',
    tags: ['fees', 'cost', 'tuition', 'btech', 'loans'],
  },
  {
    category: 'placements',
    title: 'Placement Statistics and Top Recruiters',
    content: 'AIT maintains a 94.8% placement record. The highest package offered last year was ₹42 LPA by Amazon, and the average package is ₹8.5 LPA. Top recruiters include TCS, Infosys, Wipro, Amazon, Google, Microsoft, and Cognizant. Our dedicated placement cell provides training in soft skills, aptitude, and mock interviews starting from the 3rd year.',
    tags: ['placement', 'jobs', 'salary', 'package', 'recruiters', 'companies'],
  },
  {
    category: 'hostel',
    title: 'Hostel Facilities and Fees',
    content: 'AIT offers separate hostels for boys and girls with 24/7 security, Wi-Fi, and power backup. Options include 2-seater and 3-seater rooms, with AC and Non-AC variants. Hostel fee is ₹60,000 per year for Non-AC and ₹80,000 per year for AC rooms. Mess charges are ₹40,000 per year, providing 4 meals a day with both veg and non-veg options.',
    tags: ['hostel', 'accommodation', 'mess', 'food', 'rooms'],
  },
  {
    category: 'scholarships',
    title: 'Scholarships and Financial Aid',
    content: 'AIT offers several scholarships: 1. Merit Scholarship: 50% tuition waiver for >95% in 12th board, 25% waiver for 90-95%. 2. Sports Scholarship: For state/national level players. 3. AITEE Top Rankers: 100% tuition waiver for top 100 ranks. 4. Need-based Financial Aid: Up to 50% waiver for students from EWS category (family income < 5 LPA).',
    tags: ['scholarship', 'financial aid', 'waiver', 'merit', 'concession'],
  },
  {
    category: 'facilities',
    title: 'Campus Life and Facilities',
    content: 'Our 50-acre lush green campus features a fully digitized central library, a 1000-seater auditorium, indoor and outdoor sports complexes (basketball, tennis, cricket ground), a well-equipped gymnasium, an on-campus clinic, and a cafeteria. The campus is entirely Wi-Fi enabled.',
    tags: ['campus', 'library', 'sports', 'gym', 'facilities', 'infrastructure'],
  },
  {
    category: 'courses',
    title: 'BBA and MBA Programs',
    content: 'AIT School of Management offers 3-year BBA and 2-year MBA programs. MBA specializations include Finance, Marketing, HR, and Business Analytics. The program features mandatory summer internships and guest lectures by industry leaders. Eligibility for MBA: Graduation with 50% + valid CAT/MAT/XAT score.',
    tags: ['bba', 'mba', 'management', 'business', 'cat'],
  },
  {
    category: 'admission',
    title: 'Document Required for Admission',
    content: 'During admission counseling, students must bring original and 2 sets of photocopies of: 10th and 12th marksheets, Transfer Certificate (TC), Migration Certificate, Character Certificate, Aadhar Card, 6 passport size photos, and category/caste certificate (if applicable).',
    tags: ['documents', 'admission', 'counseling', 'certificates'],
  },
  {
    category: 'departments',
    title: 'Faculty and Teaching Methodology',
    content: 'AIT has over 200 highly qualified faculty members, with 60% holding Ph.D. degrees from premier institutions like IITs and NITs. Our teaching methodology involves project-based learning, flipped classrooms, and regular industry interactions rather than just rote learning.',
    tags: ['faculty', 'teachers', 'teaching', 'professors'],
  },
  {
    category: 'facilities',
    title: 'Student Clubs and Extra-curriculars',
    content: 'AIT hosts over 20 active student clubs including the Coding Club, Robotics Society, Cultural Club (Dance/Music/Drama), Entrepreneurship Cell (E-Cell), and Photography Club. Our annual techno-cultural fest "AIT-FEST" happens every March and attracts participation from over 50 colleges.',
    tags: ['clubs', 'fest', 'extracurricular', 'events', 'cultural'],
  },
  {
    category: 'courses',
    title: 'B.Tech Specializations',
    content: 'Apart from core CSE, AIT offers B.Tech in Electronics & Communication (ECE), Mechanical Engineering (ME), Civil Engineering (CE), and specialized CSE branches like Artificial Intelligence & Machine Learning (AIML), Data Science, and Cyber Security.',
    tags: ['btech', 'branches', 'ece', 'mechanical', 'civil', 'specializations'],
  },
  {
    category: 'placements',
    title: 'Internship Opportunities',
    content: 'AIT has a mandatory 6-month industry internship in the 8th semester for B.Tech students. The placement cell assists in securing internships. Stipends range from ₹10,000 to ₹40,000 per month. Many internships lead to Pre-Placement Offers (PPOs).',
    tags: ['internship', 'stipend', 'ppo', 'training', 'industry'],
  },
  {
    category: 'admission',
    title: 'Lateral Entry Admission (Diploma to Degree)',
    content: 'Students who have completed a 3-year AICTE approved diploma can apply for direct admission into the 2nd year (3rd semester) of B.Tech. Admission is based on the State Lateral Entry Entrance Exam. Minimum 60% aggregate in diploma is required.',
    tags: ['lateral', 'diploma', 'direct admission', 'second year'],
  },
  {
    category: 'fees',
    title: 'Refund Policy',
    content: 'If a student withdraws their admission before the commencement of classes, the entire fee (minus ₹1000 processing fee) is refunded. If withdrawn within 30 days after classes start, 50% tuition fee is refunded. No refund is provided after 30 days of class commencement.',
    tags: ['refund', 'withdrawal', 'cancellation', 'money back'],
  },
  {
    category: 'facilities',
    title: 'Transport Facility',
    content: 'AIT operates a fleet of 30 buses covering all major routes in the city and nearby suburbs up to a 40km radius. Transport fees range from ₹15,000 to ₹25,000 per year depending on the distance. All buses are GPS enabled for tracking.',
    tags: ['transport', 'bus', 'commute', 'travel'],
  },
];

const seedKnowledgeBase = async () => {
  try {
    await dbConfig();
    console.log('🌱 Starting knowledge base seeding (Gemini vectors)...');

    // 1. Delete ALL existing entries because old embeddings (1536d) are incompatible with new embeddings (768d)
    await KnowledgeBase.deleteMany({});
    console.log('🗑️ Cleared existing knowledge base.');

    // 2. Insert new entries with embeddings
    let successCount = 0;
    
    for (const item of initialKnowledge) {
      try {
        // Generate embedding using Gemini
        const textToEmbed = `[${item.category.toUpperCase()}] ${item.title}. ${item.content}`;
        const embedding = await generateEmbedding(textToEmbed);
        
        await KnowledgeBase.create({
          ...item,
          embedding,
        });
        
        successCount++;
        console.log(`✅ Seeded: ${item.title}`);
        
        // Slight delay to avoid Gemini API rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`❌ Failed to seed ${item.title}:`, err.message);
      }
    }

    console.log(`\n🎉 Seeding complete! Successfully added ${successCount}/${initialKnowledge.length} entries.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedKnowledgeBase();
