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
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-teal-500 to-teal-600 hover:from-brand-700 hover:to-teal-600 text-white font-bold shadow-xl shadow-teal-500/25 border border-white/40 transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Bot className="w-5 h-5 animate-bounce text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
          </div>
          <span className="text-sm font-semibold tracking-wide">AI ผู้ช่วยร้านค้า</span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="bg-white w-96 sm:w-[420px] h-[540px] rounded-3xl shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#14B8A6] border-b border-[#0F766E] flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Campus Food Copilot</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium border border-white/30">
                    Claude 3.5
                  </span>
                </h3>
                <p className="text-[11px] text-teal-100 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-300" />
                  <span>ดึงข้อมูลจริงจากระบบร้านค้า</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#F8FAFC]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={clsx(
                  'flex gap-2.5 items-start',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-[#CCFBF1] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={clsx(
                    'p-3 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-wrap shadow-xs',
                    msg.role === 'user'
                      ? 'bg-[#0D9488] text-white rounded-br-none shadow-teal-500/20'
                      : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-bl-none',
                  )}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-[#CCFBF1] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-[#0D9488] text-xs p-2.5 rounded-xl bg-[#CCFBF1] border border-[#99F6E4] animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0D9488]" />
                <span>AI กำลังประมวลผลและดึงข้อมูลยอดขายจริงจากระบบ...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts */}
          <div className="px-3 py-2 border-t border-[#E2E8F0] bg-white overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {suggestedActions.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSendMessage(suggestion)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] hover:bg-[#CCFBF1] text-[#0D9488] text-[11px] font-medium transition-colors shrink-0 disabled:opacity-50"
              >
                ✨ {suggestion}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2">
            <input
              type="text"
              placeholder="พิมพ์คำถามถึง AI ผู้ช่วย..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              disabled={isLoading}
              className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-700 hover:to-teal-600 text-white disabled:opacity-40 transition-all active:scale-95 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
