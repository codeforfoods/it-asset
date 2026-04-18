import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Server, MonitorPlay, AlertTriangle, Building2, Loader2, ArrowUpRight } from 'lucide-react';
import { fetchEquipments, transformEquipments } from '../services/equipmentService';
import { supabase } from '../lib/supabase';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: cats } = await supabase.from('categories').select('*');
        const raw = await fetchEquipments();
        const transformed = transformEquipments(raw, cats);
        setData(transformed);
      } catch (err) {
        console.error("Lỗi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    let totalQty = 0;
    let newThisYear = 0;
    let eolSoon = 0; // Contains EOL or EOSS in current or next year
    const units = new Set();
    const locations = new Set();

    data.forEach(item => {
      totalQty += item.qty || 0;
      if (item.yearInUse === currentYear) {
        newThisYear += item.qty || 0;
      }
      if (item._raw.company_id) units.add(item._raw.company_id);
      if (item._raw.location_id) locations.add(item._raw.location_id);

      // Check EOL/EOSS (format MM/YYYY)
      const eolYear = item.eol ? item.eol.split('/')[1] : null;
      const eossYear = item.eoss ? item.eoss.split('/')[1] : null;
      if (
        (eolYear && (eolYear === currentYear || parseInt(eolYear) === parseInt(currentYear) + 1)) ||
        (eossYear && (eossYear === currentYear || parseInt(eossYear) === parseInt(currentYear) + 1))
      ) {
        eolSoon += item.qty || 0;
      }
    });

    return {
      totalQty,
      newThisYear,
      eolSoon,
      totalUnits: units.size,
      totalLocations: locations.size,
    };
  }, [data]);

  // Compute charts data
  const charts = useMemo(() => {
    // 1. Investment by Year
    const yearMap = {};
    // 2. By Location
    const locMap = {};
    // 3. By Category
    const catMap = {};

    data.forEach(item => {
      const y = item.yearInUse || 'Chưa rõ';
      const l = item.location || 'Chưa gán';
      const c = item.category || 'Khác';
      const q = item.qty || 0;

      yearMap[y] = (yearMap[y] || 0) + q;
      locMap[l] = (locMap[l] || 0) + q;
      catMap[c] = (catMap[c] || 0) + q;
    });

    const yearData = Object.keys(yearMap).sort().map(y => ({ name: y, "Số lượng": yearMap[y] }));
    const locData = Object.keys(locMap).sort((a,b) => locMap[b] - locMap[a]).map(l => ({ name: l, value: locMap[l] }));
    const catData = Object.keys(catMap).sort((a,b) => catMap[b] - catMap[a]).map(c => ({ name: c, value: catMap[c] }));

    return { yearData, locData, catData };
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  const statCards = [
    { label: "Tổng Thiết Bị", value: metrics.totalQty, icon: Server, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
    { label: "Đầu Tư Mới (Năm Nay)", value: metrics.newThisYear, icon: MonitorPlay, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { label: "Cảnh Báo EOL/EOSS", value: metrics.eolSoon, icon: AlertTriangle, color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400" },
    { label: "Quy Mô Triển Khai", value: `${metrics.totalLocations} Vị trí`, sub: `${metrics.totalUnits} Đơn vị`, icon: Building2, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tổng quan Hệ thống</h1>
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Đã đồng bộ dữ liệu
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-foreground">
                {stat.value}
                {stat.sub && <span className="text-sm font-normal text-muted-foreground ml-2">/ {stat.sub}</span>}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-primary" />
            Xu hướng trang bị theo năm
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.yearData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="Số lượng" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorQty)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            Cơ cấu thiết bị theo nhóm
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.catData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {charts.catData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
        <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Phân bổ số lượng theo vị trí
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.locData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              />
              <Bar dataKey="value" name="Số lượng" fill="#10b981" radius={[0, 4, 4, 0]}>
                {charts.locData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
