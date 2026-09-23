import React from 'react';
import { FileDown, Printer, FileText, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  onExportDocx: () => void;
  onPrint: () => void;
  onOpenMasterPrompt: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onExportDocx,
  onPrint,
  onOpenMasterPrompt,
  isExporting,
}) => {
  return (
    <header className="no-print bg-gradient-to-r from-[#0a3678] via-[#0d47a1] to-[#002171] text-white shadow-lg border-b-2 border-amber-400 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Unit Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 border-2 border-amber-200 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-xl font-black tracking-wider text-[#0a3678]">HITU</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded border border-amber-400/40 uppercase tracking-wide">
                  Nhóm ĐHQL2-K10
                </span>
                <span className="text-xs text-blue-200 hidden sm:inline">
                  Chuẩn Nghị định 30/2020/NĐ-CP • Phong cách Vàng - Xanh
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                Trường Đại học Công nghiệp và Thương mại Hà Nội
              </h1>
              <p className="text-xs text-blue-100/90 font-medium">
                Hệ Thống Thiết Kế & Xuất Bản Phiếu Khảo Sát Hành Chính Tự Động AI
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            <button
              onClick={onOpenMasterPrompt}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition shadow-sm cursor-pointer"
              title="Xem và sao chép Bộ Master Prompt chi tiết nhất"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span className="font-semibold">Bộ Prompt Chuẩn</span>
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition shadow-sm cursor-pointer"
              title="In trực tiếp hoặc Lưu dạng PDF"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>In ấn / PDF</span>
            </button>

            <button
              onClick={onExportDocx}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-black rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-[#0a3678] border border-amber-300 transition shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              title="Xuất file Microsoft Word (.docx) chuẩn thể thức hành chính"
            >
              <FileDown className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Đang tạo File Word...' : 'Xuất File Word (.docx)'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
