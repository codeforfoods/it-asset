import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed(c => !c)} />
        <main className="flex-1 overflow-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
