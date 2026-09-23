import React, { useState } from 'react';
import { HITU_PRESETS } from '../data/surveyTemplates';
import { SurveyDocument, SurveyPresetTemplate } from '../types/survey';
import {
  Sparkles,
  FileSpreadsheet,
  Settings,
  History,
  Check,
  ChevronRight,
  Send,
  Loader2,
  RefreshCw,
  FolderOpen,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface AdministrativeControlPanelProps {
  currentSurvey: SurveyDocument;
  onSelectSurvey: (survey: SurveyDocument) => void;
  onGenerateAI: (params: {
    topic: string;
    surveyType: string;
    targetAudience: string;
    purpose: string;
    questionCount: string;
    customRequirements: string;
  }) => Promise<void>;
  isGenerating: boolean;
  onOpenMasterPrompt: () => void;
  onOpenEditor: () => void;
  savedSurveys: { id: string; title: string; createdAt: string; data: SurveyDocument }[];
  onLoadSavedSurvey: (survey: SurveyDocument) => void;
  onSaveCurrentSurvey: () => void;
}

export const AdministrativeControlPanel: React.FC<AdministrativeControlPanelProps> = ({
  currentSurvey,
  onSelectSurvey,
  onGenerateAI,
  isGenerating,
  onOpenMasterPrompt,
  onOpenEditor,
  savedSurveys,
  onLoadSavedSurvey,
  onSaveCurrentSurvey,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(HITU_PRESETS[0].id);
  const [activeTab, setActiveTab] = useState<'presets' | 'ai_form' | 'saved'>('presets');

  // AI Form inputs
  const [topic, setTopic] = useState<string>(HITU_PRESETS[0].defaultTopic);
  const [surveyType, setSurveyType] = useState<string>('Khảo sát Đời sống & Nhà trọ Sinh viên');
  const [targetAudience, setTargetAudience] = useState<string>(HITU_PRESETS[0].defaultTarget);
  const [purpose, setPurpose] = useState<string>(HITU_PRESETS[0].defaultPurpose);
  const [questionCount, setQuestionCount] = useState<string>('15-20');
  const [customRequirements, setCustomRequirements] = useState<string>(
    'Thang đo Likert 5 mức chuẩn, bảng ma trận đánh giá đẹp, câu hỏi nhân khẩu học và câu hỏi tự luận mở thực tiễn.'
  );

  const handleSelectPreset = (preset: SurveyPresetTemplate) => {
    setSelectedPresetId(preset.id);
    setTopic(preset.defaultTopic);
    setSurveyType(preset.category);
    setTargetAudience(preset.defaultTarget);
    setPurpose(preset.defaultPurpose);
    onSelectSurvey(preset.sampleData);
  };

  const handleApplyPresetToForm = (preset: SurveyPresetTemplate) => {
    setSelectedPresetId(preset.id);
    setTopic(preset.defaultTopic);
    setSurveyType(preset.category);
    setTargetAudience(preset.defaultTarget);
    setPurpose(preset.defaultPurpose);
    setActiveTab('ai_form');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateAI({
      topic,
      surveyType,
      targetAudience,
      purpose,
      questionCount,
      customRequirements,
    });
  };

  const quickIdeas = [
    {
      label: 'Khảo sát tình hình thuê nhà trọ của Sinh viên HITU',
      topic: 'Khảo sát tình hình thuê nhà trọ và điều kiện sống của sinh viên',
      target: 'Sinh viên các khóa thuộc Trường Đại học Công nghiệp và Thương mại Hà Nội (HITU)',
      purpose: 'Nắm bắt thực trạng chỗ ở, chi phí và mức độ an toàn để đề xuất chính sách hỗ trợ sinh viên',
      type: 'Khảo sát Đời sống & Nhà trọ Sinh viên',
    },
    {
      label: 'Khảo sát Doanh nghiệp về nhu cầu nhân lực & sinh viên HITU',
      topic: 'Khảo sát Doanh nghiệp về nhu cầu nhân lực và mức độ đáp ứng của người học/sinh viên',
      target: 'Cơ quan, Doanh nghiệp và Người sử dụng lao động',
      purpose: 'Tăng cường sự gắn kết giữa cơ sở giáo dục và doanh nghiệp, cải tiến chương trình đào tạo',
      type: 'Khảo sát Doanh nghiệp & Tuyển dụng',
    },
    {
      label: 'Đánh giá chất lượng dịch vụ Căn tin & Nhà ăn HITU',
      topic: 'Đánh giá chất lượng dịch vụ ăn uống và an toàn thực phẩm tại Căn tin trường HITU',
      target: 'Cán bộ, Giảng viên và Sinh viên HITU',
      purpose: 'Nâng cao chất lượng phục vụ, thực đơn và vệ sinh an toàn thực phẩm tại Căn tin',
      type: 'Khảo sát Cơ sở vật chất & Dịch vụ',
    },
    {
      label: 'Nghiên cứu động lực học tập và NCKH sinh viên HITU',
      topic: 'Nghiên cứu các nhân tố ảnh hưởng đến động lực học tập và kết quả nghiên cứu khoa học của sinh viên HITU',
      target: 'Sinh viên các khoa ngành thuộc Trường Đại học Công nghiệp và Thương mại Hà Nội',
      purpose: 'Thu thập số liệu thực nghiệm phục vụ đề tài nghiên cứu khoa học cấp Trường của Nhóm ĐHQL2-K10',
      type: 'Khảo sát Nghiên cứu khoa học & Luận văn',
    },
  ];

  const handleSelectQuickIdea = (idea: typeof quickIdeas[0]) => {
    setTopic(idea.topic);
    setTargetAudience(idea.target);
    setPurpose(idea.purpose);
    setSurveyType(idea.type);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden no-print">
      {/* Panel Tab Switcher */}
      <div className="bg-gradient-to-r from-[#0a3678] via-[#0d47a1] to-[#002171] text-white p-2 flex items-center gap-1.5 border-b-2 border-amber-400">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#0a3678] shadow-md'
              : 'text-blue-100 hover:text-white hover:bg-white/10'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Mẫu Chuẩn HITU ({HITU_PRESETS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_form')}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'ai_form'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#0a3678] shadow-md'
              : 'text-blue-100 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Tạo Bằng AI</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#0a3678] shadow-md'
              : 'text-blue-100 hover:text-white hover:bg-white/10'
          }`}
          title="Lịch sử phiếu đã lưu"
        >
          <History className="w-3.5 h-3.5" />
          <span>Đã lưu ({savedSurveys.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: PRESET CATALOG */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Chọn Kiểu Phiếu Khảo Sát
                </h3>
                <p className="text-xs text-slate-500">
                  Nhóm ĐHQL2-K10 thiết kế chuẩn theo Nghị định 30/2020/NĐ-CP
                </p>
              </div>
              <button
                onClick={onOpenEditor}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
              >
                Sửa chi tiết
              </button>
            </div>

            <div className="space-y-2">
              {HITU_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border transition cursor-pointer relative group ${
                      isSelected
                        ? 'bg-red-50/70 border-red-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-white hover:border-slate-300 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {preset.category}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Check className="w-3 h-3" /> Đang xem
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                          {preset.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyPresetToForm(preset);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-xs text-slate-600 hover:text-red-700 p-1 rounded transition flex-shrink-0 cursor-pointer"
                        title="Dùng thông tin này để AI tùy biến thêm"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={onSaveCurrentSurvey}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Lưu bản này vào bộ nhớ</span>
              </button>
              <button
                onClick={onOpenMasterPrompt}
                className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Xem Master Prompt</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: AI FORM GENERATOR */}
        {activeTab === 'ai_form' && (
          <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs sm:text-sm">
            <div className="bg-gradient-to-r from-red-50 to-amber-50 p-3 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-red-700 animate-pulse" />
                <span className="font-bold text-red-950 text-xs uppercase tracking-wide">
                  Trợ Lý AI Soạn Thảo Văn Bản Hành Chính
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Chỉ cần nhập chủ đề và yêu cầu, AI (Gemini 3.8 Flash) sẽ tự động xây dựng phiếu khảo sát hoàn chỉnh theo Nghị định 30/2020/NĐ-CP.
              </p>
            </div>

            {/* Quick suggestions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Gợi ý chủ đề nhanh (Click để điền tự động):</span>
              </label>
              <div className="flex flex-col gap-1.5">
                {quickIdeas.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickIdea(idea)}
                    className="text-[11px] bg-slate-100 hover:bg-red-50 hover:border-red-300 hover:text-red-900 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 text-left transition cursor-pointer flex items-center justify-between group"
                  >
                    <span className="font-semibold">{idea.label}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-red-700 font-mono">Chọn &rarr;</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                1. Chủ đề / Tên đề tài khảo sát (*):
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => {
                  const val = e.target.value;
                  setTopic(val);
                  if (/thuê nhà|nhà trọ|phòng trọ|ở trọ|chỗ ở/i.test(val)) {
                    setTargetAudience('Sinh viên Trường Đại học Công nghiệp và Thương mại Hà Nội (HITU)');
                    setSurveyType('Khảo sát Đời sống & Nhà trọ Sinh viên');
                  } else if (/doanh nghiệp|tuyển dụng|người sử dụng lao động/i.test(val)) {
                    setTargetAudience('Cơ quan, Doanh nghiệp và Người sử dụng lao động');
                    setSurveyType('Khảo sát Doanh nghiệp & Tuyển dụng');
                  }
                }}
                placeholder="Ví dụ: Khảo sát tình hình thuê nhà của sinh viên HITU..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-red-700 focus:outline-none bg-white text-xs sm:text-sm"
                required
              />
            </div>

            {/* Survey Type & Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Thể loại khảo sát:
                </label>
                <select
                  value={surveyType}
                  onChange={(e) => setSurveyType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs font-medium"
                >
                  <option value="Khảo sát Đời sống & Nhà trọ Sinh viên">Khảo sát Đời sống & Nhà trọ Sinh viên</option>
                  <option value="Khảo sát Doanh nghiệp & Tuyển dụng">Khảo sát Doanh nghiệp & Tuyển dụng</option>
                  <option value="Khảo sát Nghiên cứu khoa học & Luận văn">Khảo sát Nghiên cứu khoa học & Luận văn</option>
                  <option value="Khảo sát Cơ sở vật chất & Dịch vụ">Khảo sát Cơ sở vật chất & Căn tin, KTX</option>
                  <option value="Khảo sát Đào tạo & Giảng dạy">Khảo sát Đào tạo & Giảng dạy</option>
                  <option value="Khảo sát Khác (Tùy chỉnh)">Khảo sát Khác (Tùy chỉnh)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Đối tượng khảo sát:
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Sinh viên, Giảng viên, Doanh nghiệp..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs font-medium"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                4. Mục đích khảo sát:
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Thu thập số liệu thực nghiệm phục vụ đề tài nghiên cứu..."
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs"
              />
            </div>

            {/* Question Count & Special requirements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  5. Số lượng câu:
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs"
                >
                  <option value="10-12">Ngắn gọn (10-12)</option>
                  <option value="15-20">Tiêu chuẩn (15-20)</option>
                  <option value="25-30">Chuyên sâu (25-30)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  6. Yêu cầu đặc biệt:
                </label>
                <input
                  type="text"
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  placeholder="Thang đo Likert 5 mức, bảng ma trận..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0a3678] via-[#0d47a1] to-[#002171] hover:from-[#0d47a1] hover:to-[#0a3678] active:from-[#002171] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg border-2 border-amber-400 transition disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>AI đang thiết kế bảng hỏi chuẩn hành chính...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Khởi Tạo Phiếu Khảo Sát Bằng AI</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: SAVED SURVEYS */}
        {activeTab === 'saved' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-bold text-sm text-slate-900">
                Các Bản Khảo Sát Đã Lưu ({savedSurveys.length})
              </h3>
              <button
                onClick={onSaveCurrentSurvey}
                className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2.5 py-1 rounded font-semibold transition cursor-pointer"
              >
                + Lưu bản hiện tại
              </button>
            </div>

            {savedSurveys.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <History className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Chưa có bản khảo sát nào được lưu trong bộ nhớ.</p>
                <p className="text-[11px] text-slate-400">
                  Nhấn "Lưu bản hiện tại" để lưu giữ kết quả nghiên cứu của bạn!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedSurveys.map((saved) => (
                  <div
                    key={saved.id}
                    onClick={() => onLoadSavedSurvey(saved.data)}
                    className="p-3 bg-slate-50 hover:bg-red-50/50 border border-slate-200 hover:border-red-300 rounded-xl transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                        {saved.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {saved.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">
                      {saved.data.subtitle || saved.data.introduction.slice(0, 70)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
        ĐHQL2-K10 • Trường Đại học Công nghiệp và Thương mại Hà Nội (HITU)
      </div>
    </div>
  );
};
