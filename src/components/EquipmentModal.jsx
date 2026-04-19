import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react';
import { createEquipment, updateEquipment } from '../services/equipmentService';

const INITIAL_FORM = {
  company_id: '',
  category_id: '',
  device_type_name: '',
  ip_address: '',
  model: '',
  task_function: '',
  quantity: 1,
  location_id: '',
  location_qty: 1,
  function_sd: '',
  eol_date: '',
  eoss_date: '',
  eo_license: '',
  license_status_id: '',
  replace_phase: '',
  replace_model: '',
};

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MONTH_LABELS = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];

// ─── InfoTooltip ────────────────────────────────────────
function InfoTooltip({ title, description, actions }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const btnRef = useRef(null);

  const updatePosition = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top - 8, // 8px spacing above
      });
    }
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      // Update on scroll of any parent container, or window resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      // Close if click is outside both the button and the tooltip content
      if (btnRef.current && !btnRef.current.contains(e.target) && !e.target.closest('.info-tooltip-content')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div 
      className="relative inline-flex items-center ml-1.5"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button 
        ref={btnRef}
        type="button"
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
      >
        <Info className="w-4 h-4" />
      </button>

      {open && createPortal(
        <div 
          className="info-tooltip-content fixed z-[9999] w-[340px] bg-card border border-border shadow-xl rounded-xl p-4 text-left animate-in fade-in zoom-in-95 duration-200 cursor-default"
          style={{ 
            left: coords.x, 
            top: coords.y,
            transform: 'translate(-50%, -100%)' // Center horizontally, place entirely above the y coordinate
          }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <h4 className="font-bold text-foreground text-sm border-b border-border pb-2 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            {title}
          </h4>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{description}</p>
          
          <div className="space-y-3 text-sm">
            {actions.map((act, idx) => (
              <div key={idx} className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground">{act.label}:</span>
                <span className={act.danger ? "text-rose-600 dark:text-rose-400 font-medium leading-relaxed whitespace-pre-line" : "text-muted-foreground leading-relaxed whitespace-pre-line"}>
                  {act.text}
                </span>
              </div>
            ))}
          </div>
          {/* Arrow pointing down to the icon */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-b border-r border-border rotate-45"></div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── MonthYearPicker ────────────────────────────────────
function MonthYearPicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  // Parse value "MM/YYYY"
  const parsed = useMemo(() => {
    if (!value) return null;
    const m = value.match(/^(\d{1,2})\/(\d{4})$/);
    if (m) return { month: parseInt(m[1]), year: parseInt(m[2]) };
    return null;
  }, [value]);

  const [viewYear, setViewYear] = useState(parsed?.year || new Date().getFullYear());

  // Update viewYear when value changes
  useEffect(() => {
    if (parsed?.year) setViewYear(parsed.year);
  }, [parsed?.year]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (monthIdx) => {
    const mm = MONTHS[monthIdx];
    onChange(`${mm}/${viewYear}`);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  };

  const inputCls = "w-full h-10 px-3 pr-9 rounded-md border border-input shadow-sm bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm cursor-pointer";

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative" ref={ref}>
        <div onClick={() => setOpen(!open)} className={inputCls + " flex items-center"}>
          <span className={value ? "text-foreground" : "text-muted-foreground/60"}>
            {value || 'MM/YYYY'}
          </span>
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>

        {open && (
          <div className="absolute left-0 top-full mt-1.5 z-50 bg-card border border-border rounded-lg shadow-xl p-3 w-[260px] animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Year nav */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={() => setViewYear(y => y - 1)} className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-foreground">{viewYear}</span>
              <button type="button" onClick={() => setViewYear(y => y + 1)} className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {MONTH_LABELS.map((label, idx) => {
                const isSelected = parsed && parsed.month === idx + 1 && parsed.year === viewYear;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className={
                      "px-2 py-2 rounded-md text-sm font-medium transition-all " +
                      (isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-foreground")
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Clear button */}
            {value && (
              <button type="button" onClick={handleClear} className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-destructive transition-colors py-1">
                Xóa giá trị
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── IP Address Input ───────────────────────────────────
function IpAddressInput({ value, onChange }) {
  const [octets, setOctets] = useState(['', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Sync from external value
  useEffect(() => {
    if (value) {
      const parts = value.split('.');
      setOctets([
        parts[0] || '',
        parts[1] || '',
        parts[2] || '',
        parts[3] || '',
      ]);
    } else {
      setOctets(['', '', '', '']);
    }
  }, [value]);

  const emitChange = (newOctets) => {
    const hasAny = newOctets.some(o => o !== '');
    if (!hasAny) {
      onChange('');
    } else {
      onChange(newOctets.join('.'));
    }
  };

  const handleOctetChange = (idx, val) => {
    // Allow only digits
    const clean = val.replace(/[^\d]/g, '');
    
    // Limit to 3 digits and max 255
    let num = clean.slice(0, 3);
    if (parseInt(num) > 255) num = '255';

    const newOctets = [...octets];
    newOctets[idx] = num;
    setOctets(newOctets);
    emitChange(newOctets);

    // Auto-advance to next octet when 3 digits entered or value >= 100
    if (num.length === 3 && idx < 3) {
      inputRefs[idx + 1].current?.focus();
      inputRefs[idx + 1].current?.select();
    }
  };

  const handleKeyDown = (idx, e) => {
    // Move to next on dot or period
    if (e.key === '.' && idx < 3) {
      e.preventDefault();
      inputRefs[idx + 1].current?.focus();
      inputRefs[idx + 1].current?.select();
    }
    // Backspace on empty moves to previous
    if (e.key === 'Backspace' && octets[idx] === '' && idx > 0) {
      e.preventDefault();
      inputRefs[idx - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').trim();
    const ipMatch = pasted.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      e.preventDefault();
      const newOctets = [ipMatch[1], ipMatch[2], ipMatch[3], ipMatch[4]].map(o => {
        const n = parseInt(o);
        return n > 255 ? '255' : String(n);
      });
      setOctets(newOctets);
      emitChange(newOctets);
    }
  };

  const octetCls = "w-full h-10 text-center rounded-md border border-input shadow-sm bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-mono";

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">Địa chỉ IP</label>
      <div className="flex items-center gap-0.5">
        {octets.map((octet, idx) => (
          <React.Fragment key={idx}>
            <input
              ref={inputRefs[idx]}
              type="text"
              inputMode="numeric"
              maxLength={3}
              value={octet}
              onChange={e => handleOctetChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              onPaste={idx === 0 ? handlePaste : undefined}
              placeholder="0"
              className={octetCls}
            />
            {idx < 3 && <span className="text-muted-foreground font-bold text-lg select-none px-px">.</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────
export default function EquipmentModal({ isOpen, onClose, equipment = null, lookups = {}, onSaveSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!equipment;

  // Build grouped categories for the "Nhóm" dropdown
  const categoryOptions = useMemo(() => {
    const cats = lookups.categories || [];
    const parents = cats.filter(c => !c.parent_id);
    const result = [];
    parents.forEach(p => {
      result.push({ id: p.id, name: p.name, isParent: true });
      cats.filter(c => c.parent_id === p.id).forEach(child => {
        result.push({ id: child.id, name: child.name, parentName: p.name, isParent: false });
      });
    });
    // Add orphan categories
    cats.filter(c => c.parent_id && !parents.find(p => p.id === c.parent_id)).forEach(c => {
      result.push({ id: c.id, name: c.name, isParent: false });
    });
    return result;
  }, [lookups.categories]);

  useEffect(() => {
    if (equipment && equipment._raw) {
      const raw = equipment._raw;
      setForm({
        company_id: raw.company_id || '',
        category_id: raw.category_id || '',
        device_type_name: raw.device_type_name || raw.device_type?.name || '',
        ip_address: raw.ip_address || '',
        model: raw.model || '',
        task_function: raw.task_function || '',
        quantity: raw.quantity || 1,
        location_id: raw.location_id || '',
        location_qty: raw.location_qty || 1,
        function_sd: raw.function_sd || '',
        eol_date: raw.eol_date || '',
        eoss_date: raw.eoss_date || '',
        eo_license: raw.eo_license || '',
        license_status_id: raw.license_status_id || '',
        replace_phase: raw.replace_phase || '',
        replace_model: raw.replace_model || '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setError(null);
  }, [equipment, isOpen]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.model.trim()) {
      setError('Vui lòng nhập tên Model thiết bị.');
      return;
    }

    const payload = {
      company_id: form.company_id || null,
      category_id: form.category_id || null,
      device_type_name: form.device_type_name || null,
      ip_address: form.ip_address || null,
      model: form.model,
      task_function: form.task_function || null,
      quantity: parseInt(form.quantity) || 1,
      location_id: form.location_id || null,
      location_qty: parseInt(form.location_qty) || 0,
      function_sd: form.function_sd || null,
      eol_date: form.eol_date || null,
      eoss_date: form.eoss_date || null,
      eo_license: form.eo_license || null,
      license_status_id: form.license_status_id || null,
      replace_phase: form.replace_phase || null,
      replace_model: form.replace_model || null,
    };

    try {
      setSaving(true);
      setError(null);
      if (isEdit) {
        await updateEquipment(equipment.id, payload);
      } else {
        await createEquipment(payload);
      }
      onSaveSuccess?.();
    } catch (err) {
      console.error('Lỗi lưu thiết bị:', err);
      setError('Lỗi lưu dữ liệu: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = "w-full h-10 px-3 rounded-md border border-input shadow-sm bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm";

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 min-h-screen">
      <div className="bg-card w-full max-w-[820px] rounded-xl border border-border shadow-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30 sticky top-0 z-10">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {isEdit ? 'Chỉnh sửa Thiết bị' : 'Thêm Thiết bị mới'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors focus:ring-2 focus:ring-primary outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="equipment-form" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Dòng 1: Đơn vị */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Đơn vị</label>
              <select value={form.company_id} onChange={e => handleChange('company_id', e.target.value)} className={inputCls}>
                <option value="">-- Chọn đơn vị --</option>
                {(lookups.companies || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            {/* Dòng 2: Nhóm, Loại thiết bị, Địa chỉ IP */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nhóm</label>
                <select value={form.category_id} onChange={e => handleChange('category_id', e.target.value)} className={inputCls}>
                  <option value="">-- Chọn nhóm --</option>
                  {categoryOptions.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.isParent ? c.name : `  └ ${c.name}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Loại thiết bị</label>
                <input type="text" value={form.device_type_name} onChange={e => handleChange('device_type_name', e.target.value)} placeholder="VD: Switch/Router" className={inputCls} />
              </div>
              <IpAddressInput value={form.ip_address} onChange={v => handleChange('ip_address', v)} />
            </div>

            {/* Dòng 3: Model, Chức năng, Số lượng */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Model <span className="text-destructive">*</span></label>
                <input type="text" value={form.model} onChange={e => handleChange('model', e.target.value)} placeholder="VD: FortiSwitch 1048E" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Chức năng</label>
                <input type="text" value={form.task_function} onChange={e => handleChange('task_function', e.target.value)} placeholder="VD: Mạng Core" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Số lượng</label>
                <input type="number" min="1" value={form.quantity} onChange={e => handleChange('quantity', e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Dòng 4: Vị trí, SL tại vị trí, Chức năng sử dụng */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Vị trí</label>
                <select value={form.location_id} onChange={e => handleChange('location_id', e.target.value)} className={inputCls}>
                  <option value="">-- Chọn vị trí --</option>
                  {(lookups.locations || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Số lượng</label>
                <input type="number" min="0" value={form.location_qty} onChange={e => handleChange('location_qty', e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Chức năng sử dụng</label>
                <input type="text" value={form.function_sd} onChange={e => handleChange('function_sd', e.target.value)} placeholder="VD: Switch Access" className={inputCls} />
              </div>
            </div>

            {/* Dòng 5: EOL, EOSS, EOLicense, License */}
            <div className="grid grid-cols-4 gap-4">
              <MonthYearPicker 
                label={
                  <div className="flex items-center whitespace-nowrap">
                    End Of Life (EOL)
                    <InfoTooltip 
                      title="End of Life (EOL) - Kết thúc vòng đời sản phẩm"
                      description="Đây là thông báo từ nhà sản xuất rằng họ ngừng sản xuất và bán model thiết bị đó ra thị trường."
                      actions={[
                        { label: 'Ý nghĩa', text: 'Bạn không thể mua mới thiết bị này từ hãng nữa. Tuy nhiên, thiết bị vẫn hoạt động bình thường nếu bạn đang sở hữu nó.' },
                        { label: 'Hành động', text: 'Đây là "hồi chuông" đầu tiên nhắc bạn cần lên kế hoạch ngân sách để chuyển đổi sang dòng thiết bị mới trong 1-3 năm tới.' }
                      ]}
                    />
                  </div>
                } 
                value={form.eol_date} 
                onChange={v => handleChange('eol_date', v)} 
              />
              <MonthYearPicker 
                label={
                  <div className="flex items-center whitespace-nowrap">
                    End Of Support (EOS)
                    <InfoTooltip 
                      title="End of Support (EOS) - Kết thúc hỗ trợ kỹ thuật"
                      description="Đây là mốc thời gian quan trọng và nguy hiểm nhất đối với thiết bị bảo mật. Sau ngày này, nhà sản xuất sẽ ngừng mọi dịch vụ hỗ trợ."
                      actions={[
                        { label: 'Ý nghĩa', text: '• Không có bản vá lỗi (Patches) hoặc cập nhật phần mềm (Firmware).\n• Không có sự trợ giúp từ kỹ sư của hãng khi gặp sự cố.' },
                        { label: 'Rủi ro', text: 'Nếu một lỗ hổng bảo mật mới (Zero-day) xuất hiện, thiết bị của bạn sẽ hoàn toàn bị phơi nhiễm vì không có bản vá.', danger: true },
                        { label: 'Hành động', text: 'Bạn bắt buộc phải thay thế thiết bị trước khi mốc này đến để đảm bảo an toàn cho hệ thống.', danger: true }
                      ]}
                    />
                  </div>
                } 
                value={form.eoss_date} 
                onChange={v => handleChange('eoss_date', v)} 
              />
              <MonthYearPicker label="EOLicense" value={form.eo_license} onChange={v => handleChange('eo_license', v)} />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">License</label>
                <select value={form.license_status_id} onChange={e => handleChange('license_status_id', e.target.value)} className={inputCls}>
                  <option value="">-- Chọn --</option>
                  {(lookups.licenseStatuses || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            {/* Dòng 6: Thông tin thay thế */}
            <div className="space-y-3 p-4 bg-primary/[0.03] border border-primary/20 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                Thông tin Thay thế (Lifecycle)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Giai đoạn thay thế</label>
                  <input type="text" value={form.replace_phase} onChange={e => handleChange('replace_phase', e.target.value)} placeholder="VD: 2026-2027" className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Thiết bị thay thế</label>
                  <input type="text" value={form.replace_model} onChange={e => handleChange('replace_model', e.target.value)} placeholder="VD: Cisco Nexus 93180YC" className={inputCls} />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-border bg-muted/30 flex justify-end gap-3 sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 font-medium text-sm rounded-md border border-border bg-background hover:bg-muted text-foreground transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit"
            form="equipment-form"
            disabled={saving}
            className="px-4 py-2 font-medium text-sm rounded-md bg-primary text-primary-foreground shadow flex items-center gap-2 hover:bg-primary/90 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary outline-none disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Đang lưu...' : 'Lưu Thiết bị'}
          </button>
        </div>
      </div>
    </div>
  );
}
