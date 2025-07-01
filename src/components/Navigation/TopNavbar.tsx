import React from 'react';

export default function TopNavbar() {
  return (
    <div className="w-full h-16 bg-white shadow flex items-center justify-between px-4">
      <h1 className="text-xl font-bold">Cliniio</h1>
      <div>{/* User Profile / Settings icons will go here */}</div>
    </div>
  );
}
