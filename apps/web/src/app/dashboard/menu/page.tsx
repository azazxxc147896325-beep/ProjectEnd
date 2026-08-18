'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/dashboard/Navbar';
import { MenuItemModal } from '@/components/menu/MenuItemModal';
import { AiImageGeneratorModal } from '@/components/menu/AiImageGeneratorModal';
import { MenuItem, CreateMenuItemDto, UpdateMenuItemDto } from '@campus-food/shared-types';
import {
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  Eye,
  EyeOff,
  Wand2,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function MenuManagementPage() {
  const { vendor } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');


  // Fetch Menu Items
  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['vendor-menu', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) return [];
      return apiClient(`/menu/vendor/${vendor.id}?includeUnavailable=true`);
    },
    enabled: !!vendor?.id,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (dto: CreateMenuItemDto) => {
      return apiClient('/menu', {
        method: 'POST',
        body: JSON.stringify({ ...dto, vendorId: vendor?.id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu', vendor?.id] });
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateMenuItemDto }) => {
      return apiClient(`/menu/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu', vendor?.id] });
    },
  });

  // Toggle Daily Special Mutation
  const toggleSpecialMutation = useMutation({
    mutationFn: async ({ id, isDailySpecial }: { id: string; isDailySpecial: boolean }) => {
      return apiClient(`/menu/${id}/toggle-special`, {
        method: 'PATCH',
        body: JSON.stringify({ isDailySpecial }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu', vendor?.id] });
    },
  });

  // Toggle Available Mutation
  const toggleAvailableMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      return apiClient(`/menu/${id}/toggle-available`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu', vendor?.id] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient(`/menu/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu', vendor?.id] });
    },
  });

  const handleFormSubmit = async (data: CreateMenuItemDto | UpdateMenuItemDto) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, dto: data });
    } else {
      await createMutation.mutateAsync(data as CreateMenuItemDto);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเมนู "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const categories = ['all', ...Array.from(new Set(menuItems.map((m) => m.category)))];

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title="จัดการเมนูอาหาร"
        description="เพิ่ม ลบ แก้ไขรายการอาหาร และเปิด/ปิดเมนูพิเศษหรือสถานะพร้อมขายแบบ Real-time"
      />

      <div className="p-6 space-y-6 flex-1">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อเมนู..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                    selectedCategory === cat
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800',
                  )}
                >
                  {cat === 'all' ? 'ทั้งหมด' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiStudioOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-bold text-xs shadow-sm transition-all"
            >
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>AI Image Studio</span>
            </button>

            {/* Add Menu Button */}
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มเมนูใหม่</span>
            </button>
          </div>
        </div>


        {/* Menu Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">กำลังโหลดรายการอาหาร...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm glass-panel rounded-3xl border-dashed border-slate-800 space-y-3">
            <p>ไม่พบรายการอาหารในหมวดหมู่นี้</p>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/40 text-xs font-bold hover:bg-brand-500/30"
            >
              + เพิ่มเมนูแรกเลย
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={clsx(
                  'glass-panel rounded-3xl overflow-hidden border-slate-800/90 transition-all flex flex-col justify-between shadow-md',
                  !item.isAvailable && 'opacity-60 grayscale-[40%]',
                )}
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500'
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-semibold text-slate-200 border border-white/10">
                      {item.category}
                    </span>
                    {item.isDailySpecial && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-[11px] font-bold text-slate-950 flex items-center gap-1 shadow-lg shadow-amber-500/30 animate-pulse-subtle">
                        <Sparkles className="w-3 h-3 fill-slate-950" />
                        <span>Special</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h4 className="font-bold text-base text-white tracking-tight">{item.name}</h4>
                    </div>
                    <span className="text-lg font-black text-brand-400 bg-slate-950/80 px-2.5 py-1 rounded-xl backdrop-blur-md border border-brand-500/30">
                      ฿{Number(item.price)}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                    {item.description || 'ไม่มีคำอธิบายเมนู'}
                  </p>

                  {/* Interactive Switch Controls */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                    {/* Toggle Special */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>เมนูพิเศษประจำวัน</span>
                      </span>
                      <button
                        onClick={() =>
                          toggleSpecialMutation.mutate({
                            id: item.id,
                            isDailySpecial: !item.isDailySpecial,
                          })
                        }
                        className={clsx(
                          'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border',
                          item.isDailySpecial
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300',
                        )}
                      >
                        {item.isDailySpecial ? 'เปิดใช้งาน' : 'ปิด'}
                      </button>
                    </div>

                    {/* Toggle Available */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                        {item.isAvailable ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>สถานะสินค้า</span>
                      </span>
                      <button
                        onClick={() =>
                          toggleAvailableMutation.mutate({
                            id: item.id,
                            isAvailable: !item.isAvailable,
                          })
                        }
                        className={clsx(
                          'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border',
                          item.isAvailable
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                        )}
                      >
                        {item.isAvailable ? 'พร้อมขาย (มีของ)' : 'ของหมดชั่วคราว'}
                      </button>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-brand-400" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 transition-colors"
                      title="ลบเมนู"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
      />

      {/* Standalone AI Image Studio Modal */}
      <AiImageGeneratorModal
        isOpen={isAiStudioOpen}
        onClose={() => setIsAiStudioOpen(false)}
        onSelectImage={(imageUrl) => {
          // Open MenuItemModal with the generated image
          setEditingItem({
            id: '',
            vendorId: vendor?.id || '',
            name: '',
            category: 'อาหารจานเดียว',
            price: 50,
            description: '',
            imageUrl,
            isDailySpecial: false,
            isAvailable: true,
          });
          setIsAiStudioOpen(false);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}

