'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/dashboard/Navbar';
import {
  MenuItemCard,
  MenuToolbar,
  MenuItemModal,
  AiImageGeneratorModal,
} from '@/components/menu';
import { MenuItem, CreateMenuItemDto, UpdateMenuItemDto } from '@campus-food/shared-types';

import { useToast } from '@/lib/toast-context';

export default function MenuManagementPage() {
  const { vendor } = useAuth();
  const { success, error: toastError, info } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Menu Items
  const { data: rawMenuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['vendor-menu', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) return [];
      const res = await apiClient<any>(`/menu/vendor/${vendor.id}?includeUnavailable=true`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!vendor?.id,
  });

  const menuItems = Array.isArray(rawMenuItems) ? rawMenuItems : [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (dto: CreateMenuItemDto) => {
      return apiClient('/menu', {
        method: 'POST',
        body: JSON.stringify({ ...dto, vendorId: vendor?.id }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu', vendor?.id] });
      success('เพิ่มเมนูสำเร็จ! ✨', `เพิ่ม "${variables.name}" เข้าสู่รายการอาหารเรียบร้อยแล้ว`);
    },
    onError: (err: any) => {
      toastError('ไม่สามารถเพิ่มเมนูได้', err?.message || 'กรุณาลองใหม่อีกครั้ง');
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu', vendor?.id] });
      success('บันทึกการแก้ไขสำเร็จ! ✅', `อัปเดตข้อมูลเมนูเรียบร้อยแล้ว`);
    },
    onError: (err: any) => {
      toastError('ไม่สามารถแก้ไขเมนูได้', err?.message || 'กรุณาลองใหม่อีกครั้ง');
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu', vendor?.id] });
      info(
        variables.isDailySpecial ? '⭐ ตั้งเป็นเมนูพิเศษประจำวัน' : 'นำออกจากเมนูพิเศษ',
        'อัปเดตการแสดงผลหน้าแรกของลูกค้าทันที',
      );
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu', vendor?.id] });
      info(
        variables.isAvailable ? '🟢 เปิดสถานะพร้อมขาย' : '🔴 ปรับเป็นของหมดชั่วคราว',
        'สถานะเมนูจะแสดงให้ลูกค้าทราบบนแอปทันที',
      );
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
      success('ลบเมนูเรียบร้อย', 'รายการอาหารถูกนำออกจากระบบแล้ว');
    },
    onError: (err: any) => {
      toastError('เกิดข้อผิดพลาดในการลบ', err?.message || 'กรุณาลองใหม่อีกครั้ง');
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
        {/* Controls Toolbar Subcomponent */}
        <MenuToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onOpenAiStudio={() => setIsAiStudioOpen(true)}
          onAddNewItem={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        />

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
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={(selected) => {
                  setEditingItem(selected);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
                onToggleSpecial={(id, isSpecial) =>
                  toggleSpecialMutation.mutate({ id, isDailySpecial: isSpecial })
                }
                onToggleAvailable={(id, isAvailable) =>
                  toggleAvailableMutation.mutate({ id, isAvailable })
                }
              />
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
