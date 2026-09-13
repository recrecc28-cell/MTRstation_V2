import React, { useState, useEffect, useMemo } from 'react';
import { MaintenanceReportData, FineTuneSettings, ArchiveRecord } from './types';
import {
  defaultReportData,
  defaultFineTuneSettings,
  createDefaultReport,
  ensureReportQuantities,
} from './data/defaultReport';
import {
  ALL_MTR_LOCATIONS,
  MTR_STATIONS_LIST,
  MTR_DEPOTS_LIST,
  getLocationByCode,
  getLocationTitle,
} from './data/mtrLocations';
import { HeaderNavbar } from './components/HeaderNavbar';
import { ReportPDFPreview } from './components/ReportPDFPreview';
import { FineTunePanel } from './components/FineTunePanel';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { ArchiveHistoryModal } from './components/ArchiveHistoryModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { PPTModal } from './components/PPTModal';
import { exportToPdf, printDocument } from './utils/pdfExport';
import {
  Check,
  SlidersHorizontal,
  Train,
  RotateCcw,
  Trash2,
} from 'lucide-react';

const STORAGE_KEY_REPORTS_MAP = 'mtr_pm_reports_by_depot_v4';
const STORAGE_KEY_ACTIVE_DEPOT = 'mtr_pm_active_depot_code';
const STORAGE_KEY_FINETUNE = 'mtr_pm_finetune_settings';
const STORAGE_KEY_ARCHIVES = 'mtr_pm_archives_history';

export default function App() {
  // Active Station/Depot Tab
  const [currentDepot, setCurrentDepot] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_DEPOT);
      if (saved && getLocationByCode(saved)) {
        return saved;
      }
      return 'AIR';
    } catch {
      return 'AIR';
    }
  });

  // Reports Map by Station/Depot (17 Stations + 3 Depots)
  const [reportsByDepot, setReportsByDepot] = useState<Record<string, MaintenanceReportData>>(() => {
    try {
      const savedV4 = localStorage.getItem(STORAGE_KEY_REPORTS_MAP);
      const savedV3 = localStorage.getItem('mtr_pm_reports_by_depot_v3');
      const saved = savedV4 || savedV3;
      let parsedMap: Record<string, any> = {};

      if (saved) {
        try {
          parsedMap = JSON.parse(saved) || {};
        } catch (e) {
          console.error('Failed to parse saved reports map', e);
        }
      }

      const result: Record<string, MaintenanceReportData> = {};
      ALL_MTR_LOCATIONS.forEach((loc) => {
        const code = loc.code;
        if (parsedMap[code]) {
          result[code] = ensureReportQuantities(parsedMap[code], code);
        } else {
          result[code] = createDefaultReport(code);
        }
      });

      return result;
    } catch (e) {
      const result: Record<string, MaintenanceReportData> = {};
      ALL_MTR_LOCATIONS.forEach((loc) => {
        result[loc.code] = createDefaultReport(loc.code);
      });
      return result;
    }
  });

  // Current Active Report Data
  const reportData = useMemo(() => {
    const raw = reportsByDepot[currentDepot] || createDefaultReport(currentDepot);
    return ensureReportQuantities(raw, currentDepot);
  }, [reportsByDepot, currentDepot]);

  // Current Location Info
  const currentLocationInfo = useMemo(() => {
    return getLocationByCode(currentDepot);
  }, [currentDepot]);

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

  // WO Fill Stats
  const woStats = useMemo(() => {
    const stats: Record<string, { filled: number; total: number }> = {};
    ALL_MTR_LOCATIONS.forEach((loc) => {
      const code = loc.code;
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

  // Auto-save active depot
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_DEPOT, currentDepot);
    } catch (err) {
      console.error('Failed to save active depot', err);
    }
  }, [currentDepot]);

  // Auto-save reportsByDepot map
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS_MAP, JSON.stringify(reportsByDepot));
      setLastSavedTime(new Date().toISOString());
    } catch (err) {
      console.error('Failed to save reportsByDepot to localStorage', err);
    }
  }, [reportsByDepot]);

  // Save fine-tune settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FINETUNE, JSON.stringify(fineTuneSettings));
    } catch (err) {
      console.error('Failed to save fine-tune settings', err);
    }
  }, [fineTuneSettings]);

  // Save archives
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

  // Handlers
  const handleDataParsedFromExcel = (
    parsedData: Partial<MaintenanceReportData>,
    fileName: string
  ) => {
    const targetCode = (parsedData.depotCode || currentDepot).toUpperCase();
    const currentForTarget = reportsByDepot[targetCode] || createDefaultReport(targetCode);

    const mergedItems =
      parsedData.items && parsedData.items.length > 0
        ? (parsedData.items as any[]).map((parsedItem) => {
            const existingItem = currentForTarget.items.find(
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
              station: targetCode,
              qty: finalQty,
            };
          })
        : currentForTarget.items;

    const updated: MaintenanceReportData = {
      ...currentForTarget,
      ...parsedData,
      depotCode: targetCode,
      depotTitle: parsedData.depotTitle || getLocationTitle(targetCode),
      reportMonthYear: parsedData.reportMonthYear || currentForTarget.reportMonthYear,
      contractNo: parsedData.contractNo || currentForTarget.contractNo,
      items: mergedItems,
      signatories: {
        ...currentForTarget.signatories,
        ...(parsedData.signatories || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    if (targetCode !== currentDepot) {
      setCurrentDepot(targetCode);
    }

    setReportsByDepot((prev) => ({
      ...prev,
      [targetCode]: updated,
    }));

    showToast(`已匯入 Excel 檔 (${fileName}) 至 ${targetCode} 站 (${updated.items.length} 項目)！`);
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
    showToast(`已歸檔「${reportData.depotTitle} (${reportData.reportMonthYear})」！`);
  };

  const handleLoadArchive = (record: ArchiveRecord) => {
    if (record.reportData.depotCode) {
      setCurrentDepot(record.reportData.depotCode);
    }
    setReportData(record.reportData);
    if (record.fineTuneSettings) {
      setFineTuneSettings(record.fineTuneSettings);
    }
    showToast(`已載入歸檔紀錄「${record.reportData.depotTitle}」！`);
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
    showToast('正在產生並下載 A4 PDF 報告...');
    try {
      const fileName = `MTR_PM_Report_${reportData.depotCode}_${reportData.reportMonthYear.replace(/\s+/g, '_')}.pdf`;
      await exportToPdf('pdf-report-canvas', fileName, 'landscape');
      showToast('PDF 報告下載完成！');
    } catch (err) {
      console.error(err);
      showToast('切換為列印輸出模式');
      window.print();
    }
  };

  const handleResetDefaultPdf = () => {
    const loc = getLocationByCode(currentDepot);
    const locName = loc ? `${loc.nameZh} (${loc.code})` : currentDepot;

    if (
      window.confirm(
        `確定要重置目前「${locName}」為原始標準預設內容嗎？\n（包含 ${reportData.depotTitle}、M1202-19E、標準 21 項維修項目與數量及簽署名稱）`
      )
    ) {
      const freshReport = createDefaultReport(currentDepot);
      setReportData(freshReport);
      setFineTuneSettings(JSON.parse(JSON.stringify(defaultFineTuneSettings)));
      showToast(`已重置「${currentDepot}」為原始預設內容！`);
    }
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        '⚠️ 警告：確定要清空所有資料嗎？(CLEAR ALL DATA)\n\n此操作將會：\n1. 清空所有 20 個車站/車廠已填寫的 PM W/O 及編輯內容\n2. 重置為系統原始初始標準範本\n3. 重置所有版面微調參數\n\n此操作無法撤銷，是否確定執行？'
      )
    ) {
      try {
        localStorage.removeItem(STORAGE_KEY_REPORTS_MAP);
        localStorage.removeItem('mtr_pm_reports_by_depot_v3');
        localStorage.removeItem(STORAGE_KEY_FINETUNE);
        localStorage.removeItem(STORAGE_KEY_ACTIVE_DEPOT);
      } catch (e) {
        console.error('Failed to clear storage', e);
      }

      const freshMap: Record<string, MaintenanceReportData> = {};
      ALL_MTR_LOCATIONS.forEach((loc) => {
        freshMap[loc.code] = createDefaultReport(loc.code);
      });

      setReportsByDepot(freshMap);
      setCurrentDepot('AIR');
      setFineTuneSettings(JSON.parse(JSON.stringify(defaultFineTuneSettings)));
      showToast('已成功清空所有站點資料並還原為初始狀態！');
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

    showToast(`已切換至 ${targetCode} 分頁 (${newTitle})`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-amber-200 selection:text-slate-900 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-4 z-50 bg-slate-900 text-white px-3.5 py-2 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navbar: Simplified to Upload Excel, Export PDF, and clean More dropdown */}
      <HeaderNavbar
        onUploadExcelClick={() => setIsExcelUploadOpen(true)}
        onResetDefaultPdfClick={handleResetDefaultPdf}
        onClearAllDataClick={handleClearAllData}
        onSaveToArchiveClick={handleSaveToArchive}
        onOpenArchiveHistoryClick={() => setIsArchiveHistoryOpen(true)}
        onExportPdfClick={handleExportPdf}
        onPrintClick={handlePrint}
        onOpenHelpClick={() => setIsHelpOpen(true)}
        onOpenPptClick={() => setIsPptOpen(true)}
        lastSavedTime={lastSavedTime}
        archiveCount={archives.length}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-[1650px] w-full mx-auto p-3 sm:p-5 space-y-3">
        {/* Single Streamlined Control Bar */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs no-print">
          {/* Left: Station Quick Selector & Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">選擇站點 / 車廠:</span>
              <select
                value={currentDepot}
                onChange={(e) => {
                  const code = e.target.value;
                  const loc = getLocationByCode(code);
                  handleSelectRegion(code, loc?.title || `MTRC Station - ${code}`);
                }}
                className="px-2.5 py-1 bg-slate-50 hover:bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors cursor-pointer"
              >
                <optgroup label="車站與設施 (17)">
                  {MTR_STATIONS_LIST.map((loc) => (
                    <option key={loc.code} value={loc.code}>
                      {loc.code} - {loc.nameZh} ({loc.nameEn})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="車廠 (3)">
                  {MTR_DEPOTS_LIST.map((loc) => (
                    <option key={loc.code} value={loc.code}>
                      {loc.code} - {loc.nameZh} ({loc.nameEn})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Station details */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-slate-300">‧</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {currentLocationInfo?.line || '港鐵'}
              </span>
              <span className="text-[11px] font-mono text-slate-600">
                PM W/O 已填: <strong className="text-emerald-700 font-bold">{woStats[currentDepot]?.filled || 0}</strong> / {woStats[currentDepot]?.total || 21}
              </span>
            </div>
          </div>

          {/* Right: Reset, Clear All Data, Fine-Tune Toggle & Meta info */}
          <div className="flex items-center gap-2">
            <span className="hidden xl:inline text-xs text-slate-500 font-mono mr-1">
              {reportData.reportMonthYear} ‧ {reportData.items.length} 項
            </span>

            {/* Reset Current Station Button */}
            <button
              type="button"
              onClick={handleResetDefaultPdf}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="重置目前選取的站點為原始標準範本 (Reset Current Station)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>重置本站 (Reset)</span>
            </button>

            {/* Clear All Data Button */}
            <button
              type="button"
              onClick={handleClearAllData}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="清空所有 20 個車站及車廠的資料，還原為初始狀態 (Clear All Data)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>清空全部資料 (Clear All)</span>
            </button>

            {/* Fine-Tune Toggle */}
            <button
              type="button"
              onClick={() => setIsFineTuneOpen(!isFineTuneOpen)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border cursor-pointer ${
                isFineTuneOpen
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="調整 PDF 字體大小、邊距與欄寬"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>{isFineTuneOpen ? '關閉微調' : '微調排版'}</span>
            </button>
          </div>
        </div>

        {/* Full-Width Live Editable PDF Preview Sheet */}
        <div className="w-full relative">
          <ReportPDFPreview
            reportData={reportData}
            fineTuneSettings={fineTuneSettings}
            onUpdateReportData={setReportData}
            isEditingEnabled={true}
          />
        </div>
      </main>

      {/* Bottom Fine-Tuning Drawer Panel */}
      <FineTunePanel
        settings={fineTuneSettings}
        onChangeSettings={setFineTuneSettings}
        isOpen={isFineTuneOpen}
        onToggleOpen={() => setIsFineTuneOpen(!isFineTuneOpen)}
      />

      {/* Clean Modals */}
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
