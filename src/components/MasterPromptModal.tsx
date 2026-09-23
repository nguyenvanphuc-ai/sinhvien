import React, { useState } from 'react';
import { DETAILED_MASTER_PROMPT, PROMPT_USE_CASES_GUIDE } from '../data/masterPromptDocs';
import { X, Copy, Check, Sparkles, BookOpen, Layers, Award, Terminal } from 'lucide-react';

interface MasterPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSnippet?: (snippet: string) => void;
}

export const MasterPromptModal: React.FC<MasterPromptModalProps> = ({
  isOpen,
  onClose,
  onSelectSnippet,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'master' | 'usecases'>('master');
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopyMaster = () => {
    navigator.clipboard.writeText(DETAILED_MASTER_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopySnippet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetIdx(idx);
    setTimeout(() => setCopiedSnippetIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-indigo-900 px-6 py-4 text-white flex items-center justify-between border-b border-red-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Bộ Siêu Prompt (Master Prompt) Chuẩn Nghị Định 30 & NCKH
              </h2>
              <p className="text-xs text-red-200">
                Thiết kế riêng cho Nhóm ĐHQL2-K10 - Trường Đại học Công nghiệp và Thương mại Hà Nội (HITU)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('master')}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'master'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Toàn Văn Master System Prompt</span>
          </button>
          <button
            onClick={() => setActiveTab('usecases')}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'usecases'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Prompt Theo Từng Trường Hợp Khảo Sát</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-800 text-sm">
          {activeTab === 'master' ? (
            <div className="space-y-4">
              {/* Highlight Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <span className="font-bold text-red-900 block mb-1">
                    Chuẩn Nghị định 30/2020
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Đầy đủ Quốc hiệu, Tiêu ngữ, Tên đơn vị HITU, Mã số phiếu, Căn lề 20-15-20-30mm, Chữ ký.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="font-bold text-blue-900 block mb-1">
                    Phương pháp NCKH Chuẩn
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Thang đo Likert 5 mức đối xứng, phân chia biến độc lập/phụ thuộc phục vụ SPSS & PLS-SEM.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-900 block mb-1">
                    Xuất File Word (.docx)
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Định dạng JSON có cấu trúc chuẩn, tự động render ra tài liệu Word và xem trước A4.
                  </p>
                </div>
              </div>

              {/* Master Prompt Codebox */}
              <div className="relative">
                <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono">
                  <span>SYSTEM_PROMPT_HITU_K10.txt</span>
                  <button
                    onClick={handleCopyMaster}
                    className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép toàn bộ Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-b-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto border border-slate-700">
                  {DETAILED_MASTER_PROMPT}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Dưới đây là các prompt chuyên dụng cho từng nhóm nghiệp vụ khảo sát thường gặp. Bạn có thể sao chép hoặc bấm nút áp dụng vào form tạo AI:
              </p>
              <div className="space-y-3">
                {PROMPT_USE_CASES_GUIDE.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopySnippet(item.promptSnippet, idx)}
                          className="text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedSnippetIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                        {onSelectSnippet && (
                          <button
                            onClick={() => {
                              onSelectSnippet(item.promptSnippet);
                              onClose();
                            }}
                            className="text-xs bg-red-700 hover:bg-red-800 text-white px-2.5 py-1 rounded flex items-center gap-1 transition cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Dùng cho AI</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{item.description}</p>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
                      {item.promptSnippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Nhóm ĐHQL2-K10 - Trường Đại học Công nghiệp và Thương mại Hà Nội</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
