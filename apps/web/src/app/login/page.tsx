'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Store, Utensils, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsSubmitting(true);
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async () => {
    setEmail('vendor@campus.ac.th');
    setPassword('password123');
    try {
      setIsSubmitting(true);
      setError(null);
      await login('vendor@campus.ac.th', 'password123');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการล็อกอินด่วน');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100/70 via-[#F0FDFA] to-teal-50/60 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing soft orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 items-center justify-center shadow-xl shadow-brand-500/25 text-white mb-2">
            <Utensils className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Campus Food Vendor</h1>
          <p className="text-xs text-[#475569]">ระบบจัดการร้านอาหารและคิวออเดอร์สำหรับแม่ค้า</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-xl shadow-teal-500/5 border-[#E2E8F0] space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">อีเมลร้านค้า</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="vendor@campus.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-700 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบแดชบอร์ด'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Banner */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] text-xs font-semibold text-[#0D9488] border border-[#99F6E4] transition-all shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
              <span>⚡ คลิกเข้าสู่ระบบด่วน (ร้านตัวอย่าง: ครัวป้าสมใจ)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
