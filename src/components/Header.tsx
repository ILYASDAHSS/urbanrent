import React from 'react';
import { NotificationItem } from '../types';

interface HeaderProps {
  activeTab: 'home' | 'search' | 'favorites' | 'profile';
  setActiveTab: (tab: 'home' | 'search' | 'favorites' | 'profile') => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onOpenNotifications,
  favoritesCount
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Desktop TopAppBar (Hidden on mobile) */}
      <header className="hidden md:flex flex-row justify-between items-center w-full px-8 lg:px-20 py-3 z-40 bg-[#f7f9fb] shadow-sm sticky top-0 border-b border-[#c7c4d8]/20">
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[#3525cd] text-3xl group-hover:scale-110 transition-transform">
            location_on
          </span>
          <span className="text-2xl font-bold tracking-tight text-[#3525cd]">
            UrbanRent
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'home'
                ? 'text-[#3525cd] bg-[#3525cd]/10'
                : 'text-[#464555] hover:bg-[#eceef0] hover:text-[#191c1e]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              data-weight={activeTab === 'home' ? 'fill' : undefined}
            >
              home
            </span>
            Home
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'search'
                ? 'text-[#3525cd] bg-[#3525cd]/10'
                : 'text-[#464555] hover:bg-[#eceef0] hover:text-[#191c1e]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              data-weight={activeTab === 'search' ? 'fill' : undefined}
            >
              search
            </span>
            Search
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-sm transition-all relative ${
              activeTab === 'favorites'
                ? 'text-[#3525cd] bg-[#3525cd]/10'
                : 'text-[#464555] hover:bg-[#eceef0] hover:text-[#191c1e]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              data-weight={activeTab === 'favorites' ? 'fill' : undefined}
            >
              favorite
            </span>
            Favorites
            {favoritesCount > 0 && (
              <span className="ml-1 bg-[#ba1a1a] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'profile'
                ? 'text-[#3525cd] bg-[#3525cd]/10'
                : 'text-[#464555] hover:bg-[#eceef0] hover:text-[#191c1e]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              data-weight={activeTab === 'profile' ? 'fill' : undefined}
            >
              person
            </span>
            Profile
          </button>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-full hover:bg-[#eceef0] transition-colors relative active:scale-95 text-[#3525cd]"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-white animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Header (Visible only on mobile) */}
      <header className="md:hidden flex flex-row justify-between items-center w-full px-4 py-2.5 z-40 bg-[#f7f9fb] shadow-sm sticky top-0 border-b border-[#c7c4d8]/20">
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#3525cd] text-2xl">
            location_on
          </span>
          <span className="font-bold text-xl text-[#3525cd] tracking-tight">
            UrbanRent
          </span>
        </div>
        <button
          onClick={onOpenNotifications}
          className="p-2 rounded-full hover:bg-[#eceef0] transition-colors relative active:scale-95 text-[#3525cd]"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-white" />
          )}
        </button>
      </header>
    </>
  );
};
