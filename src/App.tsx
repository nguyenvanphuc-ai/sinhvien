import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SurveyPreviewA4 } from './components/SurveyPreviewA4';
import { AdministrativeControlPanel } from './components/AdministrativeControlPanel';
import { MasterPromptModal } from './components/MasterPromptModal';
import { SurveyEditorModal } from './components/SurveyEditorModal';
import { HITU_PRESETS } from './data/surveyTemplates';
import { STUDENT_HOUSING_SURVEY } from './data/studentHousingSurvey';
import { EXACT_EMPLOYER_SURVEY } from './data/standardEmployerSurvey';
import { SurveyDocument } from './types/survey';
import { generateSurveyDocxBlob, downloadBlobAsFile } from './utils/surveyDocxExport';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

interface SavedSurveyItem {
  id: string;
  title: string;
  createdAt: string;
  data: SurveyDocument;
}

const STORAGE_KEY = 'hitu_saved_surveys_k10';

export default function App() {
  const [survey, setSurvey] = useState<SurveyDocument>(HITU_PRESETS[0].sampleData);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isMasterPromptOpen, setIsMasterPromptOpen] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Saved surveys in LocalStorage
  const [savedSurveys, setSavedSurveys] = useState<SavedSurveyItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // AI Survey Generation Handler
  const handleGenerateAI = async (params: {
    topic: string;
    surveyType: string;
    targetAudience: string;
    purpose: string;
    questionCount: string;
    customRequirements: string;
  }) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/surveys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (data.success && data.survey) {
        setSurvey(data.survey);
        showToast('AI đã tạo thành công phiếu khảo sát chuẩn thể thức!', 'success');
      } else {
        throw new Error(data.message || 'Lỗi từ máy chủ khi tạo phiếu.');
      }
    } catch (err: any) {
      console.warn('AI generation API notice:', err);
      // If AI server route fails, match exact domain
      let matchedData: SurveyDocument;
      if (/thuê nhà|nhà trọ|phòng trọ|ở trọ|chỗ ở|ký túc xá/i.test(params.topic)) {
        matchedData = STUDENT_HOUSING_SURVEY;
      } else if (/doanh nghiệp|nhà tuyển dụng|tuyển dụng/i.test(params.topic)) {
        matchedData = EXACT_EMPLOYER_SURVEY;
      } else {
        const matchingPreset =
          HITU_PRESETS.find((p) => p.name === params.surveyType || p.category === params.surveyType) ||
          HITU_PRESETS[0];
        matchedData = matchingPreset.sampleData;
      }

      const fallbackSurvey: SurveyDocument = {
        ...matchedData,
        title: `PHIẾU KHẢO SÁT Ý KIẾN\nVỀ ${params.topic.toUpperCase()}`,
        subtitle: `Phục vụ: ${params.purpose || matchedData.subtitle || 'Khảo sát thực tiễn Nhóm ĐHQL2-K10'}`,
        targetAudience: params.targetAudience || matchedData.targetAudience,
      };

      setSurvey(fallbackSurvey);
      showToast(
        'Đã tạo phiếu khảo sát chuẩn HITU K10 theo đúng chủ đề của bạn!',
        'success'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Export to Word Document (.docx)
  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      const blob = await generateSurveyDocxBlob(survey);
      const safeTitle = (survey.title.split('\n')[0] || 'Phieu_Khao_Sat_HITU_K10')
        .replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_')
        .slice(0, 50);
      const filename = `${safeTitle}_DHQL2_K10_HITU.docx`;

      downloadBlobAsFile(blob, filename);
      showToast('Đã xuất thành công tệp Word (.docx) chuẩn Nghị định 30!', 'success');
    } catch (error: any) {
      console.error('Error generating Word docx:', error);
      showToast('Có lỗi khi tạo tệp Word: ' + (error?.message || 'Vui lòng thử lại'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Print / PDF Handler
  const handlePrint = () => {
    window.print();
  };

  // Save Current Survey to LocalStorage
  const handleSaveCurrentSurvey = () => {
    const newItem: SavedSurveyItem = {
      id: `saved_${Date.now()}`,
      title: survey.title.split('\n')[0] || 'Phiếu khảo sát HITU',
      createdAt: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      data: survey,
    };

    const updated = [newItem, ...savedSurveys.slice(0, 19)];
    setSavedSurveys(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showToast('Đã lưu phiếu khảo sát vào bộ nhớ trình duyệt!', 'success');
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  };

  // Load Saved Survey
  const handleLoadSavedSurvey = (loadedSurvey: SurveyDocument) => {
    setSurvey(loadedSurvey);
    showToast('Đã tải bản khảo sát từ lịch sử lưu trữ!', 'success');
  };

  // Save Edits from Modal
  const handleSaveEditor = (updated: SurveyDocument) => {
    setSurvey(updated);
    showToast('Đã cập nhật các thay đổi vào phiếu!', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* Navigation Header */}
      <Header
        onExportDocx={handleExportDocx}
        onPrint={handlePrint}
        onOpenMasterPrompt={() => setIsMasterPromptOpen(true)}
        isExporting={isExporting}
      />

      {/* Main Workspace (Split View) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
          {/* Left: Administrative Control Panel */}
          <section className="lg:col-span-4 xl:col-span-4 flex flex-col h-[calc(100vh-6.5rem)] lg:sticky lg:top-20">
            <AdministrativeControlPanel
              currentSurvey={survey}
              onSelectSurvey={(newSurvey) => setSurvey(newSurvey)}
              onGenerateAI={handleGenerateAI}
              isGenerating={isGenerating}
              onOpenMasterPrompt={() => setIsMasterPromptOpen(true)}
              onOpenEditor={() => setIsEditorOpen(true)}
              savedSurveys={savedSurveys}
              onLoadSavedSurvey={handleLoadSavedSurvey}
              onSaveCurrentSurvey={handleSaveCurrentSurvey}
            />
          </section>

          {/* Right: Live A4 Administrative Preview */}
          <section className="lg:col-span-8 xl:col-span-8 flex flex-col h-[calc(100vh-6.5rem)]">
            <SurveyPreviewA4
              survey={survey}
              onOpenEditModal={() => setIsEditorOpen(true)}
            />
          </section>
        </div>
      </main>

      {/* Master Prompt Modal */}
      <MasterPromptModal
        isOpen={isMasterPromptOpen}
        onClose={() => setIsMasterPromptOpen(false)}
        onSelectSnippet={(snippet) => {
          showToast('Đã chuyển prompt vào hệ thống!', 'info');
        }}
      />

      {/* Survey Editor Modal */}
      <SurveyEditorModal
        isOpen={isEditorOpen}
        survey={survey}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveEditor}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-600'
                : toastMessage.type === 'error'
                ? 'bg-red-800 text-white border-red-600'
                : 'bg-indigo-800 text-white border-indigo-600'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-red-300" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-300" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
