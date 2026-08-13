import { MaintenanceReportData, FineTuneSettings } from '../types';

export const defaultReportData: MaintenanceReportData = {
  id: 'report-twd-2026-07',
  depotCode: 'TWD',
  depotTitle: 'MTRC Depot - TWD',
  reportMonthYear: 'July - 2026',
  contractNo: 'M1202-19E',
  items: [
    { id: '1', station: 'TWD', workDescription: 'Air Handling Unit /Primary Air Handling Unit', pmWo: '', qty: '21', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '2', station: 'TWD', workDescription: 'Fan Coil Unit', pmWo: '', qty: '109', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '3', station: 'TWD', workDescription: 'Air Cooled Chiller', pmWo: '', qty: '6', m: '', m2: '100%', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '4', station: 'TWD', workDescription: 'Chilled Water Pump', pmWo: '', qty: '8', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '5', station: 'TWD', workDescription: 'Washable Panel Filter', pmWo: '', qty: '189', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '6', station: 'TWD', workDescription: 'Chem. Dosing Unit', pmWo: '', qty: '3', m: '', m2: '', m3: '100%', m4: '', m6: '', y: '', y2: '' },
    { id: '7', station: 'TWD', workDescription: 'Motor Control Centre', pmWo: '', qty: '2', m: '', m2: '', m3: '', m4: '', m6: '100%', y: '', y2: '' },
    { id: '8', station: 'TWD', workDescription: 'Motor Control Panel', pmWo: '', qty: '9', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '9', station: 'TWD', workDescription: 'Differential By-pass Valve & Control', pmWo: '', qty: '3', m: '', m2: '', m3: '', m4: '100%', m6: '', y: '', y2: '' },
    { id: '10', station: 'TWD', workDescription: 'Disposal Bag Filter', pmWo: '', qty: '62', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '11', station: 'TWD', workDescription: 'Chemical Feed Tank', pmWo: '', qty: '3', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '12', station: 'TWD', workDescription: 'F & E Tank', pmWo: '', qty: '2', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '13', station: 'TWD', workDescription: 'Make Up Water Tank', pmWo: '', qty: '1', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '14', station: 'TWD', workDescription: 'Metering Pump', pmWo: '', qty: '4', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '15', station: 'TWD', workDescription: 'Presurization Unit', pmWo: '', qty: '3', m: '', m2: '', m3: '100%', m4: '', m6: '', y: '', y2: '' },
    { id: '16', station: 'TWD', workDescription: 'Pipework', pmWo: '', qty: '1 lot', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '17', station: 'TWD', workDescription: 'Motorised Operated Valve', pmWo: '', qty: '21', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '18', station: 'TWD', workDescription: 'Valve', pmWo: '', qty: '1 lot', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '19', station: 'TWD', workDescription: 'Sensor', pmWo: '', qty: '1 lot', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '20', station: 'TWD', workDescription: 'Flexible Connection', pmWo: '', qty: '1 lot', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
    { id: '21', station: 'TWD', workDescription: 'Pipework Insulation', pmWo: '', qty: '1 lot', m: '100%', m2: '', m3: '', m4: '', m6: '', y: '', y2: '' },
  ],
  overallTotals: {
    pmWoTotal: '',
    qtyTotal: '',
    mTotal: '100%',
    m2Total: '100%',
    m3Total: '100%',
    m4Total: '100%',
    m6Total: '100%',
    yTotal: '',
    y2Total: '',
  },
  signatories: {
    preparedByName: 'Lee Siu Keung (15224)',
    preparedByDate: '',
    verifiedByName: '',
    verifiedByDate: '',
    endorsedByName: '',
    endorsedByDate: '',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const ensureReportQuantities = (report: MaintenanceReportData, depotCode: string): MaintenanceReportData => {
  const code = depotCode.toUpperCase();
  const defaultItemsMap = new Map(defaultReportData.items.map((i) => [i.workDescription, i.qty]));

  const updatedItems = (report.items || []).map((item, idx) => {
    let finalQty = item.qty;
    if (!finalQty || String(finalQty).trim() === '') {
      finalQty = defaultItemsMap.get(item.workDescription) || defaultReportData.items[idx]?.qty || '1';
    }
    let pmWo = item.pmWo;
    if (code === 'SHD' && item.workDescription === 'Chilled Water Pump' && (!pmWo || pmWo.trim() === '')) {
      pmWo = "5001618422\n5001618424\n5001618425\n5001618426";
    }
    return {
      ...item,
      station: item.station || code,
      qty: finalQty,
      pmWo,
    };
  });

  return {
    ...report,
    depotCode: code,
    items: updatedItems,
  };
};

export const createDefaultReport = (depotCode: string = 'TWD'): MaintenanceReportData => {
  const code = depotCode.toUpperCase();
  const depotTitles: Record<string, string> = {
    TWD: 'MTRC Depot - TWD',
    TMD: 'MTRC Depot - TMD',
    SHD: 'MTRC Depot - SHD',
  };
  const title = depotTitles[code] || `MTRC Depot - ${code}`;

  return {
    id: `report-${code.toLowerCase()}-2026-07`,
    depotCode: code,
    depotTitle: title,
    reportMonthYear: 'July - 2026',
    contractNo: 'M1202-19E',
    items: defaultReportData.items.map((item) => ({
      ...item,
      station: code,
      pmWo:
        code === 'SHD' && item.workDescription === 'Chilled Water Pump'
          ? "5001618422\n5001618424\n5001618425\n5001618426"
          : '',
    })),
    overallTotals: { ...defaultReportData.overallTotals },
    signatories: { ...defaultReportData.signatories },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const defaultFineTuneSettings: FineTuneSettings = {
  baseFontSize: 11,
  headerTitleSize: 20,
  headerSubTitleSize: 17,
  contractNoSize: 16,
  tableHeaderSize: 11,
  tableCellSize: 11,
  footerTextSize: 12,
  
  pagePaddingTop: 24,
  pagePaddingBottom: 24,
  pagePaddingLeft: 24,
  pagePaddingRight: 24,
  
  tableRowPaddingY: 3,
  tableBorderWidth: 1,
  tableBorderColor: '#000000',
  
  colWidthStation: 7,
  colWidthWorkDesc: 34,
  colWidthPmWo: 12,
  colWidthQty: 7,
  colWidthTradeGroup: 40,
  
  headerOffsetX: 0,
  headerOffsetY: 0,
  tableOffsetX: 0,
  tableOffsetY: 0,
  signatoryOffsetX: 0,
  signatoryOffsetY: 0,
  
  showGridLines: true,
  showSignatureLines: true,
  compactMode: false,
};
