import React, { useMemo } from 'react';
import { Monitor, Layers, ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw } from 'lucide-react';

export default function StatsCards({ data = [] }) {
  const stats = useMemo(() => {
    const totalQty = data.reduce((sum, item) => sum + (item.qty || 0), 0);
    const uniqueTypes = new Set(data.map(item => item.deviceType)).size;
    const supportQty = data.filter(item => item.license === 'Support').reduce((sum, item) => sum + (item.qty || 0), 0);
    const expiredLicenseQty = data.filter(item => item.license === 'Hết license').reduce((sum, item) => sum + (item.qty || 0), 0);

    const now = new Date();
    const pastEolQty = data.filter(item => {
      if (!item.eol) return false;
      const [month, year] = item.eol.split('/');
      if (!month || !year) return false;
      const eolDate = new Date(parseInt(year), parseInt(month) - 1);
      return eolDate < now;
    }).reduce((sum, item) => sum + (item.qty || 0), 0);

    const needReplaceQty = data.filter(item => item.replace && item.replace !== '#N/A' && item.replace !== '').reduce((sum, item) => sum + (item.qty || 0), 0);

    return { totalQty, uniqueTypes, supportQty, expiredLicenseQty, pastEolQty, needReplaceQty };
  }, [data]);

  const cards = [
    {
      label: 'Tổng thiết bị',
      value: stats.totalQty,
      icon: Monitor,
      color: 'rgb(22, 67, 151)',
      bgColor: 'rgba(22, 67, 151, 0.08)',
      borderColor: 'rgba(22, 67, 151, 0.18)',
    },
    {
      label: 'Loại thiết bị',
      value: stats.uniqueTypes,
      icon: Layers,
      color: 'rgb(99, 60, 180)',
      bgColor: 'rgba(99, 60, 180, 0.08)',
      borderColor: 'rgba(99, 60, 180, 0.18)',
    },
    {
      label: 'Còn hỗ trợ',
      value: stats.supportQty,
      icon: ShieldCheck,
      color: 'rgb(16, 140, 90)',
      bgColor: 'rgba(16, 140, 90, 0.08)',
      borderColor: 'rgba(16, 140, 90, 0.18)',
    },
    {
      label: 'Hết License',
      value: stats.expiredLicenseQty,
      icon: ShieldAlert,
      color: 'rgb(200, 50, 50)',
      bgColor: 'rgba(200, 50, 50, 0.08)',
      borderColor: 'rgba(200, 50, 50, 0.18)',
    },
    {
      label: 'Quá hạn EOL',
      value: stats.pastEolQty,
      icon: AlertTriangle,
      color: 'rgb(200, 120, 20)',
      bgColor: 'rgba(200, 120, 20, 0.08)',
      borderColor: 'rgba(200, 120, 20, 0.18)',
    },
    {
      label: 'Cần thay thế',
      value: stats.needReplaceQty,
      icon: RefreshCw,
      color: 'rgb(180, 80, 30)',
      bgColor: 'rgba(180, 80, 30, 0.08)',
      borderColor: 'rgba(180, 80, 30, 0.18)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
            style={{ borderColor: card.borderColor }}
          >
            {/* Subtle gradient accent */}
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.07] -translate-y-6 translate-x-6 group-hover:opacity-[0.12] transition-opacity"
              style={{ backgroundColor: card.color }}
            />

            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                style={{ backgroundColor: card.bgColor }}
              >
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-muted-foreground truncate">{card.label}</p>
                <p className="text-2xl font-bold tracking-tight" style={{ color: card.color }}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
