'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Bookmark,
  Calculator,
  Sun,
  Moon,
  Share2,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Check,
  RotateCcw,
  FileText,
} from 'lucide-react';
import {
  JobPost,
  JobCategory,
  QualificationType,
  ALL_STATES_AND_UTS,
  MAIN_CATEGORIES,
  QUALIFICATION_FILTERS,
  filterJobPosts,
  formatDisplayDate,
  isJobExpiringSoon,
  getDaysRemaining,
} from '@/lib/job-utils';
import { INITIAL_JOBS_DATA, REFERENCE_TODAY } from '@/lib/jobs-data';
import JobDetailsModal from './JobDetailsModal';
import AgeCalculatorModal from './AgeCalculatorModal';
import AdminPanelModal from './AdminPanelModal';

const STORAGE_KEY_JOBS = 'aigjp_portal_jobs_v1';
const STORAGE_KEY_SAVED = 'aigjp_saved_jobs_v1';
const STORAGE_KEY_THEME = 'aigjp_theme_v1';

const HIGHLIGHT_COLOR_STYLES: Record<
  NonNullable<JobPost['highlightColor']>,
  string
> = {
  crimson:
    'bg-red-800 hover:bg-red-900 text-white border-red-950',
  navy:
    'bg-blue-900 hover:bg-blue-950 text-white border-blue-950',
  emerald:
    'bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-950',
  amber:
    'bg-amber-700 hover:bg-amber-800 text-white border-amber-900',
  violet:
    'bg-purple-900 hover:bg-purple-950 text-white border-purple-950',
  teal:
    'bg-teal-800 hover:bg-teal-900 text-white border-teal-950',
  rose:
    'bg-rose-800 hover:bg-rose-900 text-white border-rose-950',
  indigo:
    'bg-indigo-900 hover:bg-indigo-950 text-white border-indigo-950',
};

export default function JobPortalClient() {
  const [jobs, setJobs] = useState<JobPost[]>(INITIAL_JOBS_DATA);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Filter states
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>('All India Govt Jobs');
  const [selectedQualification, setSelectedQualification] = useState<QualificationType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlySaved, setOnlySaved] = useState<boolean>(false);

  // Modals
  const [activeJobModal, setActiveJobModal] = useState<JobPost | null>(null);
  const [isAgeCalcOpen, setIsAgeCalcOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Share banner state
  const [shareToast, setShareToast] = useState<{
    platform: 'WhatsApp' | 'Telegram';
    text: string;
    url: string;
  } | null>(null);

  // Load persisted data from localStorage on mount
  useEffect(() => {
    try {
      const storedJobs = localStorage.getItem(STORAGE_KEY_JOBS);
      if (storedJobs) {
        const parsed = JSON.parse(storedJobs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setJobs(parsed);
        }
      }
      const storedSaved = localStorage.getItem(STORAGE_KEY_SAVED);
      if (storedSaved) {
        const parsedSaved = JSON.parse(storedSaved);
        if (Array.isArray(parsedSaved)) {
          setSavedJobIds(parsedSaved);
        }
      }
      const storedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (storedTheme === 'dark') {
        setDarkMode(true);
      }
    } catch {
      // Fallback to defaults if localStorage is unavailable
    }
  }, []);

  // Sync dark mode class to document.documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  const handleToggleSaveJob = (jobId: string) => {
    setSavedJobIds((prev) => {
      const exists = prev.includes(jobId);
      const updated = exists ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleSaveCmsJob = (newJob: JobPost, isEditing: boolean) => {
    setJobs((prev) => {
      const updated = isEditing
        ? prev.map((j) => (j.id === newJob.id ? newJob : j))
        : [newJob, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteCmsJob = (jobId: string) => {
    setJobs((prev) => {
      const updated = prev.filter((j) => j.id !== jobId);
      try {
        localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    if (activeJobModal?.id === jobId) {
      setActiveJobModal(null);
    }
  };

  const handleResetDefaultJobs = () => {
    setJobs(INITIAL_JOBS_DATA);
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(INITIAL_JOBS_DATA));
    } catch {
      // ignore
    }
  };

  const handleShare = (job: JobPost, platform: 'WhatsApp' | 'Telegram') => {
    const shareMessage = `${job.postName} (${job.board}) - ${job.totalVacancies.toLocaleString('en-IN')} Posts | Last Date: ${formatDisplayDate(job.lastDate)} | Apply: ${job.applyOnlineUrl}`;
    const shareUrl =
      platform === 'WhatsApp'
        ? `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
        : `https://t.me/share/url?url=${encodeURIComponent(job.applyOnlineUrl)}&text=${encodeURIComponent(shareMessage)}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareMessage).catch(() => {});
    }
    setShareToast({
      platform,
      text: shareMessage,
      url: shareUrl,
    });
  };

  const filteredJobs = useMemo(() => {
    return filterJobPosts(jobs, {
      stateCode: selectedState,
      category: selectedCategory,
      qualification: selectedQualification,
      searchQuery,
      onlySaved,
      savedJobIds,
    });
  }, [
    jobs,
    selectedState,
    selectedCategory,
    selectedQualification,
    searchQuery,
    onlySaved,
    savedJobIds,
  ]);

  const highlightJobs = useMemo(() => {
    const trending = jobs.filter((j) => j.isTrendingHighlight);
    return trending.slice(0, 8);
  }, [jobs]);

  const totalOpenVacancies = useMemo(() => {
    return filteredJobs.reduce((acc, j) => acc + j.totalVacancies, 0);
  }, [filteredJobs]);

  const expiringSoonCount = useMemo(() => {
    return filteredJobs.filter((j) => isJobExpiringSoon(j.lastDate, REFERENCE_TODAY)).length;
  }, [filteredJobs]);

  const activeStateInfo = useMemo(() => {
    return ALL_STATES_AND_UTS.find((s) => s.code === selectedState) || ALL_STATES_AND_UTS[0];
  }, [selectedState]);

  const resetAllFilters = () => {
    setSelectedState('ALL');
    setSelectedCategory('All India Govt Jobs');
    setSelectedQualification('ALL');
    setSearchQuery('');
    setOnlySaved(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract: 1-row, 3-zone navigation header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-8 px-3 sm:px-8 py-3 bg-slate-900 text-white border-b border-slate-800">
        {/* Zone 1: Brand Title */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            resetAllFilters();
          }}
          className="text-sm sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          All India Government Job Portal
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300"
        >
          <button
            type="button"
            onClick={() => {
              setOnlySaved(false);
              setSelectedCategory('All India Govt Jobs');
            }}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Latest Jobs
          </button>
          <button
            type="button"
            onClick={() => {
              setOnlySaved(false);
              setSelectedCategory('Admit Card');
            }}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Admit Card
          </button>
          <button
            type="button"
            onClick={() => {
              setOnlySaved(false);
              setSelectedCategory('Results');
            }}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Exam Results
          </button>
          <button
            type="button"
            onClick={() => setIsAgeCalcOpen(true)}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Age Calculator
          </button>
          <button
            type="button"
            onClick={() => setOnlySaved(!onlySaved)}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Saved Jobs ({savedJobIds.length})
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Admin Panel</span>
          </button>
        </div>
      </header>

      {/* Feature 1: All-India State Filter Bar (All India + 28 States + 8 UTs) */}
      <section
        aria-label="All-India State Filter Bar"
        className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-8 py-2.5"
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              State / UT Recruitment Filter (28 States & 8 UTs):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAgeCalcOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 whitespace-nowrap shrink-0"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Age Calculator</span>
              </button>
              <button
                type="button"
                onClick={() => setOnlySaved(!onlySaved)}
                aria-pressed={onlySaved}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                  onlySaved
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>Saved Jobs ({savedJobIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 whitespace-nowrap shrink-0"
              >
                {darkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {ALL_STATES_AND_UTS.map((state) => {
              const isSelected = selectedState === state.code;
              return (
                <button
                  key={state.code}
                  type="button"
                  title={`${state.name} Govt Jobs`}
                  aria-label={
                    state.code === 'ALL'
                      ? 'All India Jobs'
                      : `${state.code} (${state.name}) Jobs`
                  }
                  aria-pressed={isSelected}
                  onClick={() => setSelectedState(state.code)}
                  className={`px-2 py-1 rounded text-xs font-bold font-mono transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {state.code === 'ALL' ? 'All India' : state.code}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature 2: Central & Category Working Tabs */}
      <section
        aria-label="Central and Exam Category Tabs"
        className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-2"
      >
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center gap-1.5">
          {MAIN_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category && !onlySaved;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setOnlySaved(false);
                  setSelectedCategory(category);
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-600'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-5 space-y-6">
        {/* Share Toast Notification (if triggered) */}
        {shareToast && (
          <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>{shareToast.platform} Share Link Ready & Copied:</strong> {shareToast.text}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={shareToast.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-700 text-white font-semibold whitespace-nowrap"
              >
                <span>Open {shareToast.platform}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => setShareToast(null)}
                className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Feature 3: Instant Smart Search Bar + Qualification Filter Buttons */}
        <section
          aria-label="Search and Qualification Filter"
          className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Instant Search Input */}
            <div className="lg:col-span-4 relative">
              <label htmlFor="portal-instant-search" className="sr-only">
                Search by Post Name, Recruitment Board, or State
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="portal-instant-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search post, board (SSC, UPSC, RPSC), state..."
                className="w-full pl-10 pr-4 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Qualification Filter Buttons */}
            <div className="lg:col-span-8 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
                Qualification:
              </span>
              <button
                type="button"
                aria-pressed={selectedQualification === 'ALL'}
                onClick={() => setSelectedQualification('ALL')}
                className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selectedQualification === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Qualifications
              </button>
              {QUALIFICATION_FILTERS.map((qual) => {
                const isSelected = selectedQualification === qual;
                return (
                  <button
                    key={qual}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      setSelectedQualification(isSelected ? 'ALL' : qual)
                    }
                    className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {qual}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature 4A: SarkariResult Style Highlight Cards (8 Colorful Trending Boxes) */}
        <section aria-label="Trending Recruitment Highlight Boxes">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Top Trending Sarkari Recruitments (Direct Apply & Notification)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              Updated: {formatDisplayDate(REFERENCE_TODAY)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {highlightJobs.map((job) => {
              const colorClass =
                HIGHLIGHT_COLOR_STYLES[job.highlightColor || 'crimson'];
              const isClosingSoon = isJobExpiringSoon(job.lastDate, REFERENCE_TODAY);
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setActiveJobModal(job)}
                  className={`text-left p-3.5 rounded-lg border transition-transform hover:-translate-y-0.5 flex flex-col justify-between ${colorClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono opacity-90 mb-1">
                      <span>{job.stateCode === 'ALL' ? 'ALL INDIA' : job.stateName.toUpperCase()}</span>
                      {isClosingSoon ? (
                        <span className="bg-white text-red-800 font-extrabold px-1.5 py-0.5 rounded-xs animate-pulse">
                          CLOSING SOON
                        </span>
                      ) : (
                        <span>{job.statusTag || 'Apply Online'}</span>
                      )}
                    </div>
                    <div className="text-sm sm:text-base font-extrabold leading-snug line-clamp-2">
                      {job.postName}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="font-bold">
                      {job.totalVacancies.toLocaleString('en-IN')} Posts
                    </span>
                    <span className="underline font-sans font-semibold">
                      Get Details →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Feature 4B: FreeJobAlert Style Detailed Recruitment Table */}
        <section aria-label="Detailed Government Jobs Table">
          {/* Active Filter Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white px-4 py-3 rounded-t-lg border border-b-0 border-slate-800">
            <div>
              <h1 className="text-sm sm:text-base font-bold flex flex-wrap items-center gap-2">
                <span>
                  {onlySaved
                    ? 'Saved / Bookmarked Jobs'
                    : `${activeStateInfo.name} — ${selectedCategory}`}
                </span>
                {selectedQualification !== 'ALL' && (
                  <span className="text-amber-400">({selectedQualification})</span>
                )}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 font-mono tabular-nums">
                Showing {filteredJobs.length} Notifications · Total{' '}
                {totalOpenVacancies.toLocaleString('en-IN')} Vacancies
                {expiringSoonCount > 0 && (
                  <span className="text-red-400 font-bold ml-2">
                    · {expiringSoonCount} Closing Within 3 Days
                  </span>
                )}
              </p>
            </div>

            {(selectedState !== 'ALL' ||
              selectedCategory !== 'All India Govt Jobs' ||
              selectedQualification !== 'ALL' ||
              searchQuery.trim() !== '' ||
              onlySaved) && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 transition-colors self-start sm:self-auto whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Responsive Table Container */}
          <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-lg">
            {filteredJobs.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-xs border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-3 font-bold whitespace-nowrap">Post Date</th>
                    <th className="py-3 px-3 font-bold whitespace-nowrap">State / Tag</th>
                    <th className="py-3 px-3 font-bold">Recruitment Board</th>
                    <th className="py-3 px-3 font-bold">Post Name & Advt No.</th>
                    <th className="py-3 px-3 font-bold text-right whitespace-nowrap">Vacancies</th>
                    <th className="py-3 px-3 font-bold">Qualification</th>
                    <th className="py-3 px-3 font-bold whitespace-nowrap">Last Date</th>
                    <th className="py-3 px-3 font-bold text-right whitespace-nowrap">
                      Get Details & Tools
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                  {filteredJobs.map((job) => {
                    const isSaved = savedJobIds.includes(job.id);
                    const expiringSoon = isJobExpiringSoon(job.lastDate, REFERENCE_TODAY);
                    const daysLeft = getDaysRemaining(job.lastDate, REFERENCE_TODAY);

                    return (
                      <tr
                        key={job.id}
                        className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Post Date */}
                        <td className="py-3 px-3 font-mono tabular-nums text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDisplayDate(job.postDate)}
                        </td>

                        {/* State / Central Tag (Clean Unboxed Text per Zero-Pill Rule) */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="text-xs font-bold font-mono text-blue-800 dark:text-blue-400">
                            {job.stateCode === 'ALL' ? 'ALL INDIA' : job.stateCode}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {job.stateName}
                          </div>
                        </td>

                        {/* Recruitment Board */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {job.board}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {job.category}
                          </div>
                        </td>

                        {/* Post Name */}
                        <td className="py-3 px-3 max-w-md">
                          <button
                            type="button"
                            onClick={() => setActiveJobModal(job)}
                            className="text-left font-bold text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400 hover:underline leading-snug"
                          >
                            {job.postName}
                          </button>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                            Advt No: {job.advtNo} · Age: {job.minAge}–{job.maxAge} Yrs
                          </div>
                        </td>

                        {/* Total Vacancies */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {job.totalVacancies.toLocaleString('en-IN')}
                        </td>

                        {/* Qualification */}
                        <td className="py-3 px-3 text-xs text-slate-700 dark:text-slate-300">
                          {job.qualifications.join(' · ')}
                        </td>

                        {/* Last Date + Expiring Soon Blinking Alert */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 text-xs">
                            {formatDisplayDate(job.lastDate)}
                          </div>
                          {expiringSoon && (
                            <div
                              data-testid="closing-soon-alert"
                              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-600 dark:text-red-400 animate-pulse mt-0.5"
                            >
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>
                                Closing Soon ({daysLeft === 0 ? 'Today' : `${daysLeft}d left`})
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Actions: Get Details + Save + Share */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveJobModal(job)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Get Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleSaveJob(job.id)}
                              aria-label={
                                isSaved
                                  ? `Remove ${job.postName} from Saved Jobs`
                                  : `Save ${job.postName}`
                              }
                              title={isSaved ? 'Saved Job' : 'Bookmark Job'}
                              className={`p-1.5 rounded border transition-colors ${
                                isSaved
                                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-900'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5 fill-current" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleShare(job, 'WhatsApp')}
                              aria-label={`Share ${job.postName} on WhatsApp`}
                              title="Share on WhatsApp"
                              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* Empty State */
              <div className="p-10 text-center space-y-3">
                <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Job Notifications Match Your Selected Filter Combination
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Try clearing the qualification filter, switching back to All India, or adding a new notification via the Admin Panel.
                </p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors"
                  >
                    Show All India Notifications
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdminOpen(true)}
                    className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    Add Job in Admin Panel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Bottom 3-Column Quick Access Grid (Admit Cards, Exam Results, Answer Keys & Syllabus) */}
        <section
          aria-label="Admit Cards, Results, and Syllabus Quick Columns"
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* Column 1: Latest Admit Cards */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="bg-red-800 text-white px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">Admit Card / Hall Ticket</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedState('ALL');
                  setSelectedCategory('Admit Card');
                }}
                className="text-xs underline hover:text-amber-200"
              >
                View All
              </button>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {jobs
                .filter(
                  (j) =>
                    j.category === 'Admit Card' ||
                    j.additionalCategories?.includes('Admit Card')
                )
                .slice(0, 6)
                .map((job) => (
                  <li key={job.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <button
                      type="button"
                      onClick={() => setActiveJobModal(job)}
                      className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-red-700 dark:hover:text-red-400 hover:underline block w-full"
                    >
                      {job.postName} — Hall Ticket / Exam City
                    </button>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {job.board} · Exam: {job.examDate}
                    </div>
                  </li>
                ))}
            </ul>
          </div>

          {/* Column 2: Latest Exam Results */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="bg-blue-900 text-white px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">Latest Exam Results</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedState('ALL');
                  setSelectedCategory('Results');
                }}
                className="text-xs underline hover:text-amber-200"
              >
                View All
              </button>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {jobs
                .filter(
                  (j) =>
                    j.category === 'Results' ||
                    j.additionalCategories?.includes('Results')
                )
                .slice(0, 6)
                .map((job) => (
                  <li key={job.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <button
                      type="button"
                      onClick={() => setActiveJobModal(job)}
                      className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-400 hover:underline block w-full"
                    >
                      {job.postName} — Merit List & Cut-Off Marks
                    </button>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {job.board} · {job.totalVacancies.toLocaleString('en-IN')} Posts
                    </div>
                  </li>
                ))}
            </ul>
          </div>

          {/* Column 3: Answer Key & Exam Syllabus */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="bg-emerald-800 text-white px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">Answer Key & Official Syllabus</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedState('ALL');
                  setSelectedCategory('Syllabus');
                }}
                className="text-xs underline hover:text-amber-200"
              >
                View All
              </button>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {jobs
                .filter(
                  (j) =>
                    j.category === 'Syllabus' ||
                    j.category === 'Answer Key' ||
                    j.additionalCategories?.includes('Syllabus') ||
                    j.additionalCategories?.includes('Answer Key')
                )
                .slice(0, 6)
                .map((job) => (
                  <li key={job.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <button
                      type="button"
                      onClick={() => setActiveJobModal(job)}
                      className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline block w-full"
                    >
                      {job.postName} — Official Syllabus & Exam Pattern PDF
                    </button>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {job.board} · Advt: {job.advtNo}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Quiet Clean Footer */}
      <footer className="mt-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-8 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-slate-800 dark:text-slate-200">
              All India Government Job Portal
            </strong>{' '}
            — Central & 28 States + 8 Union Territories Recruitment Directory.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={resetAllFilters}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              All India Jobs
            </button>
            <button
              type="button"
              onClick={() => setIsAgeCalcOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Age Calculator
            </button>
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Admin CMS
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <JobDetailsModal
        job={activeJobModal}
        onClose={() => setActiveJobModal(null)}
        isSaved={activeJobModal ? savedJobIds.includes(activeJobModal.id) : false}
        onToggleSave={handleToggleSaveJob}
        onShareWhatsApp={(j) => handleShare(j, 'WhatsApp')}
        onShareTelegram={(j) => handleShare(j, 'Telegram')}
      />

      <AgeCalculatorModal
        isOpen={isAgeCalcOpen}
        onClose={() => setIsAgeCalcOpen(false)}
        jobs={jobs}
        onSelectJob={(job) => setActiveJobModal(job)}
      />

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        jobs={jobs}
        onSaveJob={handleSaveCmsJob}
        onDeleteJob={handleDeleteCmsJob}
        onResetDefaults={handleResetDefaultJobs}
      />
    </div>
  );
}
