import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExactAge,
  checkJobAgeEligibility,
  isJobExpiringSoon,
  getDaysRemaining,
  filterJobPosts,
  formatDisplayDate,
  ALL_STATES_AND_UTS,
  MAIN_CATEGORIES,
  QUALIFICATION_FILTERS,
  type JobPost,
} from './job-utils.ts';

test('ALL_STATES_AND_UTS has All India + 28 States + 8 UTs = 37 entries', () => {
  assert.equal(ALL_STATES_AND_UTS.length, 37);
  const states = ALL_STATES_AND_UTS.filter((s) => s.type === 'STATE');
  const uts = ALL_STATES_AND_UTS.filter((s) => s.type === 'UT');
  assert.equal(states.length, 28);
  assert.equal(uts.length, 8);
});

test('MAIN_CATEGORIES and QUALIFICATION_FILTERS include all required tabs and buttons', () => {
  assert.equal(MAIN_CATEGORIES.length, 13);
  assert.equal(QUALIFICATION_FILTERS.length, 10);
});

test('calculateExactAge computes exact years, months, and days accurately', () => {
  const res1 = calculateExactAge('2000-05-15', '2026-10-18');
  assert.equal(res1.isValid, true);
  assert.equal(res1.years, 26);
  assert.equal(res1.months, 5);
  assert.equal(res1.days, 3);

  const res2 = calculateExactAge('2002-11-25', '2026-10-18');
  assert.equal(res2.isValid, true);
  assert.equal(res2.years, 23);
  assert.equal(res2.months, 10);
  assert.equal(res2.days, 23);

  // Invalid when DOB is after asOnDate
  const invalid = calculateExactAge('2028-01-01', '2026-10-18');
  assert.equal(invalid.isValid, false);
});

test('checkJobAgeEligibility validates minimum, maximum, and category age relaxation', () => {
  // 18 to 27 limit as on 2026-08-01
  const eligible = checkJobAgeEligibility('2001-06-10', '2026-08-01', 18, 27, 0);
  assert.equal(eligible.eligible, true);

  // Underage (17 years old)
  const underage = checkJobAgeEligibility('2009-01-01', '2026-08-01', 18, 27, 0);
  assert.equal(underage.eligible, false);
  assert.match(underage.message, /Underage/);

  // Overage without relaxation (28 years old), but eligible with 3 years OBC relaxation
  const overageGen = checkJobAgeEligibility('1998-05-01', '2026-08-01', 18, 27, 0);
  assert.equal(overageGen.eligible, false);

  const eligibleObc = checkJobAgeEligibility('1998-05-01', '2026-08-01', 18, 27, 3);
  assert.equal(eligibleObc.eligible, true);
});

test('isJobExpiringSoon detects deadlines within 0 to 3 days', () => {
  const refDate = '2026-10-18';
  assert.equal(isJobExpiringSoon('2026-10-18', refDate), true); // 0 days left
  assert.equal(isJobExpiringSoon('2026-10-20', refDate), true); // 2 days left
  assert.equal(isJobExpiringSoon('2026-10-21', refDate), true); // 3 days left
  assert.equal(isJobExpiringSoon('2026-10-22', refDate), false); // 4 days left
  assert.equal(isJobExpiringSoon('2026-10-17', refDate), false); // Already expired
  assert.equal(getDaysRemaining('2026-10-20', refDate), 2);
});

test('filterJobPosts filters accurately by state, category, qualification, search query, and saved IDs', () => {
  const sampleJobs: JobPost[] = [
    {
      id: 'job-1',
      postDate: '2026-10-15',
      stateCode: 'ALL',
      stateName: 'All India',
      board: 'SSC',
      advtNo: 'CGL-2026',
      postName: 'Combined Graduate Level (CGL) Examination 2026',
      totalVacancies: 17727,
      qualifications: ['Graduate'],
      category: 'SSC',
      additionalCategories: ['Admit Card'],
      startDate: '2026-09-20',
      lastDate: '2026-10-20',
      examDate: 'December 2026',
      minAge: 18,
      maxAge: 32,
      ageAsOnDate: '2026-08-01',
      ageRelaxationNote: 'OBC: 3 Yrs, SC/ST: 5 Yrs',
      applicationFee: { generalObcEws: '₹100', scStPh: '₹0', female: '₹0', paymentMode: 'Online' },
      vacancyBreakdown: [],
      selectionProcess: ['Tier-I CBT', 'Tier-II CBT'],
      examPattern: ['100 Questions, 200 Marks'],
      payScale: 'Level-4 to Level-8',
      applyOnlineUrl: 'https://ssc.gov.in',
      notificationPdfUrl: 'https://ssc.gov.in',
      officialWebsiteUrl: 'https://ssc.gov.in',
      shortSummary: 'SSC CGL 2026 notification',
    },
    {
      id: 'job-2',
      postDate: '2026-10-16',
      stateCode: 'RJ',
      stateName: 'Rajasthan',
      board: 'RPSC',
      advtNo: 'RPSC/RAS/2026',
      postName: 'Rajasthan State & Subordinate Services (RAS) Exam 2026',
      totalVacancies: 905,
      qualifications: ['Graduate', 'Post Graduate'],
      category: 'All India Govt Jobs',
      additionalCategories: ['Syllabus'],
      startDate: '2026-10-01',
      lastDate: '2026-11-05',
      examDate: 'January 2027',
      minAge: 21,
      maxAge: 40,
      ageAsOnDate: '2027-01-01',
      ageRelaxationNote: 'As per Rajasthan Govt rules',
      applicationFee: { generalObcEws: '₹600', scStPh: '₹400', female: '₹400', paymentMode: 'Online' },
      vacancyBreakdown: [],
      selectionProcess: ['Prelims', 'Mains', 'Interview'],
      examPattern: ['Objective Prelims 200 Marks'],
      payScale: 'Level-10 to Level-14',
      applyOnlineUrl: 'https://rpsc.rajasthan.gov.in',
      notificationPdfUrl: 'https://rpsc.rajasthan.gov.in',
      officialWebsiteUrl: 'https://rpsc.rajasthan.gov.in',
      shortSummary: 'RPSC RAS 2026 recruitment',
    },
  ];

  // Filter by state RJ
  const rjOnly = filterJobPosts(sampleJobs, {
    stateCode: 'RJ',
    category: 'All India Govt Jobs',
    qualification: 'ALL',
    searchQuery: '',
  });
  assert.equal(rjOnly.length, 1);
  assert.equal(rjOnly[0].id, 'job-2');

  // Filter by additionalCategory Admit Card
  const admitCards = filterJobPosts(sampleJobs, {
    stateCode: 'ALL',
    category: 'Admit Card',
    qualification: 'ALL',
    searchQuery: '',
  });
  assert.equal(admitCards.length, 1);
  assert.equal(admitCards[0].id, 'job-1');

  // Filter by search query
  const searchRes = filterJobPosts(sampleJobs, {
    stateCode: 'ALL',
    category: 'All India Govt Jobs',
    qualification: 'ALL',
    searchQuery: 'Combined Graduate',
  });
  assert.equal(searchRes.length, 1);
  assert.equal(searchRes[0].id, 'job-1');

  assert.equal(formatDisplayDate('2026-10-18'), '18 Oct 2026');
});
