import React from 'react';
import { Building2, MapPin, Check, Train, ShieldCheck, Sparkles } from 'lucide-react';

export interface RegionOption {
  code: string;
  name: string;
  title: string;
  description: string;
}

export const REGIONS: RegionOption[] = [
  {
    code: 'TWD',
    name: '荃灣車廠 (TWD)',
    title: 'MTRC Depot - TWD',
    description: 'Tsuen Wan Depot 保養報告',
  },
  {
    code: 'TMD',
    name: '屯門車廠 (TMD)',
    title: 'MTRC Depot - TMD',
    description: 'Tuen Mun Depot 保養報告',
  },
  {
    code: 'SHD',
    name: '小濠灣車廠 (SHD)',
    title: 'MTRC Depot - SHD',
    description: 'Siu Ho Wan Depot 保養報告',
  },
];

interface Props {
  currentDepotCode: string;
  currentDepotTitle: string;
  onSelectRegion: (code: string, title: string) => void;
  woStats?: Record<string, { filled: number; total: number }>;
}

export const RegionSelector: React.FC<Props> = ({
  currentDepotCode,
  currentDepotTitle,
  onSelectRegion,
  woStats,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 no-print">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">車廠地區分頁</h3>
            <p className="text-[11px] text-slate-500">獨立儲存各車廠 PM W/O 工單號碼</p>
          </div>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
          3 車廠獨立分頁
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
        {REGIONS.map((region) => {
          const isSelected = currentDepotCode.toUpperCase() === region.code.toUpperCase();

          const stat = woStats ? woStats[region.code] : undefined;

          return (
            <button
              key={region.code}
              type="button"
              onClick={() => onSelectRegion(region.code, region.title)}
              className={`relative text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/90 border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-500/30'
                  : 'bg-slate-50/50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <Train className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs">{region.code} 分頁</span>
                </div>
                {isSelected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                    <Check className="w-3 h-3" />
                    目前編輯中
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-200/60 px-1.5 py-0.5 rounded">
                    切換分頁
                  </span>
                )}
              </div>

              <div className="mt-1">
                <div className="text-xs font-semibold text-slate-800">{region.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{region.title}</div>
              </div>

              {stat && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">WO_WONUM 已填：</span>
                  <span className={`font-mono font-bold ${stat.filled > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {stat.filled}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <span>TWD, TMD, SHD 為 3 個獨立分頁，切換時會個別儲存該車廠專屬的 PM W/O 工單號碼。</span>
      </div>
    </div>
  );
};
