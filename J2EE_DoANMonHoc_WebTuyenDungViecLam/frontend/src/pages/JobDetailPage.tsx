import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '@/services/jobService';
import { applicationService } from '@/services/applicationService';
import { candidateService } from '@/services/candidateService';
import { profileService } from '@/services/profileService';
import { uploadService } from '@/services/uploadService';
import { reviewService } from '@/services/reviewService';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/context/AuthContext';
import type { Job, CandidateProfile, Review, EmployerRating } from '@/types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time', INTERNSHIP: 'Thực tập', FREELANCE: 'Freelance',
};

const jobLevelLabels: Record<string, string> = {
  INTERN: 'Thực tập sinh', FRESHER: 'Fresher', JUNIOR: 'Junior', SENIOR: 'Senior', MANAGER: 'Quản lý', ANY: 'Tất cả',
};

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(0) + ' triệu' : n.toLocaleString();
  if (min && max) return `${fmt(min)} - ${fmt(max)} VNĐ`;
  if (min) return `Từ ${fmt(min)} VNĐ`;
  return `Đến ${fmt(max!)} VNĐ`;
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState<'cv' | 'review'>('cv');
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedCvUrl, setSelectedCvUrl] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');

  // Review state
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [employerRating, setEmployerRating] = useState<EmployerRating | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0);

  // Map
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    jobService
      .getById(Number(id))
      .then((res) => setJob(res.data.data!))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (user?.role === 'CANDIDATE' && id) {
      candidateService.checkSaved(Number(id)).then((res) => setSaved(res.data.data ?? false)).catch(() => {});
      applicationService.checkApplied(Number(id)).then((res) => setHasApplied(res.data.data ?? false)).catch(() => {});
      reviewService.checkReviewed(Number(id)).then((res) => setHasReviewed(res.data.data ?? false)).catch(() => {});
    }
  }, [id, user]);

  // Load employer rating & reviews
  useEffect(() => {
    if (job?.employer?.id) {
      reviewService.getEmployerRating(job.employer.id).then((res) => setEmployerRating(res.data.data ?? null)).catch(() => {});
    }
  }, [job?.employer?.id]);

  useEffect(() => {
    if (job?.employer?.id) {
      reviewService.getByEmployer(job.employer.id, reviewsPage, 5).then((res) => {
        const pageData = res.data.data as any;
        setReviews(pageData?.content ?? []);
        setReviewsTotalPages(pageData?.totalPages ?? 0);
      }).catch(() => {});
    }
  }, [job?.employer?.id, reviewsPage]);

  // Resolve map coordinates: use saved lat/lng or geocode the location
  useEffect(() => {
    if (!job) return;
    if (job.latitude && job.longitude) {
      setMapCoords({ lat: job.latitude, lng: job.longitude });
    } else if (job.location) {
      axiosInstance.get('/mapbox/geocode', { params: { q: job.location } })
        .then((res) => {
          const features = res.data.data ?? [];
          if (features.length > 0 && features[0].center) {
            setMapCoords({ lng: features[0].center[0], lat: features[0].center[1] });
          }
        })
        .catch(() => {});
    }
  }, [job?.latitude, job?.longitude, job?.location]);

  // Initialize map when coordinates are available
  useEffect(() => {
    if (!mapCoords || !mapContainerRef.current) return;
    if (mapRef.current) return;

    axiosInstance.get('/mapbox/token').then((res) => {
      const token = res.data.data;
      if (!token || !mapContainerRef.current) return;

      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [mapCoords.lng, mapCoords.lat],
        zoom: 14,
        interactive: true,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      new mapboxgl.Marker({ color: '#2563eb' })
        .setLngLat([mapCoords.lng, mapCoords.lat])
        .setPopup(new mapboxgl.Popup().setHTML(
          `<div style="font-size:13px"><strong>${job?.title ?? ''}</strong><br/><span style="color:#6b7280">${job?.location ?? ''}</span></div>`
        ))
        .addTo(map);

      mapRef.current = map;
    }).catch(() => {});

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapCoords, job?.title, job?.location]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const toggleSave = async () => {
    if (!id) return;
    try {
      if (saved) {
        await candidateService.unsaveJob(Number(id));
        setSaved(false);
      } else {
        await candidateService.saveJob(Number(id));
        setSaved(true);
      }
    } catch { /* ignore */ }
  };

  const openApplyModal = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowApplyModal(true);
    setApplyStep('cv');
    setCoverLetter('');
    setCvFile(null);
    setSelectedCvUrl('');
    setMessage('');
    try {
      const res = await profileService.getCandidateProfile();
      const profile = res.data.data!;
      setCandidateProfile(profile);
      if (profile.cvUrl) {
        setSelectedCvUrl(profile.cvUrl);
      }
    } catch {
      setCandidateProfile(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!id) return;
    setSubmittingReview(true);
    try {
      await reviewService.create({ jobId: Number(id), rating: reviewRating, comment: reviewComment });
      setHasReviewed(true);
      setShowReviewForm(false);
      setReviewComment('');
      setToast('Đánh giá đã được gửi thành công!');
      // Refresh reviews & rating
      if (job?.employer?.id) {
        reviewService.getEmployerRating(job.employer.id).then((res) => setEmployerRating(res.data.data ?? null));
        reviewService.getByEmployer(job.employer.id, 0, 5).then((res) => {
          const pageData = res.data.data as any;
          setReviews(pageData?.content ?? []);
          setReviewsTotalPages(pageData?.totalPages ?? 0);
          setReviewsPage(0);
        });
      }
    } catch (err: any) {
      setToast(err.response?.data?.message ?? 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCvUpload = async (file: File) => {
    setCvFile(file);
    setUploading(true);
    try {
      const res = await uploadService.uploadCV(file);
      const url = res.data.data?.url ?? '';
      setSelectedCvUrl(url);
    } catch {
      setMessage('Upload CV thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!id || !selectedCvUrl) {
      setMessage('Vui lòng chọn hoặc upload CV trước khi ứng tuyển.');
      return;
    }
    setApplying(true);
    setMessage('');
    try {
      await applicationService.apply({ jobId: Number(id), coverLetter, cvUrl: selectedCvUrl });
      setShowApplyModal(false);
      setHasApplied(true);
      setToast('Nộp đơn thành công! Kiểm tra email để xem xác nhận.');
    } catch (err: any) {
      setMessage(err.response?.data?.message ?? 'Có lỗi xảy ra khi ứng tuyển');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-blue-200 transition hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Quay lại danh sách
          </Link>

          <div className="mt-4 flex items-start gap-5">
            {job.employer?.logoUrl ? (
              <img src={job.employer.logoUrl} alt="" className="h-16 w-16 rounded-xl border-2 border-white/20 bg-white object-contain" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-2xl font-bold text-white backdrop-blur">
                {job.employer?.companyName?.[0] ?? 'C'}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white md:text-3xl">{job.title}</h1>
              <p className="mt-1 flex items-center gap-2 text-lg text-blue-200">
                {job.employer?.companyName}
                {employerRating && employerRating.totalReviews > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/20 px-2.5 py-0.5 text-xs font-medium text-yellow-200 backdrop-blur">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    {employerRating.averageRating.toFixed(1)} ({employerRating.totalReviews})
                  </span>
                )}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {jobTypeLabels[job.jobType] ?? job.jobType}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {jobLevelLabels[job.jobLevel] ?? job.jobLevel}
                </span>
                {job.city && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.city}
                  </span>
                )}
                <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-medium text-green-200 backdrop-blur">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Mô tả công việc
              </h2>
              <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">{job.description}</div>
            </section>

            {job.requirements && (
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  Yêu cầu
                </h2>
                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">{job.requirements}</div>
              </section>
            )}

            {job.benefits && (
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                  Quyền lợi
                </h2>
                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">{job.benefits}</div>
              </section>
            )}

            {/* Review Form for Candidates */}
            {user?.role === 'CANDIDATE' && hasApplied && !hasReviewed && (
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  Đánh giá nhà tuyển dụng
                </h2>
                {!showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mt-4 w-full rounded-xl border-2 border-dashed border-yellow-300 bg-yellow-50 py-3 text-sm font-medium text-yellow-700 transition hover:border-yellow-400 hover:bg-yellow-100"
                  >
                    Viết đánh giá cho {job.employer?.companyName}
                  </button>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Đánh giá sao</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="transition hover:scale-110"
                          >
                            <svg
                              className={`h-8 w-8 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill={star <= reviewRating ? 'currentColor' : 'none'}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Nhận xét</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn với nhà tuyển dụng này..."
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="flex-1 rounded-xl bg-yellow-500 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-50"
                      >
                        {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {user?.role === 'CANDIDATE' && hasReviewed && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Bạn đã đánh giá nhà tuyển dụng cho công việc này
                </div>
              </div>
            )}

            {/* Employer Reviews */}
            {reviews.length > 0 && (
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  Đánh giá từ ứng viên
                  {employerRating && (
                    <span className="ml-auto text-sm font-normal text-gray-500">
                      {employerRating.averageRating.toFixed(1)}/5 ({employerRating.totalReviews} đánh giá)
                    </span>
                  )}
                </h2>
                <div className="mt-4 space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        {review.candidate.avatarUrl ? (
                          <img src={review.candidate.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            {review.candidate.fullName?.[0] ?? 'U'}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{review.candidate.fullName}</p>
                          <p className="text-xs text-gray-500">{review.job.title}</p>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="mt-2 flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} className={`h-4 w-4 ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
                {reviewsTotalPages > 1 && (
                  <div className="mt-4 flex justify-center gap-1">
                    <button disabled={reviewsPage === 0} onClick={() => setReviewsPage(reviewsPage - 1)}
                      className="rounded-lg px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-100 disabled:opacity-40">Trước</button>
                    <span className="px-3 py-1.5 text-xs text-gray-500">{reviewsPage + 1}/{reviewsTotalPages}</span>
                    <button disabled={reviewsPage >= reviewsTotalPages - 1} onClick={() => setReviewsPage(reviewsPage + 1)}
                      className="rounded-lg px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-100 disabled:opacity-40">Sau</button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Info Card */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-gray-900">Thông tin chung</h3>
              <div className="mt-4 space-y-3">
                {[
                  { icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Loại công việc', value: jobTypeLabels[job.jobType] ?? job.jobType },
                  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Cấp bậc', value: jobLevelLabels[job.jobLevel] ?? job.jobLevel },
                  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Số vị trí', value: `${job.positions} người` },
                  { icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Lượt xem', value: `${job.views}` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-medium text-gray-900">{value}</p>
                    </div>
                  </div>
                ))}
                {job.category && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Danh mục</p>
                      <p className="text-sm font-medium text-gray-900">{job.category.name}</p>
                    </div>
                  </div>
                )}
                {job.deadline && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Hạn nộp hồ sơ</p>
                      <p className="text-sm font-medium text-red-600">{new Date(job.deadline).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Location */}
            {mapCoords && (
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-6 pt-5 pb-3">
                  <h3 className="flex items-center gap-2 font-bold text-gray-900">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Vị trí trên bản đồ
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">{job.location}</p>
                </div>
                <div ref={mapContainerRef} className="h-56 w-full" />
              </div>
            )}

            {/* Apply Section */}
            {user?.role === 'CANDIDATE' && (
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
                <button
                  onClick={toggleSave}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition ${
                    saved
                      ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <svg className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  {saved ? 'Đã lưu' : 'Lưu tin này'}
                </button>

                {job.status === 'OPEN' && (
                  hasApplied ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-sm font-semibold text-green-700 border border-green-200">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Bạn đã ứng tuyển công việc này
                    </div>
                  ) : (
                    <button
                      onClick={openApplyModal}
                      className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                    >
                      Ứng tuyển ngay
                    </button>
                  )
                )}
              </div>
            )}

            {/* Apply Section for non-logged-in users */}
            {!user && job.status === 'OPEN' && (
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                >
                  Đăng nhập để ứng tuyển
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-green-600 px-5 py-3.5 text-sm font-medium text-white shadow-2xl animate-[slideUp_0.3s_ease-out]">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {toast}
          <button onClick={() => setToast('')} className="ml-2 text-green-200 hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && job && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowApplyModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Ứng tuyển</h2>
                <p className="text-sm text-gray-500">{job.title} - {job.employer?.companyName}</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3">
              <div className={`flex items-center gap-2 text-sm font-medium ${applyStep === 'cv' ? 'text-blue-600' : 'text-green-600'}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${applyStep === 'cv' ? 'bg-blue-600' : 'bg-green-500'}`}>
                  {applyStep === 'cv' ? '1' : '✓'}
                </span>
                Chọn CV
              </div>
              <div className="h-px flex-1 bg-gray-200" />
              <div className={`flex items-center gap-2 text-sm font-medium ${applyStep === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${applyStep === 'review' ? 'bg-blue-600' : 'bg-gray-300'}`}>2</span>
                Xác nhận
              </div>
            </div>

            {/* Modal Body */}
            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              {message && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{message}</div>
              )}

              {/* Step 1: CV Selection */}
              {applyStep === 'cv' && (
                <div className="space-y-4">
                  {/* Existing CV */}
                  {candidateProfile?.cvUrl && (
                    <div
                      onClick={() => { setSelectedCvUrl(candidateProfile.cvUrl!); setCvFile(null); }}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                        selectedCvUrl === candidateProfile.cvUrl && !cvFile
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Dùng CV có sẵn</p>
                          <p className="text-xs text-gray-500">CV đã upload trong hồ sơ cá nhân</p>
                        </div>
                        {selectedCvUrl === candidateProfile.cvUrl && !cvFile && (
                          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                      <a href={candidateProfile.cvUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        onClick={(e) => e.stopPropagation()}>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Xem trước CV
                      </a>
                    </div>
                  )}

                  {/* Upload new CV */}
                  <div className={`rounded-xl border-2 border-dashed p-4 transition ${cvFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Upload CV mới</p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX - Tối đa 10MB</p>
                      </div>
                    </div>
                    {cvFile && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {cvFile.name}
                      </div>
                    )}
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      Chọn file
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleCvUpload(f);
                        }}
                      />
                    </label>
                    {uploading && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        Đang upload...
                      </div>
                    )}
                  </div>

                  {!candidateProfile?.cvUrl && !cvFile && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Bạn chưa có CV trong hồ sơ. Vui lòng upload CV để ứng tuyển.
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Review & Confirm */}
              {applyStep === 'review' && (
                <div className="space-y-4">
                  {/* CV Preview */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">CV đính kèm</p>
                    <div className="mt-2 flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <a href={selectedCvUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        {cvFile ? cvFile.name : 'CV có sẵn'}
                      </a>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thư giới thiệu</label>
                    <textarea
                      placeholder="Viết đôi dòng giới thiệu bản thân và lý do ứng tuyển (không bắt buộc)..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={5}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Profile summary */}
                  {candidateProfile && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Thông tin ứng viên</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-700">
                        <p><span className="text-gray-500">Họ tên:</span> {candidateProfile.user.fullName}</p>
                        <p><span className="text-gray-500">Email:</span> {candidateProfile.user.email}</p>
                        {candidateProfile.user.phone && <p><span className="text-gray-500">SĐT:</span> {candidateProfile.user.phone}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              {applyStep === 'cv' ? (
                <>
                  <button onClick={() => setShowApplyModal(false)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedCvUrl) {
                        setMessage('Vui lòng chọn hoặc upload CV trước.');
                        return;
                      }
                      setMessage('');
                      setApplyStep('review');
                    }}
                    disabled={uploading}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    Tiếp tục
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setApplyStep('cv')} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                    Quay lại
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    disabled={applying}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {applying ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Đang gửi...
                      </span>
                    ) : 'Xác nhận ứng tuyển'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
