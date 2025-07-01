import React from 'react';
import { Link } from 'react-router-dom';
import { IconComponent } from '@/components/Icon/Icon';
import {
  mdiHome,
  mdiShieldCheck,
  mdiSpray,
  mdiBookOpenPageVariant,
  mdiCog,
  mdiPackageVariant,
} from '@mdi/js';

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Cliniio</h2>
      <nav className="space-y-2">
        <Link to="/home" className="flex items-center space-x-2">
          <IconComponent path={mdiHome} size={1} />
          <span>Home</span>
        </Link>
        <Link to="/sterilization" className="flex items-center space-x-2">
          <IconComponent path={mdiShieldCheck} size={1} />
          <span>Sterilization</span>
        </Link>
        <Link to="/inventory" className="flex items-center space-x-2">
          <IconComponent path={mdiPackageVariant} size={1} />
          <span>Inventory</span>
        </Link>
        <Link to="/environmental-clean" className="flex items-center space-x-2">
          <IconComponent path={mdiSpray} size={1} />
          <span>Environmental Cleaning</span>
        </Link>
        <Link to="/knowledge-hub" className="flex items-center space-x-2">
          <IconComponent path={mdiBookOpenPageVariant} size={1} />
          <span>Knowledge Hub</span>
        </Link>
        <Link to="/settings" className="flex items-center space-x-2">
          <IconComponent path={mdiCog} size={1} />
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );
}
