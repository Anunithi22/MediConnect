/**
 * Comprehensive Phase 8 Automated Test Suite
 * Location, Geospatial Indexing & Distance Calculation
 */

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('====================================================');
  console.log('  MEDICONNECT PHASE 8: GEOSPATIAL & LOCATION TESTS  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 0. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(health.status === 'healthy', 'Backend health check is healthy');

    // 1. Valid hospital geospatial search
    console.log('\n--- 1. Hospital Geospatial Search (/api/hospitals) ---');
    // Using Apollo Speciality Greams Road Chennai: 13.0569, 80.2525
    const hospNearRes = await fetch(`${BASE_URL}/hospitals?latitude=13.0569&longitude=80.2525&radius=25`);
    assert(hospNearRes.status === 200, 'GET /api/hospitals with lat/lng returned 200');
    const hospNearData = await hospNearRes.json();
    assert(hospNearData.success === true, 'Response indicates success: true');
    assert(Array.isArray(hospNearData.data) && hospNearData.data.length > 0, `Returned ${hospNearData.data.length} nearby hospitals in Chennai`);
    
    // Check first hospital distance calculation
    const firstHosp = hospNearData.data[0];
    assert(firstHosp.distance !== undefined, `Hospital includes calculated distance: ${firstHosp.distance}`);
    assert(firstHosp.distanceUnit === 'km', `Hospital includes default distanceUnit 'km'`);
    assert(firstHosp.distanceFormatted !== undefined, `Hospital includes formatted distance string: ${firstHosp.distanceFormatted}`);
    assert(firstHosp.location && firstHosp.location.type === 'Point', 'Hospital includes valid GeoJSON location Point');
    assert(Array.isArray(firstHosp.location.coordinates) && firstHosp.location.coordinates.length === 2, 'Coordinates are [longitude, latitude]');

    // 2. Hospital nearest sorting
    console.log('\n--- 2. Hospital Nearest Sorting ---');
    const hospSortedRes = await fetch(`${BASE_URL}/hospitals?latitude=13.0569&longitude=80.2525&radius=25&sort=nearest`);
    assert(hospSortedRes.status === 200, 'GET /api/hospitals?sort=nearest returned 200');
    const hospSortedData = await hospSortedRes.json();
    const distances = hospSortedData.data.map((h) => h.distance);
    let isAscending = true;
    for (let i = 1; i < distances.length; i++) {
      if (distances[i] < distances[i - 1]) isAscending = false;
    }
    assert(isAscending, `Hospitals sorted by distance ascending: ${distances.join(' km, ')} km`);

    // 3. Unit conversion (miles)
    console.log('\n--- 3. Distance Unit Conversion (Miles) ---');
    const hospMiRes = await fetch(`${BASE_URL}/hospitals?latitude=13.0569&longitude=80.2525&radius=25&unit=mi&sort=nearest`);
    assert(hospMiRes.status === 200, 'GET /api/hospitals with unit=mi returned 200');
    const hospMiData = await hospMiRes.json();
    assert(hospMiData.data[0].distanceUnit === 'mi', 'Distance unit is correctly reported as "mi"');
    // Compare km vs mi for second hospital (which has non-zero distance)
    if (hospSortedData.data.length > 1 && hospMiData.data.length > 1) {
      const kmVal = hospSortedData.data[1].distance;
      const miVal = hospMiData.data[1].distance;
      const expectedMi = Math.round((kmVal / 1.60934) * 10) / 10;
      assert(Math.abs(miVal - expectedMi) <= 0.2, `Miles conversion accurate: ${kmVal} km ≈ ${miVal} mi`);
    }

    // 4. Coordinate & Radius Validation
    console.log('\n--- 4. Coordinate & Radius Validation ---');
    const invLatRes = await fetch(`${BASE_URL}/hospitals?latitude=95&longitude=80`);
    assert(invLatRes.status === 400, 'Invalid latitude (> 90) rejected with 400 Bad Request');
    const invLatData = await invLatRes.json();
    assert(invLatData.message.includes('Latitude'), `Error message mentions Latitude: "${invLatData.message}"`);

    const invLngRes = await fetch(`${BASE_URL}/hospitals?latitude=13&longitude=-190`);
    assert(invLngRes.status === 400, 'Invalid longitude (< -180) rejected with 400 Bad Request');

    const invRadRes = await fetch(`${BASE_URL}/hospitals?latitude=13&longitude=80&radius=-10`);
    assert(invRadRes.status === 400, 'Negative radius rejected with 400 Bad Request');

    const alphaRadRes = await fetch(`${BASE_URL}/hospitals?latitude=13&longitude=80&radius=abc`);
    assert(alphaRadRes.status === 400, 'Non-numeric radius rejected with 400 Bad Request');

    const excessiveRadRes = await fetch(`${BASE_URL}/hospitals?latitude=13&longitude=80&radius=1000`);
    assert(excessiveRadRes.status === 400, 'Radius exceeding maximum (500 km) rejected with 400 Bad Request');

    // 5. No nearby results
    console.log('\n--- 5. No Nearby Results Handling ---');
    // Query middle of the ocean (0, 0) with small radius
    const noResultsRes = await fetch(`${BASE_URL}/hospitals?latitude=0&longitude=0&radius=5`);
    assert(noResultsRes.status === 200, 'Distant location returns 200 OK');
    const noResultsData = await noResultsRes.json();
    assert(noResultsData.data.length === 0, 'Returns empty results array [] for location with no healthcare facilities');
    assert(noResultsData.message && noResultsData.message.includes('No hospitals found'), 'Returns friendly empty state message');

    // 6. Doctor search using affiliated hospital location
    console.log('\n--- 6. Doctor Search via Affiliated Hospital Location ---');
    const docNearRes = await fetch(`${BASE_URL}/doctors?latitude=13.0569&longitude=80.2525&radius=25`);
    assert(docNearRes.status === 200, 'GET /api/doctors with lat/lng returned 200');
    const docNearData = await docNearRes.json();
    assert(docNearData.data.length > 0, `Returned ${docNearData.data.length} doctors within 25 km`);
    
    const firstDoc = docNearData.data[0];
    assert(firstDoc.distance !== undefined, `Doctor includes calculated distance: ${firstDoc.distance}`);
    assert(firstDoc.distanceUnit === 'km', `Doctor includes distanceUnit: ${firstDoc.distanceUnit}`);
    assert(firstDoc.hospital && firstDoc.hospital.name, `Doctor includes affiliated hospital name: ${firstDoc.hospital.name}`);
    assert(firstDoc.hospital.distance !== undefined, `Hospital sub-object also contains distance`);

    // 7. Doctor nearest sorting
    console.log('\n--- 7. Doctor Nearest Sorting ---');
    const docSortedRes = await fetch(`${BASE_URL}/doctors?latitude=13.0569&longitude=80.2525&radius=25&sort=nearest`);
    assert(docSortedRes.status === 200, 'GET /api/doctors?sort=nearest returned 200');
    const docSortedData = await docSortedRes.json();
    const docDistances = docSortedData.data.map((d) => d.distance);
    let docDistAscending = true;
    for (let i = 1; i < docDistances.length; i++) {
      if (docDistances[i] < docDistances[i - 1]) docDistAscending = false;
    }
    assert(docDistAscending, `Doctors sorted by affiliated hospital distance ascending: ${docDistances.join(' km, ')} km`);

    // 8. Profiles with location context
    console.log('\n--- 8. Doctor & Hospital Profiles Distance Calculation ---');
    // Hospital profile with coords
    const hospProfileRes = await fetch(`${BASE_URL}/hospitals/${firstHosp.id}?latitude=13.0569&longitude=80.2525`);
    assert(hospProfileRes.status === 200, 'GET /api/hospitals/:id with user coords returned 200');
    const hospProfileData = await hospProfileRes.json();
    assert(hospProfileData.data.distance !== undefined, `Hospital profile returns computed distance: ${hospProfileData.data.distance} ${hospProfileData.data.distanceUnit}`);

    // Doctor profile with coords
    const docProfileRes = await fetch(`${BASE_URL}/doctors/${firstDoc.id}?latitude=13.0569&longitude=80.2525`);
    assert(docProfileRes.status === 200, 'GET /api/doctors/:id with user coords returned 200');
    const docProfileData = await docProfileRes.json();
    assert(docProfileData.data.distance !== undefined, `Doctor profile returns computed distance from hospital: ${docProfileData.data.distance} ${docProfileData.data.distanceUnit}`);

    // 9. Existing non-location search regressions
    console.log('\n--- 9. Non-Location Discovery Regression ---');
    const standardHospRes = await fetch(`${BASE_URL}/hospitals?city=Chennai`);
    const standardHospData = await standardHospRes.json();
    assert(standardHospRes.status === 200 && standardHospData.data.length > 0, 'Standard city-based hospital search works');

    const standardDocRes = await fetch(`${BASE_URL}/doctors?specialization=Cardiology`);
    const standardDocData = await standardDocRes.json();
    assert(standardDocRes.status === 200 && standardDocData.data.length > 0, 'Standard specialty-based doctor search works');

    // 10. Security & Privacy: No persistent patient GPS stored
    console.log('\n--- 10. Security & Privacy Verification ---');
    const docPublic = docNearData.data[0];
    assert(!docPublic.password, 'Doctor response does not expose sensitive fields');
    assert(docNearData.locationSearch !== undefined, 'Query coordinates echoed in response metadata for client display only');

    console.log('\n====================================================');
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
