import * as XLSX from 'xlsx';
import { MaintenanceReportData, MaintenanceItem } from '../types';

export const STANDARD_MTR_ITEMS = [
  'Air Handling Unit /Primary Air Handling Unit',
  'Fan Coil Unit',
  'Air Cooled Chiller',
  'Chilled Water Pump',
  'Washable Panel Filter',
  'Chem. Dosing Unit',
  'Motor Control Centre',
  'Motor Control Panel',
  'Differential By-pass Valve & Control',
  'Disposal Bag Filter',
  'Chemical Feed Tank',
  'F & E Tank',
  'Make Up Water Tank',
  'Metering Pump',
  'Presurization Unit',
  'Pipework',
  'Motorised Operated Valve',
  'Valve',
  'Sensor',
  'Flexible Connection',
  'Pipework Insulation',
];

/**
 * Intelligent keyword & acronym matcher for MTR Work Descriptions
 */
export function matchStandardWorkDescription(rawText: string): string {
  if (!rawText) return '';
  const text = rawText.toUpperCase().trim();

  // 1. Air Cooled Chiller (ACC)
  if (
    text.includes('AIR COOLED CHILLER') ||
    text.includes('AIR-COOLED CHILLER') ||
    text.includes('ECS-ACC') ||
    text.includes('-ACC-') ||
    text.endsWith('-ACC') ||
    text.includes('ACC-ALL') ||
    (text.includes('CHILLER') && !text.includes('WATER PUMP') && !text.includes('PUMP')) ||
    /\bACC\b/.test(text)
  ) {
    return 'Air Cooled Chiller';
  }

  // 2. Disposal Bag Filter (DBF)
  if (
    text.includes('DISPOSAL BAG FILTER') ||
    text.includes('BAG FILTER') ||
    text.includes('ECS-DBF') ||
    text.includes('-DBF-') ||
    text.endsWith('-DBF') ||
    text.includes('DBF-ALL') ||
    /\bDBF\b/.test(text)
  ) {
    return 'Disposal Bag Filter';
  }

  // 4. Motor Control Panel (MCP) - Check before MCC if text explicitly mentions PANEL or MCP
  if (
    text.includes('MOTOR CONTROL PANEL') ||
    text.includes('ECS-MCP') ||
    text.includes('-MCP-') ||
    text.endsWith('-MCP') ||
    text.includes('MCP-ALL') ||
    /\bMCP\b/.test(text)
  ) {
    return 'Motor Control Panel';
  }

  // 3. Motor Control Centre (MCC)
  if (
    text.includes('MOTOR CONTROL CENTER') ||
    text.includes('MOTOR CONTROL CENTRE') ||
    text.includes('ECS-MCC') ||
    text.includes('-MCC-') ||
    text.endsWith('-MCC') ||
    text.includes('MCC-ALL') ||
    /\bMCC\b/.test(text)
  ) {
    return 'Motor Control Centre';
  }

  // 5. Motorised Operated Valve (MOV)
  if (
    text.includes('MOTORISED OPERATED VALVE') ||
    text.includes('MOTORIZED OPERATED VALVE') ||
    text.includes('MOTORISED VALVE') ||
    text.includes('MOTORIZED VALVE') ||
    text.includes('ECS-MOV') ||
    text.includes('-MOV-') ||
    text.endsWith('-MOV') ||
    text.includes('MOV-ALL') ||
    /\bMOV\b/.test(text)
  ) {
    return 'Motorised Operated Valve';
  }

  // 6. Washable Panel Filter (WPF)
  if (
    text.includes('WASHABLE PANEL FILTER') ||
    text.includes('PANEL FILTER') ||
    text.includes('ECS-WPF') ||
    text.includes('-WPF-') ||
    text.endsWith('-WPF') ||
    text.includes('WPF-ALL') ||
    /\bWPF\b/.test(text)
  ) {
    return 'Washable Panel Filter';
  }

  // 7. Air Handling Unit / Primary Air Handling Unit (AHU)
  if (
    text.includes('AIR HANDLING') ||
    text.includes('AIR HANDING') ||
    text.includes('PRIMARY AIR') ||
    text.includes('ECS-AHU') ||
    text.includes('-AHU-') ||
    text.endsWith('-AHU') ||
    text.includes('AHU-ALL') ||
    /\bAHU\b/.test(text)
  ) {
    return 'Air Handling Unit /Primary Air Handling Unit';
  }

  // 8. Fan Coil Unit (FCU)
  if (
    text.includes('FAN COIL') ||
    text.includes('ECS-FCU') ||
    text.includes('-FCU-') ||
    text.endsWith('-FCU') ||
    text.includes('FCU-ALL') ||
    /\bFCU\b/.test(text)
  ) {
    return 'Fan Coil Unit';
  }

  // 9. Chilled Water Pump (CWP / CHP / MUP / SHD-METCHW / CHILLER PUMP ROOM equipment)
  if (
    text.includes('5001618422') ||
    text.includes('5001618424') ||
    text.includes('5001618425') ||
    text.includes('5001618426') ||
    text.includes('CHILLED WATER PUMP') ||
    text.includes('CHILLER PUMP') ||
    text.includes('CHILLED PUMP') ||
    text.includes('MR-SHD-CP') ||
    text.includes('MR-SHD-MDP') ||
    text.includes('MR-SHD-MTP') ||
    text.includes('MR-SHD-ORP') ||
    text.includes('SHD-ECS-METCHW') ||
    text.includes('SHD-ECS-PHC') ||
    text.includes('SHD-ECS-CHP') ||
    text.includes('ECS-CWP') ||
    text.includes('-CWP-') ||
    text.endsWith('-CWP') ||
    text.includes('CWP-ALL') ||
    /\bCWP\b/.test(text) ||
    text.includes('ECS-CHP') ||
    text.includes('-CHP-') ||
    text.endsWith('-CHP') ||
    text.includes('CHP-') ||
    /\bCHP\b/.test(text) ||
    text.includes('ECS-MTP') ||
    text.includes('-MTP-') ||
    text.endsWith('-MTP') ||
    text.includes('MTP-') ||
    /\bMTP\b/.test(text) ||
    text.includes('ECS-MUP') ||
    text.includes('-MUP-') ||
    text.endsWith('-MUP') ||
    text.includes('MUP-') ||
    text.includes('ECS-MWP') ||
    text.includes('-MWP-') ||
    text.includes('MR-SHD-MUP') ||
    /\bMUP\b/.test(text) ||
    /\bMWP\b/.test(text)
  ) {
    return 'Chilled Water Pump';
  }

  // 10. Chem. Dosing Unit (CDU)
  if (
    text.includes('CHEM. DOSING') ||
    text.includes('CHEMICAL DOSING') ||
    text.includes('DOSING UNIT') ||
    text.includes('ECS-CDU') ||
    text.includes('-CDU-') ||
    text.endsWith('-CDU') ||
    text.includes('CDU-ALL') ||
    /\bCDU\b/.test(text)
  ) {
    return 'Chem. Dosing Unit';
  }

  // 11. Differential By-pass Valve & Control (DBV)
  if (
    text.includes('DIFFERENTIAL BY-PASS') ||
    text.includes('BYPASS VALVE') ||
    text.includes('BY-PASS VALVE') ||
    text.includes('ECS-DBV') ||
    text.includes('-DBV-') ||
    text.endsWith('-DBV') ||
    text.includes('DBV-ALL') ||
    /\bDBV\b/.test(text)
  ) {
    return 'Differential By-pass Valve & Control';
  }

  // 12. Chemical Feed Tank (CFT)
  if (
    text.includes('CHEMICAL FEED TANK') ||
    text.includes('FEED TANK') ||
    text.includes('ECS-CFT') ||
    text.includes('-CFT-') ||
    text.endsWith('-CFT') ||
    text.includes('CFT-ALL') ||
    /\bCFT\b/.test(text)
  ) {
    return 'Chemical Feed Tank';
  }

  // 13. F & E Tank (FET)
  if (
    text.includes('F & E TANK') ||
    text.includes('F&E TANK') ||
    text.includes('EXPANSION TANK') ||
    text.includes('ECS-FET') ||
    text.includes('-FET-') ||
    text.endsWith('-FET') ||
    text.includes('FET-ALL') ||
    /\bFET\b/.test(text)
  ) {
    return 'F & E Tank';
  }

  // 14. Make Up Water Tank (MWT)
  if (
    text.includes('MAKE UP WATER') ||
    text.includes('MAKEUP WATER') ||
    text.includes('ECS-MWT') ||
    text.includes('-MWT-') ||
    text.endsWith('-MWT') ||
    text.includes('MWT-ALL') ||
    /\bMWT\b/.test(text)
  ) {
    return 'Make Up Water Tank';
  }

  // 15. Metering Pump (MP)
  if (
    text.includes('METERING PUMP') ||
    text.includes('ECS-MP') ||
    text.includes('-MP-') ||
    text.endsWith('-MP') ||
    text.includes('MP-ALL') ||
    /\bMP\b/.test(text)
  ) {
    return 'Metering Pump';
  }

  // 16. Presurization Unit (PU)
  if (
    text.includes('PRESURIZATION') ||
    text.includes('PRESSURIZATION') ||
    text.includes('ECS-PU') ||
    text.includes('-PU-') ||
    text.endsWith('-PU') ||
    text.includes('PU-ALL') ||
    /\bPU\b/.test(text)
  ) {
    return 'Presurization Unit';
  }

  // 17. Pipework Insulation (INS)
  if (
    text.includes('PIPEWORK INSULATION') ||
    text.includes('INSULATION') ||
    text.includes('ECS-INS') ||
    text.includes('-INS-') ||
    text.endsWith('-INS') ||
    text.includes('INS-ALL') ||
    /\bINS\b/.test(text)
  ) {
    return 'Pipework Insulation';
  }

  // 18. Pipework (PIPE)
  if (
    text.includes('PIPEWORK') ||
    text.includes('ECS-PIPE') ||
    text.includes('-PIPE-') ||
    text.endsWith('-PIPE') ||
    text.includes('PIPE-ALL') ||
    /\bPIPE\b/.test(text)
  ) {
    return 'Pipework';
  }

  // 19. Valve (VALVE)
  if (
    (text.includes('VALVE') || text.includes('ECS-VALVE') || text.includes('-VALVE-') || text.includes('VALVE-ALL')) &&
    !text.includes('MOTORISED') &&
    !text.includes('MOTORIZED') &&
    !text.includes('BY-PASS') &&
    !text.includes('BYPASS')
  ) {
    return 'Valve';
  }

  // 20. Sensor (SENSOR)
  if (text.includes('SENSOR') || text.includes('ECS-SENSOR') || text.includes('-SENSOR-') || text.includes('SENSOR-ALL')) {
    return 'Sensor';
  }

  // 21. Flexible Connection (FLEX)
  if (
    text.includes('FLEXIBLE CONNECTION') ||
    text.includes('FLEXIBLE') ||
    text.includes('ECS-FLEX') ||
    text.includes('-FLEX-') ||
    text.endsWith('-FLEX') ||
    text.includes('FLEX-ALL')
  ) {
    return 'Flexible Connection';
  }

  // Exact or close match with standard list
  const exact = STANDARD_MTR_ITEMS.find((item) => text.includes(item.toUpperCase()));
  if (exact) return exact;

  return rawText.trim();
}

/**
 * Checks if a string or cell matches the target depot keyword (e.g. TWD, TMD)
 */
export function matchesDepotKeyword(text: string, targetDepotCode: string = 'TWD'): boolean {
  if (!targetDepotCode) return true;
  const upperText = text.toUpperCase();
  const upperDepot = targetDepotCode.toUpperCase().trim();

  if (upperText.includes(upperDepot)) return true;

  // Handle common typo variants like TWD <-> TMD
  if (upperDepot === 'TWD' && upperText.includes('TMD')) return true;
  if (upperDepot === 'TMD' && upperText.includes('TWD')) return true;

  return false;
}

export interface ParseExcelOptions {
  targetDepotCode?: string; // e.g. TWD
  filterByDepot?: boolean; // if true, only process PM W/O that match targetDepotCode
  existingItems?: MaintenanceItem[]; // optional existing items to preserve QTYs
}

const DEFAULT_QTY_MAP: Record<string, string> = {
  'Air Handling Unit /Primary Air Handling Unit': '21',
  'Fan Coil Unit': '109',
  'Air Cooled Chiller': '6',
  'Chilled Water Pump': '8',
  'Washable Panel Filter': '189',
  'Chem. Dosing Unit': '3',
  'Motor Control Centre': '2',
  'Motor Control Panel': '9',
  'Differential By-pass Valve & Control': '3',
  'Disposal Bag Filter': '62',
  'Chemical Feed Tank': '3',
  'F & E Tank': '2',
  'Make Up Water Tank': '1',
  'Metering Pump': '4',
  'Presurization Unit': '3',
  'Pipework': '1 lot',
  'Motorised Operated Valve': '21',
  'Valve': '1 lot',
  'Sensor': '1 lot',
  'Flexible Connection': '1 lot',
  'Pipework Insulation': '1 lot',
};

/**
 * Intelligent Excel file parser for MTR Maintenance List
 */
export async function parseExcelFile(
  file: File,
  options: ParseExcelOptions = {}
): Promise<Partial<MaintenanceReportData>> {
  const { targetDepotCode = 'TWD', filterByDepot = true } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames.length) {
          throw new Error('Excel 檔案內沒有發現工作表 (Sheet)');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        let depotTitle = `MTRC Depot - ${targetDepotCode}`;
        let depotCode = targetDepotCode;
        let reportMonthYear = 'July - 2026';
        let contractNo = 'M1202-19E';
        let preparedByName = 'Lee Siu Keung (15224)';
        let preparedByDate = '';
        let verifiedByName = '';
        let verifiedByDate = '';
        let endorsedByName = '';
        let endorsedByDate = '';

        // Scanning header meta fields (Depot, Month, Contract No, Date Range)
        jsonRows.forEach((row) => {
          const rowStr = row.map((cell) => String(cell || '')).join(' ');

          if (rowStr.includes('MTRC Depot') || rowStr.includes('Depot')) {
            const match = rowStr.match(/(MTRC\s+Depot\s*-\s*[A-Z0-9]+|Depot\s*-\s*[A-Z0-9]+)/i);
            if (match) {
              depotTitle = match[0];
              const codeMatch = depotTitle.match(/-\s*([A-Z0-9]+)/i);
              if (codeMatch) depotCode = codeMatch[1];
            }
          }

          if (rowStr.includes('PM PERFORMANCE BREAKDOWN') || rowStr.includes('BREAKDOWN in')) {
            const match = rowStr.match(/in\s+([A-Za-z]+)\s*-\s*(\d{4})/i);
            if (match) {
              reportMonthYear = `${match[1]} - ${match[2]}`;
            }
          }

          // Extract date range from FROM : YYYY-MM-DD or TO : YYYY-MM-DD
          if (rowStr.includes('FROM :') || rowStr.includes('FROM:') || rowStr.includes('TO :') || rowStr.includes('TO:')) {
            const dateMatch = rowStr.match(/(\d{4})-(\d{2})-\d{2}/);
            if (dateMatch) {
              const year = dateMatch[1];
              const monthNum = parseInt(dateMatch[2], 10);
              const months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ];
              if (monthNum >= 1 && monthNum <= 12) {
                reportMonthYear = `${months[monthNum - 1]} - ${year}`;
              }
            }
          }

          if (rowStr.includes('Contract No.') || rowStr.includes('Contract')) {
            const match = rowStr.match(/Contract\s*(?:No\.?)?\s*:\s*([A-Z0-9\-]+)/i);
            if (match) {
              contractNo = match[1];
            }
          }

          if (rowStr.includes('Lee Siu Keung') || rowStr.includes('Prepared by')) {
            const matchName = rowStr.match(/(?:Name\s*&\s*Staff\s*No\.?\s*:?\s*)([^\r\n_]+)/i);
            if (matchName) {
              preparedByName = matchName[1].trim();
            }
          }
        });

        // Build lookup map from existingItems if provided
        const existingQtyMap = new Map<string, string>();
        if (options.existingItems && Array.isArray(options.existingItems)) {
          options.existingItems.forEach((item) => {
            if (item.workDescription && item.qty) {
              existingQtyMap.set(item.workDescription, item.qty);
            }
          });
        }

        // Initialize base 21 standard items map for MTR
        const itemsMap = new Map<string, MaintenanceItem>();
        STANDARD_MTR_ITEMS.forEach((stdDesc, idx) => {
          const preservedQty = existingQtyMap.get(stdDesc) || DEFAULT_QTY_MAP[stdDesc] || '1';
          itemsMap.set(stdDesc, {
            id: `item-${idx + 1}`,
            station: depotCode || targetDepotCode,
            workDescription: stdDesc,
            pmWo: '',
            qty: preservedQty,
            m: '',
            m2: '',
            m3: '',
            m4: '',
            m6: '',
            y: '',
            y2: '',
          });
        });

        const customItems: MaintenanceItem[] = [];

        // Scan table headers first to detect column layout (Maximo export vs Standard Report)
        let headerRowIndex = -1;
        for (let i = 0; i < jsonRows.length; i++) {
          const rowStr = jsonRows[i].map((c) => String(c || '').trim().toUpperCase()).join(' ');
          if (
            rowStr.includes('WO_WONUM') ||
            rowStr.includes('WONUM') ||
            rowStr.includes('ASSET.DESCRIPTION') ||
            rowStr.includes('ASSET.ASSETNUM') ||
            rowStr.includes('STATION') ||
            rowStr.includes('WORK DESCRIPTION') ||
            rowStr.includes('PM W/O')
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex !== -1) {
          const header = jsonRows[headerRowIndex].map((c) => String(c || '').trim().toUpperCase());

          const woNumIdx = header.findIndex((h) => h.includes('WO_WONUM') || h.includes('WONUM') || h.includes('WO NUMBER'));
          const assetNumIdx = header.findIndex((h) => h.includes('ASSET.ASSETNUM') || h.includes('ASSETNUM'));
          const assetDescIdx = header.findIndex(
            (h) => h.includes('ASSET.DESCRIPTION') || h.includes('DESCRIPTION') || h.includes('WORK DESCRIPTION') || h.includes('WORK') || h.includes('項目')
          );
          const woIdx = header.findIndex((h) => h === 'PM W/O' || h === 'W/O' || h.includes('工單'));
          const stationIdx = header.findIndex((h) => h.includes('STATION') || h.includes('車站'));
          const qtyIdx = header.findIndex((h) => h.includes('QTY') || h.includes('數量'));

          const mIdx = header.findIndex((h) => h === 'M');
          const m2Idx = header.findIndex((h) => h === '2M');
          const m3Idx = header.findIndex((h) => h === '3M');
          const m4Idx = header.findIndex((h) => h === '4M');
          const m6Idx = header.findIndex((h) => h === '6M');
          const yIdx = header.findIndex((h) => h === 'Y');
          const y2Idx = header.findIndex((h) => h === '2Y');

          for (let r = headerRowIndex + 1; r < jsonRows.length; r++) {
            const row = jsonRows[r];
            if (!row || row.length === 0) continue;

            const rowText = row.map((c) => String(c || '').trim()).join(' ');
            if (rowText.includes('Overall Total') || rowText.includes('Prepared by') || rowText.startsWith('count :')) break;

            const woNumVal = woNumIdx !== -1 ? String(row[woNumIdx] || '').trim() : '';
            const assetNumVal = assetNumIdx !== -1 ? String(row[assetNumIdx] || '').trim() : '';
            const assetDescVal = assetDescIdx !== -1 ? String(row[assetDescIdx] || '').trim() : '';
            const pmWoVal = woIdx !== -1 ? String(row[woIdx] || '').trim() : '';
            const rawDesc = assetDescIdx !== -1 ? assetDescVal : (assetNumIdx !== -1 ? assetNumVal : String(row[1] || '').trim());
            const station = stationIdx !== -1 ? String(row[stationIdx] || '').trim() : depotCode;
            const qty = qtyIdx !== -1 ? String(row[qtyIdx] || '').trim() : '';

            // Filter: If ASSET.DESCRIPTION is present and filterByDepot is enabled, it must contain target depot code (e.g. TWD, TMD, SHD)
            if (filterByDepot && assetDescIdx !== -1 && assetDescVal) {
              const depotKeyword = (targetDepotCode || 'TWD').toUpperCase();
              if (!assetDescVal.toUpperCase().includes(depotKeyword)) {
                continue;
              }
            }

            // Preferred WO identifier: WO_WONUM (e.g., 5001760193), fallback to PM W/O or asset description
            const woToUse = woNumVal || pmWoVal || assetDescVal || assetNumVal;

            if (woToUse || rawDesc) {
              const stdDesc =
                matchStandardWorkDescription(assetNumVal) ||
                matchStandardWorkDescription(assetDescVal) ||
                matchStandardWorkDescription(rawDesc) ||
                matchStandardWorkDescription(woToUse);

              if (stdDesc && itemsMap.has(stdDesc)) {
                const target = itemsMap.get(stdDesc)!;

                // Place WO_WONUM into PM W/O column (newline separated for multi-line display)
                if (woToUse) {
                  if (!target.pmWo) {
                    target.pmWo = woToUse;
                  } else {
                    const existingWos = target.pmWo.split(/[\n,]/).map((s) => s.trim());
                    if (!existingWos.includes(woToUse)) {
                      target.pmWo += `\n${woToUse}`;
                    }
                  }
                }

                if (qty) target.qty = qty;
                if (station) target.station = station;

                // Set frequencies if provided in table
                if (mIdx !== -1 && row[mIdx]) target.m = String(row[mIdx]).trim();
                if (m2Idx !== -1 && row[m2Idx]) target.m2 = String(row[m2Idx]).trim();
                if (m3Idx !== -1 && row[m3Idx]) target.m3 = String(row[m3Idx]).trim();
                if (m4Idx !== -1 && row[m4Idx]) target.m4 = String(row[m4Idx]).trim();
                if (m6Idx !== -1 && row[m6Idx]) target.m6 = String(row[m6Idx]).trim();
                if (yIdx !== -1 && row[yIdx]) target.y = String(row[yIdx]).trim();
                if (y2Idx !== -1 && row[y2Idx]) target.y2 = String(row[y2Idx]).trim();
              } else if (rawDesc) {
                // Custom item
                customItems.push({
                  id: `custom-${customItems.length + 1}`,
                  station: station || depotCode,
                  workDescription: rawDesc,
                  pmWo: woToUse,
                  qty: qty || '1',
                  m: mIdx !== -1 ? String(row[mIdx] || '').trim() : '100%',
                  m2: m2Idx !== -1 ? String(row[m2Idx] || '').trim() : '',
                  m3: m3Idx !== -1 ? String(row[m3Idx] || '').trim() : '',
                  m4: m4Idx !== -1 ? String(row[m4Idx] || '').trim() : '',
                  m6: m6Idx !== -1 ? String(row[m6Idx] || '').trim() : '',
                  y: yIdx !== -1 ? String(row[yIdx] || '').trim() : '',
                  y2: y2Idx !== -1 ? String(row[y2Idx] || '').trim() : '',
                });
              }
            }
          }
        } else {
          // Fallback cell scanning mode
          jsonRows.forEach((row) => {
            if (!row || row.length === 0) return;
            const rowStr = row.map((c) => String(c || '').trim()).join(' ');

            if (
              rowStr.includes('PM PERFORMANCE BREAKDOWN') ||
              rowStr.includes('Overall Total') ||
              rowStr.includes('Prepared by')
            ) {
              return;
            }

            // Look for WO number or asset description cell
            let foundWo = '';
            let foundAssetDesc = '';

            row.forEach((cell) => {
              const cellVal = String(cell || '').trim();
              if (!cellVal) return;

              if (/^\d{6,10}$/.test(cellVal) || cellVal.startsWith('WO')) {
                foundWo = cellVal;
              } else if (
                cellVal.toUpperCase().startsWith('MR') ||
                cellVal.toUpperCase().includes('TWD-') ||
                cellVal.toUpperCase().includes('ECS-')
              ) {
                foundAssetDesc = cellVal;
              }
            });

            if (foundAssetDesc || foundWo) {
              if (
                filterByDepot &&
                foundAssetDesc &&
                !foundAssetDesc.toUpperCase().includes((targetDepotCode || 'TWD').toUpperCase())
              ) {
                return;
              }

              const matchedDesc =
                matchStandardWorkDescription(foundAssetDesc) ||
                matchStandardWorkDescription(foundWo) ||
                (row[1] ? matchStandardWorkDescription(String(row[1])) : '');

              if (matchedDesc && itemsMap.has(matchedDesc)) {
                const existing = itemsMap.get(matchedDesc)!;
                const woToUse = foundWo || foundAssetDesc;

                if (!existing.pmWo) {
                  existing.pmWo = woToUse;
                } else if (!existing.pmWo.includes(woToUse)) {
                  existing.pmWo += `, ${woToUse}`;
                }

                const qtyCell = row.find((c) => /^\d+(\s*lot)?$/i.test(String(c).trim()));
                if (qtyCell && !existing.qty) {
                  existing.qty = String(qtyCell).trim();
                }
              }
            }
          });
        }

        // Auto-assign default frequencies for items that have PM W/O populated but no frequency value
        itemsMap.forEach((item, desc) => {
          if (item.pmWo && !item.m && !item.m2 && !item.m3 && !item.m4 && !item.m6 && !item.y && !item.y2) {
            if (desc === 'Air Cooled Chiller') {
              item.m2 = '100%';
            } else if (desc === 'Chem. Dosing Unit' || desc === 'Presurization Unit') {
              item.m3 = '100%';
            } else if (desc === 'Differential By-pass Valve & Control') {
              item.m4 = '100%';
            } else if (desc === 'Motor Control Centre') {
              item.m6 = '100%';
            } else {
              item.m = '100%';
            }
          }
        });

        // Final list of items: 21 standard items + any custom items
        const finalItems = Array.from(itemsMap.values()).concat(customItems);

        resolve({
          depotTitle,
          depotCode,
          reportMonthYear,
          contractNo,
          items: finalItems,
          signatories: {
            preparedByName,
            preparedByDate,
            verifiedByName,
            verifiedByDate,
            endorsedByName,
            endorsedByDate,
          },
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('讀取檔案失敗'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Downloads a pre-formatted Excel template for MTR Maintenance Engineer with real W/O examples
 */
export function downloadSampleExcelTemplate() {
  const wsData = [
    ['MTRC Depot - TWD'],
    ['PM PERFORMANCE BREAKDOWN in July - 2026'],
    ['Contract No.: M1202-19E'],
    [''],
    ['STATION', 'WORK DESCRIPTION', 'PM W/O', 'QTY', 'M', '2M', '3M', '4M', '6M', 'Y', '2Y'],
    ['TWD', 'Air Handling Unit /Primary Air Handling Unit', 'MR-TWD-AHU-ALL', '21', '21', '', '', '', '', '', ''],
    ['TWD', 'Fan Coil Unit', 'MR-TWD-FCU-ALL', '109', '109', '', '', '', '', '', ''],
    ['TWD', 'Air Cooled Chiller', 'MR TMD ECS-ACC-AIR-COOLED CHILLER', '6', '', '6', '', '', '', '', ''],
    ['TWD', 'Chilled Water Pump', 'MR-TWD-CWP-ALL', '8', '8', '', '', '', '', '', ''],
    ['TWD', 'Washable Panel Filter', 'MR-TWD WASHABLE PANEL FILTER ;TWD ;ALL', '189', '189', '', '', '', '', '', ''],
    ['TWD', 'Chem. Dosing Unit', 'MR-TWD-CDU-ALL', '3', '', '', '3', '', '', '', ''],
    ['TWD', 'Motor Control Centre', 'MR-TWD-MCC-ALL; MOTOR CONTROL CENTER', '2', '', '', '', '', '2', '', ''],
    ['TWD', 'Motor Control Panel', 'MR-TWD-MCP-ALL', '9', '9', '', '', '', '', '', ''],
    ['TWD', 'Differential By-pass Valve & Control', 'MR-TWD-DBV-ALL', '3', '', '', '', '3', '', '', ''],
    ['TWD', 'Disposal Bag Filter', 'MR-TWD-DBF-ALL; DISPOSAL BAG FILTER', '62', '62', '', '', '', '', '', ''],
    ['TWD', 'Chemical Feed Tank', 'MR-TWD-CFT-ALL', '3', '3', '', '', '', '', '', ''],
    ['TWD', 'F & E Tank', 'MR-TWD-FET-ALL', '2', '2', '', '', '', '', '', ''],
    ['TWD', 'Make Up Water Tank', 'MR-TWD-MWT-ALL', '1', '1', '', '', '', '', '', ''],
    ['TWD', 'Metering Pump', 'MR-TWD-MP-ALL', '4', '4', '', '', '', '', '', ''],
    ['TWD', 'Presurization Unit', 'MR-TWD-PU-ALL', '3', '', '', '3', '', '', '', ''],
    ['TWD', 'Pipework', 'MR-TWD-PIPE-ALL', '1 lot', '1 lot', '', '', '', '', '', ''],
    ['TWD', 'Motorised Operated Valve', 'MR-TWD-MOV-ALL; MOTORISED OPERATED VALVE', '21', '21', '', '', '', '', '', ''],
    ['TWD', 'Valve', 'MR-TWD-VALVE-ALL', '1 lot', '1 lot', '', '', '', '', '', ''],
    ['TWD', 'Sensor', 'MR-TWD-SENSOR-ALL', '1 lot', '1 lot', '', '', '', '', '', ''],
    ['TWD', 'Flexible Connection', 'MR-TWD-FLEX-ALL', '1 lot', '1 lot', '', '', '', '', '', ''],
    ['TWD', 'Pipework Insulation', 'MR-TWD-INS-ALL', '1 lot', '1 lot', '', '', '', '', '', ''],
    [''],
    ['Prepared by:', '', '', '', 'Verified by:', '', '', '', 'Endorsed by:'],
    ['Name & Staff No. :', 'Lee Siu Keung (15224)', '', '', 'Name & Staff No. :', '', '', '', 'Name & Staff No. :'],
    ['Date :', new Date().toISOString().slice(0, 10), '', '', 'Date :', '', '', '', 'Date :'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 10 }, // STATION
    { wch: 42 }, // WORK DESCRIPTION
    { wch: 38 }, // PM W/O
    { wch: 10 }, // QTY
    { wch: 6 }, // M
    { wch: 6 }, // 2M
    { wch: 6 }, // 3M
    { wch: 6 }, // 4M
    { wch: 6 }, // 6M
    { wch: 6 }, // Y
    { wch: 6 }, // 2Y
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PM Report');

  XLSX.writeFile(wb, 'MTR_Maintenance_PM_Performance_Template.xlsx');
}

