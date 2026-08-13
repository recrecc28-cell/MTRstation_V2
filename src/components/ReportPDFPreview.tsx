import React from 'react';
import { MaintenanceReportData, FineTuneSettings } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  reportData: MaintenanceReportData;
  fineTuneSettings: FineTuneSettings;
  onUpdateReportData: (newData: MaintenanceReportData) => void;
  isEditingEnabled?: boolean;
}

export const ReportPDFPreview: React.FC<Props> = ({
  reportData,
  fineTuneSettings,
  onUpdateReportData,
  isEditingEnabled = true,
}) => {
  const { items, signatories } = reportData;

  // Handle cell edit for items
  const handleItemChange = (id: string, field: keyof typeof items[0], value: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });

    onUpdateReportData({
      ...reportData,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add new row
  const handleAddRow = (index?: number) => {
    const newItem = {
      id: `item-${Date.now()}`,
      station: reportData.depotCode || 'TWD',
      workDescription: 'New Maintenance Item',
      pmWo: '',
      qty: '1',
      m: '',
      m2: '',
      m3: '',
      m4: '',
      m6: '',
      y: '',
      y2: '',
    };

    const newItems = [...items];
    if (typeof index === 'number') {
      newItems.splice(index + 1, 0, newItem);
    } else {
      newItems.push(newItem);
    }

    onUpdateReportData({
      ...reportData,
      items: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    if (items.length <= 1) return;
    const newItems = items.filter((item) => item.id !== id);
    onUpdateReportData({
      ...reportData,
      items: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  // Dynamic styles based on FineTuneSettings
  const containerStyle: React.CSSProperties = {
    paddingTop: `${fineTuneSettings.pagePaddingTop}px`,
    paddingBottom: `${fineTuneSettings.pagePaddingBottom}px`,
    paddingLeft: `${fineTuneSettings.pagePaddingLeft}px`,
    paddingRight: `${fineTuneSettings.pagePaddingRight}px`,
    fontSize: `${fineTuneSettings.baseFontSize}px`,
    color: '#000000',
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
    width: '100%',
    minHeight: '210mm', // A4 Landscape height aspect
  };

  const headerStyle: React.CSSProperties = {
    transform: `translate(${fineTuneSettings.headerOffsetX}px, ${fineTuneSettings.headerOffsetY}px)`,
  };

  const tableStyle: React.CSSProperties = {
    transform: `translate(${fineTuneSettings.tableOffsetX}px, ${fineTuneSettings.tableOffsetY}px)`,
    borderCollapse: 'collapse',
    width: '100%',
    borderColor: fineTuneSettings.tableBorderColor,
  };

  const borderStyle = {
    border: `${fineTuneSettings.tableBorderWidth}px solid ${fineTuneSettings.tableBorderColor}`,
  };

  const cellPaddingStyle: React.CSSProperties = {
    paddingTop: `${fineTuneSettings.tableRowPaddingY}px`,
    paddingBottom: `${fineTuneSettings.tableRowPaddingY}px`,
    paddingLeft: '4px',
    paddingRight: '4px',
    fontSize: `${fineTuneSettings.tableCellSize}px`,
    lineHeight: '1.2',
  };

  const signatoryStyle: React.CSSProperties = {
    transform: `translate(${fineTuneSettings.signatoryOffsetX}px, ${fineTuneSettings.signatoryOffsetY}px)`,
    fontSize: `${fineTuneSettings.footerTextSize}px`,
  };

  // Editable inline text component
  const EditableText = ({
    value,
    onChange,
    className = '',
    placeholder = '',
    style = {},
  }: {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    placeholder?: string;
    style?: React.CSSProperties;
  }) => {
    const isMultiLine = (value || '').includes('\n');

    if (!isEditingEnabled) {
      return (
        <span className={`whitespace-pre-line ${className}`} style={style}>
          {value || placeholder}
        </span>
      );
    }

    if (isMultiLine) {
      const lineCount = (value || '').split('\n').length || 1;
      return (
        <textarea
          rows={Math.max(lineCount, 1)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`bg-transparent outline-none focus:bg-amber-50 hover:bg-slate-50 transition-colors w-full resize-none overflow-hidden whitespace-pre-line leading-tight ${className}`}
          style={{ color: 'inherit', font: 'inherit', ...style }}
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-transparent outline-none focus:bg-amber-50 hover:bg-slate-50 transition-colors w-full ${className}`}
        style={{ color: 'inherit', font: 'inherit', ...style }}
      />
    );
  };

  return (
    <div className="w-full flex justify-center bg-slate-100 p-2 sm:p-4 overflow-x-auto">
      {/* Paper Container matching screenshot proportions */}
      <div
        id="pdf-report-canvas"
        style={containerStyle}
        className="bg-white shadow-xl border border-slate-300 rounded-sm max-w-[1050px] transition-all relative select-text"
      >
        {/* --- HEADER SECTION --- */}
        <div style={headerStyle} className="text-center mb-4">
          <div className="font-bold text-center tracking-wide" style={{ fontSize: `${fineTuneSettings.headerTitleSize}px` }}>
            <EditableText
              value={reportData.depotTitle}
              onChange={(val) => onUpdateReportData({ ...reportData, depotTitle: val })}
              className="text-center font-bold"
            />
          </div>

          <div className="font-bold text-center tracking-wide mt-0.5" style={{ fontSize: `${fineTuneSettings.headerSubTitleSize}px` }}>
            <span>PM PERFORMANCE BREAKDOWN in </span>
            <EditableText
              value={reportData.reportMonthYear}
              onChange={(val) => onUpdateReportData({ ...reportData, reportMonthYear: val })}
              className="inline-block font-bold w-auto border-b border-dashed border-gray-300"
              style={{ width: '150px' }}
            />
          </div>

          <div className="font-bold text-center tracking-wider mt-0.5" style={{ fontSize: `${fineTuneSettings.contractNoSize}px` }}>
            <span>Contract No.: </span>
            <EditableText
              value={reportData.contractNo}
              onChange={(val) => onUpdateReportData({ ...reportData, contractNo: val })}
              className="inline-block font-bold w-auto"
              style={{ width: '130px' }}
            />
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div style={tableStyle} className="mb-6">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <thead>
              {/* Row 1 Header */}
              <tr className="text-center font-bold" style={{ fontSize: `${fineTuneSettings.tableHeaderSize}px` }}>
                <th
                  style={{ ...borderStyle, width: `${fineTuneSettings.colWidthStation}%` }}
                  rowSpan={2}
                  className="px-1 py-1 text-center font-bold align-middle"
                >
                  STATION
                </th>
                <th
                  style={{ ...borderStyle, width: `${fineTuneSettings.colWidthWorkDesc}%` }}
                  rowSpan={2}
                  className="px-2 py-1 text-center font-bold align-middle"
                >
                  WORK DESCRIPTION
                </th>
                <th
                  style={{ ...borderStyle, width: `${fineTuneSettings.colWidthPmWo}%` }}
                  rowSpan={2}
                  className="px-1 py-1 text-center font-bold align-middle"
                >
                  PM W/O
                </th>
                <th
                  style={{ ...borderStyle, width: `${fineTuneSettings.colWidthQty}%` }}
                  rowSpan={2}
                  className="px-1 py-1 text-center font-bold align-middle"
                >
                  QTY
                </th>
                <th
                  style={{ ...borderStyle, width: `${fineTuneSettings.colWidthTradeGroup}%` }}
                  colSpan={7}
                  className="px-1 py-1 text-center font-bold align-middle uppercase"
                >
                  <div className="text-[10px] leading-tight uppercase tracking-wider text-slate-800 font-semibold">TRADE</div>
                  <div className="text-[11px] leading-tight uppercase font-extrabold text-slate-900 tracking-wide">ECS</div>
                </th>
                {isEditingEnabled && <th className="no-print w-8 border-0 bg-transparent"></th>}
              </tr>

              {/* Row 2 Sub-Headers for TRADE/ECS frequencies */}
              <tr className="text-center font-bold" style={{ fontSize: `${fineTuneSettings.tableHeaderSize}px` }}>
                <th style={{ ...borderStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="py-1 px-0.5 text-center whitespace-nowrap">M</th>
                <th style={{ ...borderStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="py-1 px-0.5 text-center whitespace-nowrap">2M</th>
                <th style={{ ...borderStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="py-1 px-0.5 text-center whitespace-nowrap">3M</th>
                <th style={{ ...borderStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="py-1 px-0.5 text-center whitespace-nowrap">4M</th>
                <th style={{ ...borderStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="py-1 px-0.5 text-center whitespace-nowrap">6M</th>
                <th style={{ ...borderStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="py-1 px-0.5 text-center whitespace-nowrap">Y</th>
                <th style={{ ...borderStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="py-1 px-0.5 text-center whitespace-nowrap">2Y</th>
                {isEditingEnabled && <th className="no-print w-8 border-0 bg-transparent"></th>}
              </tr>
            </thead>

            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-amber-50/40 transition-colors group">
                  {/* STATION */}
                  <td style={{ ...borderStyle, ...cellPaddingStyle }} className="text-center align-middle uppercase font-sans">
                    <EditableText
                      value={item.station}
                      onChange={(val) => handleItemChange(item.id, 'station', val)}
                      className="text-center font-medium"
                    />
                  </td>

                  {/* WORK DESCRIPTION */}
                  <td style={{ ...borderStyle, ...cellPaddingStyle }} className="align-middle pl-2 font-sans">
                    <EditableText
                      value={item.workDescription}
                      onChange={(val) => handleItemChange(item.id, 'workDescription', val)}
                      className="text-left font-normal"
                    />
                  </td>

                  {/* PM W/O */}
                  <td style={{ ...borderStyle, ...cellPaddingStyle }} className="text-center align-middle font-sans">
                    <EditableText
                      value={item.pmWo}
                      onChange={(val) => handleItemChange(item.id, 'pmWo', val)}
                      className="text-center font-normal"
                    />
                  </td>

                  {/* QTY */}
                  <td style={{ ...borderStyle, ...cellPaddingStyle }} className="text-center align-middle font-sans">
                    <EditableText
                      value={item.qty}
                      onChange={(val) => handleItemChange(item.id, 'qty', val)}
                      className="text-center font-normal"
                    />
                  </td>

                  {/* Frequencies under TRADE / ECS */}
                  <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle whitespace-nowrap px-0.5">
                    <EditableText value={item.m} onChange={(val) => handleItemChange(item.id, 'm', val)} className="text-center whitespace-nowrap min-w-0" />
                  </td>
                  <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle whitespace-nowrap px-0.5">
                    <EditableText value={item.m2} onChange={(val) => handleItemChange(item.id, 'm2', val)} className="text-center whitespace-nowrap min-w-0" />
                  </td>
                  <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle whitespace-nowrap px-0.5">
                    <EditableText value={item.m3} onChange={(val) => handleItemChange(item.id, 'm3', val)} className="text-center whitespace-nowrap min-w-0" />
                  </td>
                  <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle whitespace-nowrap px-0.5">
                    <EditableText value={item.m4} onChange={(val) => handleItemChange(item.id, 'm4', val)} className="text-center whitespace-nowrap min-w-0" />
                  </td>
                  <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle whitespace-nowrap px-0.5">
                    <EditableText value={item.m6} onChange={(val) => handleItemChange(item.id, 'm6', val)} className="text-center whitespace-nowrap min-w-0" />
                  </td>
                  <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle whitespace-nowrap px-0.5">
                    <EditableText value={item.y} onChange={(val) => handleItemChange(item.id, 'y', val)} className="text-center whitespace-nowrap min-w-0" />
                  </td>
                  <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle whitespace-nowrap px-0.5">
                    <EditableText value={item.y2} onChange={(val) => handleItemChange(item.id, 'y2', val)} className="text-center whitespace-nowrap min-w-0" />
                  </td>

                  {/* Actions column for editing */}
                  {isEditingEnabled && (
                    <td className="no-print p-0 text-center align-middle border-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-0.5 justify-center">
                        <button
                          type="button"
                          onClick={() => handleAddRow(idx)}
                          title="在下方新增項目"
                          className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(item.id)}
                          title="刪除此項目"
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {/* OVERALL TOTAL ROW */}
              <tr className="font-bold">
                <td
                  colSpan={4}
                  style={{ ...borderStyle, ...cellPaddingStyle }}
                  className="text-right pr-4 align-middle font-bold"
                >
                  Overall Total:
                </td>
                <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle font-bold whitespace-nowrap px-0.5">
                  <EditableText
                    value={reportData.overallTotals.mTotal}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        overallTotals: { ...reportData.overallTotals, mTotal: val },
                      })
                    }
                    className="text-center font-bold whitespace-nowrap min-w-0"
                  />
                </td>
                <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle font-bold whitespace-nowrap px-0.5">
                  <EditableText
                    value={reportData.overallTotals.m2Total}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        overallTotals: { ...reportData.overallTotals, m2Total: val },
                      })
                    }
                    className="text-center font-bold whitespace-nowrap min-w-0"
                  />
                </td>
                <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle font-bold whitespace-nowrap px-0.5">
                  <EditableText
                    value={reportData.overallTotals.m3Total}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        overallTotals: { ...reportData.overallTotals, m3Total: val },
                      })
                    }
                    className="text-center font-bold whitespace-nowrap min-w-0"
                  />
                </td>
                <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle font-bold whitespace-nowrap px-0.5">
                  <EditableText
                    value={reportData.overallTotals.m4Total}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        overallTotals: { ...reportData.overallTotals, m4Total: val },
                      })
                    }
                    className="text-center font-bold whitespace-nowrap min-w-0"
                  />
                </td>
                <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle font-bold whitespace-nowrap px-0.5">
                  <EditableText
                    value={reportData.overallTotals.m6Total}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        overallTotals: { ...reportData.overallTotals, m6Total: val },
                      })
                    }
                    className="text-center font-bold whitespace-nowrap min-w-0"
                  />
                </td>
                <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle font-bold whitespace-nowrap px-0.5">
                  <EditableText
                    value={reportData.overallTotals.yTotal}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        overallTotals: { ...reportData.overallTotals, yTotal: val },
                      })
                    }
                    className="text-center font-bold whitespace-nowrap min-w-0"
                  />
                </td>
                <td style={{ ...borderStyle, ...cellPaddingStyle, width: `${(fineTuneSettings.colWidthTradeGroup / 7).toFixed(2)}%` }} className="text-center align-middle font-bold whitespace-nowrap px-0.5">
                  <EditableText
                    value={reportData.overallTotals.y2Total}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        overallTotals: { ...reportData.overallTotals, y2Total: val },
                      })
                    }
                    className="text-center font-bold whitespace-nowrap min-w-0"
                  />
                </td>
                {isEditingEnabled && <td className="no-print w-8 border-0"></td>}
              </tr>
            </tbody>
          </table>

          {/* Quick add row button at bottom of table */}
          {isEditingEnabled && (
            <div className="no-print mt-2 flex justify-start">
              <button
                type="button"
                onClick={() => handleAddRow()}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                新增保養項目 (Add Maintenance Row)
              </button>
            </div>
          )}
        </div>

        {/* --- SIGNATORY FOOTER SECTION --- */}
        <div style={signatoryStyle} className="mt-8 pt-2">
          <div className="grid grid-cols-3 gap-6 text-left">
            {/* Prepared By */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="font-medium whitespace-nowrap">Prepared by :</span>
                <span className="flex-1 border-b border-black">
                  <EditableText
                    value={signatories.preparedBySig || ''}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        signatories: { ...signatories, preparedBySig: val },
                      })
                    }
                    placeholder=""
                  />
                </span>
              </div>

              <div className="flex items-baseline gap-1 font-semibold">
                <span className="whitespace-nowrap">Name & Staff No. :</span>
                <span className="flex-1 border-b border-black">
                  <EditableText
                    value={signatories.preparedByName}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        signatories: { ...signatories, preparedByName: val },
                      })
                    }
                    placeholder="Lee Siu Keung (15224)"
                    className="font-semibold"
                  />
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="whitespace-nowrap">Date :</span>
                <span className="flex-1 border-b border-black">
                  <EditableText
                    value={signatories.preparedByDate}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        signatories: { ...signatories, preparedByDate: val },
                      })
                    }
                    placeholder="YYYY-MM-DD"
                  />
                </span>
              </div>
            </div>

            {/* Verified By */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="font-medium whitespace-nowrap">Verified by :</span>
                <span className="flex-1 border-b border-black">
                  <EditableText
                    value={signatories.verifiedBySig || ''}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        signatories: { ...signatories, verifiedBySig: val },
                      })
                    }
                    placeholder=""
                  />
                </span>
              </div>

              <div className="flex items-baseline gap-1 font-semibold">
                <span className="whitespace-nowrap">Name & Staff No. :</span>
                <span className="flex-1 border-b border-black">
                  <EditableText
                    value={signatories.verifiedByName}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        signatories: { ...signatories, verifiedByName: val },
                      })
                    }
                    placeholder=""
                    className="font-semibold"
                  />
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="whitespace-nowrap">Date :</span>
                <span className="flex-1 border-b border-black">
                  <EditableText
                    value={signatories.verifiedByDate}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        signatories: { ...signatories, verifiedByDate: val },
                      })
                    }
                    placeholder="YYYY-MM-DD"
                  />
                </span>
              </div>
            </div>

            {/* Endorsed By */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="font-medium whitespace-nowrap">Endorsed by :</span>
                <span className="flex-1 border-b border-black">
                  <EditableText
                    value={signatories.endorsedBySig || ''}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        signatories: { ...signatories, endorsedBySig: val },
                      })
                    }
                    placeholder=""
                  />
                </span>
              </div>

              <div className="flex items-baseline gap-1 font-semibold">
                <span className="whitespace-nowrap">Name & Staff No. :</span>
                <span className="flex-1 border-b border-black">
                  <EditableText
                    value={signatories.endorsedByName}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        signatories: { ...signatories, endorsedByName: val },
                      })
                    }
                    placeholder=""
                    className="font-semibold"
                  />
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="whitespace-nowrap">Date :</span>
                <span className="flex-1 border-b border-black">
                  <EditableText
                    value={signatories.endorsedByDate}
                    onChange={(val) =>
                      onUpdateReportData({
                        ...reportData,
                        signatories: { ...signatories, endorsedByDate: val },
                      })
                    }
                    placeholder="YYYY-MM-DD"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
