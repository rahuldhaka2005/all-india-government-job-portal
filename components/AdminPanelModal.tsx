'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  JobPost,
  JobCategory,
  QualificationType,
  ALL_STATES_AND_UTS,
  MAIN_CATEGORIES,
  QUALIFICATION_FILTERS,
} from '@/lib/job-utils';
import { REFERENCE_TODAY } from '@/lib/jobs-data';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobPost[];
  onSaveJob: (job: JobPost, isEditing: boolean) => void;
  onDeleteJob: (jobId: string) => void;
  onResetDefaults: () => void;
}

const EMPTY_FORM_STATE = {
  id: '',
  postName: '',
  board: '',
  advtNo: '',
  stateCode: 'ALL',
  category: 'All India Govt Jobs' as JobCategory,
  totalVacancies: '500',
  qualifications: ['Graduate'] as QualificationType[],
  startDate: REFERENCE_TODAY,
  lastDate: '2026-10-20',
  examDate: 'December 2026',
  minAge: '18',
  maxAge: '32',
  generalFee: 'Rs. 100/-',
  scStFee: 'Rs. 0/-',
  femaleFee: 'Rs. 0/-',
  payScale: 'Level-6 (Rs. 35,400 - Rs. 1,12,400)',
  applyOnlineUrl: 'https://ssc.gov.in',
  notificationPdfUrl: 'https://ssc.gov.in/notice.pdf',
  officialWebsiteUrl: 'https://ssc.gov.in',
  isTrendingHighlight: false,
  statusTag: 'Apply Online',
  shortSummary: '',
};

export default function AdminPanelModal({
  isOpen,
  onClose,
  jobs,
  onSaveJob,
  onDeleteJob,
  onResetDefaults,
}: AdminPanelModalProps) {
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM_STATE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [adminSearch, setAdminSearch] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEditClick = (job: JobPost) => {
    setEditingJobId(job.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFormData({
      id: job.id,
      postName: job.postName,
      board: job.board,
      advtNo: job.advtNo,
      stateCode: job.stateCode,
      category: job.category,
      totalVacancies: String(job.totalVacancies),
      qualifications: job.qualifications,
      startDate: job.startDate,
      lastDate: job.lastDate,
      examDate: job.examDate,
      minAge: String(job.minAge),
      maxAge: String(job.maxAge),
      generalFee: job.applicationFee.generalObcEws,
      scStFee: job.applicationFee.scStPh,
      femaleFee: job.applicationFee.female,
      payScale: job.payScale,
      applyOnlineUrl: job.applyOnlineUrl,
      notificationPdfUrl: job.notificationPdfUrl,
      officialWebsiteUrl: job.officialWebsiteUrl,
      isTrendingHighlight: Boolean(job.isTrendingHighlight),
      statusTag: job.statusTag || 'Apply Online',
      shortSummary: job.shortSummary,
    });
  };

  const handleResetForm = () => {
    setEditingJobId(null);
    setErrorMsg(null);
    setFormData(EMPTY_FORM_STATE);
  };

  const handleQualificationToggle = (qual: QualificationType) => {
    setFormData((prev) => {
      const exists = prev.qualifications.includes(qual);
      if (exists) {
        return {
          ...prev,
          qualifications: prev.qualifications.filter((q) => q !== qual),
        };
      }
      return {
        ...prev,
        qualifications: [...prev.qualifications, qual],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.postName.trim()) {
      setErrorMsg('Post Name is required.');
      return;
    }
    if (!formData.board.trim()) {
      setErrorMsg('Recruitment Board name is required.');
      return;
    }
    if (!formData.advtNo.trim()) {
      setErrorMsg('Advertisement Number (Advt No.) is required.');
      return;
    }
    if (formData.qualifications.length === 0) {
      setErrorMsg('Select at least one required qualification.');
      return;
    }

    const totalVac = Number(formData.totalVacancies);
    const minAgeNum = Number(formData.minAge);
    const maxAgeNum = Number(formData.maxAge);

    if (isNaN(totalVac) || totalVac < 0) {
      setErrorMsg('Total Vacancies must be a valid non-negative number.');
      return;
    }

    const stateObj = ALL_STATES_AND_UTS.find((s) => s.code === formData.stateCode);
    const stateName = stateObj ? stateObj.name : 'All India';

    const existingJob = editingJobId ? jobs.find((j) => j.id === editingJobId) : null;

    const urCount = Math.round(totalVac * 0.41);
    const obcCount = Math.round(totalVac * 0.27);
    const ewsCount = Math.round(totalVac * 0.1);
    const scCount = Math.round(totalVac * 0.15);
    const stCount = Math.max(0, totalVac - (urCount + obcCount + ewsCount + scCount));

    const newJob: JobPost = {
      id: editingJobId || `custom-job-${Date.now()}`,
      postDate: existingJob ? existingJob.postDate : REFERENCE_TODAY,
      stateCode: formData.stateCode,
      stateName,
      board: formData.board.trim(),
      advtNo: formData.advtNo.trim(),
      postName: formData.postName.trim(),
      totalVacancies: totalVac,
      qualifications: formData.qualifications,
      category: formData.category,
      additionalCategories:
        formData.category !== 'All India Govt Jobs' ? ['All India Govt Jobs'] : [],
      startDate: formData.startDate || REFERENCE_TODAY,
      lastDate: formData.lastDate || '2026-11-15',
      examDate: formData.examDate.trim() || 'Notify Soon',
      minAge: isNaN(minAgeNum) ? 18 : minAgeNum,
      maxAge: isNaN(maxAgeNum) ? 35 : maxAgeNum,
      ageAsOnDate: formData.lastDate || REFERENCE_TODAY,
      ageRelaxationNote:
        existingJob?.ageRelaxationNote ||
        'OBC: 3 Years, SC/ST: 5 Years, PwBD: 10 Years as per Government rules.',
      applicationFee: {
        generalObcEws: formData.generalFee.trim() || '₹100/-',
        scStPh: formData.scStFee.trim() || '₹0/-',
        female: formData.femaleFee.trim() || '₹0/-',
        paymentMode: 'Online via Debit Card, Credit Card, Net Banking, UPI',
      },
      vacancyBreakdown: existingJob?.vacancyBreakdown?.length
        ? existingJob.vacancyBreakdown
        : [
            {
              postName: formData.postName.trim(),
              ur: urCount,
              obc: obcCount,
              ews: ewsCount,
              sc: scCount,
              st: stCount,
              total: totalVac,
            },
          ],
      selectionProcess: existingJob?.selectionProcess || [
        'Computer Based Written Examination (CBT / OMR)',
        'Skill / Physical Test (as per post requirement)',
        'Document Verification & Medical Examination',
      ],
      examPattern: existingJob?.examPattern || [
        '100 Multiple Choice Questions | 100 Marks | 90 Minutes',
      ],
      payScale: formData.payScale.trim() || '7th CPC Pay Matrix Level-6',
      applyOnlineUrl: formData.applyOnlineUrl.trim() || 'https://india.gov.in',
      notificationPdfUrl: formData.notificationPdfUrl.trim() || 'https://india.gov.in',
      officialWebsiteUrl: formData.officialWebsiteUrl.trim() || 'https://india.gov.in',
      isTrendingHighlight: formData.isTrendingHighlight,
      highlightColor: existingJob?.highlightColor || 'crimson',
      statusTag: formData.statusTag.trim() || 'Apply Online',
      shortSummary:
        formData.shortSummary.trim() ||
        `${formData.board.trim()} official notification for ${formData.postName.trim()}.`,
    };

    onSaveJob(newJob, Boolean(editingJobId));
    setSuccessMsg(
      editingJobId
        ? `Updated "${newJob.postName}" and saved to LocalStorage.`
        : `Published "${newJob.postName}" to ${stateName} (${newJob.category}) and saved to LocalStorage.`
    );
    handleResetForm();
  };

  const filteredAdminJobs = jobs.filter((j) => {
    if (!adminSearch.trim()) return true;
    const q = adminSearch.toLowerCase();
    return (
      j.postName.toLowerCase().includes(q) ||
      j.board.toLowerCase().includes(q) ||
      j.stateCode.toLowerCase().includes(q) ||
      j.category.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cms-modal-title"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-slate-900 text-white px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 id="cms-modal-title" className="text-base sm:text-lg font-bold">
                Admin Panel (CMS) — Manage Jobs, Admit Cards & Results
              </h2>
              <p className="text-xs text-slate-400">
                Add, edit, or delete notifications across all 28 States, 8 UTs & Central Categories (Auto-saved in LocalStorage)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetDefaults();
                setSuccessMsg('Restored default pre-loaded notifications in LocalStorage.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Panel"
              className="p-2 rounded bg-slate-800 text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Add / Edit Form */}
          <div className="lg:col-span-7">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {editingJobId ? (
                    <>
                      <Pencil className="w-4 h-4 text-amber-500" />
                      <span>Edit Existing Notification</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>Publish New Govt Job / Admit Card / Result</span>
                    </>
                  )}
                </h3>
                {editingJobId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Switch to New Post
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="cms-post-name"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Post / Exam Title *
                    </label>
                    <input
                      id="cms-post-name"
                      type="text"
                      placeholder="e.g. SSC GD Constable Recruitment 2026"
                      value={formData.postName}
                      onChange={(e) => setFormData({ ...formData, postName: e.target.value })}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cms-board"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Recruitment Board / Commission *
                    </label>
                    <input
                      id="cms-board"
                      type="text"
                      placeholder="e.g. SSC / UPPSC / RPSC / RRB"
                      value={formData.board}
                      onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cms-advt-no"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Advertisement No. (Advt No) *
                    </label>
                    <input
                      id="cms-advt-no"
                      type="text"
                      placeholder="e.g. 09/2026-EXAM"
                      value={formData.advtNo}
                      onChange={(e) => setFormData({ ...formData, advtNo: e.target.value })}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cms-state"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Target State / UT
                    </label>
                    <select
                      id="cms-state"
                      value={formData.stateCode}
                      onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    >
                      {ALL_STATES_AND_UTS.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code === 'ALL' ? 'All India (Central)' : `${s.code} - ${s.name}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cms-category"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Category / Portal Section
                    </label>
                    <select
                      id="cms-category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as JobCategory })
                      }
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    >
                      {MAIN_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cms-vacancies"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Total Vacancies
                    </label>
                    <input
                      id="cms-vacancies"
                      type="number"
                      min={0}
                      value={formData.totalVacancies}
                      onChange={(e) =>
                        setFormData({ ...formData, totalVacancies: e.target.value })
                      }
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cms-last-date"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Last Date to Apply
                    </label>
                    <input
                      id="cms-last-date"
                      type="date"
                      value={formData.lastDate}
                      onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cms-min-age"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Min Age (Years)
                    </label>
                    <input
                      id="cms-min-age"
                      type="number"
                      value={formData.minAge}
                      onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cms-max-age"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Max Age (Years)
                    </label>
                    <input
                      id="cms-max-age"
                      type="number"
                      value={formData.maxAge}
                      onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cms-gen-fee"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Application Fee (Gen / OBC / EWS)
                    </label>
                    <input
                      id="cms-gen-fee"
                      type="text"
                      value={formData.generalFee}
                      onChange={(e) => setFormData({ ...formData, generalFee: e.target.value })}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cms-sc-fee"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Application Fee (SC / ST / PH)
                    </label>
                    <input
                      id="cms-sc-fee"
                      type="text"
                      value={formData.scStFee}
                      onChange={(e) => setFormData({ ...formData, scStFee: e.target.value })}
                      className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Qualifications Checkboxes */}
                <div>
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Eligible Qualifications *
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {QUALIFICATION_FILTERS.map((qual) => {
                      const active = formData.qualifications.includes(qual);
                      return (
                        <button
                          key={qual}
                          type="button"
                          onClick={() => handleQualificationToggle(qual)}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                            active
                              ? 'bg-blue-700 text-white border-blue-700'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {qual}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTrendingHighlight}
                      onChange={(e) =>
                        setFormData({ ...formData, isTrendingHighlight: e.target.checked })
                      }
                      className="rounded border-slate-300"
                    />
                    <span>Show in Top SarkariResult Highlight Boxes</span>
                  </label>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingJobId ? 'Save Changes' : 'Publish Notification'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right 5 Columns: Existing Jobs List with Edit & Delete */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Database ({jobs.length} Posts)
              </h3>
              <input
                type="search"
                aria-label="Filter jobs in Admin Panel"
                placeholder="Filter posts..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs"
              />
            </div>

            <div className="flex-1 max-h-[540px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAdminJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        [{job.stateCode}]
                      </span>{' '}
                      · {job.board} · {job.category}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {job.postName}
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      Posts: {job.totalVacancies.toLocaleString('en-IN')} · Last Date: {job.lastDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditClick(job)}
                      aria-label={`Edit ${job.postName}`}
                      className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteJob(job.id);
                        setSuccessMsg(`Deleted "${job.postName}" from LocalStorage.`);
                      }}
                      aria-label={`Delete ${job.postName}`}
                      className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
