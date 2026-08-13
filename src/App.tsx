import React, { useState, useEffect, useMemo } from 'react';
import { MaintenanceReportData, FineTuneSettings, ArchiveRecord } from './types';
import { defaultReportData, defaultFineTuneSettings, createDefaultReport, ensureReportQuantities } from './data/defaultReport';
import { HeaderNavbar } from './components/HeaderNavbar';
import { ReportPDFPreview } from './components/ReportPDFPreview';
import { FineTunePanel } from './components/FineTunePanel';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { ArchiveHistoryModal } from './components/ArchiveHistoryModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { PPTModal } from './components/PPTModal';
import { RegionSelector } from './components/RegionSelector';
import { downloadSampleExcelTemplate } from './utils/excelHelper';
import { exportToPdf, printDocument } from './utils/pdfExport';
import { Check, Sparkles, SlidersHorizontal, Layers, RotateCcw, Presentation } from 'lucide-react';

const STORAGE_KEY_REPORTS_MAP = 'mtr_pm_reports_by_depot_v3';
const STORAGE_KEY_FINETUNE = 'mtr_pm_finetune_settings';
const STORAGE_KEY_ARCHIVES = 'mtr_pm_archives_history';

export default function App() {
  // --- Active Depot Tab ---
  const [currentDepot, setCurrentDepot] = useState<string>('TWD');

  // --- Reports Map by Depot (TWD, TMD, SHD) ---
  const [reportsByDepot, setReportsByDepot] = useState<Record<string, MaintenanceReportData>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS_MAP);
      if (saved) {
        const parsedMap = JSON.parse(saved);
        if (parsedMap && (parsedMap.TWD || parsedMap.TMD || parsedMap.SHD)) {
          return {
            TWD: ensureReportQuantities(parsedMap.TWD || createDefaultReport('TWD'), 'TWD'),
            TMD: ensureReportQuantities(parsedMap.TMD || createDefaultReport('TMD'), 'TMD'),
            SHD: ensureReportQuantities(parsedMap.SHD || createDefaultReport('SHD'), 'SHD'),
          };
        }
      }

      // Migration fallback from single report
      const legacySaved = localStorage.getItem('mtr_pm_report_data');
      let twdReport = createDefaultReport('TWD');
      if (legacySaved) {
        try {
          const legacy = JSON.parse(legacySaved);
          if (legacy && legacy.items) {
            twdReport = legacy;
          }
        } catch (e) {}
      }

      return {
        TWD: ensureReportQuantities(twdReport, 'TWD'),
        TMD: ensureReportQuantities(createDefaultReport('TMD'), 'TMD'),
        SHD: ensureReportQuantities(createDefaultReport('SHD'), 'SHD'),
      };
    } catch (e) {
      return {
        TWD: ensureReportQuantities(createDefaultReport('TWD'), 'TWD'),
        TMD: ensureReportQuantities(createDefaultReport('TMD'), 'TMD'),
        SHD: ensureReportQuantities(createDefaultReport('SHD'), 'SHD'),
      };
    }
  });

  // Current Active Report Data
  const reportData = useMemo(() => {
    const raw = reportsByDepot[currentDepot] || createDefaultReport(currentDepot);
    return ensureReportQuantities(raw, currentDepot);
  }, [reportsByDepot, currentDepot]);

  // Helper to update current report
  const setReportData = (
    newDataOrFn: MaintenanceReportData | ((prev: MaintenanceReportData) => MaintenanceReportData)
  ) => {
    setReportsByDepot((prevMap) => {
      const current = prevMap[currentDepot] || createDefaultReport(currentDepot);
      const updated = typeof newDataOrFn === 'function' ? newDataOrFn(current) : newDataOrFn;
      return {
        ...prevMap,
        [currentDepot]: updated,
      };
    });
  };

  const [fineTuneSettings, setFineTuneSettings] = useState<FineTuneSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FINETUNE);
      return saved ? JSON.parse(saved) : defaultFineTuneSettings;
    } catch (e) {
      return defaultFineTuneSettings;
    }
  });

  const [archives, setArchives] = useState<ArchiveRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ARCHIVES);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Modals & Panel Toggles
  const [isFineTuneOpen, setIsFineTuneOpen] = useState(false);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [isArchiveHistoryOpen, setIsArchiveHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPptOpen, setIsPptOpen] = useState(false);

  // Status banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | undefined>();

  // WO Fill Stats for each Depot Tab
  const woStats = useMemo(() => {
    const stats: Record<string, { filled: number; total: number }> = {};
    ['TWD', 'TMD', 'SHD'].forEach((code) => {
      const rep = reportsByDepot[code];
      if (rep && Array.isArray(rep.items)) {
        const filled = rep.items.filter((item) => item.pmWo && item.pmWo.trim() !== '').length;
        stats[code] = { filled, total: rep.items.length };
      } else {
        stats[code] = { filled: 0, total: 0 };
      }
    });
    return stats;
  }, [reportsByDepot]);

  // --- Auto-save reportsByDepot map to localStorage ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS_MAP, JSON.stringify(reportsByDepot));
      setLastSavedTime(new Date().toISOString());
    } catch (err) {
      console.error('Failed to save reportsByDepot to localStorage', err);
    }
  }, [reportsByDepot]);

  // --- Save fine-tune settings to localStorage ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FINETUNE, JSON.stringify(fineTuneSettings));
    } catch (err) {
      console.error('Failed to save fine-tune settings', err);
    }
  }, [fineTuneSettings]);

  // --- Save archives to localStorage ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ARCHIVES, JSON.stringify(archives));
    } catch (err) {
      console.error('Failed to save archives', err);
    }
  }, [archives]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Handlers ---
  const handleDataParsedFromExcel = (
    parsedData: Partial<MaintenanceReportData>,
    fileName: string
  ) => {
    // Preserve existing item quantities if parsed items don't provide a new non-empty QTY
    const mergedItems =
      parsedData.items && parsedData.items.length > 0
        ? (parsedData.items as any[]).map((parsedItem) => {
            const existingItem = reportData.items.find(
              (i) =>
                i.workDescription === parsedItem.workDescription ||
                i.id === parsedItem.id
            );
            const finalQty =
              parsedItem.qty && String(parsedItem.qty).trim() !== ''
                ? parsedItem.qty
                : existingItem?.qty && String(existingItem.qty).trim() !== ''
                ? existingItem.qty
                : '1';

            return {
              ...parsedItem,
              qty: finalQty,
            };
          })
        : reportData.items;

    const updated: MaintenanceReportData = {
      ...reportData,
      ...parsedData,
      depotTitle: parsedData.depotTitle || reportData.depotTitle,
      reportMonthYear: parsedData.reportMonthYear || reportData.reportMonthYear,
      contractNo: parsedData.contractNo || reportData.contractNo,
      items: mergedItems,
      signatories: {
        ...reportData.signatories,
        ...(parsedData.signatories || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    setReportData(updated);
    showToast(`成功由 Excel 檔 (${fileName}) 讀取 ${updated.items.length} 項保養資料，已保留原數量 (QTY)！`);
  };

  const handleSaveToArchive = () => {
    const newRecord: ArchiveRecord = {
      id: `archive-${Date.now()}`,
      reportData: { ...reportData },
      fineTuneSettings: { ...fineTuneSettings },
      archivedAt: new Date().toISOString(),
      notes: `${reportData.depotTitle} (${reportData.reportMonthYear}) - ${reportData.items.length} 項目`,
    };

    setArchives([newRecord, ...archives]);
    showToast(`已成功歸檔紀錄「${reportData.depotTitle} (${reportData.reportMonthYear})」！`);
  };

  const handleLoadArchive = (record: ArchiveRecord) => {
    setReportData(record.reportData);
    if (record.fineTuneSettings) {
      setFineTuneSettings(record.fineTuneSettings);
    }
    showToast(`已載入歸檔紀錄「${record.reportData.depotTitle} (${record.reportData.reportMonthYear})」！`);
  };

  const handleDeleteArchive = (id: string) => {
    if (window.confirm('確定要刪除這筆歸檔歷史紀錄嗎？')) {
      setArchives(archives.filter((a) => a.id !== id));
      showToast('已刪除歸檔紀錄');
    }
  };

  const handleClearAllArchives = () => {
    if (window.confirm('確定要清空所有已歸檔的歷史報告嗎？此動作不可撤銷。')) {
      setArchives([]);
      showToast('已清空所有歷史歸檔紀錄');
    }
  };

  const handleExportPdf = async () => {
    showToast('正在繪製並準備下載 PDF 報告...');
    try {
      const fileName = `MTR_PM_Report_${reportData.depotCode}_${reportData.reportMonthYear.replace(/\s+/g, '_')}.pdf`;
      await exportToPdf('pdf-report-canvas', fileName, 'landscape');
      showToast('PDF 報告下載成功！');
    } catch (err) {
      console.error(err);
      showToast('已切換至畫面直接匯出（請選擇另存為 PDF）');
      window.print();
    }
  };

  const handleResetDefaultPdf = () => {
    if (
      window.confirm(
        '確定要重置為原始 PDF 預設內容與字眼嗎？\n（包含 MTRC Depot - TWD、M1202-19E、標準 21 項維修項目與數量及 Lee Siu Keung 簽署名稱）'
      )
    ) {
      setReportData(JSON.parse(JSON.stringify(defaultReportData)));
      setFineTuneSettings(JSON.parse(JSON.stringify(defaultFineTuneSettings)));
      showToast('已成功重置並載入原始 PDF 預設內容與排版設定！');
    }
  };

  const handlePrint = () => {
    printDocument('pdf-report-canvas');
  };

  const handleSelectRegion = (code: string, newTitle: string) => {
    const targetCode = code.toUpperCase();
    setCurrentDepot(targetCode);

    setReportsByDepot((prev) => {
      if (!prev[targetCode]) {
        return {
          ...prev,
          [targetCode]: createDefaultReport(targetCode),
        };
      }
      return prev;
    });

    showToast(`已切換至 ${targetCode} 車廠獨立分頁 (${newTitle})！`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-200 selection:text-slate-900 pb-36">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-emerald-400 animate-bounce">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <HeaderNavbar
        onUploadExcelClick={() => setIsExcelUploadOpen(true)}
        onResetDefaultPdfClick={handleResetDefaultPdf}
        onSaveToArchiveClick={handleSaveToArchive}
        onOpenArchiveHistoryClick={() => setIsArchiveHistoryOpen(true)}
        onExportPdfClick={handleExportPdf}
        onPrintClick={handlePrint}
        onOpenHelpClick={() => setIsHelpOpen(true)}
        onOpenPptClick={() => setIsPptOpen(true)}
        lastSavedTime={lastSavedTime}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-6 space-y-4">
        {/* Quick Toolbar / Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs no-print shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-slate-600">
              目前報告: <strong className="text-slate-900 font-bold">{reportData.depotTitle}</strong> ‧ 月份: <strong className="text-slate-900 font-bold">{reportData.reportMonthYear}</strong> ‧ 共有 <strong className="text-amber-600 font-bold">{reportData.items.length}</strong> 項保養項目
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaultPdf}
              className="px-3 py-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium flex items-center gap-1.5 transition-colors border border-amber-200"
              title="重置並載入原始 PDF 預設內容"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>重置載入 PDF 內容</span>
            </button>

            <button
              onClick={() => setIsFineTuneOpen(!isFineTuneOpen)}
              className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isFineTuneOpen ? '隱藏微調面板' : '展開微調面板'}</span>
            </button>

            <button
              onClick={() => setIsArchiveHistoryOpen(true)}
              className="px-3 py-1.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>已歸檔 ({archives.length})</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout with Region Selection Sidebar on the Left */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Region Selector */}
          <div className="lg:col-span-3 xl:col-span-2 space-y-4">
            <RegionSelector
              currentDepotCode={currentDepot}
              currentDepotTitle={reportData.depotTitle}
              onSelectRegion={handleSelectRegion}
              woStats={woStats}
            />
          </div>

          {/* Right/Center Live Editable PDF Preview Sheet */}
          <div className="lg:col-span-9 xl:col-span-10 relative">
            <ReportPDFPreview
              reportData={reportData}
              fineTuneSettings={fineTuneSettings}
              onUpdateReportData={setReportData}
              isEditingEnabled={true}
            />
          </div>
        </div>
      </main>

      {/* Bottom Fine-Tuning Drawer Panel ("微調功能在最底, 可隱藏") */}
      <FineTunePanel
        settings={fineTuneSettings}
        onChangeSettings={setFineTuneSettings}
        isOpen={isFineTuneOpen}
        onToggleOpen={() => setIsFineTuneOpen(!isFineTuneOpen)}
      />

      {/* Modals */}
      <ExcelUploadModal
        isOpen={isExcelUploadOpen}
        onClose={() => setIsExcelUploadOpen(false)}
        onDataParsed={handleDataParsedFromExcel}
        currentDepotCode={reportData.depotCode}
        existingItems={reportData.items}
      />

      <ArchiveHistoryModal
        isOpen={isArchiveHistoryOpen}
        onClose={() => setIsArchiveHistoryOpen(false)}
        archives={archives}
        onLoadArchive={handleLoadArchive}
        onDeleteArchive={handleDeleteArchive}
        onClearAllArchives={handleClearAllArchives}
      />

      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <PPTModal
        isOpen={isPptOpen}
        onClose={() => setIsPptOpen(false)}
      />
    </div>
  );
}
