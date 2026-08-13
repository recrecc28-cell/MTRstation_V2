import React, { useState } from 'react';
import { parseExcelFile, downloadSampleExcelTemplate } from '../utils/excelHelper';
import { MaintenanceReportData, MaintenanceItem } from '../types';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, X, Filter } from 'lucide-react';

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
  currentDepotCode = 'TWD',
  existingItems = [],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Depot Filter States
  const [targetDepotCode, setTargetDepotCode] = useState<string>(currentDepotCode || 'TWD');
  const [filterByDepot, setFilterByDepot] = useState<boolean>(true);

  React.useEffect(() => {
    if (currentDepotCode) {
      setTargetDepotCode(currentDepotCode);
    }
  }, [currentDepotCode, isOpen]);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage('請上傳有效的 Excel 檔案 (.xlsx, .xls, .csv)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const parsedData = await parseExcelFile(selectedFile, {
        targetDepotCode: targetDepotCode.trim().toUpperCase() || 'TWD',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4 no-print">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full text-slate-900 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">上傳港鐵保養項目 Excel 檔</h2>
            <p className="text-xs text-slate-500">自動對應 PM W/O 及類似工作說明 (如 TWD / TMD)</p>
          </div>
        </div>

        {/* Depot Filtering Settings */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={filterByDepot}
                onChange={(e) => setFilterByDepot(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-white border-slate-300 focus:ring-emerald-500"
              />
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>智能過濾：僅提取與此廠組/關鍵字相關之 PM W/O</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">廠組編碼:</span>
              <input
                type="text"
                value={targetDepotCode}
                onChange={(e) => setTargetDepotCode(e.target.value.toUpperCase())}
                placeholder="TWD"
                className="w-16 px-2 py-0.5 bg-white border border-slate-300 rounded text-center text-xs text-emerald-700 font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pl-6 leading-tight">
            例如 PDF 標題為 <span className="text-amber-600 font-semibold">TWD</span> 時，系統會掃描 Excel 中含有{' '}
            <span className="text-emerald-700 font-mono">TWD</span> 或 <span className="text-emerald-700 font-mono">TMD</span>{' '}
            字眼的 PM W/O（例如 <span className="text-slate-600">MR-TWD-ACC-ALL</span>, <span className="text-slate-600">MR TMD ECS-ACC...</span>）並自動分類填入相應維修項目。
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
              <p className="text-xs text-slate-500">支援 .xlsx, .xls, .csv 檔案</p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}



        {/* Action buttons */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!selectedFile || isLoading}
            onClick={handleProcessFile}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
              selectedFile && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                讀取中...
              </>
            ) : (
              '確認讀取並自動對應 PDF 報告'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

