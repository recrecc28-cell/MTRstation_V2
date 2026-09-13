import { MaintenanceReportData, FineTuneSettings } from '../types';
import { getLocationTitle } from './mtrLocations';

export const defaultReportData: MaintenanceReportData = {
  id: 'report-empty',
  depotCode: '',
  depotTitle: '',
  reportMonthYear: '',
  contractNo: '',
  items: [],
  overallTotals: {
    pmWoTotal: '',
    qtyTotal: '',
    mTotal: '',
    m2Total: '',
    m3Total: '',
    m4Total: '',
    m6Total: '',
    yTotal: '',
    m18Total: '',
    y2Total: '',
    y3Total: '',
  },
  signatories: {
    preparedByName: '',
    preparedByDate: '',
    verifiedByName: '',
    verifiedByDate: '',
    endorsedByName: '',
    endorsedByDate: '',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const ensureReportQuantities = (report: MaintenanceReportData, depotCode?: string): MaintenanceReportData => {
  return {
    ...report,
    depotCode: depotCode ? depotCode.toUpperCase() : (report.depotCode || ''),
  };
};

export const createLAKReport = (): MaintenanceReportData => ({
  id: 'report-lak-2026-08',
  depotCode: 'LAK',
  depotTitle: 'MTRC AEL / TCL - LAK',
  reportMonthYear: 'AUG - 2026',
  contractNo: 'M1202-19E',
  items: [
    {
      id: 'lak-acc-101',
      station: 'LAK',
      workDescription: 'Air Cooled Chiller ACC-101',
      pmWo: '5001649618\n5001644596\n5001646946',
      qty: '1',
      m: '0%',
      m3: '',
      m4: '',
      m6: '0%',
      y: '',
      m18: '100%',
      y2: '',
      y3: '',
      subEntries: [
        { id: 'sub-1', pmWo: '5001649618', m: '', m3: '', m4: '', m6: '', y: '', m18: '100%', y2: '', y3: '' },
        { id: 'sub-2', pmWo: '5001644596', m: '0%', m3: '', m4: '', m6: '', y: '', m18: '', y2: '', y3: '' },
        { id: 'sub-3', pmWo: '5001646946', m: '', m3: '', m4: '', m6: '0%', y: '', m18: '', y2: '', y3: '' },
      ],
    },
    {
      id: 'lak-acc-102',
      station: 'LAK',
      workDescription: 'Air Cooled Chiller ACC-102',
      pmWo: '5001647191\n5001646615\n5001644224',
      qty: '1',
      m: '0%',
      m3: '',
      m4: '',
      m6: '0%',
      y: '',
      m18: '100%',
      y2: '',
      y3: '',
      subEntries: [
        { id: 'sub-4', pmWo: '5001647191', m: '0%', m3: '', m4: '', m6: '', y: '', m18: '', y2: '', y3: '' },
        { id: 'sub-5', pmWo: '5001646615', m: '', m3: '', m4: '', m6: '', y: '', m18: '100%', y2: '', y3: '' },
        { id: 'sub-6', pmWo: '5001644224', m: '', m3: '', m4: '', m6: '0%', y: '', m18: '', y2: '', y3: '' },
      ],
    },
    {
      id: 'lak-acc-103',
      station: 'LAK',
      workDescription: 'Air Cooled Chiller ACC-103',
      pmWo: '5001647901\n5001645609\n5001648757',
      qty: '1',
      m: '0%',
      m3: '',
      m4: '',
      m6: '0%',
      y: '',
      m18: '100%',
      y2: '',
      y3: '',
      subEntries: [
        { id: 'sub-7', pmWo: '5001647901', m: '', m3: '', m4: '', m6: '', y: '', m18: '100%', y2: '', y3: '' },
        { id: 'sub-8', pmWo: '5001645609', m: '', m3: '', m4: '', m6: '0%', y: '', m18: '', y2: '', y3: '' },
        { id: 'sub-9', pmWo: '5001648757', m: '0%', m3: '', m4: '', m6: '', y: '', m18: '', y2: '', y3: '' },
      ],
    },
    {
      id: 'lak-acc-104',
      station: 'LAK',
      workDescription: 'Air Cooled Chiller ACC-104',
      pmWo: '5001645202\n5001645942\n5001648655',
      qty: '1',
      m: '0%',
      m3: '',
      m4: '',
      m6: '0%',
      y: '',
      m18: '100%',
      y2: '',
      y3: '',
      subEntries: [
        { id: 'sub-10', pmWo: '5001645202', m: '', m3: '', m4: '', m6: '', y: '', m18: '100%', y2: '', y3: '' },
        { id: 'sub-11', pmWo: '5001645942', m: '0%', m3: '', m4: '', m6: '', y: '', m18: '', y2: '', y3: '' },
        { id: 'sub-12', pmWo: '5001648655', m: '', m3: '', m4: '', m6: '0%', y: '', m18: '', y2: '', y3: '' },
      ],
    },
  ],
  overallTotals: {
    pmWoTotal: '',
    qtyTotal: '',
    mTotal: '0%',
    m3Total: '',
    m4Total: '',
    m6Total: '0%',
    yTotal: '',
    m18Total: '100%',
    y2Total: '',
    y3Total: '',
  },
  signatories: {
    preparedByName: 'NG KA HO 17914',
    preparedByDate: '',
    verifiedByName: '',
    verifiedByDate: '',
    endorsedByName: '',
    endorsedByDate: '',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createEmptyReport = (depotCode: string = ''): MaintenanceReportData => {
  const code = (depotCode || '').toUpperCase();
  return {
    id: `report-${(code || 'new').toLowerCase()}-${Date.now()}`,
    depotCode: code,
    depotTitle: '',
    reportMonthYear: '',
    contractNo: '',
    items: [],
    overallTotals: {
      pmWoTotal: '',
      qtyTotal: '',
      mTotal: '',
      m3Total: '',
      m4Total: '',
      m6Total: '',
      yTotal: '',
      m18Total: '',
      y2Total: '',
      y3Total: '',
    },
    signatories: {
      preparedByName: '',
      preparedByDate: '',
      verifiedByName: '',
      verifiedByDate: '',
      endorsedByName: '',
      endorsedByDate: '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const createDefaultReport = (depotCode: string = ''): MaintenanceReportData => {
  return createEmptyReport(depotCode);
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
  mergeWorkDescription: true,
};
