import { SurveyDocument, SurveySection, Question } from '../types/survey';

const SECTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

export interface LikertScaleDetail {
  score: number;
  label: string;
  sublabel: string;
  description: string;
}

export const STANDARD_LIKERT_EXPLANATIONS: Record<number, LikertScaleDetail> = {
  1: {
    score: 1,
    label: 'Rất không hài lòng',
    sublabel: 'Rất kém',
    description: 'Hoàn toàn không đồng ý / Rất kém / Chưa đáp ứng được yêu cầu',
  },
  2: {
    score: 2,
    label: 'Không hài lòng',
    sublabel: 'Kém',
    description: 'Không đồng ý / Kém / Chưa đạt kỳ vọng, còn nhiều bất cập',
  },
  3: {
    score: 3,
    label: 'Bình thường',
    sublabel: 'Trung bình',
    description: 'Trung lập / Đạt yêu cầu cơ bản / Tạm chấp nhận được',
  },
  4: {
    score: 4,
    label: 'Hài lòng',
    sublabel: 'Tốt',
    description: 'Đồng ý / Chất lượng tốt / Đáp ứng đầy đủ nhu cầu và kỳ vọng',
  },
  5: {
    score: 5,
    label: 'Rất hài lòng',
    sublabel: 'Rất tốt',
    description: 'Hoàn toàn đồng ý / Rất tốt / Vượt trên mong đợi, rất an tâm',
  },
};

/**
 * Normalizes survey sections to Phần A, Phần B, Phần C...
 * and question codes/content to A1, A2, B1, B2...
 */
export function normalizeSurveyDocument(survey: SurveyDocument): SurveyDocument {
  if (!survey || !Array.isArray(survey.sections)) {
    return survey;
  }

  const normalizedSections: SurveySection[] = survey.sections.map((sec, sIdx) => {
    const letter = SECTION_LETTERS[sIdx] || String.fromCharCode(65 + sIdx);

    // Normalize Section Title
    let cleanTitle = sec.title.trim();
    // Strip old prefixes like "PHẦN I:", "PHẦN 1:", "I. ", "1. ", "PHẦN A:"
    cleanTitle = cleanTitle.replace(/^(PHẦN\s+(?:[IVXLCDM]+|[0-9]+|[A-Z])[:\.\s-]+)/i, '');
    cleanTitle = cleanTitle.replace(/^([IVXLCDM]+|[0-9]+|[A-Z])[\.\:\s-]+/i, '');
    cleanTitle = cleanTitle.trim();
    const normalizedTitle = `PHẦN ${letter}: ${cleanTitle.toUpperCase()}`;

    // Normalize Questions
    const normalizedQuestions: Question[] = sec.questions.map((q, qIdx) => {
      const qNum = qIdx + 1;
      const expectedCode = `${letter}${qNum}`;

      // Clean old numbers from start of question content (e.g. "1. ", "Câu 1. ", "A1. ")
      let content = q.content.trim();
      content = content.replace(/^(?:Câu\s+\d+|[A-Z]\d+|\d+)[\.\:\s-]+/i, '').trim();
      const normalizedContent = `${expectedCode}. ${content}`;

      // Normalize matrix items if present
      let normalizedMatrixItems = q.matrixItems;
      if (q.type === 'matrix' && Array.isArray(q.matrixItems)) {
        normalizedMatrixItems = q.matrixItems.map((item, mIdx) => {
          const mNum = mIdx + 1;
          const cleanStatement = item.statement.trim();
          return {
            ...item,
            code: `${expectedCode}.${mNum}`,
            statement: cleanStatement,
          };
        });
      }

      return {
        ...q,
        code: expectedCode,
        content: normalizedContent,
        matrixItems: normalizedMatrixItems,
      };
    });

    return {
      ...sec,
      title: normalizedTitle,
      questions: normalizedQuestions,
    };
  });

  return {
    ...survey,
    sections: normalizedSections,
  };
}
