export type QuestionType = 'single' | 'multiple' | 'matrix' | 'text' | 'rating';

export interface MatrixItem {
  code: string;
  statement: string;
}

export interface Question {
  id: string;
  code: string;
  content: string;
  type: QuestionType;
  required?: boolean;
  options?: string[]; // for single, multiple
  matrixItems?: MatrixItem[]; // for matrix (Likert scale rows)
  placeholder?: string; // for text
  ratingMax?: number; // for rating (e.g. 5 or 10)
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface LikertScaleDefinition {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}

export interface SurveyDocument {
  institution: string; // BỘ CÔNG THƯƠNG
  university: string; // TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VÀ THƯƠNG MẠI HÀ NỘI (HITU)
  department: string; // NHÓM ĐHQL2-K10
  surveyCode?: string; // PKS-HITU-K10/2026
  title: string; // PHIẾU KHẢO SÁT Ý KIẾN...
  subtitle?: string;
  introduction: string; // Lời mở đầu, mục đích, cam kết bảo mật
  targetAudience?: string; // Đối tượng khảo sát
  likertScale: LikertScaleDefinition;
  sections: SurveySection[];
  closing: string; // Lời cảm ơn
  locationDate: string; // Hà Nội, ngày ... tháng ... năm 2026
  signatoryTitle: string; // ĐẠI DIỆN NHÓM KHẢO SÁT ĐHQL2-K10
  signatoryNote: string; // (Ký và ghi rõ họ tên)
}

export interface SurveyPresetTemplate {
  id: string;
  category: string;
  name: string;
  description: string;
  iconName: string;
  defaultTopic: string;
  defaultTarget: string;
  defaultPurpose: string;
  sampleData: SurveyDocument;
}
