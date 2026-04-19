import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(c => !c)} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          collapsed={collapsed} 
          onToggleSidebar={() => setMobileMenuOpen(true)} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="flex-1 overflow-auto bg-muted/20">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}
