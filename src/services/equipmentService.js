import { supabase } from '../lib/supabase';

// ============ LOOKUP DATA ============

export async function fetchCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('sort_order')
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchDeviceTypes() {
  const { data, error } = await supabase
    .from('device_types')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchLicenseStatuses() {
  const { data, error } = await supabase
    .from('license_statuses')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

// ============ EQUIPMENTS ============

export async function fetchEquipments() {
  const { data, error } = await supabase
    .from('equipments')
    .select(`
      *,
      company:companies(id, name),
      category:categories(id, name, parent_id),
      device_type:device_types(id, name),
      location:locations(id, name),
      license_status:license_statuses(id, name, color_code)
    `)
    .order('created_at');
  if (error) throw error;
  return data;
}

/**
 * Transform raw Supabase equipment rows into flat rows for the TreeTable.
 * Builds unit / category / subCategory from relations.
 * Grouping order: Unit → Category (top-level) → Sub-category
 */
export function transformEquipments(rawData, categories) {
  // Build a category lookup: id -> { name, parent_id }
  const catMap = {};
  (categories || []).forEach(c => {
    catMap[c.id] = c;
  });

  // For each equipment, determine unit, top-level category (parent) and sub-category
  const transformed = rawData.map(eq => {
    let category = '';
    let subCategory = '';

    if (eq.category) {
      // If this category has a parent, it's a sub-category
      if (eq.category.parent_id && catMap[eq.category.parent_id]) {
        category = catMap[eq.category.parent_id].name;
        subCategory = eq.category.name;
      } else {
        category = eq.category.name;
      }
    }

    return {
      id: eq.id,
      unit: eq.company?.name || '(Chưa gán đơn vị)',
      category,
      subCategory,
      deviceType: eq.device_type_name || eq.device_type?.name || '',
      ipAddress: eq.ip_address || '',
      model: eq.model || '',
      qty: eq.quantity || 0,
      taskFunction: eq.task_function || '',
      location: eq.location?.name || '',
      qtySL: eq.location_qty || 0,
      functionSD: eq.function_sd || '',
      yearInUse: eq.year_in_use || '',
      eol: eq.eol_date || '',
      eoss: eq.eoss_date || '',
      eoLicense: eq.eo_license || '',
      license: eq.license_status?.name || '',
      replacePhase: eq.replace_phase || '',
      replace: eq.replace_model || '',
      // Keep raw IDs for editing
      _raw: eq,
    };
  });

  // Sort by Unit -> Category -> Device Type
  return transformed.sort((a, b) => {
    const unitCompare = a.unit.localeCompare(b.unit);
    if (unitCompare !== 0) return unitCompare;

    const catCompare = a.category.localeCompare(b.category);
    if (catCompare !== 0) return catCompare;

    return a.deviceType.localeCompare(b.deviceType);
  });
}

export async function createEquipment(payload) {
  const { data, error } = await supabase
    .from('equipments')
    .insert([payload])
    .select();
  if (error) throw error;
  return data[0];
}

export async function updateEquipment(id, payload) {
  const { data, error } = await supabase
    .from('equipments')
    .update(payload)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteEquipment(id) {
  const { error } = await supabase
    .from('equipments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
