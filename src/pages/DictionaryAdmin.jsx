import React, { useState, useEffect, useCallback } from 'react';
import { Folders, Tag, Plus, Edit, Trash2, ChevronRight, ChevronDown, Loader2, Save, X, MapPin, ShieldCheck, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

const TABS = [
  { id: 'companies', label: 'Đơn vị', icon: Building2 },
  { id: 'categories', label: 'Nhóm thiết bị', icon: Folders },
  { id: 'locations', label: 'Vị trí', icon: MapPin },
  { id: 'license_statuses', label: 'Trạng thái License', icon: ShieldCheck },
];

function InlineEditRow({ item, onSave, onCancel, placeholder = 'Nhập tên...' }) {
  const [name, setName] = useState(item?.name || '');
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim());
    setSaving(false);
  };
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)} placeholder={placeholder} className="flex-1 h-9 px-3 rounded-md border border-primary/40 shadow-sm bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" />
      <button type="submit" disabled={saving || !name.trim()} className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-all">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      </button>
      <button type="button" onClick={onCancel} className="p-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-all"><X className="w-4 h-4" /></button>
    </form>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [addingParent, setAddingParent] = useState(false);
  const [addingChildOf, setAddingChildOf] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order').order('name');
    setCategories(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const topLevel = categories.filter(c => !c.parent_id);
  const getChildren = (parentId) => categories.filter(c => c.parent_id === parentId);

  const handleAdd = async (name, parentId = null) => {
    const maxSort = categories.filter(c => c.parent_id === parentId).reduce((max, c) => Math.max(max, c.sort_order || 0), 0);
    await supabase.from('categories').insert({ name, parent_id: parentId, sort_order: maxSort + 1 });
    setAddingParent(false); setAddingChildOf(null); await load();
  };
  const handleUpdate = async (id, name) => { await supabase.from('categories').update({ name }).eq('id', id); setEditingId(null); await load(); };
  const handleDelete = async (id) => {
    const children = getChildren(id);
    if (!window.confirm(children.length > 0 ? `Xóa nhóm này sẽ xóa luôn ${children.length} nhóm con. Tiếp tục?` : 'Bạn có chắc chắn muốn xóa?')) return;
    await supabase.from('categories').delete().eq('id', id); await load();
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Đang tải...</span></div>;

  return (
    <div className="space-y-2">
      {topLevel.map(parent => {
        const children = getChildren(parent.id);
        const isExp = expanded[parent.id] !== false;
        return (
          <div key={parent.id} className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 group">
              <button onClick={() => setExpanded(p => ({ ...p, [parent.id]: !isExp }))} className="p-0.5 text-muted-foreground hover:text-foreground">
                {isExp ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {editingId === parent.id ? (
                <div className="flex-1"><InlineEditRow item={parent} onSave={(name) => handleUpdate(parent.id, name)} onCancel={() => setEditingId(null)} /></div>
              ) : (<>
                <span className="font-semibold text-foreground flex-1">{parent.name}</span>
                <span className="text-xs text-muted-foreground mr-2">{children.length} nhóm con</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setAddingChildOf(parent.id)} className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-md transition-colors" title="Thêm nhóm con"><Plus className="w-4 h-4" /></button>
                  <button onClick={() => setEditingId(parent.id)} className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(parent.id)} className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </>)}
            </div>
            {isExp && (
              <div className="divide-y divide-border">
                {children.map(child => (
                  <div key={child.id} className="flex items-center gap-2 px-4 py-2.5 pl-12 group hover:bg-muted/20 transition-colors">
                    {editingId === child.id ? (
                      <div className="flex-1"><InlineEditRow item={child} onSave={(name) => handleUpdate(child.id, name)} onCancel={() => setEditingId(null)} /></div>
                    ) : (<>
                      <span className="text-sm text-foreground flex-1">{child.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(child.id)} className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-md transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(child.id)} className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </>)}
                  </div>
                ))}
                {addingChildOf === parent.id && (
                  <div className="px-4 py-2.5 pl-12"><InlineEditRow onSave={(name) => handleAdd(name, parent.id)} onCancel={() => setAddingChildOf(null)} placeholder="Tên nhóm con mới..." /></div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {addingParent ? (
        <div className="border border-dashed border-primary/40 rounded-lg px-4 py-3"><InlineEditRow onSave={(name) => handleAdd(name)} onCancel={() => setAddingParent(false)} placeholder="Tên Category cấp 1 mới..." /></div>
      ) : (
        <button onClick={() => setAddingParent(true)} className="w-full border border-dashed border-border rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors flex items-center gap-2 justify-center"><Plus className="w-4 h-4" /> Thêm Category mới</button>
      )}
    </div>
  );
}

function SimpleListTab({ tableName, placeholder = 'Nhập tên mới...' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const q = supabase.from(tableName).select('*');
    if (tableName === 'companies') q.order('sort_order').order('name');
    else q.order('name');
    const { data } = await q;
    setItems(data || []);
    setLoading(false);
  }, [tableName]);
  useEffect(() => { load(); }, [load]);

  const handleAdd = async (name) => {
    const payload = tableName === 'license_statuses' ? { name, color_code: 'gray' } : { name };
    const { error } = await supabase.from(tableName).insert(payload);
    if (error) { alert('Lỗi: ' + error.message); return; }
    setAdding(false); await load();
  };
  const handleUpdate = async (id, name) => { await supabase.from(tableName).update({ name }).eq('id', id); setEditingId(null); await load(); };
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) { alert('Không thể xóa: ' + error.message); return; }
    await load();
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Đang tải...</span></div>;

  return (
    <div className="space-y-2">
      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-muted/20 transition-colors">
            {editingId === item.id ? (
              <div className="flex-1"><InlineEditRow item={item} onSave={(name) => handleUpdate(item.id, name)} onCancel={() => setEditingId(null)} /></div>
            ) : (<>
              <span className="text-sm text-foreground flex-1 font-medium">{item.name}</span>
              {item.color_code && (
                <span className={clsx("px-2 py-0.5 rounded text-[10px] font-semibold border",
                  item.color_code === 'green' ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                  item.color_code === 'red' ? "bg-rose-100 text-rose-800 border-rose-200" :
                  "bg-gray-100 text-gray-700 border-gray-200"
                )}>{item.color_code}</span>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingId(item.id)} className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </>)}
          </div>
        ))}
        {items.length === 0 && !adding && <div className="px-4 py-6 text-center text-sm text-muted-foreground">Chưa có dữ liệu</div>}
      </div>
      {adding ? (
        <div className="border border-dashed border-primary/40 rounded-lg px-4 py-3"><InlineEditRow onSave={handleAdd} onCancel={() => setAdding(false)} placeholder={placeholder} /></div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full border border-dashed border-border rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors flex items-center gap-2 justify-center"><Plus className="w-4 h-4" /> Thêm mới</button>
      )}
    </div>
  );
}

const COLOR_OPTIONS = [
  { value: 'green', label: 'Xanh lá', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  { value: 'red', label: 'Đỏ', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', dot: 'bg-rose-500' },
  { value: 'yellow', label: 'Vàng', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  { value: 'blue', label: 'Xanh dương', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
  { value: 'purple', label: 'Tím', bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200', dot: 'bg-violet-500' },
  { value: 'orange', label: 'Cam', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' },
  { value: 'gray', label: 'Xám', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' },
];

function getColorStyle(colorCode) {
  return COLOR_OPTIONS.find(c => c.value === colorCode) || COLOR_OPTIONS[COLOR_OPTIONS.length - 1];
}

function LicenseStatusTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('license_statuses').select('*').order('name');
    setItems(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleAdd = async (name) => {
    const { error } = await supabase.from('license_statuses').insert({ name, color_code: 'gray' });
    if (error) { alert('Lỗi: ' + error.message); return; }
    setAdding(false); await load();
  };

  const handleUpdate = async (id, name) => {
    await supabase.from('license_statuses').update({ name }).eq('id', id);
    setEditingId(null); await load();
  };

  const handleColorChange = async (id, colorCode) => {
    await supabase.from('license_statuses').update({ color_code: colorCode }).eq('id', id);
    setColorPickerOpen(null);
    await load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
    const { error } = await supabase.from('license_statuses').delete().eq('id', id);
    if (error) { alert('Không thể xóa: ' + error.message); return; }
    await load();
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Đang tải...</span></div>;

  return (
    <div className="space-y-2">
      <div className="border border-border rounded-lg divide-y divide-border">
        {items.map(item => {
          const color = getColorStyle(item.color_code);
          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-muted/20 transition-colors">
              {editingId === item.id ? (
                <div className="flex-1"><InlineEditRow item={item} onSave={(name) => handleUpdate(item.id, name)} onCancel={() => setEditingId(null)} /></div>
              ) : (<>
                <span className="text-sm text-foreground flex-1 font-medium">{item.name}</span>

                {/* Color badge */}
                <div className="relative">
                  <button
                    onClick={() => setColorPickerOpen(colorPickerOpen === item.id ? null : item.id)}
                    className={clsx(
                      "px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-all hover:ring-2 hover:ring-primary/30",
                      color.bg, color.text, color.border
                    )}
                  >
                    {color.label}
                  </button>

                  {/* Color dropdown */}
                  {colorPickerOpen === item.id && (
                    <div className="absolute right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[160px] animate-in fade-in slide-in-from-top-1 duration-150">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-1.5 mb-1 border-b border-border">Chọn màu</p>
                      <div className="space-y-0.5">
                        {COLOR_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleColorChange(item.id, opt.value)}
                            className={clsx(
                              "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                              item.color_code === opt.value ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                            )}
                          >
                            <span className={clsx("w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10", opt.dot)}></span>
                            <span>{opt.label}</span>
                            {item.color_code === opt.value && <span className="ml-auto text-primary text-xs">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingId(item.id)} className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </>)}
            </div>
          );
        })}
        {items.length === 0 && !adding && <div className="px-4 py-6 text-center text-sm text-muted-foreground">Chưa có dữ liệu</div>}
      </div>
      {adding ? (
        <div className="border border-dashed border-primary/40 rounded-lg px-4 py-3"><InlineEditRow onSave={handleAdd} onCancel={() => setAdding(false)} placeholder="Tên trạng thái mới..." /></div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full border border-dashed border-border rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors flex items-center gap-2 justify-center"><Plus className="w-4 h-4" /> Thêm mới</button>
      )}
    </div>
  );
}

export default function DictionaryAdmin() {
  const [activeTab, setActiveTab] = useState('companies');
  return (
    <div className="p-6 h-full flex flex-col max-h-screen">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Danh mục</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý các danh mục nền tảng: đơn vị, category, loại thiết bị, vị trí, trạng thái license.</p>
      </div>
      <div className="flex gap-1 border-b border-border mb-6 shrink-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={clsx(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px",
              isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}><Icon className="w-4 h-4" />{tab.label}</button>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto">
        {activeTab === 'companies' && <SimpleListTab tableName="companies" placeholder="Tên đơn vị mới..." />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'locations' && <SimpleListTab tableName="locations" placeholder="Tên vị trí mới..." />}
        {activeTab === 'license_statuses' && <LicenseStatusTab />}
      </div>
    </div>
  );
}
