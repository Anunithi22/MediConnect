import mongoose from 'mongoose';

const BASE_URL = 'http://127.0.0.1:5000/api';
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  FAIL: ${message}`);
    failCount++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('  MEDICONNECT PHASE 7: PROFILE & COMPARISON TESTS   ');
  console.log('====================================================\n');

  try {
    // 0. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200 && health.success, 'Backend health check responding');

    // 1. Fetch seed doctors and hospitals for tests
    const docsRes = await fetch(`${BASE_URL}/doctors?limit=5`);
    const docsData = await docsRes.json();
    assert(docsData.success && docsData.data.length >= 3, 'Fetched active doctors list');
    const doctors = docsData.data;
    const doc1 = doctors[0];
    const doc2 = doctors[1];
    const doc3 = doctors[2];

    const hospsRes = await fetch(`${BASE_URL}/hospitals?limit=5`);
    const hospsData = await hospsRes.json();
    assert(hospsData.success && hospsData.data.length >= 3, 'Fetched active hospitals list');
    const hospitals = hospsData.data;
    const hosp1 = hospitals[0];
    const hosp2 = hospitals[1];
    const hosp3 = hospitals[2];

    // --- Section 1: Advanced Doctor Profile Enhancements ---
    console.log('\n--- 1. Advanced Doctor Profile (/api/doctors/:id) ---');
    const docProfileRes = await fetch(`${BASE_URL}/doctors/${doc1.id}`);
    assert(docProfileRes.status === 200, 'GET /api/doctors/:id returned 200');
    const docProfileJson = await docProfileRes.json();
    const docProfile = docProfileJson.data;

    assert(Array.isArray(docProfile.consultationModes) && docProfile.consultationModes.length > 0,
      'Profile includes consultationModes array (e.g. In-person, Online)');
    assert(Array.isArray(docProfile.education) && docProfile.education.length > 0,
      'Profile includes education & qualifications history');
    assert(Array.isArray(docProfile.experienceHistory) && docProfile.experienceHistory.length > 0,
      'Profile includes career appointments & experience history');
    assert(docProfile.schedule && Array.isArray(docProfile.schedule.workingDays),
      'Profile includes OPD schedule from Availability model with workingDays');
    assert(docProfile.schedule.workingHours && docProfile.schedule.workingHours.start,
      'Schedule includes shift workingHours (start & end)');
    assert(docProfile.schedule.summary && typeof docProfile.schedule.summary === 'string',
      'Schedule includes formatted summary string');
    assert(!docProfile.password && !docProfile.hash && !docProfile.tokens,
      'Security: Doctor profile does not expose sensitive auth hashes');

    // --- Section 2: Advanced Hospital Profile Enhancements ---
    console.log('\n--- 2. Advanced Hospital Profile (/api/hospitals/:id) ---');
    const hospProfileRes = await fetch(`${BASE_URL}/hospitals/${hosp1.id}`);
    assert(hospProfileRes.status === 200, 'GET /api/hospitals/:id returned 200');
    const hospProfileJson = await hospProfileRes.json();
    const hospProfile = hospProfileJson.data;

    assert(typeof hospProfile.totalBeds === 'number' && hospProfile.totalBeds > 0,
      `Hospital profile includes totalBeds metric: ${hospProfile.totalBeds}`);
    assert(hospProfile.hospitalType && typeof hospProfile.hospitalType === 'string',
      `Hospital profile includes hospitalType: ${hospProfile.hospitalType}`);
    assert(typeof hospProfile.emergencyService === 'boolean',
      'Hospital profile includes 24/7 emergencyService flag');
    assert(typeof hospProfile.doctorsCount === 'number',
      `Hospital profile includes aggregated doctorsCount: ${hospProfile.doctorsCount}`);
    assert(Array.isArray(hospProfile.specialties) && hospProfile.specialties.length > 0,
      'Hospital profile includes specialized departments');
    assert(Array.isArray(hospProfile.facilities) && hospProfile.facilities.length > 0,
      'Hospital profile includes clinical facilities');

    // Hospital doctors endpoint
    const hospDocsRes = await fetch(`${BASE_URL}/hospitals/${hosp1.id}/doctors`);
    const hospDocsJson = await hospDocsRes.json();
    assert(hospDocsRes.status === 200 && Array.isArray(hospDocsJson.data),
      'GET /api/hospitals/:id/doctors returns practicing doctors');

    // --- Section 3: Doctor Comparison API ---
    console.log('\n--- 3. Doctor Comparison Engine (/api/doctors/compare) ---');
    // 2 doctors comparison
    const comp2DocsRes = await fetch(`${BASE_URL}/doctors/compare?ids=${doc1.id},${doc2.id}`);
    const comp2Docs = await comp2DocsRes.json();
    assert(comp2DocsRes.status === 200 && comp2Docs.success, 'Comparing 2 doctors returned 200');
    assert(comp2Docs.count === 2 && comp2Docs.data.length === 2, 'Returned exactly 2 doctors');
    assert(comp2Docs.data[0].id === doc1.id && comp2Docs.data[1].id === doc2.id,
      'Maintains requested comparison order');
    assert(comp2Docs.data[0].consultationModes && comp2Docs.data[1].consultationModes,
      'Compared doctors include consultationModes');
    assert(comp2Docs.data[0].schedule && comp2Docs.data[1].schedule,
      'Compared doctors include OPD schedules');

    // 3 doctors comparison
    const comp3DocsRes = await fetch(`${BASE_URL}/doctors/compare?ids=${doc1.id},${doc2.id},${doc3.id}`);
    const comp3Docs = await comp3DocsRes.json();
    assert(comp3DocsRes.status === 200 && comp3Docs.count === 3, 'Comparing 3 doctors returned 200 with 3 items');

    // Validation: less than 2 doctors
    const comp1DocRes = await fetch(`${BASE_URL}/doctors/compare?ids=${doc1.id}`);
    assert(comp1DocRes.status === 400, 'Rejects comparison with < 2 doctors (400 Bad Request)');

    // Validation: more than 3 doctors
    const comp4DocsRes = await fetch(`${BASE_URL}/doctors/compare?ids=${doc1.id},${doc2.id},${doc3.id},${doctors[3]?.id || doc1.id}`);
    assert(comp4DocsRes.status === 400, 'Rejects comparison with > 3 doctors (400 Bad Request)');

    // Validation: invalid ID format
    const compInvalidDocRes = await fetch(`${BASE_URL}/doctors/compare?ids=${doc1.id},invalid-id-123`);
    assert(compInvalidDocRes.status === 400, 'Rejects invalid ObjectId format in comparison list (400)');

    // Security: comparison with pending doctor
    const hiddenDocId = '6ac3312b8706a66402447479'; // Pending doctor ID from seed
    const compPendingDocRes = await fetch(`${BASE_URL}/doctors/compare?ids=${doc1.id},${hiddenDocId}`);
    assert(compPendingDocRes.status === 404 || compPendingDocRes.status === 400,
      'Security: Pending doctor excluded, leaving < 2 active approved doctors (404/400)');

    // --- Section 4: Hospital Comparison API ---
    console.log('\n--- 4. Hospital Comparison Engine (/api/hospitals/compare) ---');
    // 2 hospitals comparison
    const comp2HospsRes = await fetch(`${BASE_URL}/hospitals/compare?ids=${hosp1.id},${hosp2.id}`);
    const comp2Hosps = await comp2HospsRes.json();
    assert(comp2HospsRes.status === 200 && comp2Hosps.success, 'Comparing 2 hospitals returned 200');
    assert(comp2Hosps.count === 2 && comp2Hosps.data.length === 2, 'Returned exactly 2 hospitals');
    assert(comp2Hosps.data[0].id === hosp1.id && comp2Hosps.data[1].id === hosp2.id,
      'Maintains requested hospital comparison order');
    assert(typeof comp2Hosps.data[0].totalBeds === 'number' && typeof comp2Hosps.data[1].totalBeds === 'number',
      'Compared hospitals include totalBeds metrics');
    assert(typeof comp2Hosps.data[0].doctorsCount === 'number' && typeof comp2Hosps.data[1].doctorsCount === 'number',
      'Compared hospitals include computed doctorsCount');

    // 3 hospitals comparison
    const comp3HospsRes = await fetch(`${BASE_URL}/hospitals/compare?ids=${hosp1.id},${hosp2.id},${hosp3.id}`);
    const comp3Hosps = await comp3HospsRes.json();
    assert(comp3HospsRes.status === 200 && comp3Hosps.count === 3, 'Comparing 3 hospitals returned 200 with 3 items');

    // Validation: less than 2 hospitals
    const comp1HospRes = await fetch(`${BASE_URL}/hospitals/compare?ids=${hosp1.id}`);
    assert(comp1HospRes.status === 400, 'Rejects comparison with < 2 hospitals (400 Bad Request)');

    // Validation: more than 3 hospitals
    const comp4HospsRes = await fetch(`${BASE_URL}/hospitals/compare?ids=${hosp1.id},${hosp2.id},${hosp3.id},${hospitals[3]?.id || hosp1.id}`);
    assert(comp4HospsRes.status === 400, 'Rejects comparison with > 3 hospitals (400 Bad Request)');

    // Validation: invalid ID format
    const compInvalidHospRes = await fetch(`${BASE_URL}/hospitals/compare?ids=${hosp1.id},not-a-valid-id`);
    assert(compInvalidHospRes.status === 400, 'Rejects invalid ObjectId format in comparison list (400)');

    // Hospital sorting by beds
    const sortedBedsRes = await fetch(`${BASE_URL}/hospitals?sort=beds&limit=3`);
    const sortedBeds = await sortedBedsRes.json();
    assert(sortedBedsRes.status === 200, 'Hospital search supports ?sort=beds');
    if (sortedBeds.data.length >= 2) {
      assert(sortedBeds.data[0].totalBeds >= sortedBeds.data[1].totalBeds,
        'Hospitals sorted by beds in descending order');
    }

    console.log('\n====================================================');
    console.log(`RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('====================================================\n');

    if (failCount > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal test error:', err.message);
    process.exit(1);
  }
}

runTests();
