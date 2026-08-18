'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, Send, X, Bot, User, Database, ChevronDown, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { AiChatMessage, AiToolCallLog } from '@campus-food/shared-types';
import { clsx } from 'clsx';

export function AiChatWidget() {
  const { vendor } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      content: 'สวัสดีครับ! ผมคือ **Campus Food Copilot** 🤖 ผู้ช่วย AI ประจำร้านของคุณ ยินดีตอบคำถามและวิเคราะห์ข้อมูลยอดขาย เมนูยอดนิยม หรือชั่วโมงเร่งด่วนจากข้อมูลจริงให้ครับ ถามมาได้เลย!',
    },
  ]);
  const [toolLogs, setToolLogs] = useState<AiToolCallLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    'เมนูไหนขายดีที่สุดในรอบ 7 วัน?',
    'ช่วงเวลากี่โมงที่ลูกค้าสั่งอาหารเยอะที่สุด?',
    'สรุปยอดขายวันนี้',
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || !vendor?.id || isLoading) return;

    const userMsg: AiChatMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await apiClient('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          vendorId: vendor.id,
          message: query,
          history: messages.slice(-6),
        }),
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: res.answer }]);
      if (res.toolCalls && res.toolCalls.length > 0) {
        setToolLogs(res.toolCalls);
      }
      if (res.suggestedActions) {
        setSuggestedActions(res.suggestedActions);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI หรือหลังบ้าน กรุณาลองใหม่อีกครั้งครับ',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-brand-500 hover:from-violet-500 hover:to-brand-400 text-white font-bold shadow-2xl shadow-purple-500/30 border border-white/20 transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Bot className="w-5 h-5 animate-bounce text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
          </div>
          <span className="text-sm font-semibold tracking-wide">AI ผู้ช่วยร้านค้า</span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="glass-panel w-96 sm:w-[420px] h-[540px] rounded-3xl shadow-2xl border-slate-700/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-violet-950/80 via-slate-900/90 to-brand-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-brand-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Campus Food Copilot</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium border border-violet-500/30">
                    Claude 3.5
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>ดึงข้อมูลจริงจากระบบร้านค้า</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={clsx(
                  'flex gap-2.5 items-start',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={clsx(
                    'p-3 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-wrap shadow-sm',
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-slate-850 bg-slate-800/90 text-slate-200 border border-slate-700/70 rounded-bl-none',
                  )}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-brand-600/30 border border-brand-500/40 text-brand-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-violet-300 text-xs p-2.5 rounded-xl bg-violet-950/40 border border-violet-500/20 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                <span>AI กำลังประมวลผลและดึงข้อมูลยอดขายจริงจากระบบ...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts */}
          <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {suggestedActions.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSendMessage(suggestion)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-violet-500/40 text-slate-300 hover:text-white text-[11px] transition-colors shrink-0 disabled:opacity-50"
              >
                ✨ {suggestion}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="พิมพ์คำถามถึง AI ผู้ช่วย..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-brand-500 hover:from-violet-500 hover:to-brand-400 text-white disabled:opacity-40 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
