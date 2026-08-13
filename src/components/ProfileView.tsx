import React, { useState, useEffect } from 'react';
import { TourBooking, Property } from '../types';
import { api } from '../api';

interface ProfileViewProps {
  user: any;
  bookings: TourBooking[];
  properties: Property[];
  onCancelBooking: (id: string) => void;
  onLogout: () => void;
  onAddPropertyOpen: () => void;
  onDeleteProperty: (id: string) => Promise<void>;
  onUpdateBookingStatus: (id: string, status: string) => Promise<void>;
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
  adminUsers = [],
  onUpdateUserRole,
  onDeleteUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'requests' | 'users' | 'stats'>('listings');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Filter homeowner properties
  const myProperties = properties.filter(
    (p) => p.host && p.host.email === user.email
  );

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
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover border-4 border-[#3525cd]/20 relative z-10"
        />
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
        </div>

        <button
          onClick={onLogout}
          className="w-full sm:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold text-xs text-[#464555] transition-all flex items-center justify-center gap-1.5 active:scale-95 self-center sm:self-start mt-4 sm:mt-0"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Log Out
        </button>
      </div>

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
                          onClick={() => onCancelBooking(b.id)}
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

          {/* Renter Preferences */}
          <div className="p-6 rounded-2xl bg-white border border-[#c7c4d8]/30 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-[#191c1e] border-b border-[#c7c4d8]/20 pb-3">
              Renter Preferences
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#f7f9fb] border border-[#c7c4d8]/20">
                <span className="text-[#777587] block mb-1">Target Move-in Date</span>
                <span className="font-bold text-[#191c1e] text-sm">September 1, 2026</span>
              </div>

              <div className="p-3 rounded-xl bg-[#f7f9fb] border border-[#c7c4d8]/20">
                <span className="text-[#777587] block mb-1">Desired Locations</span>
                <span className="font-bold text-[#191c1e] text-sm">
                  San Francisco, Chicago, New York
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f7f9fb] border border-[#c7c4d8]/20">
                <span className="text-[#777587] block mb-1">Budget Range</span>
                <span className="font-bold text-[#3525cd] text-sm">$1,500 - $3,500 / mo</span>
              </div>

              <div className="p-3 rounded-xl bg-[#f7f9fb] border border-[#c7c4d8]/20">
                <span className="text-[#777587] block mb-1">Pets</span>
                <span className="font-bold text-[#191c1e] text-sm">Dog Friendly Required</span>
              </div>
            </div>
          </div>
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
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => onDeleteProperty(p.id)}
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
                              onClick={() => onUpdateBookingStatus(b.id, 'Cancelled')}
                              className="flex-1 sm:flex-none px-3 py-1.5 border border-red-200 text-[#ba1a1a] hover:bg-red-50 rounded-lg font-bold text-xs transition-all active:scale-95"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => onUpdateBookingStatus(b.id, 'Confirmed')}
                              className="flex-1 sm:flex-none px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-all active:scale-95 shadow-sm"
                            >
                              Confirm Request
                            </button>
                          </div>
                        )}

                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'Completed')}
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
          <div className="flex border-b border-[#c7c4d8]/20 gap-4">
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
              All Properties ({properties.length})
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
          </div>

          {/* Tab 0: Stats */}
          {activeSubTab === 'stats' && (
            <div className="space-y-4">
              {loadingStats ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : adminStats ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                    <span className="material-symbols-outlined text-3xl text-orange-600 mb-1.5">calendar_month</span>
                    <span className="text-[#777587] block text-xs font-bold uppercase mb-1">Tours Booked</span>
                    <span className="text-3xl font-extrabold text-[#191c1e]">{adminStats.totalBookings}</span>
                  </div>
                </div>
              ) : null}
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
                        <td className="py-3 px-4 text-right">
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
                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=30' }
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
                            onChange={(e) => onUpdateUserRole && onUpdateUserRole(u.id, e.target.value)}
                            className="bg-transparent border border-[#c7c4d8]/50 rounded px-2 py-1 font-bold text-[#3525cd] outline-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="user">User/Tenant</option>
                            <option value="homeowner">Homeowner</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onDeleteUser && onDeleteUser(u.id)}
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
                      {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                        <button
                          onClick={() => onCancelBooking(b.id)}
                          className="px-3 py-1 bg-white border border-red-100 hover:bg-red-50 rounded-lg font-bold text-[#ba1a1a] transition-all active:scale-95"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
