import React from 'react';
import Icon from '@mdi/react';
import {
  mdiPackageVariant,
  mdiMapMarker,
  mdiFactory,
  mdiTruck,
  mdiCalendar,
} from '@mdi/js';
import { motion } from 'framer-motion';
import { InventoryItemCardProps } from '../types/InventorySearchModalTypes';
import { getExpiryStatus, formatDate } from '../utils/inventorySearchUtils';

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  isSelected,
  onToggle,
}) => {
  const expiryStatus = getExpiryStatus(item);

  // Helper function to safely access data properties
  const getDataProperty = (property: string) => {
    return (item.data as Record<string, unknown>)?.[property];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-[#4ECDC4] bg-[#4ECDC4]/5'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={() => onToggle(item)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900">{item.name}</h4>
            {isSelected && (
              <span className="px-2 py-1 text-xs bg-[#4ECDC4] text-white rounded-full">
                Selected
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Icon path={mdiPackageVariant} size={0.8} />
                <span>{item.category}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon path={mdiMapMarker} size={0.8} />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium">Quantity:</span>
                <span>
                  {item.quantity || 0}{' '}
                  {String(getDataProperty('unit') || 'units')}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              {getDataProperty('manufacturer') ? (
                <div className="flex items-center space-x-1">
                  <Icon path={mdiFactory} size={0.8} />
                  <span>{String(getDataProperty('manufacturer'))}</span>
                </div>
              ) : null}
              {getDataProperty('supplier') ? (
                <div className="flex items-center space-x-1">
                  <Icon path={mdiTruck} size={0.8} />
                  <span>{String(getDataProperty('supplier'))}</span>
                </div>
              ) : null}
              {getDataProperty('expiration') || item.expiryDate ? (
                <div className="flex items-center space-x-1">
                  <Icon path={mdiCalendar} size={0.8} />
                  <span>
                    Expires:{' '}
                    {formatDate(
                      String(
                        getDataProperty('expiration') || item.expiryDate || ''
                      )
                    )}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Expiry Status Badge */}
          {expiryStatus && (
            <div
              className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${expiryStatus.bgColor} ${expiryStatus.color}`}
            >
              {expiryStatus.status === 'expired' && 'Expired'}
              {expiryStatus.status === 'expiring-soon' && 'Expiring Soon'}
              {expiryStatus.status === 'valid' && 'Valid'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InventoryItemCard;
