import React from 'react';
import { Search, Bell, PanelLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

export default function Header({ collapsed, onToggleSidebar, searchQuery, onSearchChange }) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 flex-shrink-0 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile / collapsed toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors md:hidden"
          title="Toggle sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Tìm kiếm thiết bị, model, IP..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 bg-background/50 border border-transparent shadow-sm hover:border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-9 pr-4 text-sm transition-all focus:outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted focus:outline-none focus:bg-muted"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted focus:outline-none focus:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive shadow-[0_0_0_2px_hsl(var(--card))]"></span>
        </button>
      </div>
    </header>
  );
}
