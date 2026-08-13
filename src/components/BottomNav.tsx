import React from 'react';

interface BottomNavProps {
  activeTab: 'home' | 'search' | 'favorites' | 'profile';
  setActiveTab: (tab: 'home' | 'search' | 'favorites' | 'profile') => void;
  favoritesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 bg-[#f7f9fb] border-t border-[#c7c4d8]/30 shadow-[0px_-4px_20px_rgba(79,70,229,0.1)] rounded-t-xl">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-200 min-w-16 py-1 ${
          activeTab === 'home'
            ? 'text-[#3525cd] bg-[#4f46e5]/10 rounded-xl px-3'
            : 'text-[#54647a] hover:opacity-80'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] mb-0.5"
          data-weight={activeTab === 'home' ? 'fill' : undefined}
        >
          home
        </span>
        <span className="text-[11px] font-semibold leading-tight">Home</span>
      </button>

      <button
        onClick={() => setActiveTab('search')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-200 min-w-16 py-1 ${
          activeTab === 'search'
            ? 'text-[#3525cd] bg-[#4f46e5]/10 rounded-xl px-3'
            : 'text-[#54647a] hover:opacity-80'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] mb-0.5"
          data-weight={activeTab === 'search' ? 'fill' : undefined}
        >
          search
        </span>
        <span className="text-[11px] font-semibold leading-tight">Search</span>
      </button>

      <button
        onClick={() => setActiveTab('favorites')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-200 min-w-16 py-1 relative ${
          activeTab === 'favorites'
            ? 'text-[#3525cd] bg-[#4f46e5]/10 rounded-xl px-3'
            : 'text-[#54647a] hover:opacity-80'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] mb-0.5"
          data-weight={activeTab === 'favorites' ? 'fill' : undefined}
        >
          favorite
        </span>
        <span className="text-[11px] font-semibold leading-tight">Favorites</span>
        {favoritesCount > 0 && (
          <span className="absolute top-0 right-2 bg-[#ba1a1a] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
            {favoritesCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-200 min-w-16 py-1 ${
          activeTab === 'profile'
            ? 'text-[#3525cd] bg-[#4f46e5]/10 rounded-xl px-3'
            : 'text-[#54647a] hover:opacity-80'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] mb-0.5"
          data-weight={activeTab === 'profile' ? 'fill' : undefined}
        >
          person
        </span>
        <span className="text-[11px] font-semibold leading-tight">Profile</span>
      </button>
    </nav>
  );
};
