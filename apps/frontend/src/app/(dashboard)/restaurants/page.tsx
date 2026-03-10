'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import RestaurantCard from '@/components/RestaurantCard';
import { useStore } from '@/lib/store';

const FILTERS = ['All Dining', 'Fast Food', 'Continental', 'Beverages', 'Desserts'];

const STATUS_STEPS = [
  { label: 'CART', desc: 'Items selected', color: 'bg-green-500', done: true },
  { label: 'PENDING PAYMENT', desc: 'Awaiting checkout', color: 'bg-amber-500', active: true },
  { label: 'CONFIRMED', desc: 'Kitchen queue', color: 'bg-slate-200' },
  { label: 'DELIVERED', desc: 'Internal desk drop', color: 'bg-slate-200' },
];

export default function RestaurantsPage() {
  const { user } = useStore();
  const [activeFilter, setActiveFilter] = useState('All Dining');

  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const res = await api.get('/restaurants');
      return res.data;
    },
  });

  return (
    <div className="flex gap-0 min-h-full -m-6">
      {/* Main content */}
      <div className="flex-1 p-8 min-w-0">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Member Discovery</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {user?.regionId
              ? `Explore restaurants available in your region`
              : 'Global View — All Regions'}
          </p>
        </div>

        {/* Filter pills — from Stitch reference */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all
                ${activeFilter === f
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Restaurant grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm">
                <div className="aspect-video w-full bg-slate-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                  <div className="h-px bg-slate-100 mt-4" />
                  <div className="flex justify-between pt-2">
                    <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Failed to load restaurants</h3>
            <p className="text-slate-500 text-sm">Check your connection and try again.</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No restaurants in your region</h3>
            <p className="text-slate-500 text-sm">Contact your admin to add restaurant access.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant: Record<string, unknown>, i: number) => (
              <RestaurantCard
                key={String(restaurant.id)}
                id={String(restaurant.id)}
                name={String(restaurant.name)}
                region={restaurant.region as { id: string; name: string }}
                isManager={user?.role === 'MANAGER' || user?.role === 'ADMIN'}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Command Center sidebar — inspired by Stitch right panel */}
      <aside className="w-72 shrink-0 border-l border-slate-200 bg-white p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-base font-bold text-slate-900">Command Center</h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600 border border-blue-100">
            LIVE
          </span>
        </div>

        {/* Order status timeline */}
        <div className="flex flex-col gap-0 flex-1 relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100" />
          {STATUS_STEPS.map((step, i) => (
            <div key={step.label} className="relative flex gap-4 pb-8">
              <div className={`z-10 flex size-8 items-center justify-center rounded-full text-white shadow-md shrink-0 text-xs font-bold transition-all
                ${step.done ? 'bg-green-500' : step.active ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-slate-200'}`}>
                {step.done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-slate-400 text-xs">{i + 1}</span>
                )}
              </div>
              <div className="pt-1">
                <p className={`text-xs font-bold uppercase tracking-tight
                  ${step.done ? 'text-green-600' : step.active ? 'text-amber-500' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 mt-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Your Session</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Role</span>
              <span className="font-bold text-slate-800 capitalize">{user?.role?.toLowerCase() ?? '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Restaurants</span>
              <span className="font-bold text-slate-800">{restaurants.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Access</span>
              <span className="font-bold text-green-600">Authorized</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
