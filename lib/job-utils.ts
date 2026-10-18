export interface VacancyBreakdown {
  postName: string;
  ur: number;
  obc: number;
  ews: number;
  sc: number;
  st: number;
  total: number;
}

export interface ApplicationFee {
  generalObcEws: string;
  scStPh: string;
  female: string;
  paymentMode: string;
}

export type JobCategory =
  | 'All India Govt Jobs'
  | 'UPSC'
  | 'SSC'
  | 'Railway (RRB)'
  | 'Banking (IBPS/SBI)'
  | 'Defence (Army/Navy/Airforce)'
  | 'Teaching'
  | 'Police'
  | 'PSU Jobs'
  | 'Admit Card'
  | 'Results'
  | 'Answer Key'
  | 'Syllabus';

export type QualificationType =
  | '10th Pass'
  | '12th Pass'
  | 'ITI'
  | 'Diploma'
  | 'Graduate'
  | 'Post Graduate'
  | 'B.Tech'
  | 'B.Ed'
  | 'Medical'
  | 'Law';

export interface JobPost {
  id: string;
  postDate: string; // YYYY-MM-DD
  stateCode: string; // 'ALL' or 2-letter state/UT code like 'RJ', 'UP', 'MP', etc.
  stateName: string; // 'Central / All India' or State Name
  board: string; // e.g., 'SSC', 'UPSC', 'RRB', 'UPPSC'
  advtNo: string; // e.g., '04/2026-CGL'
  postName: string;
  totalVacancies: number;
  qualifications: QualificationType[];
  category: JobCategory;
  additionalCategories?: JobCategory[]; // e.g. if a job also has Admit Card or Result out
  startDate: string; // YYYY-MM-DD
  lastDate: string; // YYYY-MM-DD
  examDate: string; // Text or YYYY-MM-DD
  minAge: number;
  maxAge: number;
  ageAsOnDate: string; // YYYY-MM-DD
  ageRelaxationNote: string;
  applicationFee: ApplicationFee;
  vacancyBreakdown: VacancyBreakdown[];
  selectionProcess: string[];
  examPattern: string[];
  payScale: string;
  applyOnlineUrl: string;
  notificationPdfUrl: string;
  officialWebsiteUrl: string;
  isTrendingHighlight?: boolean;
  highlightColor?: 'crimson' | 'navy' | 'emerald' | 'amber' | 'violet' | 'teal' | 'rose' | 'indigo';
  statusTag?: string; // e.g., 'Apply Online', 'Admit Card Out', 'Result Declared', 'Answer Key Out'
  shortSummary: string;
}

export interface StateInfo {
  code: string;
  name: string;
  type: 'ALL' | 'STATE' | 'UT';
}

export const ALL_STATES_AND_UTS: StateInfo[] = [
  { code: 'ALL', name: 'All India', type: 'ALL' },
  // 28 States
  { code: 'AP', name: 'Andhra Pradesh', type: 'STATE' },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'STATE' },
  { code: 'AS', name: 'Assam', type: 'STATE' },
  { code: 'BH', name: 'Bihar', type: 'STATE' },
  { code: 'CG', name: 'Chhattisgarh', type: 'STATE' },
  { code: 'GA', name: 'Goa', type: 'STATE' },
  { code: 'GJ', name: 'Gujarat', type: 'STATE' },
  { code: 'HR', name: 'Haryana', type: 'STATE' },
  { code: 'HP', name: 'Himachal Pradesh', type: 'STATE' },
  { code: 'JH', name: 'Jharkhand', type: 'STATE' },
  { code: 'KA', name: 'Karnataka', type: 'STATE' },
  { code: 'KL', name: 'Kerala', type: 'STATE' },
  { code: 'MP', name: 'Madhya Pradesh', type: 'STATE' },
  { code: 'MH', name: 'Maharashtra', type: 'STATE' },
  { code: 'MN', name: 'Manipur', type: 'STATE' },
  { code: 'ML', name: 'Meghalaya', type: 'STATE' },
  { code: 'MZ', name: 'Mizoram', type: 'STATE' },
  { code: 'NL', name: 'Nagaland', type: 'STATE' },
  { code: 'OD', name: 'Odisha', type: 'STATE' },
  { code: 'PB', name: 'Punjab', type: 'STATE' },
  { code: 'RJ', name: 'Rajasthan', type: 'STATE' },
  { code: 'SK', name: 'Sikkim', type: 'STATE' },
  { code: 'TN', name: 'Tamil Nadu', type: 'STATE' },
  { code: 'TS', name: 'Telangana', type: 'STATE' },
  { code: 'TR', name: 'Tripura', type: 'STATE' },
  { code: 'UP', name: 'Uttar Pradesh', type: 'STATE' },
  { code: 'UK', name: 'Uttarakhand', type: 'STATE' },
  { code: 'WB', name: 'West Bengal', type: 'STATE' },
  // 8 Union Territories
  { code: 'AN', name: 'Andaman & Nicobar', type: 'UT' },
  { code: 'CH', name: 'Chandigarh', type: 'UT' },
  { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu', type: 'UT' },
  { code: 'DL', name: 'Delhi (NCT)', type: 'UT' },
  { code: 'JK', name: 'Jammu & Kashmir', type: 'UT' },
  { code: 'LA', name: 'Ladakh', type: 'UT' },
  { code: 'LD', name: 'Lakshadweep', type: 'UT' },
  { code: 'PY', name: 'Puducherry', type: 'UT' },
];

export const MAIN_CATEGORIES: JobCategory[] = [
  'All India Govt Jobs',
  'UPSC',
  'SSC',
  'Railway (RRB)',
  'Banking (IBPS/SBI)',
  'Defence (Army/Navy/Airforce)',
  'Teaching',
  'Police',
  'PSU Jobs',
  'Admit Card',
  'Results',
  'Answer Key',
  'Syllabus',
];

export const QUALIFICATION_FILTERS: QualificationType[] = [
  '10th Pass',
  '12th Pass',
  'ITI',
  'Diploma',
  'Graduate',
  'Post Graduate',
  'B.Tech',
  'B.Ed',
  'Medical',
  'Law',
];

export interface AgeCalculationResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  isValid: boolean;
}

/**
 * Calculates exact age in years, months, and days between a Date of Birth (YYYY-MM-DD)
 * and a target reference date (YYYY-MM-DD).
 */
export function calculateExactAge(dobStr: string, asOnDateStr: string): AgeCalculationResult {
  if (!dobStr || !asOnDateStr) {
    return { years: 0, months: 0, days: 0, totalDays: 0, isValid: false };
  }

  const dobParts = dobStr.split('-').map(Number);
  const asOnParts = asOnDateStr.split('-').map(Number);

  if (dobParts.length !== 3 || asOnParts.length !== 3 || dobParts.some(isNaN) || asOnParts.some(isNaN)) {
    return { years: 0, months: 0, days: 0, totalDays: 0, isValid: false };
  }

  const dob = new Date(Date.UTC(dobParts[0], dobParts[1] - 1, dobParts[2]));
  const asOn = new Date(Date.UTC(asOnParts[0], asOnParts[1] - 1, asOnParts[2]));

  if (isNaN(dob.getTime()) || isNaN(asOn.getTime()) || dob.getTime() > asOn.getTime()) {
    return { years: 0, months: 0, days: 0, totalDays: 0, isValid: false };
  }

  let years = asOnParts[0] - dobParts[0];
  let months = asOnParts[1] - dobParts[1];
  let days = asOnParts[2] - dobParts[2];

  if (days < 0) {
    months -= 1;
    // Get days in the previous month of asOn
    const prevMonthDate = new Date(Date.UTC(asOnParts[0], asOnParts[1] - 1, 0));
    days += prevMonthDate.getUTCDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((asOn.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));

  return {
    years,
    months,
    days,
    totalDays,
    isValid: true,
  };
}

export interface AgeEligibilityResult extends AgeCalculationResult {
  eligible: boolean;
  message: string;
}

/**
 * Checks whether a candidate's DOB meets a job's [minAge, maxAge] criteria (with optional category relaxation in years).
 */
export function checkJobAgeEligibility(
  dobStr: string,
  asOnDateStr: string,
  minAge: number,
  maxAge: number,
  relaxationYears: number = 0
): AgeEligibilityResult {
  const calc = calculateExactAge(dobStr, asOnDateStr);
  if (!calc.isValid) {
    return {
      ...calc,
      eligible: false,
      message: 'Please enter a valid Date of Birth prior to the calculation date.',
    };
  }

  const effectiveMaxAge = maxAge + Math.max(0, relaxationYears);

  // Under minimum age if years < minAge
  if (calc.years < minAge) {
    return {
      ...calc,
      eligible: false,
      message: `Underage: Minimum required age is ${minAge} years (you are ${calc.years}y ${calc.months}m ${calc.days}d).`,
    };
  }

  // Over maximum age if years > effectiveMaxAge, OR years === effectiveMaxAge and (months > 0 or days > 0)
  if (calc.years > effectiveMaxAge || (calc.years === effectiveMaxAge && (calc.months > 0 || calc.days > 0))) {
    return {
      ...calc,
      eligible: false,
      message: `Overage: Maximum allowed age is ${effectiveMaxAge} years (you are ${calc.years}y ${calc.months}m ${calc.days}d).`,
    };
  }

  return {
    ...calc,
    eligible: true,
    message: `Eligible! Your age (${calc.years}y ${calc.months}m ${calc.days}d) is within the ${minAge}–${effectiveMaxAge} years limit.`,
  };
}

/**
 * Checks if a job's lastDate is expiring within 3 days (0 to 3 days remaining, inclusive)
 * compared to referenceDateStr (YYYY-MM-DD).
 */
export function isJobExpiringSoon(lastDateStr: string, referenceDateStr: string): boolean {
  if (!lastDateStr || !referenceDateStr) return false;
  const lastParts = lastDateStr.split('-').map(Number);
  const refParts = referenceDateStr.split('-').map(Number);
  if (lastParts.length !== 3 || refParts.length !== 3 || lastParts.some(isNaN) || refParts.some(isNaN)) {
    return false;
  }

  const lastUtc = Date.UTC(lastParts[0], lastParts[1] - 1, lastParts[2]);
  const refUtc = Date.UTC(refParts[0], refParts[1] - 1, refParts[2]);

  const diffDays = Math.round((lastUtc - refUtc) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
}

/**
 * Returns the number of days remaining until lastDateStr from referenceDateStr.
 */
export function getDaysRemaining(lastDateStr: string, referenceDateStr: string): number | null {
  if (!lastDateStr || !referenceDateStr) return null;
  const lastParts = lastDateStr.split('-').map(Number);
  const refParts = referenceDateStr.split('-').map(Number);
  if (lastParts.length !== 3 || refParts.length !== 3 || lastParts.some(isNaN) || refParts.some(isNaN)) {
    return null;
  }
  const lastUtc = Date.UTC(lastParts[0], lastParts[1] - 1, lastParts[2]);
  const refUtc = Date.UTC(refParts[0], refParts[1] - 1, refParts[2]);
  return Math.round((lastUtc - refUtc) / (1000 * 60 * 60 * 24));
}

export interface JobFilterCriteria {
  stateCode: string; // 'ALL' or specific state code
  category: JobCategory;
  qualification: QualificationType | 'ALL';
  searchQuery: string;
  onlySaved?: boolean;
  savedJobIds?: string[];
}

/**
 * Filters a list of JobPost entries according to active State, Category, Qualification, Search query, and Saved status.
 */
export function filterJobPosts(jobs: JobPost[], criteria: JobFilterCriteria): JobPost[] {
  const query = criteria.searchQuery.trim().toLowerCase();

  return jobs.filter((job) => {
    // 1. Saved filter
    if (criteria.onlySaved && criteria.savedJobIds) {
      if (!criteria.savedJobIds.includes(job.id)) {
        return false;
      }
    }

    // 2. State filter
    if (criteria.stateCode && criteria.stateCode !== 'ALL') {
      if (job.stateCode !== criteria.stateCode) {
        return false;
      }
    }

    // 3. Category filter
    if (criteria.category && criteria.category !== 'All India Govt Jobs') {
      const matchesPrimary = job.category === criteria.category;
      const matchesAdditional = job.additionalCategories?.includes(criteria.category) ?? false;
      if (!matchesPrimary && !matchesAdditional) {
        return false;
      }
    }

    // 4. Qualification filter
    if (criteria.qualification && criteria.qualification !== 'ALL') {
      if (!job.qualifications.includes(criteria.qualification)) {
        return false;
      }
    }

    // 5. Instant Search query (matches postName, board, stateName, stateCode, advtNo, qualifications, category)
    if (query.length > 0) {
      const searchableText = [
        job.postName,
        job.board,
        job.stateName,
        job.stateCode,
        job.advtNo,
        job.category,
        job.shortSummary,
        ...job.qualifications,
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Formats a YYYY-MM-DD date string into DD MMM YYYY (e.g. "18 Oct 2026")
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return 'Notify Soon';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[parts[1] - 1];
  if (!monthName) return dateStr;
  const day = String(parts[2]).padStart(2, '0');
  return `${day} ${monthName} ${parts[0]}`;
}
