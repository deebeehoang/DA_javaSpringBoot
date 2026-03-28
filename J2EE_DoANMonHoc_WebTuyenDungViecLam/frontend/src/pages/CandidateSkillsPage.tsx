import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { candidateService } from '@/services/candidateService';
import type { CandidateSkill, SkillOption } from '@/services/candidateService';

const levelLabel: Record<string, string> = {
  BASIC: 'Cơ bản',
  INTERMEDIATE: 'Trung bình',
  ADVANCED: 'Nâng cao',
  EXPERT: 'Chuyên gia',
};

const levelColor: Record<string, string> = {
  BASIC: 'bg-gray-100 text-gray-700',
  INTERMEDIATE: 'bg-blue-100 text-blue-700',
  ADVANCED: 'bg-purple-100 text-purple-700',
  EXPERT: 'bg-orange-100 text-orange-700',
};

const categoryLabel: Record<string, string> = {
  TECHNICAL: 'Kỹ thuật',
  SOFT_SKILL: 'Kỹ năng mềm',
  LANGUAGE: 'Ngoại ngữ',
  OTHER: 'Khác',
};

const levels = ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function CandidateSkillsPage() {
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [allSkills, setAllSkills] = useState<SkillOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('INTERMEDIATE');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [myRes, allRes] = await Promise.all([
        candidateService.getMySkills(),
        candidateService.getAllSkills(),
      ]);
      setSkills(myRes.data.data ?? []);
      setAllSkills(allRes.data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const availableSkills = allSkills.filter(
    (s) => !skills.some((ms) => ms.skillId === s.id)
  );

  const handleAdd = async () => {
    if (!selectedSkill) return;
    setSaving(true);
    try {
      await candidateService.addSkill(Number(selectedSkill), selectedLevel);
      setSelectedSkill('');
      setSelectedLevel('INTERMEDIATE');
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLevel = async (skillId: number, level: string) => {
    await candidateService.updateSkillLevel(skillId, level);
    setSkills((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, level } : s))
    );
  };

  const handleRemove = async (skillId: number) => {
    await candidateService.removeSkill(skillId);
    setSkills((prev) => prev.filter((s) => s.skillId !== skillId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/candidate/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Bảng điều khiển
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Kỹ năng của tôi</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý kỹ năng để nổi bật hơn với nhà tuyển dụng</p>

        {/* Add skill */}
        <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Thêm kỹ năng
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className={`flex-1 ${inputCls}`}>
              <option value="">-- Chọn kỹ năng --</option>
              {availableSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({categoryLabel[s.category] ?? s.category})
                </option>
              ))}
            </select>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className={inputCls} style={{ width: 'auto' }}>
              {levels.map((l) => (
                <option key={l} value={l}>{levelLabel[l]}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={saving || !selectedSkill}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Đang thêm...' : 'Thêm'}
            </button>
          </div>
        </div>

        {/* Skill list */}
        {skills.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <p className="mt-4 text-gray-500">Chưa có kỹ năng nào. Hãy thêm kỹ năng để hoàn thiện hồ sơ.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {skills.map((s) => (
              <div key={s.skillId} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{s.skillName}</span>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {categoryLabel[s.category] ?? s.category}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelColor[s.level] ?? 'bg-gray-100 text-gray-600'}`}>
                        {levelLabel[s.level] ?? s.level}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={s.level}
                    onChange={(e) => handleUpdateLevel(s.skillId, e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {levels.map((l) => (
                      <option key={l} value={l}>{levelLabel[l]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(s.skillId)}
                    className="rounded-lg border border-red-200 p-1.5 text-red-500 transition hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
