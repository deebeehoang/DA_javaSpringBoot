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
  BASIC: 'bg-gray-100 text-gray-700 border-gray-200',
  INTERMEDIATE: 'bg-blue-50 text-blue-700 border-blue-200',
  ADVANCED: 'bg-purple-50 text-purple-700 border-purple-200',
  EXPERT: 'bg-orange-50 text-orange-700 border-orange-200',
};

const categoryLabel: Record<string, string> = {
  TECHNICAL: 'Kỹ thuật',
  SOFT_SKILL: 'Kỹ năng mềm',
  LANGUAGE: 'Ngoại ngữ',
  OTHER: 'Khác',
};

const categoryIcon: Record<string, string> = {
  TECHNICAL: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  SOFT_SKILL: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  LANGUAGE: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
  OTHER: 'M13 10V3L4 14h7v7l9-11h-7z',
};

const levels = ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export default function CandidateSkillsPage() {
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [allSkills, setAllSkills] = useState<SkillOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);
  const [levelPickId, setLevelPickId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const mySkillIds = new Set(skills.map((s) => s.skillId));

  const availableSkills = allSkills.filter(
    (s) => !mySkillIds.has(s.id) &&
      (searchTerm === '' || s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedAvailable = availableSkills.reduce<Record<string, SkillOption[]>>((acc, s) => {
    const cat = s.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const handlePickSkill = async (skillId: number, level: string) => {
    setAdding(skillId);
    try {
      await candidateService.addSkill(skillId, level);
      setLevelPickId(null);
      fetchData();
    } finally {
      setAdding(null);
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
        <p className="mt-1 text-sm text-gray-500">Chọn kỹ năng phù hợp để nổi bật hơn với nhà tuyển dụng</p>

        {/* My skills */}
        <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Kỹ năng đã chọn
            <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">{skills.length}</span>
          </h2>

          {skills.length === 0 ? (
            <p className="mt-4 text-center text-sm text-gray-400">Bạn chưa chọn kỹ năng nào. Hãy chọn từ danh sách bên dưới.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((s) => (
                <div key={s.skillId} className="group relative flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm transition hover:shadow-md">
                  <span className="font-medium text-gray-800">{s.skillName}</span>
                  <select
                    value={s.level}
                    onChange={(e) => handleUpdateLevel(s.skillId, e.target.value)}
                    className={`cursor-pointer rounded-full border px-1.5 py-0.5 text-[11px] font-medium ${levelColor[s.level]} focus:outline-none`}
                  >
                    {levels.map((l) => (
                      <option key={l} value={l}>{levelLabel[l]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(s.skillId)}
                    className="ml-0.5 rounded-full p-0.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    title="Xóa kỹ năng"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pick skills from list */}
        <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Chọn kỹ năng
          </h2>

          {/* Search */}
          <div className="relative mt-4">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kỹ năng..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {Object.keys(groupedAvailable).length === 0 ? (
            <p className="mt-6 text-center text-sm text-gray-400">
              {searchTerm ? 'Không tìm thấy kỹ năng phù hợp.' : 'Bạn đã chọn tất cả kỹ năng có sẵn.'}
            </p>
          ) : (
            <div className="mt-4 space-y-5">
              {['TECHNICAL', 'SOFT_SKILL', 'LANGUAGE', 'OTHER'].filter((cat) => groupedAvailable[cat]).map((cat) => (
                <div key={cat}>
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={categoryIcon[cat]} /></svg>
                    {categoryLabel[cat]}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {groupedAvailable[cat].map((s) => (
                      <div key={s.id} className="relative">
                        {levelPickId === s.id ? (
                          <div className="flex items-center gap-1 rounded-full border-2 border-blue-300 bg-blue-50 px-2 py-1 shadow-md">
                            <span className="text-xs font-medium text-blue-700">{s.name}</span>
                            <span className="mx-1 text-gray-300">|</span>
                            {levels.map((l) => (
                              <button
                                key={l}
                                onClick={() => handlePickSkill(s.id, l)}
                                disabled={adding === s.id}
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition hover:opacity-80 ${levelColor[l]}`}
                                title={levelLabel[l]}
                              >
                                {levelLabel[l]}
                              </button>
                            ))}
                            <button
                              onClick={() => setLevelPickId(null)}
                              className="ml-0.5 rounded-full p-0.5 text-gray-400 hover:text-gray-600"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setLevelPickId(s.id)}
                            disabled={adding === s.id}
                            className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            {s.name}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
