import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  User,
  Patient,
  Doctor,
  Hospital,
  Specialization,
  Availability,
  Appointment,
  Review,
  Notification,
  SavedDoctor,
  SavedHospital,
  SearchHistory,
} from '../models/index.js';

dotenv.config();

const specializationsData = [
  {
    name: 'General Medicine',
    description: 'Comprehensive primary care for adult and acute common illnesses',
    category: 'Primary Care',
    icon: 'Stethoscope',
    keywords: ['fever', 'cold', 'cough', 'fatigue', 'infection', 'headache', 'weakness'],
  },
  {
    name: 'Cardiology',
    description: 'Diagnosis and medical care of heart, cardiovascular system, and hypertension',
    category: 'Specialty Care',
    icon: 'Heart',
    keywords: ['chest pain', 'palpitations', 'breathlessness', 'hypertension', 'heart rate', 'cholesterol'],
  },
  {
    name: 'Dermatology',
    description: 'Care of skin, hair, nails, eczema, acne, and cutaneous conditions',
    category: 'Specialty Care',
    icon: 'Sparkles',
    keywords: ['skin rash', 'itching', 'acne', 'allergy', 'hair fall', 'eczema', 'pigmentation'],
  },
  {
    name: 'Pediatrics',
    description: 'Medical care for infants, children, adolescents, and growth disorders',
    category: 'Pediatric Care',
    icon: 'Baby',
    keywords: ['child fever', 'vaccination', 'childhood cough', 'infant colic', 'growth delay'],
  },
  {
    name: 'Orthopedics',
    description: 'Musculoskeletal system, bones, joints, ligaments, tendons, and fractures',
    category: 'Surgical & Specialty',
    icon: 'Bone',
    keywords: ['joint pain', 'knee pain', 'fracture', 'back pain', 'arthritis', 'shoulder pain'],
  },
  {
    name: 'Neurology',
    description: 'Disorders of the nervous system, brain, nerves, and spinal cord',
    category: 'Specialty Care',
    icon: 'Brain',
    keywords: ['severe migraine', 'numbness', 'seizure', 'dizziness', 'memory loss', 'tremors'],
  },
  {
    name: 'Gynecology',
    description: 'Female reproductive health, obstetrics, prenatal care, and fertility',
    category: 'Women Health',
    icon: 'Activity',
    keywords: ['menstrual cramps', 'pregnancy care', 'pcos', 'hormonal imbalance', 'prenatal'],
  },
  {
    name: 'Ophthalmology',
    description: 'Eye diseases, vision testing, refractive surgery, and ocular health',
    category: 'Specialty Care',
    icon: 'Eye',
    keywords: ['blurred vision', 'eye pain', 'red eyes', 'cataract', 'dry eyes', 'glaucoma'],
  },
  {
    name: 'Gastroenterology',
    description: 'Digestive system, stomach, intestines, liver, and biliary tract',
    category: 'Internal Medicine',
    icon: 'Shield',
    keywords: ['acid reflux', 'stomach ache', 'indigestion', 'gastritis', 'liver disease', 'constipation'],
  },
  {
    name: 'Oncology',
    description: 'Cancer screening, medical oncology, diagnosis, and systemic chemotherapy',
    category: 'Super Specialty',
    icon: 'Target',
    keywords: ['unexplained weight loss', 'lump', 'cancer screening', 'biopsy advice'],
  },
];

const hospitalsData = [
  {
    name: 'Apollo Speciality Hospitals',
    address: 'Greams Road, Thousand Lights',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600006',
    latitude: 13.0569,
    longitude: 80.2525,
    phone: '+91 44 2829 0200',
    email: 'info@apollochennai.com',
    facilities: ['24/7 Emergency', 'Cardiology Lab', 'ICU', 'MRI / CT Scan', 'Pharmacy', 'Inpatient Rooms'],
    emergencyService: true,
    rating: 4.8,
    reviewCount: 420,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'MIOT International',
    address: '4/112 Mount Poonamallee Road, Manapakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600089',
    latitude: 13.0182,
    longitude: 80.1772,
    phone: '+91 44 4200 2288',
    email: 'contact@miotinternational.com',
    facilities: ['Level 1 Trauma', 'Orthopedics Center', 'Robotic Surgery', 'Blood Bank', 'Pharmacy'],
    emergencyService: true,
    rating: 4.7,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Fortis Malar Hospital',
    address: '52 1st Main Road, Gandhi Nagar, Adyar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600020',
    latitude: 13.0067,
    longitude: 80.2572,
    phone: '+91 44 4289 2222',
    email: 'support@fortismalar.com',
    facilities: ['Cardiac Care Unit', 'Pediatrics Center', 'Dialysis', 'Emergency Ambulance'],
    emergencyService: true,
    rating: 4.6,
    reviewCount: 195,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Kauvery Hospital',
    address: '199 Luz Church Road, Mylapore',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600004',
    latitude: 13.0335,
    longitude: 80.2642,
    phone: '+91 44 4000 6000',
    email: 'care@kauveryhospital.com',
    facilities: ['Geriatric Care', 'Neuro ICU', 'Ambulance 24x7', 'Endoscopy Suite'],
    emergencyService: true,
    rating: 4.7,
    reviewCount: 280,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Gleneagles Health City',
    address: '439 Cheran Nagar, Perumbakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600100',
    latitude: 12.9063,
    longitude: 80.1989,
    phone: '+91 44 3500 0600',
    email: 'info@gleneagleshealthcity.com',
    facilities: ['Liver Transplant Unit', 'Comprehensive Oncology', 'Emergency Trauma', 'Helipad'],
    emergencyService: true,
    rating: 4.8,
    reviewCount: 350,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'PSG Hospitals',
    address: 'Avinashi Road, Peelamedu',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641004',
    latitude: 11.0267,
    longitude: 77.0133,
    phone: '+91 422 257 0170',
    email: 'admin@psghospitals.com',
    facilities: ['24/7 Casualty', 'Cardio-Thoracic Surgery', 'Pediatric ICU', 'Blood Bank'],
    emergencyService: true,
    rating: 4.7,
    reviewCount: 380,
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Ganga Medical Centre & Hospital',
    address: '313 Mettupalayam Road',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641043',
    latitude: 11.0189,
    longitude: 76.9534,
    phone: '+91 422 248 5000',
    email: 'contact@gangahospital.com',
    facilities: ['World-renowned Orthopedics', 'Plastic Surgery', 'Trauma Resuscitation', 'Rehab Centre'],
    emergencyService: true,
    rating: 4.9,
    reviewCount: 520,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Manipal Hospital Hal Old Airport Road',
    address: '98 HAL Old Airport Road, Kodihalli',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560017',
    latitude: 12.9592,
    longitude: 77.6534,
    phone: '+91 80 2502 4444',
    email: 'info@manipalhospitals.com',
    facilities: ['Organ Transplant', 'Heart Care', 'Robotic Surgery', 'Advanced ICU', 'Emergency 24x7'],
    emergencyService: true,
    rating: 4.8,
    reviewCount: 460,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Aster CMI Hospital',
    address: 'No. 43/42 NH 44, Sahakar Nagar, Hebbal',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560092',
    latitude: 13.0583,
    longitude: 77.5925,
    phone: '+91 80 4342 0100',
    email: 'care@asterhospital.com',
    facilities: ['Comprehensive Neurosciences', 'Pediatric Oncology', 'Level 1 Trauma', 'Ambulance GPS'],
    emergencyService: true,
    rating: 4.7,
    reviewCount: 290,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Narayana Health City',
    address: '258/A Bommasandra Industrial Area, Anekal Taluk',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560099',
    latitude: 12.8125,
    longitude: 77.6933,
    phone: '+91 80 7122 2222',
    email: 'info@narayanahealth.org',
    facilities: ['Cardiac Super Specialty', 'Bone Marrow Transplant', '24x7 Emergency', 'Affordable Care'],
    emergencyService: true,
    rating: 4.8,
    reviewCount: 610,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600',
  },
];

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediconnect';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log('[Seed] Cleaning old records...');

    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Hospital.deleteMany({}),
      Specialization.deleteMany({}),
      Availability.deleteMany({}),
      Appointment.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      SavedDoctor.deleteMany({}),
      SavedHospital.deleteMany({}),
      SearchHistory.deleteMany({}),
    ]);

    console.log('[Seed] Inserting Specializations...');
    const createdSpecs = await Specialization.insertMany(specializationsData);
    const specMap = new Map();
    createdSpecs.forEach((s) => specMap.set(s.name, s));

    console.log('[Seed] Inserting Hospitals...');
    const hospitalsWithSpecs = hospitalsData.map((h) => ({
      ...h,
      specialties: createdSpecs.map((s) => s._id),
    }));
    const createdHospitals = await Hospital.insertMany(hospitalsWithSpecs);

    console.log('[Seed] Creating Administrator User...');
    const adminUser = await User.create({
      fullName: 'System Administrator',
      email: 'admin@mediconnect.com',
      phone: '+91 9900112233',
      password: 'Admin@123456',
      role: 'admin',
      isActive: true,
    });

    console.log('[Seed] Creating Test Patient User...');
    const patientUser = await User.create({
      fullName: 'Ananya Sharma',
      email: 'patient@mediconnect.com',
      phone: '+91 9876543210',
      password: 'Patient@123456',
      role: 'patient',
      isActive: true,
    });

    const patientDoc = await Patient.create({
      user: patientUser._id,
      age: 29,
      gender: 'female',
      preferredLanguage: 'en',
      location: {
        address: 'Nungambakkam High Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600034',
        latitude: 13.0604,
        longitude: 80.2437,
      },
      medicalHistorySummary: 'Mild seasonal allergies. No chronic conditions.',
    });

    console.log('[Seed] Creating Seed Doctors & Users...');
    const doctorSeedProfiles = [
      {
        name: 'Dr. Arun Kumar',
        email: 'doctor@mediconnect.com',
        phone: '+91 9840123456',
        qualification: 'MBBS, MD, DM (Cardiology), FACC',
        specialty: 'Cardiology',
        experience: 14,
        consultationFee: 800,
        languages: ['English', 'Tamil', 'Hindi'],
        bio: 'Senior Interventional Cardiologist specializing in preventive cardiology and angioplasty.',
        rating: 4.9,
        reviewCount: 124,
      },
      {
        name: 'Dr. Priya Ramaswamy',
        email: 'dr.priya@mediconnect.com',
        phone: '+91 9840123457',
        qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
        specialty: 'Dermatology',
        experience: 10,
        consultationFee: 700,
        languages: ['English', 'Tamil'],
        bio: 'Consultant Dermatologist with rich clinical experience in clinical dermatology and laser treatments.',
        rating: 4.8,
        reviewCount: 98,
      },
      {
        name: 'Dr. Rajesh Sundaram',
        email: 'dr.rajesh@mediconnect.com',
        phone: '+91 9840123458',
        qualification: 'MBBS, MS (Orthopedics), MCh (Joint Replacement)',
        specialty: 'Orthopedics',
        experience: 16,
        consultationFee: 900,
        languages: ['English', 'Tamil'],
        bio: 'Renowned orthopedic surgeon specializing in knee and hip arthroplasty with computer navigation.',
        rating: 4.9,
        reviewCount: 180,
      },
      {
        name: 'Dr. Meera Nambiar',
        email: 'dr.meera@mediconnect.com',
        phone: '+91 9840123459',
        qualification: 'MBBS, MD (Pediatrics), DNB',
        specialty: 'Pediatrics',
        experience: 9,
        consultationFee: 600,
        languages: ['English', 'Tamil', 'Hindi'],
        bio: 'Compassionate pediatrician focusing on developmental milestones and neonatal intensive care.',
        rating: 4.8,
        reviewCount: 88,
      },
      {
        name: 'Dr. Anand Chandrasekar',
        email: 'dr.anand@mediconnect.com',
        phone: '+91 9840123460',
        qualification: 'MBBS, MD (General Medicine)',
        specialty: 'General Medicine',
        experience: 12,
        consultationFee: 500,
        languages: ['English', 'Tamil', 'Hindi'],
        bio: 'Consultant physician specializing in diabetic management, hypertension, and infectious diseases.',
        rating: 4.7,
        reviewCount: 145,
      },
      {
        name: 'Dr. Deepa Natarajan',
        email: 'dr.deepa@mediconnect.com',
        phone: '+91 9840123461',
        qualification: 'MBBS, MD, DM (Neurology)',
        specialty: 'Neurology',
        experience: 11,
        consultationFee: 1000,
        languages: ['English', 'Tamil'],
        bio: 'Expert Neurologist managing migraines, stroke management, and peripheral neuropathies.',
        rating: 4.9,
        reviewCount: 76,
      },
      {
        name: 'Dr. Kavitha Subramanian',
        email: 'dr.kavitha@mediconnect.com',
        phone: '+91 9840123462',
        qualification: 'MBBS, MS (Obstetrics & Gynecology)',
        specialty: 'Gynecology',
        experience: 15,
        consultationFee: 750,
        languages: ['English', 'Tamil'],
        bio: 'Senior Obstetrician and Gynecologist with expertise in high-risk pregnancy care and laparoscopic procedures.',
        rating: 4.8,
        reviewCount: 112,
      },
      {
        name: 'Dr. Vignesh Balaji',
        email: 'dr.vignesh@mediconnect.com',
        phone: '+91 9840123463',
        qualification: 'MBBS, MS (Ophthalmology), FICO',
        specialty: 'Ophthalmology',
        experience: 8,
        consultationFee: 550,
        languages: ['English', 'Tamil'],
        bio: 'Cataract and Refractive surgeon providing modern stitch-free micro-incision surgeries.',
        rating: 4.7,
        reviewCount: 64,
      },
      {
        name: 'Dr. Suresh Venkatesh',
        email: 'dr.suresh@mediconnect.com',
        phone: '+91 9840123464',
        qualification: 'MBBS, MD, DM (Gastroenterology)',
        specialty: 'Gastroenterology',
        experience: 13,
        consultationFee: 850,
        languages: ['English', 'Tamil', 'Hindi'],
        bio: 'Consultant gastroenterologist specializing in therapeutic endoscopy, GERD, and hepatology.',
        rating: 4.8,
        reviewCount: 92,
      },
      {
        name: 'Dr. Shalini Gupta',
        email: 'dr.shalini@mediconnect.com',
        phone: '+91 9840123465',
        qualification: 'MBBS, MD, DM (Medical Oncology)',
        specialty: 'Oncology',
        experience: 14,
        consultationFee: 1200,
        languages: ['English', 'Hindi', 'Tamil'],
        bio: 'Medical Oncologist dedicated to targeted therapies, immunotherapy, and evidence-based cancer treatment.',
        rating: 4.9,
        reviewCount: 80,
      },
    ];

    const createdDoctors = [];
    for (let i = 0; i < doctorSeedProfiles.length; i++) {
      const doc = doctorSeedProfiles[i];
      const hospitalObj = createdHospitals[i % createdHospitals.length];
      const specObj = specMap.get(doc.specialty) || createdSpecs[0];

      const docUser = await User.create({
        fullName: doc.name,
        email: doc.email,
        phone: doc.phone,
        password: 'Doctor@123456',
        role: 'doctor',
        isActive: true,
      });

      const doctorDoc = await Doctor.create({
        user: docUser._id,
        qualification: doc.qualification,
        specialization: specObj._id,
        specialtyName: specObj.name,
        experience: doc.experience,
        hospital: hospitalObj._id,
        hospitalName: hospitalObj.name,
        consultationFee: doc.consultationFee,
        languages: doc.languages,
        bio: doc.bio,
        verificationStatus: 'approved',
        rating: doc.rating,
        reviewCount: doc.reviewCount,
        isAvailable: true,
      });

      await Availability.create({
        doctor: doctorDoc._id,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: { start: '09:00', end: '17:00' },
        breakTime: { start: '13:00', end: '14:00' },
        slotDurationMinutes: 30,
      });

      createdDoctors.push(doctorDoc);
    }

    console.log('[Seed] Seeding patient appointments, reviews, saved items & notifications...');
    // Seed Appointments for Patient
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 2);
    upcomingDate.setHours(10, 30, 0, 0);

    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 14);
    pastDate1.setHours(14, 0, 0, 0);

    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 30);
    pastDate2.setHours(11, 0, 0, 0);

    const upcomingApt = await Appointment.create({
      bookingId: 'APT-2026-00101',
      patient: patientDoc._id,
      patientUser: patientUser._id,
      doctor: createdDoctors[0]._id,
      hospital: createdDoctors[0].hospital,
      date: upcomingDate,
      timeSlot: '10:30 AM',
      reason: 'Cardiovascular checkup and mild palpitations check',
      status: 'confirmed',
      consultationFee: createdDoctors[0].consultationFee,
      isReviewed: false,
    });

    const completedApt = await Appointment.create({
      bookingId: 'APT-2026-00085',
      patient: patientDoc._id,
      patientUser: patientUser._id,
      doctor: createdDoctors[1]._id,
      hospital: createdDoctors[1].hospital,
      date: pastDate1,
      timeSlot: '02:00 PM',
      reason: 'Seasonal skin allergy and itchy rash consult',
      status: 'completed',
      consultationFee: createdDoctors[1].consultationFee,
      isReviewed: true,
    });

    await Appointment.create({
      bookingId: 'APT-2026-00042',
      patient: patientDoc._id,
      patientUser: patientUser._id,
      doctor: createdDoctors[2]._id,
      hospital: createdDoctors[2].hospital,
      date: pastDate2,
      timeSlot: '11:00 AM',
      reason: 'Digestive consultation and GERD guidance',
      status: 'cancelled',
      consultationFee: createdDoctors[2].consultationFee,
      isReviewed: false,
    });

    // Seed Review for completed appointment
    await Review.create({
      appointment: completedApt._id,
      patient: patientDoc._id,
      patientUser: patientUser._id,
      doctor: createdDoctors[1]._id,
      hospital: createdDoctors[1].hospital,
      doctorRating: 5,
      doctorReview: 'Dr. Priya was very patient, empathetic, and explained the skincare routine clearly. The allergic rash subsided within 3 days.',
      hospitalRating: 5,
      hospitalReview: 'Fortis Malar premises were clean, sanitised, and the appointment was on time.',
    });

    // Seed Saved Doctors
    await SavedDoctor.insertMany([
      { patient: patientDoc._id, doctor: createdDoctors[0]._id },
      { patient: patientDoc._id, doctor: createdDoctors[1]._id },
    ]);

    // Seed Saved Hospitals
    await SavedHospital.insertMany([
      { patient: patientDoc._id, hospital: createdHospitals[0]._id },
      { patient: patientDoc._id, hospital: createdHospitals[1]._id },
    ]);

    // Seed Search History
    await SearchHistory.insertMany([
      { patient: patientDoc._id, query: 'Cardiologist in Thousand Lights', specialty: 'Cardiology', location: 'Chennai' },
      { patient: patientDoc._id, query: 'Dermatologist for skin allergy', specialty: 'Dermatology', location: 'Chennai' },
      { patient: patientDoc._id, query: 'Pediatric care near Adyar', specialty: 'Pediatrics', location: 'Chennai' },
    ]);

    // Seed Notifications
    await Notification.insertMany([
      {
        recipient: patientUser._id,
        title: 'Upcoming Appointment Reminder',
        message: 'Your appointment with Dr. Arun Kumar is scheduled for in 2 days at 10:30 AM.',
        type: 'appointment_reminder',
        isRead: false,
        relatedId: upcomingApt._id,
      },
      {
        recipient: patientUser._id,
        title: 'Appointment Confirmed',
        message: 'Your booking APT-2026-00101 with Dr. Arun Kumar has been successfully confirmed.',
        type: 'appointment_confirmed',
        isRead: true,
        relatedId: upcomingApt._id,
      },
      {
        recipient: patientUser._id,
        title: 'Welcome to MediConnect',
        message: 'Welcome to MediConnect! Discover verified doctors and hospitals suited to your care preferences.',
        type: 'system',
        isRead: true,
      },
    ]);

    console.log('[Seed] Database successfully populated!');
    console.log('--------------------------------------------------');
    console.log(' Admin Credentials:   admin@mediconnect.com   / Admin@123456');
    console.log(' Doctor Credentials:  doctor@mediconnect.com  / Doctor@123456');
    console.log(' Patient Credentials: patient@mediconnect.com / Patient@123456');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

// If run directly via node seed.js
if (process.argv[1]?.includes('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
