// test-patient.js - Automated Patient System & RBAC Test Suite
const BASE_URL = 'http://127.0.0.1:5000/api';

const runTests = async () => {
  console.log('====================================================');
  console.log('   MEDICONNECT PHASE 5: PATIENT SYSTEM API TESTS    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  PASS: ${message}`);
      passed++;
    } else {
      console.error(`  FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.success, 'Health check is responding');

    // 2. Patient Login
    console.log('\n--- 1. Patient Authentication ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient@mediconnect.com',
        password: 'Patient@123456',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success, 'Patient logged in successfully');
    const patientToken = loginData.token;
    const patientHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patientToken}`,
    };

    // 3. Doctor Login (to test RBAC protections)
    const docLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'doctor@mediconnect.com',
        password: 'Doctor@123456',
      }),
    });
    const docLoginData = await docLoginRes.json();
    const docToken = docLoginData.token;
    const docHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docToken}`,
    };

    // 4. Test GET /api/patients/me
    console.log('\n--- 2. Patient Profile ---');
    const profileRes = await fetch(`${BASE_URL}/patients/me`, { headers: patientHeaders });
    const profileData = await profileRes.json();
    assert(profileRes.status === 200 && profileData.success, 'GET /api/patients/me returned 200');
    assert(profileData.data.user.email === 'patient@mediconnect.com', 'Patient user email matches');
    assert(profileData.data.location?.city === 'Chennai', 'Patient location city is Chennai');

    // 5. Test RBAC: Doctor cannot access patient profile
    const docAccessPatientRes = await fetch(`${BASE_URL}/patients/me`, { headers: docHeaders });
    assert(docAccessPatientRes.status === 403, 'RBAC: Doctor receives 403 when requesting /api/patients/me');

    // 6. Test PATCH /api/patients/me
    const updateRes = await fetch(`${BASE_URL}/patients/me`, {
      method: 'PATCH',
      headers: patientHeaders,
      body: JSON.stringify({
        age: 30,
        address: 'Flat 4B, Lotus Apartments, Nungambakkam',
        city: 'Chennai',
      }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.success, 'PATCH /api/patients/me returned 200');
    assert(updateData.data.age === 30, 'Profile age updated to 30');
    assert(
      updateData.data.location?.address === 'Flat 4B, Lotus Apartments, Nungambakkam',
      'Profile address updated correctly'
    );

    // 7. Test Dashboard Summary
    console.log('\n--- 3. Dashboard Summary ---');
    const summaryRes = await fetch(`${BASE_URL}/patients/dashboard-summary`, { headers: patientHeaders });
    const summaryData = await summaryRes.json();
    assert(summaryRes.status === 200 && summaryData.success, 'GET /api/patients/dashboard-summary returned 200');
    assert(summaryData.data.stats.totalAppointments >= 2, 'Dashboard stats totalAppointments >= 2');
    assert(summaryData.data.stats.savedDoctorsCount >= 1, 'Dashboard stats savedDoctorsCount >= 1');
    assert(summaryData.data.upcomingAppointment !== null, 'Upcoming appointment populated');
    assert(
      summaryData.data.upcomingAppointment?.bookingId === 'APT-2026-00101',
      'Upcoming appointment bookingId matches APT-2026-00101'
    );

    // 8. Appointments List & Filters
    console.log('\n--- 4. Appointments & Ownership ---');
    const aptsRes = await fetch(`${BASE_URL}/appointments/my`, { headers: patientHeaders });
    const aptsData = await aptsRes.json();
    assert(aptsRes.status === 200 && aptsData.success, 'GET /api/appointments/my returned 200');
    assert(aptsData.data.length >= 3, `Returned ${aptsData.data.length} appointments`);

    const upcomingAptsRes = await fetch(`${BASE_URL}/appointments/my?status=upcoming`, { headers: patientHeaders });
    const upcomingAptsData = await upcomingAptsRes.json();
    assert(
      upcomingAptsRes.status === 200 && upcomingAptsData.data.length >= 1,
      'Filtered ?status=upcoming returned valid appointment(s)'
    );

    const completedAptsRes = await fetch(`${BASE_URL}/appointments/my?status=completed`, { headers: patientHeaders });
    const completedAptsData = await completedAptsRes.json();
    assert(
      completedAptsRes.status === 200 && completedAptsData.data.some((a) => a.status === 'completed'),
      'Filtered ?status=completed returned completed appointment(s)'
    );

    // 9. Single Appointment View & Ownership Protection
    const aptId = aptsData.data[0]._id;
    const singleAptRes = await fetch(`${BASE_URL}/appointments/${aptId}`, { headers: patientHeaders });
    const singleAptData = await singleAptRes.json();
    assert(singleAptRes.status === 200 && singleAptData.success, 'GET /api/appointments/:id returned 200');

    // Register a second patient user to verify cross-patient ownership isolation
    const regSecondPatientRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Second Patient',
        email: `secondpatient_${Date.now()}@mediconnect.com`,
        phone: '+91 9988776655',
        password: 'Password@123456',
        confirmPassword: 'Password@123456',
        age: 25,
        gender: 'male',
      }),
    });
    const regSecondPatientData = await regSecondPatientRes.json();
    const secondPatientToken = regSecondPatientData.token;
    const secondPatientHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secondPatientToken}`,
    };

    // Second patient attempts to read Ananya's appointment
    const forbiddenRes = await fetch(`${BASE_URL}/appointments/${aptId}`, { headers: secondPatientHeaders });
    assert(forbiddenRes.status === 403, 'Cross-patient isolation: other patient gets 403 trying to view foreign appointment');

    // 10. Search History
    console.log('\n--- 5. Search History ---');
    const searchRes = await fetch(`${BASE_URL}/search-history`, { headers: patientHeaders });
    const searchData = await searchRes.json();
    assert(searchRes.status === 200 && searchData.success, 'GET /api/search-history returned 200');
    assert(searchData.data.length >= 2, 'Search history has seeded items');

    const addSearchRes = await fetch(`${BASE_URL}/search-history`, {
      method: 'POST',
      headers: patientHeaders,
      body: JSON.stringify({
        query: 'Pediatric dentist near Anna Nagar',
        specialty: 'Pediatrics',
        location: 'Anna Nagar, Chennai',
      }),
    });
    const addSearchData = await addSearchRes.json();
    assert(addSearchRes.status === 201 && addSearchData.success, 'POST /api/search-history added new query');
    const newSearchId = addSearchData.data._id;

    const delSearchRes = await fetch(`${BASE_URL}/search-history/${newSearchId}`, {
      method: 'DELETE',
      headers: patientHeaders,
    });
    assert(delSearchRes.status === 200, 'DELETE /api/search-history/:id deleted item');

    // 11. Notifications
    console.log('\n--- 6. Notifications ---');
    const notifsRes = await fetch(`${BASE_URL}/notifications`, { headers: patientHeaders });
    const notifsData = await notifsRes.json();
    assert(notifsRes.status === 200 && notifsData.success, 'GET /api/notifications returned 200');
    assert(notifsData.data.length >= 1, 'Notifications list has items');

    const unreadNotif = notifsData.data.find((n) => !n.isRead);
    if (unreadNotif) {
      const readRes = await fetch(`${BASE_URL}/notifications/${unreadNotif._id}/read`, {
        method: 'PATCH',
        headers: patientHeaders,
      });
      assert(readRes.status === 200, 'PATCH /api/notifications/:id/read marked notification as read');
    }

    // 12. Saved Doctors & Saved Hospitals
    console.log('\n--- 7. Saved Items ---');
    const savedDocsRes = await fetch(`${BASE_URL}/saved-doctors`, { headers: patientHeaders });
    const savedDocsData = await savedDocsRes.json();
    assert(savedDocsRes.status === 200 && savedDocsData.data.length >= 1, 'GET /api/saved-doctors returned list');

    const savedHospRes = await fetch(`${BASE_URL}/saved-hospitals`, { headers: patientHeaders });
    const savedHospData = await savedHospRes.json();
    assert(savedHospRes.status === 200 && savedHospData.data.length >= 1, 'GET /api/saved-hospitals returned list');

    // 13. Patient Reviews
    console.log('\n--- 8. Patient Reviews ---');
    const reviewsRes = await fetch(`${BASE_URL}/reviews/my`, { headers: patientHeaders });
    const reviewsData = await reviewsRes.json();
    assert(reviewsRes.status === 200 && reviewsData.data.length >= 1, 'GET /api/reviews/my returned patient review');

    console.log('\n====================================================');
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled test runner error:', err);
    process.exit(1);
  }
};

runTests();
