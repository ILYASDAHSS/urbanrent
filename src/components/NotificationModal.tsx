import React from 'react';
import { NotificationItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden mt-12 sm:mt-16 flex flex-col border border-[#c7c4d8]/30">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#c7c4d8]/30 flex justify-between items-center bg-[#f7f9fb]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3525cd]">notifications</span>
            <h3 className="font-bold text-[#191c1e] text-base">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#eceef0] text-[#777587]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* List */}
        <div className="p-3 max-h-[380px] overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <p className="text-xs text-center text-[#777587] py-6">No notifications</p>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  !item.read
                    ? 'bg-[#3525cd]/5 border-[#3525cd]/30'
                    : 'bg-[#f7f9fb] border-[#c7c4d8]/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-[#191c1e]">{item.title}</span>
                  <span className="text-[10px] text-[#777587]">{item.time}</span>
                </div>
                <p className="text-xs text-[#464555] mt-1">{item.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#c7c4d8]/30 bg-[#f7f9fb] text-center">
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-[#3525cd] hover:underline"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};
