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
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">อันดับเมนูอาหารขายดี (Top Popular Items)</h4>
            <p className="text-xs text-slate-500">คำนวณจากจำนวนจานที่สั่งและรายได้รวมจริง</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-100">
              <th className="pb-3 font-semibold">อันดับ</th>
              <th className="pb-3 font-semibold">ชื่อเมนู</th>
              <th className="pb-3 font-semibold">หมวดหมู่</th>
              <th className="pb-3 font-semibold text-right">จำนวนที่ขายได้ (จาน)</th>
              <th className="pb-3 font-semibold text-right">ยอดขายรวม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading || !popularItems || popularItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  ยังไม่พบประวัติเมนูขายดีในช่วงเวลานี้
                </td>
              </tr>
            ) : (
              popularItems.map((item, idx) => (
                <tr key={item.menuItemId} className="hover:bg-sky-50/50 transition-colors">
                  <td className="py-3.5 font-bold">
                    <span
                      className={clsx(
                        'w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-xs',
                        idx === 0
                          ? 'bg-amber-500 text-white font-black'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800 font-bold'
                          : idx === 2
                          ? 'bg-amber-700 text-white font-bold'
                          : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-3.5 text-slate-600">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] border border-slate-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-bold text-slate-800">{item.totalQuantity} จาน</td>
                  <td className="py-3.5 text-right font-black text-brand-700">
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
