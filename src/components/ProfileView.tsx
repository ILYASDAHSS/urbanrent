import React, { useState, useEffect } from 'react';
import { TourBooking, Property, RentalApplication, RentPayment } from '../types';
import { api, resolveAssetUrl } from '../api';

interface ProfileViewProps {
  user: any;
  bookings: TourBooking[];
  properties: Property[];
  onCancelBooking: (id: string) => Promise<void>;
  onLogout: () => void;
  onAddPropertyOpen: () => void;
  onDeleteProperty: (id: string) => Promise<void>;
  onUpdateBookingStatus: (id: string, status: string) => Promise<void>;
  onUpdatePropertyStatus: (id: string, listingStatus: 'available' | 'leased') => Promise<void>;
  applications: RentalApplication[];
  onUpdateApplicationStatus: (id: string, status: RentalApplication['status']) => Promise<void>;
  onUpdateProfile: (profile: Record<string, unknown>) => Promise<void>;
  onUpdateAvatar: (file: File) => Promise<void>;
  payments: RentPayment[];
  onPayRent: (applicationId: string, method: RentPayment['method']) => Promise<void>;
  onRefreshPayments: () => Promise<void>;
  onConfirmRentPayment: (id: string) => Promise<void>;
  onModerateProperty: (id: string, listingStatus: 'available' | 'rejected') => Promise<void>;
  onUpdateUserSuspension: (id: number | string, suspended: boolean) => Promise<void>;
  onDownloadMonthlyReport: (month: string) => Promise<void>;
  // Admin-specific props
  adminUsers?: any[];
  onUpdateUserRole?: (id: number | string, role: string) => Promise<void>;
  onDeleteUser?: (id: number | string) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  bookings,
  properties,
  onCancelBooking,
  onLogout,
  onAddPropertyOpen,
  onDeleteProperty,
  onUpdateBookingStatus,
  onUpdatePropertyStatus,
  applications,
  onUpdateApplicationStatus,
  onUpdateProfile,
  onUpdateAvatar,
  payments,
  onPayRent,
  onRefreshPayments,
  onConfirmRentPayment,
  onModerateProperty,
  onUpdateUserSuspension,
  onDownloadMonthlyReport,
  adminUsers = [],
  onUpdateUserRole,
  onDeleteUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'requests' | 'applications' | 'users' | 'stats' | 'reports'>('listings');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [actionError, setActionError] = useState('');
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));

  const runAction = async (action: () => Promise<void>) => {
    setActionError('');
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save this change.');
    }
  };

  const handleAvatarSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsAvatarUploading(true);
    try {
      await onUpdateAvatar(file);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not upload your profile photo.');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  // Filter homeowner properties
  const myProperties = properties.filter(
    (p) => p.host && p.host.email === user.email
  );
  const pendingProperties = properties.filter((property) => property.listingStatus === 'pending_review');

  // Fetch admin stats if user is admin
  useEffect(() => {
    if (user.role === 'admin' && activeSubTab === 'stats') {
      const fetchStats = async () => {
        setLoadingStats(true);
        try {
          const stats = await api.getAdminStats();
          setAdminStats(stats);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingStats(false);
        }
      };
      fetchStats();
    }
  }, [user.role, activeSubTab]);

  // Set initial tab based on role
  useEffect(() => {
    if (user.role === 'admin') {
      setActiveSubTab('stats');
    } else if (user.role === 'homeowner') {
      setActiveSubTab('listings');
    }
  }, [user.role]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
            Administrator
          </span>
        );
      case 'homeowner':
        return (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            Homeowner / Host
          </span>
        );
      default:
        return (
          <span className="bg-[#3525cd]/10 text-[#3525cd] text-xs font-bold px-3 py-1 rounded-full border border-[#3525cd]/20">
            Verified Tenant
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {/* Profile Header */}
      <div className="p-6 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#3525cd]/5 rounded-full -mr-12 -mt-12 blur-lg" />
        <div className="relative z-10 shrink-0">
          <img
            src={resolveAssetUrl(user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80')}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-[#3525cd]/20"
          />
          <label className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white transition-opacity ${isAvatarUploading ? 'cursor-wait opacity-100' : 'cursor-pointer opacity-0 hover:opacity-100 focus-within:opacity-100'}`}>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Choose a new profile photo"
              disabled={isAvatarUploading}
              onChange={(event) => void handleAvatarSelection(event)}
            />
            <span className="material-symbols-outlined" aria-hidden="true">
              {isAvatarUploading ? 'progress_activity' : 'photo_camera'}
            </span>
          </label>
        </div>
        <div className="text-center sm:text-left flex-1 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-2xl font-bold text-[#191c1e]">{user.name}</h1>
            <div className="flex justify-center sm:justify-start">
              {getRoleBadge(user.role)}
            </div>
          </div>
          <p className="text-xs text-[#777587] mt-1.5">
            {user.email} {user.phone ? `• ${user.phone}` : ''}
          </p>
          <p className="text-[11px] text-[#777587] mt-1">
            Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'today'}
            {user.city ? ` • Based in ${user.city}` : ''}
            {user.occupation ? ` • ${user.occupation}` : ''}
          </p>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#3525cd] hover:underline">
            <span>{isAvatarUploading ? 'Uploading photo…' : 'Change profile photo'}</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Choose a new profile photo"
              disabled={isAvatarUploading}
              onChange={(event) => void handleAvatarSelection(event)}
            />
          </label>
        </div>

        {actionError && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {actionError}
          </p>
        )}

        <button
          onClick={onLogout}
          className="w-full sm:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold text-xs text-[#464555] transition-all flex items-center justify-center gap-1.5 active:scale-95 self-center sm:self-start mt-4 sm:mt-0"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Log Out
        </button>
      </div>

      <ProfileEditor user={user} onSave={onUpdateProfile} />

      {/* RENTER / TENANT DASHBOARD */}
      {user.role === 'user' && (
        <div className="space-y-6">
          {/* Scheduled Tours */}
          <div className="p-6 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd]">calendar_month</span>
                <h2 className="font-bold text-lg text-[#191c1e]">Your Scheduled Tours</h2>
              </div>
              <span className="text-xs font-semibold text-[#777587]">
                {bookings.length} upcoming
              </span>
            </div>

            {bookings.length === 0 ? (
              <p className="text-xs text-[#777587] py-6 text-center">
                No scheduled tours yet. Browse properties and click "Schedule Tour" to request a viewing.
              </p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-[#f7f9fb] border border-[#c7c4d8]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={b.propertyImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80'}
                        alt={b.propertyTitle}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#191c1e]">{b.propertyTitle}</h4>
                        <p className="text-xs text-[#3525cd] font-semibold mt-0.5">
                          {b.type === 'in-person' ? 'In-Person Tour' : 'Virtual Live Tour'} • {b.date} at {b.time}
                        </p>
                        <p className="text-[11px] text-[#777587]">Host: {b.hostName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        b.status === 'Confirmed'
                          ? 'bg-[#005236]/10 text-[#005236] border-[#005236]/20'
                          : b.status === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : b.status === 'Completed'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                      }`}>
                        {b.status}
                      </span>
                      {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                        <button
                          onClick={() => { void runAction(() => onCancelBooking(b.id)); }}
                          className="px-3 py-1 bg-white border border-red-200 text-[#ba1a1a] hover:bg-red-50 rounded-lg text-xs font-bold transition-all active:scale-95"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ApplicationList
            title="Your rental applications"
            empty="You have not applied to a home yet. Open a listing and choose Apply Now."
            applications={applications}
            payments={payments}
            onPayRent={onPayRent}
            onRefreshPayments={onRefreshPayments}
          />
        </div>
      )}

      {/* HOMEOWNER / HOST DASHBOARD */}
      {user.role === 'homeowner' && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex border-b border-[#c7c4d8]/20 gap-4">
            <button
              onClick={() => setActiveSubTab('listings')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
                activeSubTab === 'listings'
                  ? 'border-[#3525cd] text-[#3525cd]'
                  : 'border-transparent text-[#777587] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">apartment</span>
              My Listed Properties ({myProperties.length})
            </button>
            <button
              onClick={() => setActiveSubTab('requests')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
                activeSubTab === 'requests'
                  ? 'border-[#3525cd] text-[#3525cd]'
                  : 'border-transparent text-[#777587] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">notifications</span>
              Incoming Tour Requests ({bookings.length})
            </button>
            <button
              onClick={() => setActiveSubTab('applications')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
                activeSubTab === 'applications'
                  ? 'border-[#3525cd] text-[#3525cd]'
                  : 'border-transparent text-[#777587] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">description</span>
              Applications ({applications.length})
            </button>
          </div>

          {/* Tab 1: Listings */}
          {activeSubTab === 'listings' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-[#191c1e]">Your Current Listings</h3>
                <button
                  onClick={onAddPropertyOpen}
                  className="px-4 py-2 bg-[#3525cd] hover:bg-[#2c1eb5] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Post New Property
                </button>
              </div>

              {myProperties.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-[#c7c4d8]/30 space-y-3">
                  <span className="material-symbols-outlined text-4xl text-[#777587]">
                    holiday_village
                  </span>
                  <h4 className="font-bold text-base text-[#191c1e]">You haven't listed any houses yet</h4>
                  <p className="text-xs text-[#777587] max-w-sm mx-auto">
                    Click "Post New Property" to create your first house listing on UrbanRent.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myProperties.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-white border border-[#c7c4d8]/30 shadow-sm flex gap-4"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-[#191c1e] line-clamp-1">{p.title}</h4>
                          <p className="text-[11px] text-[#777587] line-clamp-1">{p.address}, {p.city}</p>
                          <p className="text-xs font-extrabold text-[#3525cd] mt-1">${p.price}/mo</p>
                          <p className="text-[11px] font-bold uppercase text-[#005236]">
                            {p.listingStatus === 'pending_review'
                              ? 'Awaiting admin approval'
                              : p.listingStatus === 'rejected'
                                ? 'Not approved'
                                : p.listingStatus === 'leased' ? 'Leased' : 'On the market'}
                          </p>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          {(p.listingStatus === 'available' || p.listingStatus === 'leased') && <button
                            onClick={() => {
                              void runAction(() => onUpdatePropertyStatus(
                                p.id,
                                p.listingStatus === 'leased' ? 'available' : 'leased'
                              ));
                            }}
                            className="px-2.5 py-1 bg-[#f7f9fb] border border-[#c7c4d8]/40 text-[#191c1e] rounded-lg text-[10px] font-bold"
                          >
                            {p.listingStatus === 'leased' ? 'Relist' : 'Mark leased'}
                          </button>}
                          <button
                            onClick={() => { void runAction(() => onDeleteProperty(p.id)); }}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-[#ba1a1a] rounded-lg text-[10px] font-bold transition-all active:scale-95 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'applications' && (
            <ApplicationList
              title="Applications for your homes"
              empty="Renters have not applied to your listings yet."
              applications={applications}
              onUpdateStatus={onUpdateApplicationStatus}
              runAction={runAction}
              payments={payments}
              onRefreshPayments={onRefreshPayments}
              onConfirmPayment={onConfirmRentPayment}
            />
          )}

          {/* Tab 2: Requests */}
          {activeSubTab === 'requests' && (
            <div className="p-6 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#191c1e] border-b border-[#c7c4d8]/20 pb-3">
                Incoming Viewings Schedules
              </h3>

              {bookings.length === 0 ? (
                <p className="text-xs text-[#777587] py-6 text-center">
                  No tour requests scheduled for your properties yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl bg-[#f7f9fb] border border-[#c7c4d8]/20 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#c7c4d8]/10 pb-2">
                        <div>
                          <h4 className="font-bold text-sm text-[#191c1e]">{b.propertyTitle}</h4>
                          <p className="text-xs text-[#3525cd] font-semibold mt-0.5">
                            {b.type === 'in-person' ? 'In-Person Tour' : 'Virtual Live Tour'} • {b.date} at {b.time}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          b.status === 'Confirmed'
                            ? 'bg-[#005236]/10 text-[#005236] border-[#005236]/20'
                            : b.status === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : b.status === 'Completed'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-[#464555]">Renter Contact:</p>
                          <p className="text-[#191c1e]">{b.tenantName} ({b.tenantEmail})</p>
                          {b.tenantPhone && <p className="text-[#777587]">Phone: {b.tenantPhone}</p>}
                        </div>

                        {b.status === 'Pending' && (
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => { void runAction(() => onUpdateBookingStatus(b.id, 'Cancelled')); }}
                              className="flex-1 sm:flex-none px-3 py-1.5 border border-red-200 text-[#ba1a1a] hover:bg-red-50 rounded-lg font-bold text-xs transition-all active:scale-95"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => { void runAction(() => onUpdateBookingStatus(b.id, 'Confirmed')); }}
                              className="flex-1 sm:flex-none px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-all active:scale-95 shadow-sm"
                            >
                              Confirm Request
                            </button>
                          </div>
                        )}

                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => { void runAction(() => onUpdateBookingStatus(b.id, 'Completed')); }}
                            className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-all active:scale-95 shadow-sm"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ADMIN DASHBOARD */}
      {user.role === 'admin' && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex flex-wrap border-b border-[#c7c4d8]/20 gap-4">
            <button
              onClick={() => setActiveSubTab('stats')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
                activeSubTab === 'stats'
                  ? 'border-[#3525cd] text-[#3525cd]'
                  : 'border-transparent text-[#777587] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">query_stats</span>
              Overview Stats
            </button>
            <button
              onClick={() => setActiveSubTab('listings')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
                activeSubTab === 'listings'
                  ? 'border-[#3525cd] text-[#3525cd]'
                  : 'border-transparent text-[#777587] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">apartment</span>
              Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveSubTab('users')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
                activeSubTab === 'users'
                  ? 'border-[#3525cd] text-[#3525cd]'
                  : 'border-transparent text-[#777587] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">group</span>
              Users Accounts ({adminUsers.length})
            </button>
            <button
              onClick={() => setActiveSubTab('requests')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
                activeSubTab === 'requests'
                  ? 'border-[#3525cd] text-[#3525cd]'
                  : 'border-transparent text-[#777587] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              All Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveSubTab('applications')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
                activeSubTab === 'applications'
                  ? 'border-[#3525cd] text-[#3525cd]'
                  : 'border-transparent text-[#777587] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">description</span>
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveSubTab('reports')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
                activeSubTab === 'reports'
                  ? 'border-[#3525cd] text-[#3525cd]'
                  : 'border-transparent text-[#777587] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Monthly Reports
            </button>
          </div>

          {/* Tab 0: Stats */}
          {activeSubTab === 'stats' && (
            <div className="space-y-4">
              {loadingStats ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : adminStats ? (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm text-center">
                    <span className="material-symbols-outlined text-3xl text-[#3525cd] mb-1.5">group</span>
                    <span className="text-[#777587] block text-xs font-bold uppercase mb-1">Total Users</span>
                    <span className="text-3xl font-extrabold text-[#191c1e]">{adminStats.totalUsers}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm text-center">
                    <span className="material-symbols-outlined text-3xl text-emerald-600 mb-1.5">real_estate_agent</span>
                    <span className="text-[#777587] block text-xs font-bold uppercase mb-1">Homeowners</span>
                    <span className="text-3xl font-extrabold text-[#191c1e]">{adminStats.totalHomeowners}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm text-center">
                    <span className="material-symbols-outlined text-3xl text-blue-600 mb-1.5">person</span>
                    <span className="text-[#777587] block text-xs font-bold uppercase mb-1">Tenants</span>
                    <span className="text-3xl font-extrabold text-[#191c1e]">{adminStats.totalTenants}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm text-center">
                    <span className="material-symbols-outlined text-3xl text-purple-600 mb-1.5">apartment</span>
                    <span className="text-[#777587] block text-xs font-bold uppercase mb-1">Properties</span>
                    <span className="text-3xl font-extrabold text-[#191c1e]">{adminStats.totalProperties}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm text-center">
                    <span className="material-symbols-outlined text-3xl text-amber-600 mb-1.5">pending_actions</span>
                    <span className="text-[#777587] block text-xs font-bold uppercase mb-1">Needs Review</span>
                    <span className="text-3xl font-extrabold text-[#191c1e]">{adminStats.pendingProperties ?? 0}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm text-center">
                    <span className="material-symbols-outlined text-3xl text-orange-600 mb-1.5">calendar_month</span>
                    <span className="text-[#777587] block text-xs font-bold uppercase mb-1">Tours Booked</span>
                    <span className="text-3xl font-extrabold text-[#191c1e]">{adminStats.totalBookings}</span>
                  </div>
                </div>
              ) : null}
              <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-[#191c1e]">Listings awaiting approval</h3>
                    <p className="text-xs text-[#777587]">
                      {pendingProperties.length} listing{pendingProperties.length === 1 ? '' : 's'} need review
                    </p>
                  </div>
                  {pendingProperties.length > 0 && (
                    <button
                      onClick={() => setActiveSubTab('listings')}
                      className="text-xs font-bold text-[#3525cd] hover:underline"
                    >
                      View all properties
                    </button>
                  )}
                </div>
                {pendingProperties.length === 0 ? (
                  <p className="py-3 text-center text-sm text-[#777587]">No listings are waiting for approval.</p>
                ) : (
                  <div className="space-y-2">
                    {pendingProperties.map((property) => (
                      <div key={property.id} className="flex flex-col gap-3 rounded-xl bg-[#f7f9fb] p-3 sm:flex-row sm:items-center">
                        <img src={property.image} alt="" className="h-14 w-20 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-bold text-[#191c1e]">{property.title}</h4>
                          <p className="text-xs text-[#777587]">
                            {property.city} • {property.host.name} • ${property.price.toLocaleString()}/mo
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { void runAction(() => onModerateProperty(property.id, 'available')); }}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { void runAction(() => onModerateProperty(property.id, 'rejected')); }}
                            className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Tab 1: Manage Properties */}
          {activeSubTab === 'listings' && (
            <div className="p-6 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#191c1e] border-b border-[#c7c4d8]/20 pb-3">
                System Properties Administration
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#c7c4d8]/30 text-[#777587] uppercase font-bold">
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Host</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id} className="border-b border-[#c7c4d8]/10 hover:bg-[#f7f9fb]">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />
                          <span className="font-bold text-[#191c1e] line-clamp-1">{p.title}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#464555]">{p.city}</td>
                        <td className="py-3 px-4 font-bold text-[#3525cd]">${p.price}</td>
                        <td className="py-3 px-4 text-[#777587]">{p.host ? p.host.name : 'Unknown'}</td>
                        <td className="py-3 px-4 font-bold">{p.listingStatus?.replace('_', ' ') || 'available'}</td>
                        <td className="py-3 px-4 text-right">
                          {p.listingStatus === 'pending_review' && (
                            <>
                              <button
                                onClick={() => { void runAction(() => onModerateProperty(p.id, 'available')); }}
                                className="px-2.5 py-1 text-xs font-bold bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg mr-2"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => { void runAction(() => onModerateProperty(p.id, 'rejected')); }}
                                className="px-2.5 py-1 text-xs font-bold bg-amber-50 border border-amber-100 text-amber-700 rounded-lg mr-2"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onDeleteProperty(p.id)}
                            className="px-2.5 py-1 text-xs font-bold bg-red-50 border border-red-100 hover:border-red-200 text-[#ba1a1a] rounded-lg transition-all active:scale-95"
                          >
                            Delete Listing
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Manage Users */}
          {activeSubTab === 'users' && (
            <div className="p-6 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#191c1e] border-b border-[#c7c4d8]/20 pb-3">
                System Accounts Administration
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#c7c4d8]/30 text-[#777587] uppercase font-bold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role / Access</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="border-b border-[#c7c4d8]/10 hover:bg-[#f7f9fb]">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <img
                            src={resolveAssetUrl(u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=30' )}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="font-bold text-[#191c1e]">{u.name}</span>
                        </td>
                        <td className="py-3 px-4 text-[#464555] font-semibold">{u.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            disabled={u.id === user.id}
                            onChange={(e) => {
                              if (onUpdateUserRole) {
                                void runAction(() => onUpdateUserRole(u.id, e.target.value));
                              }
                            }}
                            className="bg-transparent border border-[#c7c4d8]/50 rounded px-2 py-1 font-bold text-[#3525cd] outline-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="user">User/Tenant</option>
                            <option value="homeowner">Homeowner</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              void runAction(() => onUpdateUserSuspension(u.id, !u.is_suspended));
                            }}
                            disabled={u.id === user.id}
                            className={`px-2.5 py-1 text-xs font-bold border rounded-lg mr-2 disabled:opacity-50 ${
                              u.is_suspended
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : 'bg-amber-50 border-amber-100 text-amber-700'
                            }`}
                          >
                            {u.is_suspended ? 'Reinstate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => {
                              if (onDeleteUser) {
                                void runAction(() => onDeleteUser(u.id));
                              }
                            }}
                            disabled={u.id === user.id}
                            className="px-2.5 py-1 text-xs font-bold bg-red-50 border border-red-100 hover:border-red-200 text-[#ba1a1a] rounded-lg transition-all active:scale-95 disabled:opacity-50"
                          >
                            Delete Account
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: All Bookings */}
          {activeSubTab === 'requests' && (
            <div className="p-6 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#191c1e] border-b border-[#c7c4d8]/20 pb-3">
                System Bookings Administration
              </h3>

              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-[#f7f9fb] border border-[#c7c4d8]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={b.propertyImage} alt="" className="w-12 h-12 rounded object-cover" />
                      <div>
                        <h4 className="font-bold text-[#191c1e]">{b.propertyTitle}</h4>
                        <p className="font-semibold text-[#3525cd] mt-0.5">
                          {b.type === 'in-person' ? 'In-Person' : 'Virtual'} Tour • {b.date} at {b.time}
                        </p>
                        <p className="text-[11px] text-[#777587]">
                          Tenant: <strong>{b.tenantName}</strong> • Host: <strong>{b.hostName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        b.status === 'Confirmed'
                          ? 'bg-[#005236]/10 text-[#005236] border-[#005236]/20'
                          : b.status === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : b.status === 'Completed'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                      }`}>
                        {b.status}
                      </span>
                      {b.status === 'Pending' && (
                        <button
                          onClick={() => { void runAction(() => onUpdateBookingStatus(b.id, 'Confirmed')); }}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold transition-all active:scale-95"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => { void runAction(() => onUpdateBookingStatus(b.id, 'Completed')); }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold transition-all active:scale-95"
                        >
                          Mark complete
                        </button>
                      )}
                      {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                        <button
                          onClick={() => { void runAction(() => onCancelBooking(b.id)); }}
                          className="px-3 py-1 bg-white border border-red-100 hover:bg-red-50 rounded-lg font-bold text-[#ba1a1a] transition-all active:scale-95"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'applications' && (
            <ApplicationList
              title="Platform rental applications"
              empty="There are no rental applications yet."
              applications={applications}
              onUpdateStatus={onUpdateApplicationStatus}
              runAction={runAction}
              payments={payments}
              onRefreshPayments={onRefreshPayments}
              onConfirmPayment={onConfirmRentPayment}
            />
          )}

          {activeSubTab === 'reports' && (
            <div className="p-6 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#191c1e]">Monthly properties and rent transactions</h3>
              <p className="text-sm text-[#777587]">
                Download a CSV containing all property listings and rent payments for the selected month.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <label className="text-xs font-bold text-[#464555]">
                  Transaction month
                  <input
                    type="month"
                    value={reportMonth}
                    onChange={(event) => setReportMonth(event.target.value)}
                    className="mt-1 block rounded-xl border border-[#c7c4d8]/50 px-3 py-2 font-normal"
                  />
                </label>
                <button
                  onClick={() => { void runAction(() => onDownloadMonthlyReport(reportMonth)); }}
                  className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-sm font-bold"
                >
                  Export monthly CSV
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProfileEditor: React.FC<{
  user: any;
  onSave: (profile: Record<string, unknown>) => Promise<void>;
}> = ({ user, onSave }) => {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState(user.city || '');
  const [occupation, setOccupation] = useState(user.occupation || '');
  const [bio, setBio] = useState(user.bio || '');
  const [moveInDate, setMoveInDate] = useState(String(user.move_in_date || '').slice(0, 10));
  const [budgetMin, setBudgetMin] = useState(user.budget_min ?? '');
  const [budgetMax, setBudgetMax] = useState(user.budget_max ?? '');
  const [pets, setPets] = useState(user.pets || '');
  const [householdSize, setHouseholdSize] = useState(user.household_size ?? 1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await onSave({
        name,
        phone,
        city,
        occupation,
        bio,
        move_in_date: moveInDate || null,
        budget_min: budgetMin === '' ? null : Number(budgetMin),
        budget_max: budgetMax === '' ? null : Number(budgetMax),
        pets,
        household_size: Number(householdSize) || 1,
      });
      setMessage('Profile saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="p-6 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm space-y-4">
      <div>
        <h2 className="font-bold text-lg text-[#191c1e]">About you</h2>
        <p className="text-xs text-[#777587]">This is what owners see when you book a tour or apply.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Full name" value={name} onChange={setName} />
        <Field label="Phone" value={phone} onChange={setPhone} />
        <Field label="City" value={city} onChange={setCity} />
        <Field label="Occupation" value={occupation} onChange={setOccupation} />
        <label className="text-xs font-bold text-[#464555]">
          Target move-in
          <input type="date" value={moveInDate} onChange={(event) => setMoveInDate(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-[#c7c4d8]/50 font-normal" />
        </label>
        <label className="text-xs font-bold text-[#464555]">
          Household size
          <input type="number" min={1} max={12} value={householdSize} onChange={(event) => setHouseholdSize(Number(event.target.value))} className="mt-1 w-full px-3 py-2 rounded-xl border border-[#c7c4d8]/50 font-normal" />
        </label>
        <Field label="Minimum budget" value={String(budgetMin)} onChange={setBudgetMin} type="number" />
        <Field label="Maximum budget" value={String(budgetMax)} onChange={setBudgetMax} type="number" />
        <div className="sm:col-span-2">
          <Field label="Pets" value={pets} onChange={setPets} placeholder="No pets, or one small dog" />
        </div>
        <label className="sm:col-span-2 text-xs font-bold text-[#464555]">
          Short bio
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} className="mt-1 w-full px-3 py-2 rounded-xl border border-[#c7c4d8]/50 font-normal" placeholder="Where you work, who is moving with you, and what you are looking for." />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-sm font-bold disabled:opacity-70">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
        {message && <p className="text-xs text-[#464555]">{message}</p>}
      </div>
    </form>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <label className="text-xs font-bold text-[#464555]">
    {label}
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 w-full px-3 py-2 rounded-xl border border-[#c7c4d8]/50 font-normal"
    />
  </label>
);

const ApplicationList: React.FC<{
  title: string;
  empty: string;
  applications: RentalApplication[];
  payments?: RentPayment[];
  onPayRent?: (applicationId: string, method: RentPayment['method']) => Promise<void>;
  onRefreshPayments?: () => Promise<void>;
  onConfirmPayment?: (id: string) => Promise<void>;
  onUpdateStatus?: (id: string, status: RentalApplication['status']) => Promise<void>;
  runAction?: (action: () => Promise<void>) => Promise<void>;
}> = ({ title, empty, applications, payments = [], onPayRent, onRefreshPayments, onConfirmPayment, onUpdateStatus, runAction }) => {
  const currentPeriod = new Date().toISOString().slice(0, 7);

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm space-y-4">
      <h2 className="font-bold text-lg text-[#191c1e] border-b border-[#c7c4d8]/20 pb-3">{title}</h2>
      {applications.length === 0 ? (
        <p className="text-xs text-[#777587] py-6 text-center">{empty}</p>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => {
            const payment = payments.find((item) =>
              item.applicationId === application.id && item.period === currentPeriod
            );
            const canStartPayment = !payment || payment.status === 'failed';
            const canResumeCard = payment?.status === 'pending' && payment.method === 'card';

            return (
              <div key={application.id} className="p-4 rounded-xl bg-[#f7f9fb] border border-[#c7c4d8]/20 space-y-2">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#191c1e]">{application.propertyTitle}</h3>
                    <p className="text-[11px] text-[#777587]">{application.propertyAddress}</p>
                  </div>
                  <span className="text-[11px] font-bold uppercase text-[#3525cd]">{application.status}</span>
                </div>
                <p className="text-xs text-[#464555]">{application.message}</p>
                <p className="text-[11px] text-[#777587]">
                  {application.tenantName}
                  {application.employment ? ` • ${application.employment}` : ''}
                  {application.moveInDate ? ` • Move-in ${application.moveInDate}` : ''}
                  {` • ${application.occupants} occupant${application.occupants === 1 ? '' : 's'}`}
                </p>
                {application.status === 'submitted' && onUpdateStatus && runAction && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { void runAction(() => onUpdateStatus(application.id, 'approved')); }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => { void runAction(() => onUpdateStatus(application.id, 'declined')); }}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-[#ba1a1a] text-xs font-bold"
                    >
                      Decline
                    </button>
                  </div>
                )}
                {payment && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#c7c4d8]/20 pt-2">
                    <p className="text-xs text-[#464555]">
                      {payment.period} rent: ${(payment.amountCents / 100).toLocaleString()} • {payment.method === 'card' ? 'Card' : 'In person'} • {payment.status}
                    </p>
                    {payment.status === 'pending' && payment.method === 'in_person' && onConfirmPayment && runAction && (
                      <button
                        onClick={() => { void runAction(() => onConfirmPayment(payment.id)); }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                      >
                        Confirm rent received
                      </button>
                    )}
                    {payment.status === 'pending' && payment.method === 'card' && onRefreshPayments && runAction && (
                      <button
                        onClick={() => { void runAction(onRefreshPayments); }}
                        className="px-3 py-1.5 rounded-lg border border-[#c7c4d8]/50 text-xs font-bold text-[#464555]"
                      >
                        Refresh payment status
                      </button>
                    )}
                  </div>
                )}
                {application.status === 'approved' && onPayRent && runAction
                  && (canStartPayment || canResumeCard) && (
                  <div className="flex flex-wrap gap-2 border-t border-[#c7c4d8]/20 pt-2">
                    <span className="w-full text-xs font-semibold text-[#464555]">
                      Pay this month’s rent:
                    </span>
                    <button
                      onClick={() => { void runAction(() => onPayRent(application.id, 'card')); }}
                      className="px-3 py-1.5 rounded-lg bg-[#3525cd] text-white text-xs font-bold"
                    >
                      {canResumeCard ? 'Resume card checkout' : 'Pay by card'}
                    </button>
                    {canStartPayment && (
                      <button
                        onClick={() => { void runAction(() => onPayRent(application.id, 'in_person')); }}
                        className="px-3 py-1.5 rounded-lg border border-[#3525cd] text-[#3525cd] text-xs font-bold"
                      >
                        Pay in person
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
