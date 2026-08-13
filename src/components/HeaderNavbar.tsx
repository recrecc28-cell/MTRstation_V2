import React from 'react';
import {
  FileSpreadsheet,
  Download,
  FileDown,
  Printer,
  Archive,
  History,
  HelpCircle,
  Train,
  CheckCircle2,
  RotateCcw,
  Presentation,
} from 'lucide-react';

interface Props {
  onUploadExcelClick: () => void;
  onDownloadTemplateClick?: () => void;
  onResetDefaultPdfClick: () => void;
  onSaveToArchiveClick: () => void;
  onOpenArchiveHistoryClick: () => void;
  onExportPdfClick: () => void;
  onPrintClick: () => void;
  onOpenHelpClick: () => void;
  onOpenPptClick?: () => void;
  lastSavedTime?: string;
}

export const HeaderNavbar: React.FC<Props> = ({
  onUploadExcelClick,
  onResetDefaultPdfClick,
  onSaveToArchiveClick,
  onOpenArchiveHistoryClick,
  onExportPdfClick,
  onPrintClick,
  onOpenHelpClick,
  onOpenPptClick,
  lastSavedTime,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 shadow-sm sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Depot Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center text-white shadow-md border border-red-500">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-wide">
                港鐵保養工程報告自動化系統
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200 rounded">
                MTR Depot PM Report
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Excel 資料自動讀取歸檔 ‧ PDF 每個位置可微調 ‧ 即時繪圖導出
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PPT Presentation Button */}
          {onOpenPptClick && (
            <button
              type="button"
              onClick={onOpenPptClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-md transition-colors"
              title="查看系統介紹 PPT 簡報"
            >
              <Presentation className="w-4 h-4 text-purple-600" />
              <span>系統簡報 (PPT)</span>
            </button>
          )}

          {/* Upload Excel Button */}
          <button
            type="button"
            onClick={onUploadExcelClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs transition-colors"
            title="上傳港鐵保養清單 Excel 檔"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>上傳 Excel 檔</span>
          </button>

          {/* Reset & Load Default PDF Content */}
          <button
            type="button"
            onClick={onResetDefaultPdfClick}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 hover:border-amber-300 rounded-md transition-colors"
            title="重置並載入原始 PDF 預設內容"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>重置 PDF 預設內容</span>
          </button>

          {/* Save to Archive */}
          <button
            type="button"
            onClick={onSaveToArchiveClick}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-colors"
            title="歸檔目前保養紀錄"
          >
            <Archive className="w-3.5 h-3.5 text-amber-600" />
            <span>自動歸檔</span>
          </button>

          {/* Open Archive History */}
          <button
            type="button"
            onClick={onOpenArchiveHistoryClick}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-colors"
            title="查看已歸檔的每月報告歷史"
          >
            <History className="w-3.5 h-3.5 text-sky-600" />
            <span>歷史紀錄</span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={onPrintClick}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-colors"
            title="直接列印 PDF 畫面"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">列印</span>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={onExportPdfClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-md shadow-md transition-colors"
            title="匯出高清 A4 PDF 報告"
          >
            <FileDown className="w-4 h-4" />
            <span>匯出 PDF 檔</span>
          </button>

          {/* Help */}
          <button
            type="button"
            onClick={onOpenHelpClick}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="使用說明"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {lastSavedTime && (
        <div className="bg-slate-950 px-4 py-1 text-[11px] text-slate-400 flex items-center justify-end gap-1.5 border-t border-slate-850">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>已即時暫存更新 ({new Date(lastSavedTime).toLocaleTimeString()})</span>
        </div>
      )}
    </header>
  );
};
