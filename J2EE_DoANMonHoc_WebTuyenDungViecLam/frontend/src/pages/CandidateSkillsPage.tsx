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

const categoryLabel: Record<string, string> = {
  TECHNICAL: 'Kỹ thuật',
  SOFT_SKILL: 'Kỹ năng mềm',
  LANGUAGE: 'Ngoại ngữ',
  OTHER: 'Khác',
};

const levels = ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/candidate/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Bảng điều khiển
      </Link>
      <h1 className="mt-1 text-2xl font-bold text-gray-800">Kỹ năng của tôi</h1>

      {/* Add skill */}
      <div className="mt-6 rounded-lg border bg-white p-5">
        <h2 className="font-semibold text-gray-700">Thêm kỹ năng</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="flex-1 rounded border px-3 py-2 text-sm"
          >
            <option value="">-- Chọn kỹ năng --</option>
            {availableSkills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({categoryLabel[s.category] ?? s.category})
              </option>
            ))}
          </select>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            {levels.map((l) => (
              <option key={l} value={l}>{levelLabel[l]}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={saving || !selectedSkill}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Đang thêm...' : 'Thêm'}
          </button>
        </div>
      </div>

      {/* Skill list */}
      {skills.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">Chưa có kỹ năng nào. Hãy thêm kỹ năng để hoàn thiện hồ sơ.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {skills.map((s) => (
            <div key={s.skillId} className="flex items-center justify-between rounded-lg border bg-white p-4">
              <div>
                <span className="font-medium text-gray-800">{s.skillName}</span>
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {categoryLabel[s.category] ?? s.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={s.level}
                  onChange={(e) => handleUpdateLevel(s.skillId, e.target.value)}
                  className="rounded border px-2 py-1 text-sm"
                >
                  {levels.map((l) => (
                    <option key={l} value={l}>{levelLabel[l]}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemove(s.skillId)}
                  className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
