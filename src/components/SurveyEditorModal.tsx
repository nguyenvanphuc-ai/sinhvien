import React, { useState } from 'react';
import { SurveyDocument, Question, SurveySection, QuestionType } from '../types/survey';
import { X, Plus, Trash2, Save, Check } from 'lucide-react';

interface SurveyEditorModalProps {
  isOpen: boolean;
  survey: SurveyDocument;
  onClose: () => void;
  onSave: (updated: SurveyDocument) => void;
}

export const SurveyEditorModal: React.FC<SurveyEditorModalProps> = ({
  isOpen,
  survey,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<SurveyDocument>(JSON.parse(JSON.stringify(survey)));
  const [activeTab, setActiveTab] = useState<'info' | 'sections' | 'scale'>('info');

  if (!isOpen) return null;

  const handleInfoChange = (field: keyof SurveyDocument, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScaleChange = (level: '1' | '2' | '3' | '4' | '5', value: string) => {
    setFormData((prev) => ({
      ...prev,
      likertScale: {
        ...prev.likertScale,
        [level]: value,
      },
    }));
  };

  const handleUpdateSectionTitle = (sIdx: number, title: string) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.sections[sIdx].title = title;
      return next;
    });
  };

  const handleUpdateSectionDesc = (sIdx: number, desc: string) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.sections[sIdx].description = desc;
      return next;
    });
  };

  const handleUpdateQuestion = (sIdx: number, qIdx: number, updated: Partial<Question>) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.sections[sIdx].questions[qIdx] = {
        ...next.sections[sIdx].questions[qIdx],
        ...updated,
      };
      return next;
    });
  };

  const handleAddQuestion = (sIdx: number) => {
    setFormData((prev) => {
      const next = { ...prev };
      const newQ: Question = {
        id: `q_${Date.now()}`,
        code: `C${next.sections[sIdx].questions.length + 1}`,
        content: 'Nội dung câu hỏi mới...',
        type: 'single',
        options: ['Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3'],
      };
      next.sections[sIdx].questions.push(newQ);
      return next;
    });
  };

  const handleDeleteQuestion = (sIdx: number, qIdx: number) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.sections[sIdx].questions.splice(qIdx, 1);
      return next;
    });
  };

  const handleAddMatrixItem = (sIdx: number, qIdx: number) => {
    setFormData((prev) => {
      const next = { ...prev };
      const q = next.sections[sIdx].questions[qIdx];
      if (!q.matrixItems) q.matrixItems = [];
      const num = q.matrixItems.length + 1;
      q.matrixItems.push({
        code: `${q.code || 'TC'}${num}`,
        statement: 'Tiêu chí đánh giá mới...',
      });
      return next;
    });
  };

  const handleDeleteMatrixItem = (sIdx: number, qIdx: number, mIdx: number) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.sections[sIdx].questions[qIdx].matrixItems?.splice(mIdx, 1);
      return next;
    });
  };

  const handleAddSection = () => {
    setFormData((prev) => {
      const next = { ...prev };
      const num = next.sections.length + 1;
      next.sections.push({
        id: `sec_${Date.now()}`,
        title: `PHẦN ${num}: NỘI DUNG MỚI`,
        description: 'Mô tả hướng dẫn trả lời cho phần này...',
        questions: [],
      });
      return next;
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg">
              Chỉnh Sửa Chi Tiết Phiếu Khảo Sát
            </span>
            <span className="text-xs bg-slate-800 text-amber-300 px-2 py-0.5 rounded">
              Chuẩn Hành Chính
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Menu */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'info'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Thông Tin Hành Chính
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'sections'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Nội Dung & Các Phần Câu Hỏi ({formData.sections.length})
          </button>
          <button
            onClick={() => setActiveTab('scale')}
            className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'scale'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Thang Đo Likert 5 Mức
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'info' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cơ quan chủ quản:
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => handleInfoChange('institution', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên Trường:
                  </label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => handleInfoChange('university', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Đơn vị khảo sát:
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInfoChange('department', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã số phiếu / Ký hiệu:
                  </label>
                  <input
                    type="text"
                    value={formData.surveyCode || ''}
                    onChange={(e) => handleInfoChange('surveyCode', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tiêu đề Phiếu khảo sát (In hoa):
                </label>
                <textarea
                  rows={2}
                  value={formData.title}
                  onChange={(e) => handleInfoChange('title', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-red-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phụ đề / Trích yếu:
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => handleInfoChange('subtitle', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lời mở đầu & Giới thiệu mục đích, cam kết bảo mật:
                </label>
                <textarea
                  rows={4}
                  value={formData.introduction}
                  onChange={(e) => handleInfoChange('introduction', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 leading-relaxed focus:ring-2 focus:ring-red-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Địa danh & Ngày tháng:
                  </label>
                  <input
                    type="text"
                    value={formData.locationDate}
                    onChange={(e) => handleInfoChange('locationDate', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chức danh Người ký:
                  </label>
                  <input
                    type="text"
                    value={formData.signatoryTitle}
                    onChange={(e) => handleInfoChange('signatoryTitle', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lời cảm ơn kết thúc:
                </label>
                <textarea
                  rows={2}
                  value={formData.closing}
                  onChange={(e) => handleInfoChange('closing', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-700 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-6">
              {formData.sections.map((sec, sIdx) => (
                <div
                  key={sIdx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4"
                >
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase">
                      Tiêu đề Phần {sIdx + 1}:
                    </label>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleUpdateSectionTitle(sIdx, e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-sm text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Hướng dẫn cho phần này..."
                      value={sec.description || ''}
                      onChange={(e) => handleUpdateSectionDesc(sIdx, e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs italic text-slate-700"
                    />
                  </div>

                  {/* Questions List */}
                  <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-300">
                    {sec.questions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-3 bg-white border border-slate-200 rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                #{qIdx + 1}
                              </span>
                              <select
                                value={q.type}
                                onChange={(e) =>
                                  handleUpdateQuestion(sIdx, qIdx, {
                                    type: e.target.value as QuestionType,
                                  })
                                }
                                className="text-xs p-1 border border-slate-300 rounded font-medium bg-slate-50"
                              >
                                <option value="single">Trắc nghiệm 1 lựa chọn (Radio)</option>
                                <option value="multiple">Trắc nghiệm nhiều lựa chọn (Checkbox)</option>
                                <option value="matrix">Bảng ma trận Likert 5 mức (Matrix)</option>
                                <option value="text">Tự luận / Viết ý kiến mở (Text)</option>
                              </select>
                            </div>

                            <input
                              type="text"
                              value={q.content}
                              onChange={(e) =>
                                handleUpdateQuestion(sIdx, qIdx, { content: e.target.value })
                              }
                              className="w-full p-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-900"
                            />
                          </div>

                          <button
                            onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* If single or multiple: options */}
                        {(q.type === 'single' || q.type === 'multiple') && (
                          <div className="space-y-1.5 pl-2">
                            <label className="text-xs font-medium text-slate-500">
                              Các lựa chọn trả lời (mỗi dòng một lựa chọn):
                            </label>
                            <textarea
                              rows={3}
                              value={(q.options || []).join('\n')}
                              onChange={(e) =>
                                handleUpdateQuestion(sIdx, qIdx, {
                                  options: e.target.value.split('\n').filter(Boolean),
                                })
                              }
                              className="w-full p-2 border border-slate-200 rounded text-xs font-mono"
                            />
                          </div>
                        )}

                        {/* If matrix: matrix items */}
                        {q.type === 'matrix' && (
                          <div className="space-y-2 pl-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-600">
                                Các tiêu chí đánh giá trong bảng ma trận:
                              </span>
                              <button
                                onClick={() => handleAddMatrixItem(sIdx, qIdx)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Thêm tiêu chí
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {q.matrixItems?.map((mItem, mIdx) => (
                                <div key={mIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={mItem.code}
                                    onChange={(e) => {
                                      const next = [...(q.matrixItems || [])];
                                      next[mIdx].code = e.target.value;
                                      handleUpdateQuestion(sIdx, qIdx, { matrixItems: next });
                                    }}
                                    className="w-16 p-1 border border-slate-300 rounded text-xs text-center font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={mItem.statement}
                                    onChange={(e) => {
                                      const next = [...(q.matrixItems || [])];
                                      next[mIdx].statement = e.target.value;
                                      handleUpdateQuestion(sIdx, qIdx, { matrixItems: next });
                                    }}
                                    className="flex-1 p-1 border border-slate-300 rounded text-xs"
                                  />
                                  <button
                                    onClick={() => handleDeleteMatrixItem(sIdx, qIdx, mIdx)}
                                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddQuestion(sIdx)}
                      className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Thêm câu hỏi vào phần này
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddSection}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
              >
                <Plus className="w-4 h-4" /> Thêm Phần Khảo Sát Mới
              </button>
            </div>
          )}

          {activeTab === 'scale' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <p className="text-xs text-slate-600">
                Tùy chỉnh định nghĩa 5 mức độ của Thang đo Likert (từ 1 đến 5):
              </p>
              {(['1', '2', '3', '4', '5'] as const).map((level) => (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-16 font-bold text-center bg-slate-100 py-2 rounded border border-slate-200">
                    Mức {level}
                  </span>
                  <input
                    type="text"
                    value={formData.likertScale[level] || ''}
                    onChange={(e) => handleScaleChange(level, e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-2 shadow cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
