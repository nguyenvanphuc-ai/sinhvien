import React from 'react';
import { SurveyDocument, Question } from '../types/survey';
import { Check, Star, Award, ShieldCheck, HelpCircle } from 'lucide-react';
import { normalizeSurveyDocument, STANDARD_LIKERT_EXPLANATIONS } from '../utils/surveyNormalizer';

interface InfographicSurveyViewProps {
  survey: SurveyDocument;
  isInteractiveMode?: boolean;
  answers?: Record<string, any>;
  onSelectOption?: (qId: string, opt: string, isMultiple?: boolean) => void;
  onSelectMatrix?: (itemCode: string, level: number) => void;
}

export const InfographicSurveyView: React.FC<InfographicSurveyViewProps> = ({
  survey: rawSurvey,
  isInteractiveMode = false,
  answers = {},
  onSelectOption,
  onSelectMatrix,
}) => {
  // Normalize survey document so sections are Phần A, B, C... and questions are A1, A2, B1, B2...
  const survey = normalizeSurveyDocument(rawSurvey);

  const isChecked = (qId: string, opt: string, isMultiple = false) => {
    if (isMultiple) {
      return (answers[qId] || []).includes(opt);
    }
    return answers[qId] === opt;
  };

  const isMatrixChecked = (code: string, level: number) => {
    return answers[code] === level;
  };

  // Divide sections into left and right columns
  let leftSections = survey.sections.slice(0, Math.ceil(survey.sections.length / 2));
  let rightSections = survey.sections.slice(Math.ceil(survey.sections.length / 2));

  // If 8 sections (like the standard employer survey):
  // Left: Phần A, B, C, G (0, 1, 2, 6)
  // Right: Phần D, E, F, H (3, 4, 5, 7)
  if (survey.sections.length >= 8) {
    const sA = survey.sections[0];
    const sB = survey.sections[1];
    const sC = survey.sections[2];
    const sD = survey.sections[3];
    const sE = survey.sections[4];
    const sF = survey.sections[5];
    const sG = survey.sections[6];
    const sH = survey.sections[7];

    leftSections = [sA, sB, sC, sG].filter(Boolean);
    rightSections = [sD, sE, sF, sH].filter(Boolean);
  }

  // Get explanation for a Likert score from survey or standard definitions
  const getLikertLabel = (score: number) => {
    const scaleKey = score as 1 | 2 | 3 | 4 | 5;
    const custom = survey.likertScale ? survey.likertScale[scaleKey] : undefined;
    if (custom) return custom;
    return STANDARD_LIKERT_EXPLANATIONS[score]?.description || '';
  };

  const renderQuestion = (q: Question) => {
    // Extract code badge (e.g., A1, B2) from content if exists
    const match = q.content.match(/^([A-Z]\d+)\.\s*(.*)$/);
    const codeBadge = match ? match[1] : q.code;
    const cleanContent = match ? match[2] : q.content;

    return (
      <div key={q.id} className="space-y-1.5 pt-1 text-slate-800">
        <div className="font-bold leading-snug flex items-start gap-1.5">
          {codeBadge && (
            <span className="inline-flex items-center justify-center bg-amber-400 text-[#0a3678] font-black px-1.5 py-0.5 rounded text-[11px] tracking-wide flex-shrink-0 shadow-2xs border border-amber-500/80">
              {codeBadge}
            </span>
          )}
          <span className="text-slate-900">{cleanContent}</span>
        </div>

        {/* Single Choice Options */}
        {q.type === 'single' && q.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1 pt-0.5">
            {q.options.map((opt, oIdx) => {
              const selected = isChecked(q.id, opt, false);
              return (
                <label
                  key={oIdx}
                  onClick={() => onSelectOption && onSelectOption(q.id, opt, false)}
                  className={`flex items-center gap-1.5 text-[11px] p-1 rounded-md transition ${
                    isInteractiveMode ? 'cursor-pointer hover:bg-amber-50/80' : ''
                  } ${selected ? 'text-[#0a3678] font-semibold bg-blue-50/60' : 'text-slate-700'}`}
                >
                  <span
                    className={`w-4 h-4 border-2 rounded-xs flex items-center justify-center flex-shrink-0 transition ${
                      selected
                        ? 'border-[#0a3678] bg-[#0a3678] text-amber-300'
                        : 'border-[#0a3678]/70 bg-white hover:border-amber-500'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Multiple Choice Options */}
        {q.type === 'multiple' && q.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1 pt-0.5">
            {q.options.map((opt, oIdx) => {
              const selected = isChecked(q.id, opt, true);
              return (
                <label
                  key={oIdx}
                  onClick={() => onSelectOption && onSelectOption(q.id, opt, true)}
                  className={`flex items-center gap-1.5 text-[11px] p-1 rounded-md transition ${
                    isInteractiveMode ? 'cursor-pointer hover:bg-amber-50/80' : ''
                  } ${selected ? 'text-[#0a3678] font-semibold bg-blue-50/60' : 'text-slate-700'}`}
                >
                  <span
                    className={`w-4 h-4 border-2 rounded-xs flex items-center justify-center flex-shrink-0 transition ${
                      selected
                        ? 'border-[#0a3678] bg-[#0a3678] text-amber-300'
                        : 'border-[#0a3678]/70 bg-white hover:border-amber-500'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Matrix Likert Table with Clear 1-5 Legend */}
        {q.type === 'matrix' && q.matrixItems && q.matrixItems.length > 0 && (
          <div className="space-y-1.5 my-1.5">
            {/* Detailed Likert 1 to 5 Explanatory Box (Phong cách Vàng - Xanh) */}
            <div className="bg-gradient-to-r from-amber-50/95 via-yellow-50/90 to-blue-50/90 border border-amber-300 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#0a3678] font-black text-[10.5px] uppercase tracking-wide mb-1 border-b border-amber-200/80 pb-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Quy ước thang điểm đánh giá chi tiết (Từ 1 đến 5):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 text-[9.5px]">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const detail = STANDARD_LIKERT_EXPLANATIONS[lvl];
                  const fullText = getLikertLabel(lvl);
                  return (
                    <div
                      key={lvl}
                      className="bg-white/95 p-1 rounded border border-amber-200/90 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
                        <span className="font-black text-amber-600 bg-amber-100/80 px-1 rounded text-[10px]">
                          [{lvl}]
                        </span>
                        <span className="text-[9px] font-bold text-[#0a3678]">
                          {detail?.sublabel}
                        </span>
                      </div>
                      <p
                        className="text-slate-800 font-medium text-[9px] mt-0.5 leading-tight line-clamp-2"
                        title={fullText}
                      >
                        {fullText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-lg border border-[#0a3678]/40 shadow-xs">
              <table className="w-full border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-[#0a3678] text-white">
                    <th className="border border-blue-900 px-1 py-1.5 w-9 text-center font-bold text-amber-300">
                      Mã
                    </th>
                    <th className="border border-blue-900 px-2 py-1.5 text-left font-bold text-white">
                      Tiêu chí / Nội dung đánh giá
                    </th>
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const detail = STANDARD_LIKERT_EXPLANATIONS[lvl];
                      return (
                        <th
                          key={lvl}
                          className="border border-blue-900 px-1 py-1 w-10 text-center font-bold text-amber-300"
                          title={`[${lvl}]: ${getLikertLabel(lvl)}`}
                        >
                          <div className="text-xs font-black">{lvl}</div>
                          <div className="text-[8px] font-normal text-amber-200/90 leading-tight">
                            {detail?.sublabel}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {q.matrixItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 0
                          ? 'bg-white hover:bg-amber-50/40'
                          : 'bg-[#f4f8fd] hover:bg-amber-50/50'
                      }
                    >
                      <td className="border border-[#0a3678]/25 px-1 py-1 text-center font-bold text-[#0a3678]">
                        {item.code || idx + 1}
                      </td>
                      <td className="border border-[#0a3678]/25 px-2 py-1 text-slate-800 leading-tight">
                        {item.statement}
                      </td>
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const active = isMatrixChecked(item.code, lvl);
                        return (
                          <td
                            key={lvl}
                            onClick={() => onSelectMatrix && onSelectMatrix(item.code, lvl)}
                            className={`border border-[#0a3678]/25 px-1 py-1 text-center transition ${
                              isInteractiveMode ? 'cursor-pointer hover:bg-amber-100/70' : ''
                            } ${active ? 'bg-amber-100/90' : ''}`}
                            title={`Chọn mức ${lvl}: ${getLikertLabel(lvl)}`}
                          >
                            <span className="inline-flex items-center justify-center">
                              {active ? (
                                <span className="text-[#0a3678] font-black text-xs bg-amber-300 w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-slate-400 hover:text-amber-600">☐</span>
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

        {/* Text Area / Handwriting Line */}
        {q.type === 'text' && !q.content.includes('..........') && (
          <div className="text-slate-400 font-mono tracking-wider space-y-1 pl-1 pt-0.5">
            <p>.....................................................................................................................</p>
            <p>.....................................................................................................................</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white text-slate-900 border-2 border-[#0a3678] ring-4 ring-amber-400/40 rounded-2xl p-4 sm:p-7 shadow-2xl max-w-[210mm] mx-auto text-[11px] sm:text-[11.5px] leading-snug font-sans print:border-none print:ring-0 print:p-0 print:shadow-none">
      {/* 1. TOP HEADER BANNER (VÀNG XANH QUÝ TỘC) */}
      <div className="flex items-center justify-between gap-4 pb-3.5 border-b-2 border-amber-400 mb-3.5">
        {/* Left Icon: Emblemed Shield with Gold Handshake */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#0a3678] via-[#0d47a1] to-[#002171] border-2 border-amber-400 p-2 flex items-center justify-center text-white shadow-lg flex-shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300"
          >
            <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.6-4.6a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0l-1.8 1.8" />
            <path d="m15 7-2-2a1 1 0 0 0-1.4 0L7 9.6a2 2 0 0 0 0 2.8l1.4 1.4a2 2 0 0 0 2.8 0l1.8-1.8" />
            <path d="M7 13 3.4 9.4a2 2 0 0 1 0-2.8l1.4-1.4a2 2 0 0 1 2.8 0L11 8" />
            <path d="m13 16 3.6 3.6a2 2 0 0 0 2.8 0l1.4-1.4a2 2 0 0 0 0-2.8L17 12" />
          </svg>
        </div>

        {/* Center Title */}
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs uppercase font-extrabold text-[#0a3678] mb-0.5 tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{survey.university || 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VÀ THƯƠNG MẠI HÀ NỘI (HITU)'}</span>
            <Award className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <h1 className="text-base sm:text-2xl font-black text-[#0a3678] tracking-tight uppercase leading-tight font-serif whitespace-pre-line py-0.5">
            {survey.title}
          </h1>

          {survey.subtitle && (
            <div className="inline-block mt-0.5 bg-amber-50 border border-amber-300 px-3 py-0.5 rounded-full text-xs font-semibold text-amber-900 shadow-2xs">
              {survey.subtitle}
            </div>
          )}
        </div>

        {/* Right Icon: Emblemed Upward Trend with Gold Chart */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#0a3678] via-[#0d47a1] to-[#002171] border-2 border-amber-400 p-2 flex items-center justify-center text-white shadow-lg flex-shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
            <path d="m3 9 5-5 5 5 8-8" />
            <polyline points="17 1 21 1 21 5" />
          </svg>
        </div>
      </div>

      {/* 2. INTRODUCTORY LETTER BOX (VÀNG - XANH) */}
      {survey.introduction && (
        <div className="bg-gradient-to-r from-[#f0f7ff] via-amber-50/50 to-[#f0f7ff] border-l-4 border-amber-500 border-y border-r border-[#0a3678]/20 rounded-xl p-3 sm:p-3.5 mb-4 text-[#002b49] italic leading-relaxed text-[11px] sm:text-[11.5px] whitespace-pre-line shadow-2xs">
          {survey.introduction}
        </div>
      )}

      {/* 3. MAIN TWO-COLUMN CONTAINER (PHẦN A, B, C...) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* ================= LEFT COLUMN ================= */}
        <div className="space-y-4">
          {leftSections.map((sec) => (
            <div
              key={sec.id}
              className="space-y-2 border border-[#0a3678]/30 hover:border-amber-400 transition-colors rounded-xl p-3 bg-white shadow-xs"
            >
              {/* Section Header: Blue background with Gold accent badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#0a3678] via-[#124e8f] to-[#1565c0] text-white px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wide shadow-xs border-l-4 border-amber-400">
                <span className="text-amber-300 font-black tracking-wider">{sec.title}</span>
              </div>

              {sec.description && (
                <p className="text-[10.5px] italic text-[#0a3678] bg-amber-50/80 p-1.5 rounded-md border border-amber-200">
                  {sec.description}
                </p>
              )}

              <div className="space-y-3 pt-0.5">
                {sec.questions.map((q) => renderQuestion(q))}
              </div>
            </div>
          ))}
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="space-y-4">
          {rightSections.map((sec) => (
            <div
              key={sec.id}
              className="space-y-2 border border-[#0a3678]/30 hover:border-amber-400 transition-colors rounded-xl p-3 bg-white shadow-xs"
            >
              {/* Section Header: Blue background with Gold accent badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#0a3678] via-[#124e8f] to-[#1565c0] text-white px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wide shadow-xs border-l-4 border-amber-400">
                <span className="text-amber-300 font-black tracking-wider">{sec.title}</span>
              </div>

              {sec.description && (
                <p className="text-[10.5px] italic text-[#0a3678] bg-amber-50/80 p-1.5 rounded-md border border-amber-200">
                  {sec.description}
                </p>
              )}

              <div className="space-y-3 pt-0.5">
                {sec.questions.map((q) => renderQuestion(q))}
              </div>
            </div>
          ))}

          {/* FOOTER THANKS BOX (VÀNG - XANH QUÝ TỘC) */}
          {survey.closing && (
            <div className="bg-gradient-to-br from-[#0a3678] via-[#0d47a1] to-[#002171] border-2 border-amber-400 rounded-xl p-3.5 text-center space-y-1.5 text-white shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 font-black text-xs sm:text-sm uppercase tracking-wide">
                <Star className="w-4 h-4 fill-amber-300" />
                <span>TRÂN TRỌNG CẢM ƠN SỰ HỢP TÁC CỦA QUÝ VỊ!</span>
                <Star className="w-4 h-4 fill-amber-300" />
              </div>
              <p className="text-[10.5px] text-blue-100 italic leading-relaxed whitespace-pre-line">
                {survey.closing}
              </p>
              <div className="flex justify-center pt-1 text-amber-300">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
