import React, { useState } from 'react';
import { Property, TourBooking } from '../types';

interface ScheduleTourModalProps {
  property: Property | null;
  onClose: () => void;
  onConfirmBooking: (booking: TourBooking) => void;
}

export const ScheduleTourModal: React.FC<ScheduleTourModalProps> = ({
  property,
  onClose,
  onConfirmBooking
}) => {
  const [tourType, setTourType] = useState<'in-person' | 'virtual'>('in-person');
  const [selectedDate, setSelectedDate] = useState('2026-08-12');
  const [selectedTime, setSelectedTime] = useState('02:00 PM');
  const [name, setName] = useState('Alex Rivera');
  const [phone, setPhone] = useState('(555) 234-5678');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: TourBooking = {
      id: 'tour-' + Date.now(),
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.image,
      date: selectedDate,
      time: selectedTime,
      type: tourType,
      status: 'Confirmed',
      hostName: property.host.name
    };

    onConfirmBooking(newBooking);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#c7c4d8]/30 flex justify-between items-center bg-[#f7f9fb]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3525cd]">calendar_month</span>
            <h3 className="font-bold text-lg text-[#191c1e]">Schedule a Tour</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#eceef0] text-[#777587]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-[#005236]/10 text-[#005236] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h4 className="text-xl font-bold text-[#191c1e]">Tour Request Confirmed!</h4>
            <p className="text-xs text-[#777587]">
              Your {tourType === 'in-person' ? 'In-Person' : 'Virtual'} tour for{' '}
              <strong>{property.title}</strong> is confirmed for <strong>{selectedDate}</strong> at{' '}
              <strong>{selectedTime}</strong>.
            </p>

            <div className="p-4 rounded-xl bg-[#f7f9fb] text-left text-xs space-y-1.5 border border-[#c7c4d8]/30">
              <p>
                <strong>Host:</strong> {property.host.name}
              </p>
              <p>
                <strong>Confirmation ID:</strong> #UR-{Math.floor(100000 + Math.random() * 900000)}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#3525cd] text-white font-bold text-sm shadow-md hover:bg-[#4f46e5]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
            {/* Property Preview Header */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f9fb] border border-[#c7c4d8]/30">
              <img
                src={property.image}
                alt={property.title}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="truncate">
                <p className="font-bold text-sm text-[#191c1e] truncate">{property.title}</p>
                <p className="text-xs text-[#777587] truncate">{property.address}</p>
              </div>
            </div>

            {/* Tour Type Selector */}
            <div>
              <label className="block text-xs font-bold text-[#191c1e] mb-2">Tour Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTourType('in-person')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    tourType === 'in-person'
                      ? 'bg-[#3525cd] text-white border-[#3525cd]'
                      : 'bg-[#f7f9fb] text-[#464555] border-[#c7c4d8]/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">directions_walk</span>
                  In-Person Tour
                </button>

                <button
                  type="button"
                  onClick={() => setTourType('virtual')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    tourType === 'virtual'
                      ? 'bg-[#3525cd] text-white border-[#3525cd]'
                      : 'bg-[#f7f9fb] text-[#464555] border-[#c7c4d8]/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">videocam</span>
                  Virtual Live Tour
                </button>
              </div>
            </div>

            {/* Date Select */}
            <div>
              <label className="block text-xs font-bold text-[#191c1e] mb-1">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#c7c4d8]/40 text-xs text-[#191c1e] font-semibold"
              />
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-xs font-bold text-[#191c1e] mb-2">Available Time Slots</label>
              <div className="grid grid-cols-3 gap-2">
                {['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:15 PM'].map(
                  (time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                        selectedTime === time
                          ? 'bg-[#3525cd] text-white border-[#3525cd]'
                          : 'bg-[#f7f9fb] text-[#464555] border-[#c7c4d8]/30 hover:bg-[#eceef0]'
                      }`}
                    >
                      {time}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#c7c4d8]/40 text-xs text-[#191c1e] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#c7c4d8]/40 text-xs text-[#191c1e] font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-xl bg-[#3525cd] text-white font-bold text-sm shadow-md hover:bg-[#4f46e5] active:scale-95 transition-all"
            >
              Confirm Tour Appointment
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
