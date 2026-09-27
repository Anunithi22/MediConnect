const BASE_URL = 'http://127.0.0.1:5000/api/auth';

const post = async (endpoint, body = {}, headers = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
};

const get = async (endpoint, headers = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  });
  const data = await res.json();
  return { status: res.status, data };
};

const runTests = async () => {
  console.log('====================================================');
  console.log('  MEDICONNECT PHASE 3 AUTHENTICATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (name, condition, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} - ${details}`);
      failed++;
    }
  };

  const timestamp = Date.now();
  let patientToken = null;
  let doctorToken = null;
  let adminToken = null;

  try {
    // 1. Patient Registration
    console.log('--- 1. Testing Patient Registration ---');
    const newPatientData = {
      fullName: 'Vikram Sundar',
      email: `vikram.${timestamp}@mediconnect.test`,
      phone: '+91 9123456780',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      age: 34,
      gender: 'male',
      preferredLanguage: 'en',
      location: { city: 'Chennai', state: 'Tamil Nadu' },
    };

    const resPatientReg = await post('/register', newPatientData);
    assert('Patient Registration Success', resPatientReg.status === 201 && resPatientReg.data.success);
    assert('Patient Token Generated', !!resPatientReg.data.token);
    assert('Patient Role is "patient"', resPatientReg.data.user.role === 'patient');
    assert('Patient Profile ID is created', !!resPatientReg.data.user.patientId);

    // 2. Duplicate Patient Registration
    console.log('\n--- 2. Testing Duplicate Patient Registration ---');
    const resDup = await post('/register', newPatientData);
    assert(
      'Duplicate Registration Blocked',
      resDup.status === 400 && resDup.data.message.includes('already exists')
    );

    // 3. Password Mismatch Validation
    console.log('\n--- 3. Testing Password Mismatch Validation ---');
    const resMismatch = await post('/register', {
      ...newPatientData,
      email: `another.${timestamp}@test.com`,
      confirmPassword: 'DifferentPassword!123',
    });
    assert('Password Mismatch Blocked', resMismatch.status === 400);

    // 4. Doctor Registration
    console.log('\n--- 4. Testing Doctor Registration ---');
    const newDoctorData = {
      fullName: 'Dr. Siddharth R',
      email: `dr.siddharth.${timestamp}@mediconnect.test`,
      phone: '+91 9888877777',
      password: 'DoctorPassword@123',
      confirmPassword: 'DoctorPassword@123',
      qualification: 'MBBS, MD (Pediatrics)',
      specialization: 'Pediatrics',
      experience: 7,
      consultationFee: 650,
      languages: ['English', 'Tamil'],
      bio: 'Dedicated pediatrician with special focus on preventive child care.',
    };

    const resDoctorReg = await post('/register/doctor', newDoctorData);
    assert('Doctor Registration Success', resDoctorReg.status === 201 && resDoctorReg.data.success);
    assert('Doctor Verification Status is "pending"', resDoctorReg.data.user.verificationStatus === 'pending');
    assert('Doctor Role is "doctor"', resDoctorReg.data.user.role === 'doctor');

    // 5. Patient Login
    console.log('\n--- 5. Testing Patient Login ---');
    const resPatientLogin = await post('/login', {
      email: `vikram.${timestamp}@mediconnect.test`,
      password: 'Password@123',
    });
    assert('Patient Login Success', resPatientLogin.status === 200 && resPatientLogin.data.success);
    assert('User password not leaked in response', resPatientLogin.data.user.password === undefined);
    patientToken = resPatientLogin.data.token;

    // 6. Doctor Login
    console.log('\n--- 6. Testing Doctor Login ---');
    const resDocLogin = await post('/login', {
      email: 'doctor@mediconnect.com', // Seeded doctor
      password: 'Doctor@123456',
    });
    assert('Doctor Login Success', resDocLogin.status === 200 && resDocLogin.data.success);
    assert('Doctor Role Verified', resDocLogin.data.user.role === 'doctor');
    doctorToken = resDocLogin.data.token;

    // 7. Admin Login
    console.log('\n--- 7. Testing Admin Login ---');
    const resAdminLogin = await post('/login', {
      email: 'admin@mediconnect.com', // Seeded admin
      password: 'Admin@123456',
    });
    assert('Admin Login Success', resAdminLogin.status === 200 && resAdminLogin.data.success);
    assert('Admin Role Verified', resAdminLogin.data.user.role === 'admin');
    adminToken = resAdminLogin.data.token;

    // 8. Invalid Password Check
    console.log('\n--- 8. Testing Invalid Password ---');
    const resInvalidPw = await post('/login', {
      email: 'admin@mediconnect.com',
      password: 'WrongPassword999',
    });
    assert('Invalid Password Blocked (401)', resInvalidPw.status === 401);

    // 9. Invalid Email Check
    console.log('\n--- 9. Testing Invalid Email ---');
    const resInvalidEmail = await post('/login', {
      email: 'nonexistent.user.999@mediconnect.com',
      password: 'SomePassword@123',
    });
    assert('Nonexistent Email Blocked (401)', resInvalidEmail.status === 401);

    // 10. Missing Token on Protected Route (/me)
    console.log('\n--- 10. Testing Missing Token on /api/auth/me ---');
    const resNoToken = await get('/me');
    assert('Missing Token Rejected (401)', resNoToken.status === 401);

    // 11. Invalid Token on Protected Route
    console.log('\n--- 11. Testing Invalid Bearer Token ---');
    const resInvalidToken = await get('/me', {
      Authorization: 'Bearer invalid.malformed.jwt.token',
    });
    assert('Invalid Token Rejected (401)', resInvalidToken.status === 401);

    // 12. Current User Endpoint (/api/auth/me) with Patient Token
    console.log('\n--- 12. Testing /api/auth/me for Authenticated User ---');
    const resMe = await get('/me', {
      Authorization: `Bearer ${patientToken}`,
    });
    assert('Current User Profile Retrieved', resMe.status === 200 && resMe.data.success);
    assert('Profile corresponds to logged in user', resMe.data.user.email === `vikram.${timestamp}@mediconnect.test`);
    assert('Profile contains patientId', !!resMe.data.user.patientId);

    // 13. Role Access: Patient accessing Patient-Only Route
    console.log('\n--- 13. Testing Role Authorization: Patient on Patient Route ---');
    const resPatRoute = await get('/test/patient-only', {
      Authorization: `Bearer ${patientToken}`,
    });
    assert('Patient accessing Patient-only route Allowed (200)', resPatRoute.status === 200);

    // 14. Role Access: Patient accessing Doctor-Only Route
    console.log('\n--- 14. Testing Role Authorization: Patient on Doctor Route ---');
    const resPatOnDoc = await get('/test/doctor-only', {
      Authorization: `Bearer ${patientToken}`,
    });
    assert('Patient on Doctor route Blocked (403)', resPatOnDoc.status === 403);

    // 15. Role Access: Patient accessing Admin-Only Route
    console.log('\n--- 15. Testing Role Authorization: Patient on Admin Route ---');
    const resPatOnAdmin = await get('/test/admin-only', {
      Authorization: `Bearer ${patientToken}`,
    });
    assert('Patient on Admin route Blocked (403)', resPatOnAdmin.status === 403);

    // 16. Role Access: Doctor accessing Admin-Only Route
    console.log('\n--- 16. Testing Role Authorization: Doctor on Admin Route ---');
    const resDocOnAdmin = await get('/test/admin-only', {
      Authorization: `Bearer ${doctorToken}`,
    });
    assert('Doctor on Admin route Blocked (403)', resDocOnAdmin.status === 403);

    // 17. Role Access: Admin accessing Admin Route
    console.log('\n--- 17. Testing Role Authorization: Admin on Admin Route ---');
    const resAdminRoute = await get('/test/admin-only', {
      Authorization: `Bearer ${adminToken}`,
    });
    assert('Admin on Admin route Allowed (200)', resAdminRoute.status === 200 && resAdminRoute.data.success);

    // 18. Logout Endpoint
    console.log('\n--- 18. Testing Logout Endpoint ---');
    const resLogout = await post('/logout');
    assert('Logout Endpoint Responds 200', resLogout.status === 200 && resLogout.data.success);

  } catch (globalErr) {
    console.error('Unexpected error during testing:', globalErr.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
