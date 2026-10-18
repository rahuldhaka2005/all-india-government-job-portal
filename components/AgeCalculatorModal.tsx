'use client';

import React, { useState } from 'react';
import { X, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  JobPost,
  calculateExactAge,
  checkJobAgeEligibility,
} from '@/lib/job-utils';
import { REFERENCE_TODAY } from '@/lib/jobs-data';

interface AgeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobPost[];
  onSelectJob: (job: JobPost) => void;
}

export default function AgeCalculatorModal({
  isOpen,
  onClose,
  jobs,
  onSelectJob,
}: AgeCalculatorModalProps) {
  const [dob, setDob] = useState<string>('2001-07-15');
  const [asOnDate, setAsOnDate] = useState<string>(REFERENCE_TODAY);
  const [relaxation, setRelaxation] = useState<number>(0);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const exactAge = calculateExactAge(dob, asOnDate);

  // Check eligibility across top 10 jobs
  const jobEligibilityList = jobs.slice(0, 12).map((job) => {
    const check = checkJobAgeEligibility(
      dob,
      job.ageAsOnDate || asOnDate,
      job.minAge,
      job.maxAge,
      relaxation
    );
    return {
      job,
      check,
    };
  });

  const eligibleCount = jobEligibilityList.filter((item) => item.check.eligible).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-calc-modal-title"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-slate-900 dark:text-slate-100">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 text-white px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h2 id="age-calc-modal-title" className="text-lg font-bold">
              Sarkari Exam Exact Age & Eligibility Calculator
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Age Calculator"
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="standalone-dob"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Your Date of Birth (DOB)
              </label>
              <input
                id="standalone-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="standalone-ason"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Calculate Age As On Date
              </label>
              <input
                id="standalone-ason"
                type="date"
                value={asOnDate}
                onChange={(e) => setAsOnDate(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="standalone-category"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Category Relaxation
              </label>
              <select
                id="standalone-category"
                value={relaxation}
                onChange={(e) => setRelaxation(Number(e.target.value))}
                className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value={0}>UR / General / EWS (+0 Yrs)</option>
                <option value={3}>OBC (NCL) (+3 Yrs)</option>
                <option value={5}>SC / ST / Ex-SM (+5 Yrs)</option>
                <option value={10}>PwBD / PH (+10 Yrs)</option>
              </select>
            </div>
          </div>

          {/* Calculated Age Output */}
          {exactAge.isValid ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Years</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400">
                  {exactAge.years}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Months</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {exactAge.months}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Days</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {exactAge.days}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Days</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {exactAge.totalDays.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              Please select a valid Date of Birth prior to the target calculation date.
            </div>
          )}

          {/* Live Exam Eligibility Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Instant Age Eligibility Check Across Active Exams
              </h3>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                Eligible for {eligibleCount} of {jobEligibilityList.length} Checked Exams
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 px-3 font-semibold">Exam / Recruitment Post</th>
                    <th className="py-2 px-3 font-semibold">Required Age</th>
                    <th className="py-2 px-3 font-semibold">Your Age on Cut-off</th>
                    <th className="py-2 px-3 font-semibold">Status</th>
                    <th className="py-2 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {jobEligibilityList.map(({ job, check }) => (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">
                        {job.postName}
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums whitespace-nowrap">
                        {job.minAge}–{job.maxAge + relaxation} Yrs
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums whitespace-nowrap">
                        {check.years}Y {check.months}M {check.days}D
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {check.eligible ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Eligible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Not Eligible</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectJob(job);
                          }}
                          className="text-blue-700 dark:text-blue-400 hover:underline font-semibold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
