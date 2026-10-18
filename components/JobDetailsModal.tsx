'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  CreditCard,
  Calculator,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileText,
  Globe,
  Bookmark,
  Share2,
  Printer,
  Award,
  BookOpen,
  Building2,
} from 'lucide-react';
import {
  JobPost,
  checkJobAgeEligibility,
  formatDisplayDate,
  isJobExpiringSoon,
  getDaysRemaining,
} from '@/lib/job-utils';
import { REFERENCE_TODAY } from '@/lib/jobs-data';

interface JobDetailsModalProps {
  job: JobPost | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onShareWhatsApp: (job: JobPost) => void;
  onShareTelegram: (job: JobPost) => void;
}

export default function JobDetailsModal({
  job,
  onClose,
  isSaved,
  onToggleSave,
  onShareWhatsApp,
  onShareTelegram,
}: JobDetailsModalProps) {
  const [dob, setDob] = useState<string>('2001-05-15');
  const [relaxationYears, setRelaxationYears] = useState<number>(0);
  const [activeActionPreview, setActiveActionPreview] = useState<
    null | 'apply' | 'pdf' | 'website'
  >(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantMobile, setApplicantMobile] = useState('');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  React.useEffect(() => {
    if (!job) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [job, onClose]);

  if (!job) return null;

  const ageCheck = checkJobAgeEligibility(
    dob,
    job.ageAsOnDate || REFERENCE_TODAY,
    job.minAge,
    job.maxAge,
    relaxationYears
  );

  const expiringSoon = isJobExpiringSoon(job.lastDate, REFERENCE_TODAY);
  const daysLeft = getDaysRemaining(job.lastDate, REFERENCE_TODAY);

  const handleQuickApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantMobile.trim()) return;
    setApplicationSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-job-title"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-slate-900 dark:text-slate-100">
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 bg-slate-900 text-white px-5 py-4 border-b border-slate-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mb-1">
              <span className="font-semibold text-amber-400">{job.board}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">Advt No: {job.advtNo}</span>
              <span aria-hidden="true">·</span>
              <span>{job.stateCode === 'ALL' ? 'All India (Central)' : `${job.stateName} (${job.stateCode})`}</span>
            </div>
            <h2
              id="modal-job-title"
              className="text-lg sm:text-xl font-bold leading-snug text-white"
            >
              {job.postName}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(job.id)}
              aria-label={isSaved ? 'Remove from Saved Jobs' : 'Save this Job'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isSaved
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>{isSaved ? 'Saved' : 'Save Job'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Job Details Modal"
              className="p-2 rounded bg-slate-800 text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Top Overview Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Vacancies</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                {job.totalVacancies.toLocaleString('en-IN')} Posts
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Category: {job.category}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Required Qualification</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                {job.qualifications.join(' / ')}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Pay Scale: {job.payScale}
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400">Share Notification</div>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => onShareWhatsApp(job)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => onShareTelegram(job)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-700 hover:bg-sky-800 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </button>
              </div>
            </div>
          </div>

          {/* Two Column Grid: Important Dates & Application Fee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Important Dates */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Important Dates</span>
                </h3>
                {expiringSoon && (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 animate-pulse">
                    Closing Soon ({daysLeft === 0 ? 'Today' : `${daysLeft}d left`})
                  </span>
                )}
              </div>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Notification Post Date:</dt>
                  <dd className="font-mono tabular-nums font-medium text-slate-900 dark:text-slate-100">
                    {formatDisplayDate(job.postDate)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Application Begin:</dt>
                  <dd className="font-mono tabular-nums font-medium text-emerald-700 dark:text-emerald-400">
                    {formatDisplayDate(job.startDate)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Last Date to Apply Online:</dt>
                  <dd className="font-mono tabular-nums font-bold text-red-600 dark:text-red-400">
                    {formatDisplayDate(job.lastDate)}
                  </dd>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-600 dark:text-slate-400">Exam / CBT Date:</dt>
                  <dd className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white text-right">
                    {job.examDate}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Application Fee */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Application Fee</span>
                </h3>
              </div>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-slate-600 dark:text-slate-400">General / OBC / EWS:</dt>
                  <dd className="tabular-nums font-semibold text-slate-900 dark:text-white text-right">
                    {job.applicationFee.generalObcEws}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-slate-600 dark:text-slate-400">SC / ST / PwBD (PH):</dt>
                  <dd className="tabular-nums font-semibold text-emerald-700 dark:text-emerald-400 text-right">
                    {job.applicationFee.scStPh}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-slate-600 dark:text-slate-400">All Category Female:</dt>
                  <dd className="tabular-nums font-medium text-slate-900 dark:text-slate-100 text-right">
                    {job.applicationFee.female}
                  </dd>
                </div>
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Payment Mode: </span>
                  {job.applicationFee.paymentMode}
                </div>
              </dl>
            </div>
          </div>

          {/* Age Limit & Built-in Interactive Age Calculator */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    Age Limit (As on {formatDisplayDate(job.ageAsOnDate)}) & Instant Eligibility Calculator
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Minimum Age: <strong className="font-mono">{job.minAge} Years</strong> · Maximum Age:{' '}
                  <strong className="font-mono">{job.maxAge} Years</strong> · {job.ageRelaxationNote}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-4">
                <label
                  htmlFor="modal-dob-input"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Enter Your Date of Birth (DOB)
                </label>
                <input
                  id="modal-dob-input"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="modal-relaxation-select"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Select Category Relaxation
                </label>
                <select
                  id="modal-relaxation-select"
                  value={relaxationYears}
                  onChange={(e) => setRelaxationYears(Number(e.target.value))}
                  className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value={0}>General / EWS (+0 Years)</option>
                  <option value={3}>OBC Non-Creamy Layer (+3 Years)</option>
                  <option value={5}>SC / ST / State Domicile (+5 Years)</option>
                  <option value={10}>PwBD / PH General (+10 Years)</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <div
                  className={`p-2.5 rounded border text-xs ${
                    ageCheck.eligible
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {ageCheck.eligible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span className="font-mono tabular-nums">
                      Exact Age: {ageCheck.years}Y {ageCheck.months}M {ageCheck.days}D
                    </span>
                  </div>
                  <div className="mt-0.5 leading-snug">{ageCheck.message}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Post-wise & Category-wise Vacancy Breakdown Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Post-wise & Category-wise Vacancy Details</span>
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3 font-semibold">Post Name / Cadre</th>
                    <th className="py-2.5 px-3 font-semibold text-right">UR / Gen</th>
                    <th className="py-2.5 px-3 font-semibold text-right">OBC</th>
                    <th className="py-2.5 px-3 font-semibold text-right">EWS</th>
                    <th className="py-2.5 px-3 font-semibold text-right">SC</th>
                    <th className="py-2.5 px-3 font-semibold text-right">ST</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono tabular-nums">
                  {job.vacancyBreakdown.length > 0 ? (
                    job.vacancyBreakdown.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                          {row.postName}
                        </td>
                        <td className="py-2.5 px-3 text-right">{row.ur.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right">{row.obc.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right">{row.ews.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right">{row.sc.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right">{row.st.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {row.total.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-3 px-3 text-center font-sans text-slate-500">
                        Total Notified Posts: {job.totalVacancies.toLocaleString('en-IN')} (Refer to official PDF for post-wise breakup)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selection Process & Exam Pattern */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Selection Process</span>
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {job.selectionProcess.map((step, i) => (
                  <li key={i} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Syllabus & Exam Pattern</span>
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {job.examPattern.map((pat, i) => (
                  <li key={i} className="leading-relaxed">
                    {pat}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Direct Important Links Table */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-2.5 text-sm font-bold">
              Direct Important Links
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Apply Online (Registration / Login Portal)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setApplicationSubmitted(false);
                      setActiveActionPreview(activeActionPreview === 'apply' ? null : 'apply');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Apply Online</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Download Official Notification PDF ({job.advtNo})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveActionPreview(activeActionPreview === 'pdf' ? null : 'pdf')
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Notification PDF</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Official Recruitment Board Website ({job.board})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveActionPreview(activeActionPreview === 'website' ? null : 'website')
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Official Website</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive In-App Action View (For Apply Online / Notification Gazette / Official Portal Info) */}
          {activeActionPreview === 'apply' && (
            <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  One-Time Registration (OTR) & Direct Application Gateway — {job.board}
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveActionPreview(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Close Panel
                </button>
              </div>
              {applicationSubmitted ? (
                <div className="p-3 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                    <span>Application Pre-Registration Saved Successfully!</span>
                  </div>
                  <p>
                    Candidate <strong>{applicantName}</strong> ({applicantMobile}) has been registered for{' '}
                    <strong>{job.postName}</strong> (Advt: {job.advtNo}). Official Portal URL:{' '}
                    <span className="font-mono underline">{job.applyOnlineUrl}</span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuickApplySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="otr-candidate-name"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Candidate Full Name (As per 10th Marksheet)
                    </label>
                    <input
                      id="otr-candidate-name"
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="otr-mobile"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Active Mobile Number / OTR ID
                    </label>
                    <input
                      id="otr-mobile"
                      type="text"
                      required
                      placeholder="10-digit Mobile Number"
                      value={applicantMobile}
                      onChange={(e) => setApplicantMobile(e.target.value)}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
                    >
                      Proceed to Application Form
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeActionPreview === 'pdf' && (
            <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-red-950 dark:text-red-200 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>OFFICIAL GAZETTE NOTIFICATION SUMMARY — {job.advtNo}</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-medium"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Recruitment Board:</strong> {job.board} · <strong>Total Posts:</strong>{' '}
                {job.totalVacancies.toLocaleString('en-IN')} · <strong>Pay Scale:</strong> {job.payScale}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Direct Notification Document Path: <span className="font-mono">{job.notificationPdfUrl}</span>
              </p>
            </div>
          )}

          {activeActionPreview === 'website' && (
            <div className="rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-bold text-blue-950 dark:text-blue-200">
                  Official Board Portal: {job.board}
                </div>
                <div className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                  {job.officialWebsiteUrl}
                </div>
              </div>
              <a
                href={job.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-700 text-white font-semibold whitespace-nowrap shrink-0"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
