import mongoose from 'mongoose';
import { User, Doctor } from './src/models/index.js';

const BASE_URL = 'http://127.0.0.1:5000/api';

const runTests = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediconnect');
  }
  console.log('====================================================');
  console.log('  MEDICONNECT PHASE 6: DOCTOR & HOSPITAL DISCOVERY  ');
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
    assert(healthRes.status === 200 && healthData.success, 'Health check responding');

    // 2. Doctor Discovery - Basic list & Approved Only visibility
    console.log('\n--- 1. Doctor Discovery & Public Visibility ---');
    const allDocsRes = await fetch(`${BASE_URL}/doctors`);
    const allDocsData = await allDocsRes.json();
    assert(allDocsRes.status === 200 && allDocsData.success, 'GET /api/doctors returned 200');
    assert(allDocsData.data.length > 0, `Returned ${allDocsData.data.length} approved doctors`);

    // Verify all returned doctors have verificationStatus === 'approved'
    const nonApproved = allDocsData.data.filter((d) => d.verificationStatus !== 'approved');
    assert(nonApproved.length === 0, 'Public discovery contains ONLY approved doctors');

    // Verify pending & rejected doctors are completely excluded
    const pendingFound = allDocsData.data.some((d) => d.email === 'dr.pending@mediconnect.com');
    const rejectedFound = allDocsData.data.some((d) => d.email === 'dr.rejected@mediconnect.com');
    assert(!pendingFound, 'Pending doctors are hidden from public discovery');
    assert(!rejectedFound, 'Rejected doctors are hidden from public discovery');

    // Verify no sensitive user fields leak
    const sampleDoc = allDocsData.data[0];
    assert(!sampleDoc.password && !sampleDoc.passwordHash && !sampleDoc.__v, 'No passwords or internal hashes exposed');
    assert(sampleDoc.id && sampleDoc.name && sampleDoc.specialization, 'Doctor public shape contains id, name, and specialization');

    // 3. Doctor Text Search
    console.log('\n--- 2. Doctor Text Search ---');
    const searchNameRes = await fetch(`${BASE_URL}/doctors?search=arun`);
    const searchNameData = await searchNameRes.json();
    assert(
      searchNameRes.status === 200 && searchNameData.data.some((d) => d.name.toLowerCase().includes('arun')),
      'Search by doctor name (arun) matches Dr. Arun Kumar'
    );

    const searchSpecRes = await fetch(`${BASE_URL}/doctors?search=cardio`);
    const searchSpecData = await searchSpecRes.json();
    assert(
      searchSpecRes.status === 200 && searchSpecData.data.some((d) => d.specialization.toLowerCase().includes('cardio')),
      'Search by specialty (cardio) matches Cardiology doctors'
    );

    const searchHospRes = await fetch(`${BASE_URL}/doctors?search=apollo`);
    const searchHospData = await searchHospRes.json();
    assert(
      searchHospRes.status === 200 && searchHospData.data.some((d) => d.hospital.name.toLowerCase().includes('apollo')),
      'Search by hospital name (apollo) matches doctors affiliated with Apollo'
    );

    // 4. Doctor Filtering
    console.log('\n--- 3. Doctor Filtering ---');
    // Filter by Specialization name
    const filterSpecRes = await fetch(`${BASE_URL}/doctors?specialization=Dermatology`);
    const filterSpecData = await filterSpecRes.json();
    assert(
      filterSpecRes.status === 200 &&
        filterSpecData.data.length > 0 &&
        filterSpecData.data.every((d) => d.specialization.toLowerCase() === 'dermatology'),
      'Filtered by ?specialization=Dermatology accurately'
    );

    // Filter by Specialization ID
    const sampleSpecId = sampleDoc.specializationId;
    if (sampleSpecId) {
      const filterSpecIdRes = await fetch(`${BASE_URL}/doctors?specialization=${sampleSpecId}`);
      const filterSpecIdData = await filterSpecIdRes.json();
      assert(
        filterSpecIdRes.status === 200 && filterSpecIdData.data.length > 0,
        `Filtered by ?specialization=<ObjectId> (${sampleSpecId})`
      );
    }

    // Filter by Hospital ID
    const sampleHospId = sampleDoc.hospital.id;
    if (sampleHospId) {
      const filterHospRes = await fetch(`${BASE_URL}/doctors?hospital=${sampleHospId}`);
      const filterHospData = await filterHospRes.json();
      assert(
        filterHospRes.status === 200 && filterHospData.data.every((d) => d.hospital.id === sampleHospId),
        `Filtered by ?hospital=<ObjectId> matches hospital`
      );
    }

    // Filter by Experience range
    const filterExpRes = await fetch(`${BASE_URL}/doctors?experienceMin=10&experienceMax=15`);
    const filterExpData = await filterExpRes.json();
    assert(
      filterExpRes.status === 200 &&
        filterExpData.data.length > 0 &&
        filterExpData.data.every((d) => d.experience >= 10 && d.experience <= 15),
      'Filtered by ?experienceMin=10&experienceMax=15'
    );

    // Filter by RatingMin
    const filterRatingRes = await fetch(`${BASE_URL}/doctors?ratingMin=4.8`);
    const filterRatingData = await filterRatingRes.json();
    assert(
      filterRatingRes.status === 200 &&
        filterRatingData.data.length > 0 &&
        filterRatingData.data.every((d) => d.rating >= 4.8),
      'Filtered by ?ratingMin=4.8'
    );

    // Filter by Consultation Fee range
    const filterFeeRes = await fetch(`${BASE_URL}/doctors?feeMin=600&feeMax=800`);
    const filterFeeData = await filterFeeRes.json();
    assert(
      filterFeeRes.status === 200 &&
        filterFeeData.data.length > 0 &&
        filterFeeData.data.every((d) => d.consultationFee >= 600 && d.consultationFee <= 800),
      'Filtered by ?feeMin=600&feeMax=800'
    );

    // Filter by Language
    const filterLangRes = await fetch(`${BASE_URL}/doctors?language=Tamil`);
    const filterLangData = await filterLangRes.json();
    assert(
      filterLangRes.status === 200 &&
        filterLangData.data.length > 0 &&
        filterLangData.data.every((d) => d.languages.includes('Tamil')),
      'Filtered by ?language=Tamil'
    );

    // 5. Doctor Sorting
    console.log('\n--- 4. Doctor Sorting ---');
    const sortFeeLowRes = await fetch(`${BASE_URL}/doctors?sort=feeLow`);
    const sortFeeLowData = await sortFeeLowRes.json();
    const fee0 = sortFeeLowData.data[0].consultationFee;
    const fee1 = sortFeeLowData.data[1]?.consultationFee || fee0;
    assert(sortFeeLowRes.status === 200 && fee0 <= fee1, 'Sorted by ?sort=feeLow ascending');

    const sortFeeHighRes = await fetch(`${BASE_URL}/doctors?sort=feeHigh`);
    const sortFeeHighData = await sortFeeHighRes.json();
    const feeHigh0 = sortFeeHighData.data[0].consultationFee;
    const feeHigh1 = sortFeeHighData.data[1]?.consultationFee || feeHigh0;
    assert(sortFeeHighRes.status === 200 && feeHigh0 >= feeHigh1, 'Sorted by ?sort=feeHigh descending');

    const sortExpRes = await fetch(`${BASE_URL}/doctors?sort=experience`);
    const sortExpData = await sortExpRes.json();
    const exp0 = sortExpData.data[0].experience;
    const exp1 = sortExpData.data[1]?.experience || exp0;
    assert(sortExpRes.status === 200 && exp0 >= exp1, 'Sorted by ?sort=experience descending');

    const sortRatingRes = await fetch(`${BASE_URL}/doctors?sort=rating`);
    const sortRatingData = await sortRatingRes.json();
    assert(sortRatingRes.status === 200 && sortRatingData.data[0].rating >= (sortRatingData.data[1]?.rating || 0), 'Sorted by ?sort=rating descending');

    // 6. Pagination & Input Validation
    console.log('\n--- 5. Pagination & Validation ---');
    const pageRes = await fetch(`${BASE_URL}/doctors?page=1&limit=3`);
    const pageData = await pageRes.json();
    assert(pageRes.status === 200 && pageData.data.length === 3, 'Pagination limit=3 returned exactly 3 items');
    assert(
      pageData.pagination.page === 1 &&
        pageData.pagination.limit === 3 &&
        pageData.pagination.total > 3 &&
        pageData.pagination.hasNextPage === true,
      'Pagination metadata structure is fully accurate'
    );

    // Validation error when limit exceeds 50
    const invalidLimitRes = await fetch(`${BASE_URL}/doctors?limit=999`);
    assert(invalidLimitRes.status === 400, 'Validation: limit > 50 rejected with 400 Bad Request');

    // Validation error on negative experience
    const invalidExpRes = await fetch(`${BASE_URL}/doctors?experienceMin=-5`);
    assert(invalidExpRes.status === 400, 'Validation: negative experienceMin rejected with 400 Bad Request');

    // Validation error on invalid rating
    const invalidRatingRes = await fetch(`${BASE_URL}/doctors?ratingMin=10`);
    assert(invalidRatingRes.status === 400, 'Validation: ratingMin > 5 rejected with 400 Bad Request');

    // 7. Doctor Profile Details & Security
    console.log('\n--- 6. Doctor Profile & Hidden Doctor Security ---');
    const docProfileRes = await fetch(`${BASE_URL}/doctors/${sampleDoc.id}`);
    const docProfileData = await docProfileRes.json();
    assert(docProfileRes.status === 200 && docProfileData.success, 'GET /api/doctors/:id returned 200');
    assert(docProfileData.data.name === sampleDoc.name, 'Doctor profile name matches');
    assert(Array.isArray(docProfileData.data.services), 'Doctor profile includes clinical services');

    // Malformed doctor ID
    const badIdRes = await fetch(`${BASE_URL}/doctors/non-existent-id`);
    assert(badIdRes.status === 400, 'GET /api/doctors/invalid-id returns 400 Bad Request');

    // Non-existent valid ObjectId
    const nonExistentIdRes = await fetch(`${BASE_URL}/doctors/600000000000000000000000`);
    assert(nonExistentIdRes.status === 404, 'GET /api/doctors/<non-existent-id> returns 404');

    // Security: Pending and Rejected doctor profiles MUST return 404 to public users
    const pendingUser = await User.findOne({ email: 'dr.pending@mediconnect.com' });
    if (pendingUser) {
      const pendingDoc = await Doctor.findOne({ user: pendingUser._id });
      if (pendingDoc) {
        const pendingRes = await fetch(`${BASE_URL}/doctors/${pendingDoc._id}`);
        assert(pendingRes.status === 404, 'Security: Public request for pending doctor profile returns 404');
      }
    }

    const rejectedUser = await User.findOne({ email: 'dr.rejected@mediconnect.com' });
    if (rejectedUser) {
      const rejectedDoc = await Doctor.findOne({ user: rejectedUser._id });
      if (rejectedDoc) {
        const rejectedRes = await fetch(`${BASE_URL}/doctors/${rejectedDoc._id}`);
        assert(rejectedRes.status === 404, 'Security: Public request for rejected doctor profile returns 404');
      }
    }

    // 8. Hospital Discovery
    console.log('\n--- 7. Hospital Discovery ---');
    const allHospRes = await fetch(`${BASE_URL}/hospitals`);
    const allHospData = await allHospRes.json();
    assert(allHospRes.status === 200 && allHospData.success, 'GET /api/hospitals returned 200');
    assert(allHospData.data.length >= 5, `Returned ${allHospData.data.length} hospitals`);

    const sampleHosp = allHospData.data[0];
    assert(sampleHosp.id && sampleHosp.name && sampleHosp.city, 'Hospital public shape contains id, name, city');

    // Search hospital
    const searchHospTextRes = await fetch(`${BASE_URL}/hospitals?search=apollo`);
    const searchHospTextData = await searchHospTextRes.json();
    assert(
      searchHospTextRes.status === 200 &&
        searchHospTextData.data.some((h) => h.name.toLowerCase().includes('apollo')),
      'Hospital search (?search=apollo) matches Apollo'
    );

    // Filter hospital by city
    const filterCityRes = await fetch(`${BASE_URL}/hospitals?city=Chennai`);
    const filterCityData = await filterCityRes.json();
    assert(
      filterCityRes.status === 200 && filterCityData.data.every((h) => h.city === 'Chennai'),
      'Filtered by ?city=Chennai'
    );

    // Filter hospital by emergency
    const filterEmergRes = await fetch(`${BASE_URL}/hospitals?emergency=true`);
    const filterEmergData = await filterEmergRes.json();
    assert(
      filterEmergRes.status === 200 && filterEmergData.data.every((h) => h.emergencyService === true),
      'Filtered by ?emergency=true'
    );

    // Filter hospital by facility
    const filterFacilityRes = await fetch(`${BASE_URL}/hospitals?facility=ICU`);
    const filterFacilityData = await filterFacilityRes.json();
    assert(
      filterFacilityRes.status === 200 &&
        filterFacilityData.data.every((h) => h.facilities.some((f) => f.toLowerCase().includes('icu'))),
      'Filtered by ?facility=ICU'
    );

    // Filter hospital by hospitalType
    const filterTypeRes = await fetch(`${BASE_URL}/hospitals?hospitalType=Super-Specialty`);
    const filterTypeData = await filterTypeRes.json();
    assert(
      filterTypeRes.status === 200 && filterTypeData.data.length > 0,
      'Filtered by ?hospitalType=Super-Specialty'
    );

    // 9. Hospital Profile & Doctors List
    console.log('\n--- 8. Hospital Profile & Associated Doctors ---');
    const hospDetailRes = await fetch(`${BASE_URL}/hospitals/${sampleHosp.id}`);
    const hospDetailData = await hospDetailRes.json();
    assert(hospDetailRes.status === 200 && hospDetailData.success, 'GET /api/hospitals/:id returned 200');
    assert(typeof hospDetailData.data.doctorsCount === 'number', 'Hospital profile includes computed doctorsCount');

    const hospDocsRes = await fetch(`${BASE_URL}/hospitals/${sampleHosp.id}/doctors`);
    const hospDocsData = await hospDocsRes.json();
    assert(hospDocsRes.status === 200 && Array.isArray(hospDocsData.data), 'GET /api/hospitals/:id/doctors returned list');
    assert(hospDocsData.pagination !== undefined, 'Hospital doctors endpoint supports pagination');

    // 10. Specialization API
    console.log('\n--- 9. Specialization API ---');
    const specsRes = await fetch(`${BASE_URL}/specializations`);
    const specsData = await specsRes.json();
    assert(specsRes.status === 200 && specsData.data.length >= 10, 'GET /api/specializations returned all specialties');

    const specSearchRes = await fetch(`${BASE_URL}/specializations?search=cardio`);
    const specSearchData = await specSearchRes.json();
    assert(
      specSearchRes.status === 200 && specSearchData.data.some((s) => s.name === 'Cardiology'),
      'GET /api/specializations?search=cardio matches Cardiology'
    );

    console.log('\n====================================================');
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    await mongoose.disconnect();

    if (failed > 0) {
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error('Unhandled test runner error:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runTests();
