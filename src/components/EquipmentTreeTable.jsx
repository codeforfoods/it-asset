import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronRight, ChevronDown, Edit, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export default function EquipmentTreeTable({ data = [], onEdit, onDelete, userRole, globalFilter }) {
  const [grouping, setGrouping] = useState(['unit', 'category', 'subCategory']);
  const [expanded, setExpanded] = useState(true);


  const columns = useMemo(() => {
    const baseColumns = [
      { header: 'Đơn vị', accessorKey: 'unit' },
      { header: 'Category', accessorKey: 'category' },
      { header: 'Nhóm Con', accessorKey: 'subCategory' },
      {
        header: 'Loại thiết bị',
        accessorKey: 'deviceType',
        cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="font-medium text-muted-foreground">{getValue()}</span>
      },
      {
        header: 'Model',
        accessorKey: 'model',
        cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="font-semibold">{getValue()}</span>
      },
      {
        header: 'Địa chỉ IP',
        accessorKey: 'ipAddress',
        cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="text-muted-foreground font-mono text-sm">{getValue()}</span>
      },
      { header: 'Số lượng', accessorKey: 'qty', aggregationFn: 'sum', aggregatedCell: ({ getValue }) => <span className="font-bold text-primary">{getValue()}</span> },
      { header: 'Nhiệm vụ/ Chức năng', accessorKey: 'taskFunction', cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="text-muted-foreground">{getValue()}</span> },
      { header: 'Vị trí', accessorKey: 'location', cell: ({ row, getValue }) => row.getCanExpand() ? null : getValue() },
      { header: 'SL', accessorKey: 'qtySL', aggregationFn: 'sum', aggregatedCell: ({ getValue }) => <span className="font-bold text-primary">{getValue()}</span> },
      { header: 'Chức năng', accessorKey: 'functionSD', cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="text-muted-foreground">{getValue()}</span> },
      { header: 'Năm SD', accessorKey: 'yearInUse', cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="text-muted-foreground">{getValue()}</span> },
      { header: 'EOL', accessorKey: 'eol', cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="text-muted-foreground">{getValue()}</span> },
      { header: 'EOS', accessorKey: 'eoss', cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="text-muted-foreground">{getValue()}</span> },
      { header: 'EOLicense', accessorKey: 'eoLicense', cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="text-muted-foreground">{getValue()}</span> },
      {
        header: 'License',
        accessorKey: 'license',
        cell: ({ row, getValue }) => {
          if (row.getCanExpand()) return null;
          const val = getValue();
          return (
            <span className={clsx(
              "px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-wide",
              val === 'Support' ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-rose-100 text-rose-800 border-rose-200"
            )}>
              {val?.toUpperCase()}
            </span>
          );
        }
      },
      { header: 'Giai đoạn thay thế', accessorKey: 'replacePhase', cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="text-muted-foreground text-sm">{getValue()}</span> },
      { header: 'Thiết bị thay thế', accessorKey: 'replace', cell: ({ row, getValue }) => row.getCanExpand() ? null : <span className="text-muted-foreground/70 text-sm truncate max-w-[120px] inline-block">{getValue()}</span> },
    ];
    if (userRole !== 'Manager') {
      baseColumns.push({
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          if (row.getCanExpand()) return null;
          return (
            <div className="flex items-center justify-center gap-1">
              <button onClick={() => onEdit?.(row.original)} className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
              <button onClick={() => onDelete?.(row.original)} className="p-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
            </div>
          );
        }
      });
    }

    return baseColumns;
  }, [onEdit, onDelete, userRole]);

  const table = useReactTable({
    data,
    columns,
    state: { grouping, expanded, globalFilter },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    autoResetExpanded: false,
    autoResetGrouping: false,
  });

  return (
    <div className="w-full bg-card border border-border shadow-sm rounded-xl overflow-hidden flex flex-col h-full ring-1 ring-black/5 ring-inset">
      <div className="overflow-auto flex-1 p-0 custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 z-20" style={{ backgroundColor: 'rgb(22, 67, 151)' }}>
            {/* Row 1: Main headers */}
            <tr>
              <th rowSpan={2} className="px-5 py-3 font-semibold text-white sticky left-0 z-30 align-middle border border-white/20 min-w-[320px]" style={{ backgroundColor: 'rgb(22, 67, 151)' }}>
                Đơn vị / Category / Loại TB
              </th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">Model</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">Địa chỉ IP</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">Số lượng</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">Nhiệm vụ/<br />Chức năng</th>
              <th colSpan={3} className="px-4 py-3 font-semibold text-white text-center border border-white/20 whitespace-nowrap">Vị trí &amp; chức năng hiện tại</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">Năm SD</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">EOL</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">EOS</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">EOLicense</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">License</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">Giai đoạn<br />thay thế</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap">Thiết bị<br />thay thế</th>
              {userRole !== 'Manager' && <th rowSpan={2} className="px-4 py-3 font-semibold text-white text-center align-middle border border-white/20 whitespace-nowrap sticky right-0 z-30" style={{ backgroundColor: 'rgb(22, 67, 151)' }}>Thao tác</th>}
            </tr>
            {/* Row 2: Sub-headers for "Vị trí & chức năng hiện tại" */}
            <tr>
              <th className="px-4 py-2 font-semibold text-white text-center border border-white/20 whitespace-nowrap text-[13px]">Vị trí</th>
              <th className="px-4 py-2 font-semibold text-white text-center border border-white/20 whitespace-nowrap text-[13px]">SL</th>
              <th className="px-4 py-2 font-semibold text-white text-center border border-white/20 whitespace-nowrap text-[13px]">Chức năng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.map((row) => {
              const isGroup = row.getIsGrouped();
              const level = row.depth;

              return (
                <tr
                  key={row.id}
                  className={clsx(
                    "group transition-colors",
                    isGroup && level === 0 ? "bg-indigo-50/60 hover:bg-indigo-50" : "",
                    isGroup && level === 1 ? "bg-primary/[0.03] hover:bg-primary/[0.08]" : "",
                    isGroup && level === 2 ? "bg-muted/20 hover:bg-muted/40" : "",
                    !isGroup ? "bg-card hover:bg-muted/30" : ""
                  )}
                >
                  <td
                    className={clsx(
                      "px-5 py-3 sticky left-0 z-10 transition-all truncate min-w-[320px] max-w-[440px] shadow-[1px_0_0_0_hsl(var(--border))]",
                      isGroup && level === 0 ? "bg-indigo-50/60 group-hover:bg-indigo-50" : "",
                      isGroup && level === 1 ? "bg-card group-hover:bg-primary/[0.04]" : "bg-card group-hover:bg-muted/30"
                    )}
                    style={{ paddingLeft: `${row.depth * 1.5 + 1.25}rem` }}
                  >
                    <div className="flex items-center gap-2 cursor-pointer w-full select-none" onClick={row.getToggleExpandedHandler()}>
                      {row.getCanExpand() ? (
                        <span className="p-0.5 rounded-md hover:bg-border/50 text-muted-foreground">
                          {row.getIsExpanded() ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                      ) : (
                        <span className="w-5 inline-block shrink-0 opacity-0"></span>
                      )}
                      {isGroup ? (
                        <span className={clsx(
                          "font-bold truncate",
                          level === 0 ? "text-indigo-700 text-[15px]" : "",
                          level === 1 ? "text-primary text-[14px]" : "",
                          level === 2 ? "text-foreground text-[13px]" : ""
                        )}>
                          {row.getValue(row.groupingColumnId)} <span className="opacity-50 text-xs font-medium ml-1">({row.subRows.length})</span>
                        </span>
                      ) : (
                        <span className="font-medium text-foreground text-[14px] truncate">{row.getValue('deviceType')}</span>
                      )}
                    </div>
                  </td>

                  {row.getVisibleCells().map(cell => {
                    if (cell.column.id === 'unit' || cell.column.id === 'category' || cell.column.id === 'subCategory' || cell.column.id === 'deviceType') return null;

                    const isActions = cell.column.id === 'actions';

                    return (
                      <td
                        key={cell.id}
                        className={clsx(
                          "px-4 py-3 whitespace-nowrap",
                          isActions ? "sticky right-0 z-10 shadow-[-1px_0_0_0_hsl(var(--border))]" : "",
                          isActions && (!isGroup) ? "bg-card group-hover:bg-muted/30" : "",
                          isActions && (isGroup && level === 0) ? "bg-indigo-50/60 group-hover:bg-indigo-50" : "",
                          isActions && (isGroup && level === 1) ? "bg-primary/[0.03] group-hover:bg-primary/[0.08]" : "",
                          isActions && (isGroup && level === 2) ? "bg-muted/20 group-hover:bg-muted/40" : "",
                        )}
                      >
                        {cell.getIsGrouped() ? (
                          <span></span>
                        ) : cell.getIsAggregated() ? (
                          flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
                        ) : cell.getIsPlaceholder() ? null : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
