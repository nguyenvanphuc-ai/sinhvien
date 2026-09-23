import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  convertMillimetersToTwip,
  ShadingType,
} from 'docx';
import { SurveyDocument } from '../types/survey';
import { normalizeSurveyDocument } from './surveyNormalizer';

const FONT_FAMILY = 'Times New Roman';

export async function generateSurveyDocxBlob(rawSurvey: SurveyDocument): Promise<Blob> {
  const survey = normalizeSurveyDocument(rawSurvey);
  const children: (Paragraph | Table)[] = [];

  // 1. Header 2-column table: Left: Institution & Unit; Right: Quốc hiệu & Tiêu ngữ
  const headerTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    rows: [
      new TableRow({
        children: [
          // Left cell
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: survey.institution || 'BỘ CÔNG THƯƠNG',
                    font: FONT_FAMILY,
                    size: 22, // 11pt
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: survey.university || 'TRƯỜNG ĐH CÔNG NGHIỆP VÀ THƯƠNG MẠI HÀ NỘI',
                    font: FONT_FAMILY,
                    size: 22,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: survey.department || 'NHÓM ĐHQL2-K10',
                    font: FONT_FAMILY,
                    size: 22,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: '---------***---------',
                    font: FONT_FAMILY,
                    size: 20,
                  }),
                ],
              }),
              ...(survey.surveyCode
                ? [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 80 },
                      children: [
                        new TextRun({
                          text: `Mã số: ${survey.surveyCode}`,
                          font: FONT_FAMILY,
                          size: 20,
                          italics: true,
                        }),
                      ],
                    }),
                  ]
                : []),
            ],
          }),
          // Right cell
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                    font: FONT_FAMILY,
                    size: 24, // 12pt
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: 'Độc lập - Tự do - Hạnh phúc',
                    font: FONT_FAMILY,
                    size: 26, // 13pt
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: '-----------------------',
                    font: FONT_FAMILY,
                    size: 20,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: survey.locationDate || 'Hà Nội, ngày ... tháng ... năm 2026',
                    font: FONT_FAMILY,
                    size: 22,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(headerTable);

  // Spacing after header
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [],
    })
  );

  // 2. Title & Subtitle
  const titleLines = survey.title.split('\n');
  titleLines.forEach((line) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 60 },
        children: [
          new TextRun({
            text: line.trim(),
            font: FONT_FAMILY,
            size: 30, // 15pt
            bold: true,
          }),
        ],
      })
    );
  });

  if (survey.subtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 180 },
        children: [
          new TextRun({
            text: survey.subtitle,
            font: FONT_FAMILY,
            size: 24, // 12pt
            italics: true,
          }),
        ],
      })
    );
  }

  // 3. Introduction & Purpose
  if (survey.introduction) {
    const introParagraphs = survey.introduction.split('\n\n');
    introParagraphs.forEach((pText) => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 80, after: 80, line: 280 },
          indent: { firstLine: convertMillimetersToTwip(10) },
          children: [
            new TextRun({
              text: pText.trim(),
              font: FONT_FAMILY,
              size: 26, // 13pt
            }),
          ],
        })
      );
    });
  }

  // Likert scale legend if present
  if (survey.likertScale) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: 'Quy ước thang đo đánh giá (Thang đo Likert 5 mức độ):',
            font: FONT_FAMILY,
            size: 24,
            bold: true,
            italics: true,
          }),
        ],
      })
    );
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 40, after: 120 },
        indent: { left: convertMillimetersToTwip(5) },
        children: [
          new TextRun({
            text: `[1]: ${survey.likertScale['1']}   |   [2]: ${survey.likertScale['2']}   |   [3]: ${survey.likertScale['3']}   |   [4]: ${survey.likertScale['4']}   |   [5]: ${survey.likertScale['5']}`,
            font: FONT_FAMILY,
            size: 22,
            italics: true,
          }),
        ],
      })
    );
  }

  // 4. Sections & Questions
  survey.sections.forEach((sec, secIdx) => {
    // Section header
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: sec.title,
            font: FONT_FAMILY,
            size: 26, // 13pt
            bold: true,
          }),
        ],
      })
    );

    if (sec.description) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 40, after: 100 },
          indent: { left: convertMillimetersToTwip(5) },
          children: [
            new TextRun({
              text: sec.description,
              font: FONT_FAMILY,
              size: 24,
              italics: true,
            }),
          ],
        })
      );
    }

    // Questions in this section
    sec.questions.forEach((q, qIdx) => {
      // Question content
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: q.content,
              font: FONT_FAMILY,
              size: 26,
              bold: true,
            }),
          ],
        })
      );

      // Render options based on type
      if (q.type === 'single' || q.type === 'multiple') {
        const symbol = '☐';
        const options = q.options || [];

        options.forEach((opt) => {
          children.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 30, after: 40 },
              indent: { left: convertMillimetersToTwip(8) },
              children: [
                new TextRun({
                  text: `${symbol}  ${opt}`,
                  font: FONT_FAMILY,
                  size: 24,
                }),
              ],
            })
          );
        });
      } else if (q.type === 'text') {
        // Dot lines for handwriting if not already embedded in the question content
        const alreadyHasDotted = q.content.includes('.....');
        if (!alreadyHasDotted) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 40, after: 40 },
              indent: { left: convertMillimetersToTwip(5) },
              children: [
                new TextRun({
                  text: '......................................................................................................................................................................',
                  font: FONT_FAMILY,
                  size: 22,
                  color: '666666',
                }),
              ],
            })
          );
          children.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 20, after: 60 },
              indent: { left: convertMillimetersToTwip(5) },
              children: [
                new TextRun({
                  text: '......................................................................................................................................................................',
                  font: FONT_FAMILY,
                  size: 22,
                  color: '666666',
                }),
              ],
            })
          );
        }
      } else if (q.type === 'matrix' && q.matrixItems && q.matrixItems.length > 0) {
        // Likert Explanation Paragraph right above table
        children.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 80, after: 60 },
            children: [
              new TextRun({
                text: '* Quy ước thang điểm đánh giá chi tiết (1 đến 5): ',
                font: FONT_FAMILY,
                size: 22,
                bold: true,
                color: '0A3678',
              }),
              new TextRun({
                text: '[1]: Rất không hài lòng / Rất kém   |   [2]: Không hài lòng / Kém   |   [3]: Bình thường / Trung bình   |   [4]: Hài lòng / Tốt   |   [5]: Rất hài lòng / Rất tốt',
                font: FONT_FAMILY,
                size: 21,
                italics: true,
                color: '333333',
              }),
            ],
          })
        );

        // Likert Matrix Table
        const borderDef = {
          style: BorderStyle.SINGLE,
          size: 4,
          color: '333333',
        };

        const tableRows: TableRow[] = [];

        const colLabels: Record<string, string> = {
          '1': 'Rất kém',
          '2': 'Kém',
          '3': 'T.Bình',
          '4': 'Tốt',
          '5': 'Rất tốt',
        };

        // Table Header
        tableRows.push(
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                width: { size: 9, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.CLEAR, fill: '0A3678' },
                borders: { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 60, after: 60 },
                    children: [
                      new TextRun({ text: 'Mã', font: FONT_FAMILY, size: 21, bold: true, color: 'FFFFFF' }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 56, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.CLEAR, fill: '0A3678' },
                borders: { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 60, after: 60 },
                    children: [
                      new TextRun({
                        text: 'Tiêu chí / Nội dung đánh giá',
                        font: FONT_FAMILY,
                        size: 21,
                        bold: true,
                        color: 'FFFFFF',
                      }),
                    ],
                  }),
                ],
              }),
              ...['1', '2', '3', '4', '5'].map(
                (num) =>
                  new TableCell({
                    width: { size: 7, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: '0A3678' },
                    borders: { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 40, after: 20 },
                        children: [
                          new TextRun({ text: num, font: FONT_FAMILY, size: 21, bold: true, color: 'F59E0B' }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 40 },
                        children: [
                          new TextRun({ text: colLabels[num] || '', font: FONT_FAMILY, size: 16, color: 'FFFFFF' }),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          })
        );

        // Rows for each matrix item
        q.matrixItems.forEach((item) => {
          tableRows.push(
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 8, type: WidthType.PERCENTAGE },
                  borders: { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 60, after: 60 },
                      children: [
                        new TextRun({ text: item.code, font: FONT_FAMILY, size: 22, bold: true }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 57, type: WidthType.PERCENTAGE },
                  borders: { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.LEFT,
                      spacing: { before: 60, after: 60 },
                      children: [
                        new TextRun({ text: item.statement, font: FONT_FAMILY, size: 22 }),
                      ],
                    }),
                  ],
                }),
                ...[1, 2, 3, 4, 5].map(
                  () =>
                    new TableCell({
                      width: { size: 7, type: WidthType.PERCENTAGE },
                      borders: { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 60, after: 60 },
                          children: [new TextRun({ text: '☐', font: FONT_FAMILY, size: 20 })],
                        }),
                      ],
                    })
                ),
              ],
            })
          );
        });

        const matrixTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        });

        children.push(matrixTable);
      }
    });
  });

  // 5. Closing & Thanks
  if (survey.closing) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 240, after: 120 },
        indent: { firstLine: convertMillimetersToTwip(10) },
        children: [
          new TextRun({
            text: survey.closing,
            font: FONT_FAMILY,
            size: 26,
            italics: true,
          }),
        ],
      })
    );
  }

  // 6. Signatures (Right aligned column table)
  const signTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 40 },
                children: [
                  new TextRun({
                    text: 'NGƯỜI ĐƯỢC KHẢO SÁT',
                    font: FONT_FAMILY,
                    size: 24,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 20, after: 800 },
                children: [
                  new TextRun({
                    text: '(Ký hoặc ghi ý kiến tự nguyện)',
                    font: FONT_FAMILY,
                    size: 20,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: survey.locationDate || 'Hà Nội, ngày ... tháng ... năm 2026',
                    font: FONT_FAMILY,
                    size: 22,
                    italics: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: survey.signatoryTitle || 'ĐẠI DIỆN NHÓM ĐHQL2-K10',
                    font: FONT_FAMILY,
                    size: 24,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 20, after: 800 },
                children: [
                  new TextRun({
                    text: survey.signatoryNote || '(Ký và ghi rõ họ tên)',
                    font: FONT_FAMILY,
                    size: 20,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(signTable);

  // Create Document with Decree 30 margins:
  // Top: 20mm (1134 twip)
  // Bottom: 20mm (1134 twip)
  // Left: 30mm (1701 twip)
  // Right: 15mm (850 twip)
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(20),
              bottom: convertMillimetersToTwip(20),
              left: convertMillimetersToTwip(30),
              right: convertMillimetersToTwip(15),
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlobAsFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
