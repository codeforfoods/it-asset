import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Server, Settings, LayoutDashboard, PanelLeftClose, PanelLeft, PieChart, Users, LogOut, KeyRound } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import ChangePasswordModal from '../ChangePasswordModal';

export default function Sidebar({ collapsed = false, onToggle }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: PieChart, label: 'Tổng quan' },
    { to: '/equipments', icon: Server, label: 'Danh sách thiết bị' },
    ...(user?.role === 'Admin' ? [
      { to: '/settings', icon: Settings, label: 'Danh mục' },
      { to: '/users', icon: Users, label: 'Quản trị User' },
    ] : []),
  ];

  return (
    <>
      <aside
        className={clsx(
          "flex-shrink-0 border-r border-border bg-card flex flex-col hidden md:flex transition-all duration-300 ease-in-out overflow-hidden",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center border-b border-border shrink-0" style={{ paddingLeft: collapsed ? '14px' : '24px', paddingRight: collapsed ? '14px' : '24px' }}>
          <div className={clsx("flex items-center gap-2 text-primary transition-all duration-300", collapsed && "justify-center")}>
            <LayoutDashboard className="h-6 w-6 shrink-0" />
            <span className={clsx(
              "font-bold text-lg tracking-tight text-foreground whitespace-nowrap transition-all duration-300",
              collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
            )}>
              <span className="text-primary">IT</span>Asset
            </span>
          </div>
        </div>
        
        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            <p className={clsx(
              "px-2 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2 whitespace-nowrap transition-all duration-300",
              collapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100 h-auto"
            )}>
              Quản lý
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 rounded-lg transition-all duration-200 group text-sm font-medium",
                  collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={clsx(
                  "whitespace-nowrap transition-all duration-300",
                  collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                )}>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Toggle button */}
        <div className="px-3 py-2 border-t border-border">
          <button
            onClick={onToggle}
            className={clsx(
              "flex items-center gap-2 w-full rounded-lg py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200",
              collapsed ? "px-0 justify-center" : "px-3"
            )}
            title={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4 shrink-0" /> : <PanelLeftClose className="h-4 w-4 shrink-0" />}
            <span className={clsx(
              "whitespace-nowrap transition-all duration-300",
              collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
            )}>
              Thu nhỏ
            </span>
          </button>
        </div>

        {/* User section */}
        <div className="p-3 border-t border-border flex flex-col gap-2">
          <div className={clsx(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors",
            collapsed && "justify-center p-1.5"
          )}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 shadow-inner shrink-0 flex items-center justify-center text-white text-xs font-bold uppercase">
              {user?.username?.[0] || 'U'}
            </div>
            <div className={clsx(
              "overflow-hidden transition-all duration-300 flex-1",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              <p className="text-sm font-medium text-foreground truncate capitalize">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
            
            {!collapsed && (
              <div className="flex items-center gap-1">
                <button onClick={() => setIsPwdModalOpen(true)} className="p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-md transition-colors" title="Đổi mật khẩu">
                  <KeyRound className="w-4 h-4" />
                </button>
                <button onClick={handleLogout} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Đăng xuất">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {collapsed && (
            <div className="flex flex-col gap-1">
              <button onClick={() => setIsPwdModalOpen(true)} className="flex items-center justify-center p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors" title="Đổi mật khẩu">
                <KeyRound className="w-4 h-4" />
              </button>
              <button onClick={handleLogout} className="flex items-center justify-center p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Đăng xuất">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <ChangePasswordModal 
        isOpen={isPwdModalOpen} 
        onClose={() => setIsPwdModalOpen(false)} 
      />
    </>
  );
}
