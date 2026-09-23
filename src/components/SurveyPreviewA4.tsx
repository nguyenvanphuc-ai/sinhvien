import React, { useState } from 'react';
import { SurveyDocument } from '../types/survey';
import {
  CheckSquare,
  Square,
  Circle,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  FileEdit,
  LayoutGrid,
  FileText,
  Sparkles,
} from 'lucide-react';
import { InfographicSurveyView } from './InfographicSurveyView';
import { normalizeSurveyDocument, STANDARD_LIKERT_EXPLANATIONS } from '../utils/surveyNormalizer';

interface SurveyPreviewA4Props {
  survey: SurveyDocument;
  onEditField?: (field: keyof SurveyDocument, value: any) => void;
  onOpenEditModal?: () => void;
}

export const SurveyPreviewA4: React.FC<SurveyPreviewA4Props> = ({
  survey: rawSurvey,
  onOpenEditModal,
}) => {
  const survey = normalizeSurveyDocument(rawSurvey);
  const [zoom, setZoom] = useState<number>(100);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [viewFormat, setViewFormat] = useState<'infographic' | 'administrative'>('infographic');

  const handleSelectOption = (qId: string, opt: string, isMultiple = false) => {
    if (!isInteractiveMode) return;
    setAnswers((prev) => {
      if (isMultiple) {
        const currentList: string[] = prev[qId] || [];
        if (currentList.includes(opt)) {
          return { ...prev, [qId]: currentList.filter((item) => item !== opt) };
        } else {
          return { ...prev, [qId]: [...currentList, opt] };
        }
      } else {
        return { ...prev, [qId]: opt };
      }
    });
  };

  const handleMatrixSelect = (itemCode: string, level: number) => {
    if (!isInteractiveMode) return;
    setAnswers((prev) => ({
      ...prev,
      [itemCode]: level,
    }));
  };

  const handleResetAnswers = () => {
    setAnswers({});
  };

  return (
    <div className="flex flex-col h-full bg-slate-200/80 rounded-xl overflow-hidden shadow-inner border border-slate-300">
      {/* Top Toolbar */}
      <div className="no-print bg-slate-800 text-slate-200 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {/* View Format Selector Tabs */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewFormat('infographic')}
              className={`text-xs px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewFormat === 'infographic'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Xem theo chuẩn 2 cột đồ họa chuyên nghiệp (Đúng hình ảnh chuẩn đã gửi)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Chuẩn Mẫu Ảnh (2 Cột)</span>
            </button>
            <button
              onClick={() => setViewFormat('administrative')}
              className={`text-xs px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewFormat === 'administrative'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Xem theo chuẩn thể thức văn bản hành chính Nghị định 30/2020/NĐ-CP"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Chuẩn Hành Chính (NĐ 30)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive Test Mode Toggle */}
          <button
            onClick={() => setIsInteractiveMode(!isInteractiveMode)}
            className={`text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition cursor-pointer ${
              isInteractiveMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
            title="Bật/Tắt chế độ click chọn điền thử khảo sát trực tiếp trên mẫu"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isInteractiveMode ? 'Đang điền thử' : 'Chế độ điền thử'}
            </span>
          </button>

          {isInteractiveMode && Object.keys(answers).length > 0 && (
            <button
              onClick={handleResetAnswers}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-amber-300 px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
              title="Xóa các đáp án đã điền thử"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa nháp</span>
            </button>
          )}

          {/* Quick Edit button */}
          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded flex items-center gap-1 transition cursor-pointer shadow-xs"
              title="Chỉnh sửa nội dung chi tiết của phiếu"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sửa nội dung</span>
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-700 rounded px-1.5 py-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(65, z - 10))}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs px-1.5 font-mono text-slate-300 min-w-[3rem] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(140, z + 10))}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 flex justify-center items-start">
        <div
          id="survey-printable-area"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="print-container transition-all"
        >
          {viewFormat === 'infographic' ? (
            <InfographicSurveyView
              survey={survey}
              isInteractiveMode={isInteractiveMode}
              answers={answers}
              onSelectOption={handleSelectOption}
              onSelectMatrix={handleMatrixSelect}
            />
          ) : (
            <div
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
              className="bg-white text-slate-900 shadow-2xl rounded-sm w-[210mm] min-h-[297mm] p-[20mm_15mm_20mm_30mm] text-[13pt] leading-relaxed relative border border-slate-300"
            >
              {/* Header 2 Columns: Đơn vị ban hành vs Quốc hiệu Tiêu ngữ */}
              <div className="grid grid-cols-12 gap-2 mb-6 pb-2">
                {/* Cột trái: Đơn vị khảo sát */}
                <div className="col-span-5 text-center flex flex-col items-center">
                  <p className="text-[11.5pt] uppercase text-slate-800 font-normal leading-tight">
                    {survey.institution || 'BỘ CÔNG THƯƠNG'}
                  </p>
                  <p className="text-[11.5pt] font-bold uppercase text-slate-900 leading-tight mt-0.5">
                    {survey.university || 'TRƯỜNG ĐH CÔNG NGHIỆP VÀ THƯƠNG MẠI HÀ NỘI'}
                  </p>
                  <p className="text-[11.5pt] font-bold uppercase text-red-900 leading-tight mt-0.5">
                    {survey.department || 'NHÓM ĐHQL2-K10'}
                  </p>
                  <div className="w-24 border-b border-slate-600 my-1"></div>
                  {survey.surveyCode && (
                    <p className="text-[10pt] italic text-slate-600 mt-0.5">
                      Mã số: {survey.surveyCode}
                    </p>
                  )}
                </div>

                {/* Cột phải: Quốc hiệu - Tiêu ngữ */}
                <div className="col-span-7 text-center flex flex-col items-center">
                  <p className="text-[12pt] font-bold uppercase tracking-tight text-slate-900 leading-tight">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className="text-[13pt] font-bold text-slate-900 leading-tight mt-0.5">
                    Độc lập - Tự do - Hạnh phúc
                  </p>
                  <div className="w-36 border-b-2 border-slate-900 my-1"></div>
                  <p className="text-[11pt] italic text-slate-600 mt-1">
                    {survey.locationDate || 'Hà Nội, ngày ... tháng ... năm 2026'}
                  </p>
                </div>
              </div>

              {/* Tiêu đề phiếu khảo sát */}
              <div className="text-center my-6">
                <h2 className="text-[15pt] font-bold uppercase text-slate-950 leading-snug tracking-tight whitespace-pre-line">
                  {survey.title}
                </h2>
                {survey.subtitle && (
                  <p className="text-[12pt] italic text-slate-700 mt-1.5 font-normal">
                    {survey.subtitle}
                  </p>
                )}
              </div>

              {/* Lời mở đầu / Giới thiệu mục đích & Cam kết bảo mật */}
              {survey.introduction && (
                <div className="mb-6 text-justify text-[13pt] text-slate-900 leading-relaxed whitespace-pre-line indent-8">
                  {survey.introduction}
                </div>
              )}

              {/* Bảng quy ước Thang đo Likert 5 mức độ (nếu có) */}
              {survey.likertScale && (
                <div className="mb-6 p-3 bg-slate-50 border border-slate-300 rounded text-[11.5pt]">
                  <p className="font-bold italic text-slate-900 mb-1.5">
                    * Quy ước thang đo đánh giá (Thang đo Likert 5 mức độ):
                  </p>
                  <div className="grid grid-cols-5 gap-2 text-center text-[10.5pt] sm:text-[11pt] text-slate-800">
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 block text-xs">[1]</span>
                      <span>{survey.likertScale['1']}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 block text-xs">[2]</span>
                      <span>{survey.likertScale['2']}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 block text-xs">[3]</span>
                      <span>{survey.likertScale['3']}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 block text-xs">[4]</span>
                      <span>{survey.likertScale['4']}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 block text-xs">[5]</span>
                      <span>{survey.likertScale['5']}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Nội dung các phần và câu hỏi */}
              <div className="space-y-6">
                {survey.sections.map((sec, sIdx) => (
                  <div key={sec.id || sIdx} className="space-y-3">
                    {/* Tiêu đề Section */}
                    <h3 className="text-[13pt] font-bold text-slate-950 uppercase border-b border-slate-300 pb-1">
                      {sec.title}
                    </h3>
                    {sec.description && (
                      <p className="text-[12pt] italic text-slate-700">
                        {sec.description}
                      </p>
                    )}

                    {/* Danh sách câu hỏi */}
                    <div className="space-y-4 pt-1">
                      {sec.questions.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="space-y-2">
                          <p className="font-bold text-[12.5pt] text-slate-900">
                            {q.content}
                          </p>

                          {/* Trắc nghiệm 1 lựa chọn (Single) */}
                          {q.type === 'single' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                              {q.options?.map((opt, oIdx) => {
                                const isSelected = answers[q.id] === opt;
                                return (
                                  <label
                                    key={oIdx}
                                    onClick={() => handleSelectOption(q.id, opt, false)}
                                    className={`flex items-center gap-2.5 text-[12pt] text-slate-800 ${
                                      isInteractiveMode
                                        ? 'cursor-pointer hover:text-blue-700 py-0.5'
                                        : ''
                                    }`}
                                  >
                                    {isSelected ? (
                                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                    )}
                                    <span>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* Nhiều lựa chọn (Multiple) */}
                          {q.type === 'multiple' && (
                            <div className="grid grid-cols-1 gap-1.5 pl-4">
                              {q.options?.map((opt, oIdx) => {
                                const isSelected = (answers[q.id] || []).includes(opt);
                                return (
                                  <label
                                    key={oIdx}
                                    onClick={() => handleSelectOption(q.id, opt, true)}
                                    className={`flex items-center gap-2.5 text-[12pt] text-slate-800 ${
                                      isInteractiveMode
                                        ? 'cursor-pointer hover:text-blue-700 py-0.5'
                                        : ''
                                    }`}
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                    )}
                                    <span>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* Ma trận Likert (Matrix Table) */}
                          {q.type === 'matrix' && q.matrixItems && q.matrixItems.length > 0 && (
                            <div className="space-y-2 my-3">
                              {/* Hướng dẫn thang điểm cụ thể 1 đến 5 */}
                              <div className="bg-amber-50/90 border border-amber-300 rounded-lg p-2.5 text-[11pt] text-slate-800">
                                <span className="font-bold text-[#0a3678] block mb-1">
                                  * Quy ước thang điểm đánh giá chi tiết (từ mức 1 đến 5):
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 text-[10.5pt]">
                                  <div className="bg-white p-1 rounded border border-amber-200">
                                    <strong className="text-red-700">[1]:</strong> Rất không hài lòng (Rất kém / Hoàn toàn không đồng ý)
                                  </div>
                                  <div className="bg-white p-1 rounded border border-amber-200">
                                    <strong className="text-orange-700">[2]:</strong> Không hài lòng (Kém / Chưa đạt kỳ vọng)
                                  </div>
                                  <div className="bg-white p-1 rounded border border-amber-200">
                                    <strong className="text-blue-800">[3]:</strong> Bình thường (Trung bình / Đạt mức cơ bản)
                                  </div>
                                  <div className="bg-white p-1 rounded border border-amber-200">
                                    <strong className="text-emerald-700">[4]:</strong> Hài lòng (Tốt / Đáp ứng đầy đủ nhu cầu)
                                  </div>
                                  <div className="bg-white p-1 rounded border border-amber-200">
                                    <strong className="text-amber-800">[5]:</strong> Rất hài lòng (Rất tốt / Xuất sắc, vượt kỳ vọng)
                                  </div>
                                </div>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-slate-700 text-[11pt]">
                                  <thead>
                                    <tr className="bg-[#0a3678] text-white">
                                      <th className="border border-slate-600 px-2 py-1.5 w-14 text-center font-bold text-amber-300">
                                        Mã
                                      </th>
                                      <th className="border border-slate-600 px-3 py-1.5 text-left font-bold text-white">
                                        Nội dung nhận định / Tiêu chí đánh giá
                                      </th>
                                      <th className="border border-slate-600 px-1 py-1.5 w-14 text-center font-bold text-amber-300" title="1: Rất không hài lòng / Rất kém">
                                        <div>1</div>
                                        <div className="text-[8.5pt] font-normal text-amber-200/90">Rất kém</div>
                                      </th>
                                      <th className="border border-slate-600 px-1 py-1.5 w-14 text-center font-bold text-amber-300" title="2: Không hài lòng / Kém">
                                        <div>2</div>
                                        <div className="text-[8.5pt] font-normal text-amber-200/90">Kém</div>
                                      </th>
                                      <th className="border border-slate-600 px-1 py-1.5 w-14 text-center font-bold text-amber-300" title="3: Bình thường / Trung bình">
                                        <div>3</div>
                                        <div className="text-[8.5pt] font-normal text-amber-200/90">T.Bình</div>
                                      </th>
                                      <th className="border border-slate-600 px-1 py-1.5 w-14 text-center font-bold text-amber-300" title="4: Hài lòng / Tốt">
                                        <div>4</div>
                                        <div className="text-[8.5pt] font-normal text-amber-200/90">Tốt</div>
                                      </th>
                                      <th className="border border-slate-600 px-1 py-1.5 w-14 text-center font-bold text-amber-300" title="5: Rất hài lòng / Rất tốt">
                                        <div>5</div>
                                        <div className="text-[8.5pt] font-normal text-amber-200/90">Rất tốt</div>
                                      </th>
                                    </tr>
                                  </thead>
                                <tbody>
                                  {q.matrixItems.map((item, mIdx) => (
                                    <tr
                                      key={mIdx}
                                      className={mIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                                    >
                                      <td className="border border-slate-700 px-2 py-1.5 text-center font-bold text-slate-800">
                                        {item.code}
                                      </td>
                                      <td className="border border-slate-700 px-3 py-1.5 text-slate-900 leading-snug">
                                        {item.statement}
                                      </td>
                                      {[1, 2, 3, 4, 5].map((level) => {
                                        const isChosen = answers[item.code] === level;
                                        return (
                                          <td
                                            key={level}
                                            onClick={() => handleMatrixSelect(item.code, level)}
                                            className={`border border-slate-700 px-1 py-1.5 text-center ${
                                              isInteractiveMode
                                                ? 'cursor-pointer hover:bg-blue-100'
                                                : ''
                                            }`}
                                          >
                                            <span className="inline-flex items-center justify-center text-slate-700">
                                              {isChosen ? (
                                                <span className="text-blue-700 font-bold text-sm">
                                                  ✓
                                                </span>
                                              ) : (
                                                <span className="text-slate-400">☐</span>
                                              )}
                                            </span>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                          {/* Tự luận / Viết tự do (Text) */}
                          {q.type === 'text' && (
                            <div className="space-y-2.5 pt-1">
                              {isInteractiveMode ? (
                                <textarea
                                  rows={3}
                                  placeholder={q.placeholder || 'Ghi ý kiến của bạn tại đây...'}
                                  className="w-full text-[12pt] p-2 border border-slate-300 rounded font-serif focus:outline-none focus:ring-1 focus:ring-blue-500"
                                ></textarea>
                              ) : (
                                <div className="text-slate-400 font-mono tracking-widest text-xs space-y-1">
                                  <p>....................................................................................................................................................................</p>
                                  <p>....................................................................................................................................................................</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lời cảm ơn */}
              {survey.closing && (
                <div className="my-8 text-justify text-[13pt] italic text-slate-900 indent-8 leading-relaxed">
                  {survey.closing}
                </div>
              )}

              {/* Chữ ký 2 bên */}
              <div className="grid grid-cols-12 gap-4 mt-8 pt-4">
                <div className="col-span-5 text-center">
                  <p className="font-bold text-[12pt] uppercase text-slate-900">
                    NGƯỜI ĐƯỢC KHẢO SÁT
                  </p>
                  <p className="text-[11pt] italic text-slate-600 mb-16">
                    (Ký hoặc ghi ý kiến tự nguyện)
                  </p>
                </div>

                <div className="col-span-7 text-center">
                  <p className="text-[11pt] italic text-slate-600 mb-1">
                    {survey.locationDate || 'Hà Nội, ngày ... tháng ... năm 2026'}
                  </p>
                  <p className="font-bold text-[12pt] uppercase text-slate-900 leading-tight">
                    {survey.signatoryTitle || 'ĐẠI DIỆN NHÓM ĐHQL2-K10'}
                  </p>
                  <p className="text-[11pt] italic text-slate-600 mb-16">
                    {survey.signatoryNote || '(Ký và ghi rõ họ tên)'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
