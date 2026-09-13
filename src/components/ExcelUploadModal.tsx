import React, { useState } from 'react';
import { parseExcelFile, downloadSampleExcelTemplate } from '../utils/excelHelper';
import { MaintenanceReportData, MaintenanceItem } from '../types';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, X, Filter, Train } from 'lucide-react';
import {
  ALL_MTR_LOCATIONS,
  MTR_STATIONS_LIST,
  MTR_DEPOTS_LIST,
  getLocationByCode,
} from '../data/mtrLocations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDataParsed: (parsedData: Partial<MaintenanceReportData>, fileName: string) => void;
  currentDepotCode?: string;
  existingItems?: MaintenanceItem[];
}

export const ExcelUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onDataParsed,
  currentDepotCode = 'AIR',
  existingItems = [],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Depot/Station Filter States
  const [targetDepotCode, setTargetDepotCode] = useState<string>(currentDepotCode || 'AIR');
  const [filterByDepot, setFilterByDepot] = useState<boolean>(true);

  React.useEffect(() => {
    if (currentDepotCode) {
      setTargetDepotCode(currentDepotCode);
    }
  }, [currentDepotCode, isOpen]);

  if (!isOpen) return null;

  // Try to auto-detect station code from uploaded file name
  const detectStationFromFileName = (fileName: string): string | null => {
    const cleanName = fileName.toUpperCase().replace(/\.[^/.]+$/, '');
    for (const loc of ALL_MTR_LOCATIONS) {
      if (cleanName === loc.code || cleanName.startsWith(loc.code + '-') || cleanName.startsWith(loc.code + '_') || cleanName.startsWith(loc.code + ' ')) {
        return loc.code;
      }
    }
    // Check if contains code as token
    for (const loc of ALL_MTR_LOCATIONS) {
      if (cleanName.includes(loc.code)) {
        return loc.code;
      }
    }
    return null;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setSelectedFile(file);
        setErrorMessage(null);
        const detected = detectStationFromFileName(file.name);
        if (detected) {
          setTargetDepotCode(detected);
        }
      } else {
        setErrorMessage('請上傳有效的 Excel 檔案 (.xlsx, .xls, .csv)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
      const detected = detectStationFromFileName(file.name);
      if (detected) {
        setTargetDepotCode(detected);
      }
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const targetCode = targetDepotCode.trim().toUpperCase() || 'AIR';
      const parsedData = await parseExcelFile(selectedFile, {
        targetDepotCode: targetCode,
        filterByDepot,
        existingItems,
      });
      onDataParsed(parsedData, selectedFile.name);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '讀取 Excel 檔案失敗，請檢查格式。');
    } finally {
      setIsLoading(false);
    }
  };

  const currentLocation = getLocationByCode(targetDepotCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 no-print">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full text-slate-900 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">上傳港鐵車站/車廠 Excel 檔</h2>
            <p className="text-xs text-slate-500">自動對應 PM W/O 及各站維修設備項目 (如 AIR, HOK, TSY...)</p>
          </div>
        </div>

        {/* Target Station / Depot Settings */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-slate-700">目標車站 / 車廠:</span>
              <select
                value={targetDepotCode}
                onChange={(e) => setTargetDepotCode(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-emerald-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={filterByDepot}
                onChange={(e) => setFilterByDepot(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 bg-white border-slate-300 focus:ring-emerald-500"
              />
              <Filter className="w-3 h-3 text-emerald-600" />
              <span>智能過濾此站 PM W/O</span>
            </label>
          </div>

          <p className="text-[11px] text-slate-500 leading-tight">
            目標站點：
            <span className="text-emerald-700 font-bold font-mono ml-1">
              {targetDepotCode}
            </span>
            {currentLocation ? ` (${currentLocation.nameZh} - ${currentLocation.line})` : ''}
            。系統將智能提取與此站相關之 PM W/O 工單號碼。
          </p>
        </div>

        {/* Drag Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50'
              : selectedFile
              ? 'border-emerald-600 bg-emerald-50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50'
          }`}
          onClick={() => document.getElementById('excel-file-input')?.click()}
        >
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-1.5">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-emerald-700">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB ‧ 點擊更換檔案
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-700">
                拖拽 Excel (.xlsx) 檔案到此處，或 <span className="text-emerald-600 underline">點擊瀏覽檔案</span>
              </p>
              <p className="text-xs text-slate-500">支援單站 Excel (如 AIR.xlsx, HOK.xlsx) 或綜合清單</p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={downloadSampleExcelTemplate}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載標準 Excel 範本</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!selectedFile || isLoading}
              onClick={handleProcessFile}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isLoading ? '處理中...' : '讀取並填入報告'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
