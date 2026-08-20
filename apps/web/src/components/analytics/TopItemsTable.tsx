'use client';

import React from 'react';
import { PopularMenuItem } from '@campus-food/shared-types';
import { Award } from 'lucide-react';
import { clsx } from 'clsx';

interface TopItemsTableProps {
  popularItems?: PopularMenuItem[];
  isLoading: boolean;
}

export function TopItemsTable({ popularItems = [], isLoading }: TopItemsTableProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-4 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">อันดับเมนูอาหารขายดี (Top Popular Items)</h4>
            <p className="text-xs text-slate-400">คำนวณจากจำนวนจานที่สั่งและรายได้รวมจริง</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800">
              <th className="pb-3 font-semibold">อันดับ</th>
              <th className="pb-3 font-semibold">ชื่อเมนู</th>
              <th className="pb-3 font-semibold">หมวดหมู่</th>
              <th className="pb-3 font-semibold text-right">จำนวนที่ขายได้ (จาน)</th>
              <th className="pb-3 font-semibold text-right">ยอดขายรวม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading || !popularItems || popularItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  ยังไม่พบประวัติเมนูขายดีในช่วงเวลานี้
                </td>
              </tr>
            ) : (
              popularItems.map((item, idx) => (
                <tr key={item.menuItemId} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 font-bold">
                    <span
                      className={clsx(
                        'w-6 h-6 rounded-lg flex items-center justify-center text-xs',
                        idx === 0
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950 font-bold'
                          : idx === 2
                          ? 'bg-amber-800 text-white font-bold'
                          : 'text-slate-400',
                      )}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-100">{item.name}</td>
                  <td className="py-3.5 text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-bold text-white">{item.totalQuantity} จาน</td>
                  <td className="py-3.5 text-right font-black text-brand-400">
                    ฿{item.totalRevenue.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
