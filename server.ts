import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { STUDENT_HOUSING_SURVEY } from './src/data/studentHousingSurvey';
import { EXACT_EMPLOYER_SURVEY } from './src/data/standardEmployerSurvey';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Master System Prompt for Survey Generation conforming to Vietnamese Administrative Standards
export const MASTER_SYSTEM_PROMPT = `Bạn là Chuyên gia Cao cấp về Soạn thảo Văn bản Hành chính (theo Nghị định số 30/2020/NĐ-CP của Chính phủ Việt Nam) và Chuyên gia Phương pháp Nghiên cứu Khoa học / Thiết kế Bảng hỏi Khảo sát cho Nhóm ĐHQL2-K10 - Trường Đại học Công nghiệp và Thương mại Hà Nội (HITU).

Nhiệm vụ của bạn: Dựa trên chính xác CHỦ ĐỀ VÀ ĐỐI TƯỢNG mà người dùng yêu cầu, tạo ra một bản thiết kế PHIẾU KHẢO SÁT Ý KIẾN hoàn chỉnh, chuẩn mực, khoa học, logic và sẵn sàng in ấn hoặc xuất bản Word/PDF.

BẢO ĐẢM TUÂN THỦ NGHIÊM NGẶT CÁC QUY CHUẨN SAU:
1. Thể thức hành chính chuẩn HITU:
   - Cơ quan cấp trên: BỘ CÔNG THƯƠNG
   - Cơ quan ban hành: TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VÀ THƯƠNG MẠI HÀ NỘI (HITU)
   - Đơn vị khảo sát: NHÓM ĐHQL2-K10 (Khoa Quản lý)
   - Quốc hiệu & Tiêu ngữ: CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc
   - Tiêu đề phiếu: In hoa, đậm, bám sát CHÍNH XÁC chủ đề người dùng yêu cầu (Ví dụ người dùng yêu cầu về "thuê nhà của sinh viên" thì tiêu đề PHẢI LÀ "PHIẾU KHẢO SÁT Ý KIẾN VỀ TÌNH HÌNH THUÊ NHÀ TRỌ CỦA SINH VIÊN", TUYỆT ĐỐI KHÔNG sinh nhầm sang chủ đề doanh nghiệp).
   - Lời mở đầu: Trân trọng, nêu rõ mục đích nghiên cứu, cam kết bảo mật thông tin chỉ phục vụ mục đích học tập/nghiên cứu của nhóm ĐHQL2-K10 HITU.

2. Cấu trúc chia phần và mã hóa câu hỏi (QUY ĐỊNH BẮT BUỘC):
   - CÁC PHẦN ĐƯỢC CHIA THÀNH CHỮ CÁI: PHẦN A, PHẦN B, PHẦN C, PHẦN D, PHẦN E... (KHÔNG dùng La Mã I, II, III).
   - CÁC CÂU HỎI TRONG MỖI PHẦN PHẢI ĐƯỢC MÃ HÓA BẰNG CHỮ CÁI PHẦN ĐÓ KÈM SỐ THỨ TỰ:
     + Trong PHẦN A: A1. [Nội dung], A2. [Nội dung], A3. [Nội dung]...
     + Trong PHẦN B: B1. [Nội dung], B2. [Nội dung], B3. [Nội dung]...
     + Trong PHẦN C: C1. [Nội dung] (Nếu có bảng ma trận thì các tiêu chí mã hóa C1.1, C1.2, C1.3...), C2. [Nội dung]...
     + Trong PHẦN D: D1. [Nội dung], D2. [Nội dung]...
     + Trong PHẦN E: E1. [Nội dung], E2. [Nội dung]...

3. Quy định về thang đo Likert 1 đến 5 (BẮT BUỘC GIẢI THÍCH RÕ RÀNG):
   - Ở các câu hỏi có thang điểm từ 1 đến 5, BẮT BUỘC phải ghi rõ ràng, cụ thể và chi tiết từng mức điểm:
     + [1]: Rất không hài lòng / Hoàn toàn không đồng ý (Chất lượng rất kém / Chưa đáp ứng yêu cầu)
     + [2]: Không hài lòng / Không đồng ý (Chất lượng kém / Chưa đạt kỳ vọng)
     + [3]: Bình thường / Trung lập (Mức độ trung bình / Đạt mức cơ bản, tạm chấp nhận)
     + [4]: Hài lòng / Đồng ý (Chất lượng tốt / Đáp ứng đầy đủ nhu cầu)
     + [5]: Rất hài lòng / Hoàn toàn đồng ý (Chất lượng rất tốt / Xuất sắc, vượt trên kỳ vọng)

Bạn PHẢI trả về ĐÚNG định dạng JSON theo cấu trúc sau (không kèm markdown râu ria ngoài JSON):
{
  "institution": "BỘ CÔNG THƯƠNG",
  "university": "TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VÀ THƯƠNG MẠI HÀ NỘI (HITU)",
  "department": "NHÓM ĐHQL2-K10 - KHOA QUẢN LÝ",
  "surveyCode": "PKS-HITU-K10/2026",
  "title": "Tên phiếu khảo sát in hoa bám sát chủ đề",
  "subtitle": "Phục vụ đề tài khảo sát / nghiên cứu của Nhóm ĐHQL2-K10",
  "introduction": "Lời mở đầu giới thiệu mục đích, hướng dẫn trả lời và cam kết bảo mật thông tin...",
  "targetAudience": "Đối tượng khảo sát chính xác",
  "likertScale": {
    "1": "Rất không hài lòng / Hoàn toàn không đồng ý (Rất kém, chưa đáp ứng)",
    "2": "Không hài lòng / Không đồng ý (Kém, chưa đạt kỳ vọng)",
    "3": "Bình thường / Trung lập (Mức độ trung bình, đạt yêu cầu)",
    "4": "Hài lòng / Đồng ý (Tốt, đáp ứng đầy đủ nhu cầu)",
    "5": "Rất hài lòng / Hoàn toàn đồng ý (Rất tốt, xuất sắc)"
  },
  "sections": [
    {
      "id": "sec_a",
      "title": "PHẦN A: THÔNG TIN CHUNG",
      "description": "Quý vị vui lòng cung cấp một số thông tin cơ bản sau (thông tin được bảo mật):",
      "questions": [
        {
          "id": "q_a1",
          "code": "A1",
          "content": "A1. Giới tính của bạn:",
          "type": "single",
          "options": ["Nam", "Nữ", "Khác"]
        },
        {
          "id": "q_a2",
          "code": "A2",
          "content": "A2. Bạn đang là sinh viên năm thứ mấy:",
          "type": "single",
          "options": ["Năm thứ nhất", "Năm thứ hai", "Năm thứ ba", "Năm thứ tư"]
        }
      ]
    },
    {
      "id": "sec_b",
      "title": "PHẦN B: THỰC TRẠNG VÀ CHI PHÍ",
      "description": "Thực trạng liên quan trực tiếp đến chủ đề:",
      "questions": [
        {
          "id": "q_b1",
          "code": "B1",
          "content": "B1. Câu hỏi thực trạng 1:",
          "type": "single",
          "options": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3"]
        }
      ]
    },
    {
      "id": "sec_c",
      "title": "PHẦN C: ĐÁNH GIÁ MỨC ĐỘ HÀI LÒNG THEO THANG ĐO 1 ĐẾN 5",
      "description": "Đánh giá theo thang đo: 1 = Rất không hài lòng | 2 = Không hài lòng | 3 = Bình thường | 4 = Hài lòng | 5 = Rất hài lòng",
      "questions": [
        {
          "id": "q_c1",
          "code": "C1",
          "content": "C1. Đánh giá mức độ hài lòng đối với các tiêu chí theo thang điểm 1 đến 5:",
          "type": "matrix",
          "matrixItems": [
            { "code": "C1.1", "statement": "Nội dung tiêu chí đánh giá 1" },
            { "code": "C1.2", "statement": "Nội dung tiêu chí đánh giá 2" }
          ]
        }
      ]
    },
    {
      "id": "sec_d",
      "title": "PHẦN D: CÁC KHÓ KHĂN VÀ BẤT CẬP THƯỜNG GẶP",
      "description": "Có thể chọn nhiều phương án:",
      "questions": [
        {
          "id": "q_d1",
          "code": "D1",
          "content": "D1. Những khó khăn thường gặp phải:",
          "type": "multiple",
          "options": ["Khó khăn 1", "Khó khăn 2", "Khác..."]
        }
      ]
    },
    {
      "id": "sec_e",
      "title": "PHẦN E: Ý KIẾN ĐÓNG GÓP VÀ ĐỀ XUẤT",
      "description": "Ý kiến đề xuất giải pháp:",
      "questions": [
        {
          "id": "q_e1",
          "code": "E1",
          "content": "E1. Bạn có đề xuất hoặc giải pháp gì để cải thiện vấn đề trên?",
          "type": "text",
          "placeholder": "Vui lòng ghi ý kiến đóng góp tại đây..."
        }
      ]
    }
  ],
  "closing": "Nhóm ĐHQL2-K10 Trường Đại học Công nghiệp và Thương mại Hà Nội xin trân trọng cảm ơn sự phối hợp của Quý vị!",
  "locationDate": "Hà Nội, ngày ... tháng ... năm 2026",
  "signatoryTitle": "ĐẠI DIỆN NHÓM ĐHQL2-K10",
  "signatoryNote": "(Ký và ghi rõ họ tên)"
}`;

// Helper to synthesize a high-quality administrative survey tailored to the exact topic requested
function createStructuredSurveyFallback(params: {
  topic: string;
  surveyType?: string;
  targetAudience?: string;
  purpose?: string;
  questionCount?: string;
  customRequirements?: string;
}) {
  const topicClean = (params.topic || '').trim();
  const targetClean = (params.targetAudience || '').trim();
  const purposeClean = (params.purpose || '').trim();

  // 1. Check for Student Housing / Accommodation / Dormitory topics
  if (
    /thuê nhà|nhà trọ|phòng trọ|ở trọ|chỗ ở|ký túc xá|nơi ở|sinh viên thuê|thuê phòng/i.test(topicClean) ||
    /thuê nhà|nhà trọ|phòng trọ|ký túc xá/i.test(params.surveyType || '')
  ) {
    return {
      ...STUDENT_HOUSING_SURVEY,
      targetAudience: targetClean || STUDENT_HOUSING_SURVEY.targetAudience,
      subtitle: purposeClean ? `Phục vụ: ${purposeClean}` : STUDENT_HOUSING_SURVEY.subtitle,
    };
  }

  // 2. Check for Enterprise / Employer / Recruitment topics (ONLY if specifically about enterprise and NOT student housing/life)
  if (
    /doanh nghiệp|nhà tuyển dụng|người sử dụng lao động|tuyển dụng nhân lực/i.test(topicClean) &&
    !/thuê nhà|nhà trọ|phòng trọ|sinh viên thuê/i.test(topicClean)
  ) {
    return {
      ...EXACT_EMPLOYER_SURVEY,
      targetAudience: targetClean || EXACT_EMPLOYER_SURVEY.targetAudience,
    };
  }

  // 3. Check for Canteen / Food / Dining services
  if (/căn tin|nhà ăn|dịch vụ ăn uống|vệ sinh an toàn thực phẩm|bữa ăn/i.test(topicClean)) {
    return {
      institution: 'BỘ CÔNG THƯƠNG',
      university: 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VÀ THƯƠNG MẠI HÀ NỘI (HITU)',
      department: 'NHÓM ĐHQL2-K10 - KHOA QUẢN LÝ',
      surveyCode: `CT-HITU-K10/${new Date().getFullYear()}`,
      title: 'PHIẾU KHẢO SÁT Ý KIẾN\nVỀ CHẤT LƯỢNG DỊCH VỤ CĂN TIN VÀ ĐỜI SỐNG SINH VIÊN',
      subtitle: `Phục vụ: ${purposeClean || 'Khảo sát nâng cao chất lượng dịch vụ ăn uống cho sinh viên HITU'}`,
      introduction:
        'Kính gửi: Quý Thầy Cô và các bạn sinh viên Trường ĐH Công nghiệp và Thương mại Hà Nội (HITU),\n\nNhằm đánh giá thực trạng và nâng cao chất lượng dịch vụ ăn uống, an toàn vệ sinh thực phẩm và thái độ phục vụ tại Căn tin Nhà trường, Nhóm ĐHQL2-K10 triển khai khảo sát ý kiến phản hồi của các bạn. Mọi ý kiến đóng góp hoàn toàn được giữ bí mật và là cơ sở để Nhà trường nâng cao chất lượng dịch vụ.',
      targetAudience: targetClean || 'Cán bộ, Giảng viên và Sinh viên HITU',
      likertScale: {
        '1': 'Rất không hài lòng',
        '2': 'Không hài lòng',
        '3': 'Bình thường',
        '4': 'Hài lòng',
        '5': 'Rất hài lòng',
      },
      sections: [
        {
          id: 'sec_ct_1',
          title: 'PHẦN I: THÔNG TIN CHUNG VÀ TẦN SUẤT SỬ DỤNG',
          questions: [
            { id: 'q_ct1', code: 'TT1', content: '1. Bạn là:', type: 'single', options: ['Sinh viên', 'Cán bộ / Giảng viên'] },
            { id: 'q_ct2', code: 'TT2', content: '2. Tần suất bạn sử dụng dịch vụ tại Căn tin trường:', type: 'single', options: ['Hàng ngày (từ 1-2 lần/ngày)', 'Vài lần một tuần', 'Hiếm khi sử dụng', 'Chưa từng sử dụng'] },
            { id: 'q_ct3', code: 'TT3', content: '3. Mức chi tiêu trung bình cho một bữa ăn tại Căn tin:', type: 'single', options: ['Dưới 25.000 đồng', 'Từ 25.000 – 35.000 đồng', 'Từ 35.000 – 50.000 đồng', 'Trên 50.000 đồng'] },
          ],
        },
        {
          id: 'sec_ct_2',
          title: 'PHẦN II: ĐÁNH GIÁ CHẤT LƯỢNG DỊCH VỤ CĂN TIN',
          description: 'Xin vui lòng đánh giá mức độ hài lòng theo thang điểm 1 đến 5:',
          questions: [
            {
              id: 'q_mat_ct',
              code: 'CT',
              content: 'Đánh giá các tiêu chí dịch vụ căn tin:',
              type: 'matrix',
              matrixItems: [
                { code: 'CT1', statement: 'Mức giá bữa ăn phù hợp với túi tiền của sinh viên' },
                { code: 'CT2', statement: 'Thực đơn phong phú, đa dạng và thay đổi theo ngày' },
                { code: 'CT3', statement: 'Mùi vị món ăn thơm ngon, hợp khẩu vị' },
                { code: 'CT4', statement: 'Đảm bảo vệ sinh an toàn thực phẩm, thức ăn nóng sốt' },
                { code: 'CT5', statement: 'Không gian căn tin sạch sẽ, thoáng mát, đủ bàn ghế' },
                { code: 'CT6', statement: 'Thái độ phục vụ của nhân viên căn tin niềm nở, lịch sự' },
                { code: 'CT7', statement: 'Tốc độ phục vụ nhanh chóng, không phải chờ đợi lâu' },
              ],
            },
          ],
        },
        {
          id: 'sec_ct_3',
          title: 'PHẦN III: ĐÓNG GÓP Ý KIẾN VÀ ĐỀ XUẤT',
          questions: [
            { id: 'q_ct_op1', code: 'DX1', content: 'Bạn có đề xuất món ăn hoặc dịch vụ nào muốn Căn tin bổ sung?', type: 'text', placeholder: 'Ghi đề xuất món ăn, đồ uống...' },
            { id: 'q_ct_op2', code: 'DX2', content: 'Ý kiến góp ý khác để hoàn thiện dịch vụ Căn tin trường HITU:', type: 'text', placeholder: 'Góp ý về giá, vệ sinh, không gian...' },
          ],
        },
      ],
      closing: 'TRÂN TRỌNG CẢM ƠN Ý KIẾN ĐÓNG GÓP CỦA BẠN!\nKính chúc Quý vị và các bạn sinh viên luôn có những bữa ăn ngon miệng và nhiều năng lượng!',
      locationDate: 'Hà Nội, ngày ... tháng ... năm 2026',
      signatoryTitle: 'ĐẠI DIỆN NHÓM ĐHQL2-K10',
      signatoryNote: '(Ký và ghi rõ họ tên)',
    };
  }

  // 4. General / Custom Survey: Synthesize dynamically around the exact user topic!
  const finalTopic = topicClean || 'Nghiên cứu khoa học và khảo sát thực tiễn';
  const finalTarget = targetClean || 'Sinh viên / Cán bộ / Đối tượng tham gia';
  const finalPurpose = purposeClean || `Thu thập dữ liệu thực tế phục vụ đề tài của Nhóm ĐHQL2-K10 HITU`;

  return {
    institution: 'BỘ CÔNG THƯƠNG',
    university: 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VÀ THƯƠNG MẠI HÀ NỘI (HITU)',
    department: 'NHÓM ĐHQL2-K10 - KHOA QUẢN LÝ',
    surveyCode: `PKS-HITU-K10/${new Date().getFullYear()}`,
    title: `PHIẾU KHẢO SÁT Ý KIẾN\nVỀ ${finalTopic.toUpperCase()}`,
    subtitle: `Phục vụ: ${finalPurpose}`,
    introduction: `Kính gửi: Quý Anh/Chị và các bạn,\n\nĐể phục vụ công tác nghiên cứu khoa học và đánh giá thực tế của Nhóm ĐHQL2-K10 Trường Đại học Công nghiệp và Thương mại Hà Nội (HITU) về đề tài "${finalTopic}", nhóm chúng tôi rất mong nhận được những ý kiến đánh giá khách quan của Quý vị.\n\nMọi thông tin đóng góp trong phiếu này hoàn toàn được giữ bí mật và chỉ phục vụ duy nhất cho mục đích nghiên cứu học thuật. Xin trân trọng cảm ơn sự phối hợp của Quý vị!`,
    targetAudience: finalTarget,
    likertScale: {
      '1': 'Hoàn toàn không đồng ý / Rất không hài lòng',
      '2': 'Không đồng ý / Không hài lòng',
      '3': 'Bình thường / Trung lập',
      '4': 'Đồng ý / Hài lòng',
      '5': 'Hoàn toàn đồng ý / Rất hài lòng',
    },
    sections: [
      {
        id: 'sec_gen_info',
        title: 'PHẦN I: THÔNG TIN CHUNG CỦA ĐỐI TƯỢNG KHẢO SÁT',
        description: 'Quý vị vui lòng lựa chọn phương án phù hợp nhất (đánh dấu ✓ vào ô tương ứng):',
        questions: [
          {
            id: 'q_gen_1',
            code: 'TT1',
            content: '1. Giới tính của Anh/Chị/Bạn:',
            type: 'single',
            options: ['Nam', 'Nữ', 'Khác'],
          },
          {
            id: 'q_gen_2',
            code: 'TT2',
            content: '2. Năm học / Thâm niên công tác:',
            type: 'single',
            options: ['Năm thứ nhất', 'Năm thứ hai', 'Năm thứ ba', 'Năm thứ tư / Tốt nghiệp', 'Cán bộ / Giảng viên'],
          },
          {
            id: 'q_gen_3',
            code: 'TT3',
            content: '3. Khối ngành / Đơn vị:',
            type: 'single',
            options: [
              'Kinh tế - Quản lý - Thương mại',
              'Công nghệ thông tin - Trí tuệ nhân tạo',
              'Du lịch - Ngoại ngữ',
              'Kỹ thuật - Công nghệ',
              'Khối ngành khác',
            ],
          },
          {
            id: 'q_gen_4',
            code: 'TT4',
            content: `4. Mức độ quan tâm của bạn đối với vấn đề "${finalTopic}":`,
            type: 'single',
            options: ['Rất ít quan tâm', 'Ít quan tâm', 'Quan tâm ở mức bình thường', 'Rất quan tâm'],
          },
        ],
      },
      {
        id: 'sec_reality',
        title: `PHẦN II: THỰC TRẠNG VÀ CÁC YẾU TỐ LIÊN QUAN`,
        description: 'Vui lòng cung cấp thông tin về trải nghiệm thực tế của bạn:',
        questions: [
          {
            id: 'q_real_1',
            code: 'TT_TH1',
            content: `5. Đánh giá mức độ phổ biến / thường xuyên tiếp xúc với vấn đề "${finalTopic}":`,
            type: 'single',
            options: ['Hiếm khi / Chưa từng', 'Thỉnh thoảng', 'Thường xuyên', 'Rất thường xuyên'],
          },
          {
            id: 'q_real_2',
            code: 'TT_TH2',
            content: '6. Những yếu tố có ảnh hưởng lớn nhất đối với bạn (có thể chọn nhiều phương án):',
            type: 'multiple',
            options: [
              'Chi phí và điều kiện tài chính',
              'Chất lượng dịch vụ và cơ sở vật chất',
              'Sự hỗ trợ từ phía Nhà trường và thầy cô',
              'Thông tin hướng dẫn rõ ràng, minh bạch',
              'Tính an toàn, thuận tiện và an ninh',
              'Yếu tố khác: .....................................................',
            ],
          },
        ],
      },
      {
        id: 'sec_eval_matrix',
        title: 'PHẦN III: ĐÁNH GIÁ CHI TIẾT THEO THANG ĐO LIKERT',
        description: 'Xin vui lòng đánh dấu (✓) vào mức độ phản ánh đúng nhất quan điểm của Quý vị từ 1 đến 5:',
        questions: [
          {
            id: 'q_mat_main',
            code: 'DG',
            content: `7. Đánh giá các tiêu chí liên quan đến: ${finalTopic}`,
            type: 'matrix',
            matrixItems: [
              { code: 'DG1', statement: `Mục tiêu và nội dung liên quan đến "${finalTopic}" được phổ biến rõ ràng, dễ tiếp cận` },
              { code: 'DG2', statement: 'Các điều kiện hỗ trợ thực tế đáp ứng tốt nhu cầu và kỳ vọng của người học' },
              { code: 'DG3', statement: 'Chi phí và quyền lợi được bảo đảm thỏa đáng, công khai minh bạch' },
              { code: 'DG4', statement: 'Môi trường xung quanh an toàn, văn minh và tạo điều kiện thuận lợi nhất' },
              { code: 'DG5', statement: 'Thái độ ứng xử và sự hỗ trợ từ các bên liên quan nhiệt tình, trách nhiệm' },
              { code: 'DG6', statement: 'Quy trình giải quyết các vướng mắc, thắc mắc được xử lý nhanh chóng, kịp thời' },
              { code: 'DG7', statement: 'Mức độ hài lòng chung của bạn về các vấn đề liên quan đến chủ đề này' },
            ],
          },
        ],
      },
      {
        id: 'sec_open_feedback',
        title: 'PHẦN IV: KHÓ KHĂN VÀ Ý KIẾN ĐỀ XUẤT GIẢI PHÁP',
        description: 'Những ý kiến tâm huyết của Quý vị là cơ sở quý báu để Nhóm ĐHQL2-K10 hoàn thiện đề tài:',
        questions: [
          {
            id: 'q_open_diff',
            code: 'DX1',
            content: `8. Những khó khăn hoặc bất cập lớn nhất bạn từng gặp phải liên quan đến "${finalTopic}":`,
            type: 'text',
            placeholder: 'Vui lòng nêu các khó khăn cụ thể của bạn...',
          },
          {
            id: 'q_open_rec',
            code: 'DX2',
            content: `9. Bạn có đề xuất hoặc giải pháp gì gửi đến Nhà trường (HITU) và Nhóm nghiên cứu để cải thiện vấn đề trên?`,
            type: 'text',
            placeholder: 'Ghi ý kiến đóng góp, giải pháp cụ thể...',
          },
        ],
      },
    ],
    closing:
      'NHÓM ĐHQL2-K10 TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VÀ THƯƠNG MẠI HÀ NỘI (HITU) XIN TRÂN TRỌNG CẢM ƠN SỰ PHỐI HỢP CỦA QUÝ VỊ!\nKính chúc Quý vị và các bạn luôn dồi dào sức khỏe, thành công trong học tập và công tác!',
    locationDate: 'Hà Nội, ngày ... tháng ... năm 2026',
    signatoryTitle: 'ĐẠI DIỆN NHÓM ĐHQL2-K10',
    signatoryNote: '(Ký và ghi rõ họ tên)',
  };
}

// API to generate survey via Gemini with retry and fallback
app.post('/api/surveys/generate', async (req, res) => {
  const {
    topic,
    surveyType,
    targetAudience,
    purpose,
    questionCount,
    customRequirements,
  } = req.body;

  const topicPrompt = topic || 'Khảo sát thực tiễn đời sống và học tập sinh viên';
  let targetPrompt = (targetAudience || '').trim();
  let typePrompt = (surveyType || '').trim();

  if (/thuê nhà|nhà trọ|phòng trọ|ở trọ|chỗ ở|ký túc xá|sinh viên/i.test(topicPrompt)) {
    if (!targetPrompt || /doanh nghiệp|người sử dụng lao động/i.test(targetPrompt)) {
      targetPrompt = 'Sinh viên các khóa thuộc Trường Đại học Công nghiệp và Thương mại Hà Nội (HITU)';
    }
    if (!typePrompt || /doanh nghiệp|tuyển dụng/i.test(typePrompt)) {
      typePrompt = 'Khảo sát Đời sống & Nhà trọ Sinh viên';
    }
  } else if (!targetPrompt) {
    targetPrompt = 'Sinh viên Trường Đại học Công nghiệp và Thương mại Hà Nội (HITU)';
  }

  const userPrompt = `Hãy tạo một phiếu khảo sát hoàn chỉnh theo chuẩn hành chính Việt Nam (Nghị định 30/2020/NĐ-CP) và khoa học cho Nhóm ĐHQL2-K10 - Trường Đại học Công nghiệp và Thương mại Hà Nội (HITU).

Thông tin yêu cầu cụ thể:
- CHỦ ĐỀ KHẢO SÁT: ${topicPrompt}
- THỂ LOẠI KHẢO SÁT: ${typePrompt || 'Khảo sát thực tế sinh viên'}
- ĐỐI TƯỢNG KHẢO SÁT: ${targetPrompt}
- MỤC ĐÍCH KHẢO SÁT: ${purpose || 'Thu thập dữ liệu thực nghiệm phục vụ đề tài nghiên cứu của nhóm ĐHQL2-K10 HITU'}
- SỐ LƯỢNG CÂU HỎI: khoảng ${questionCount || '15-20'} câu hỏi/tiêu chí đánh giá
- YÊU CẦU ĐẶC BIỆT: ${customRequirements || 'Thiết kế thang đo Likert 5 mức chuẩn, bảng ma trận đánh giá rõ ràng, câu hỏi mở thực tiễn.'}

ĐẶC BIỆT LƯU Ý: Tiêu đề và tất cả các câu hỏi trong phiếu PHẢI BÁM SÁT CHỦ ĐỀ "${topicPrompt}". TUYỆT ĐỐI KHÔNG sinh nội dung sai lệch sang chủ đề khác.

Phải trả về DUY NHẤT chuỗi JSON hợp lệ theo đúng schema hướng dẫn, không kèm markdown khác ngoài JSON.`;

  // Candidate models to try in resilient order
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.6-flash'];

  for (const model of candidateModels) {
    try {
      console.log(`[Gemini API] Requesting survey generation with model: ${model} for topic: "${topicPrompt}"`);
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: MASTER_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleaned);
      }

      if (parsedData && parsedData.title && parsedData.sections && parsedData.sections.length > 0) {
        console.log(`[Gemini API] Success with model ${model}! Title: ${parsedData.title}`);
        return res.json({ success: true, survey: parsedData });
      }
    } catch (err: any) {
      console.warn(`[Gemini API] Model ${model} failed:`, err?.message || err);
    }
  }

  // If upstream API is unavailable, invoke the topic-aware structured survey generator
  console.log(`[Server] Generating structured survey specifically for topic: "${topicPrompt}"`);
  const fallback = createStructuredSurveyFallback({
    topic,
    surveyType,
    targetAudience,
    purpose,
    questionCount,
    customRequirements,
  });

  return res.json({ success: true, survey: fallback });
});

// Serve frontend in development via Vite middlewares or production via dist
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[HITU-Survey-Server] Server running on http://0.0.0.0:${PORT}`);
});
