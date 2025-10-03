import React, { useState } from 'react';
import { useSDSSheets } from '../hooks/useSDSSheets';
import Icon from '@mdi/react';
import {
  mdiFileDocument,
  mdiMagnify,
  mdiAlertCircle,
  mdiLoading,
} from '@mdi/js';
import { motion } from 'framer-motion';

const SDSSheetsPanel = () => {
  const { sdsSheets, isLoading, error, searchSDSSheets } = useSDSSheets();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchSDSSheets(query);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Icon
            path={mdiLoading}
            size={1}
            className="animate-spin text-[#4ECDC4]"
          />
          <span className="text-gray-600">Loading SDS sheets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2 text-red-500">
          <Icon path={mdiAlertCircle} size={1} />
          <span>Error loading SDS sheets: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Safety Data Sheets
          </h2>
          <p className="text-gray-600 mt-1">
            Access and manage safety data sheets for chemicals and materials
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon path={mdiFileDocument} size={1.5} className="text-[#4ECDC4]" />
          <span className="text-sm text-gray-500">
            {sdsSheets.length} sheets
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Icon
          path={mdiMagnify}
          size={1}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search SDS sheets by name, chemical, or CAS number..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
        />
      </div>

      {/* SDS Sheets Grid */}
      {sdsSheets.length === 0 ? (
        <div className="text-center py-12">
          <Icon
            path={mdiFileDocument}
            size={3}
            className="mx-auto text-gray-300 mb-4"
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No SDS sheets found
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? 'Try adjusting your search terms.'
              : 'No safety data sheets are currently available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sdsSheets.map((sds, index) => (
            <motion.div
              key={sds.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <Icon
                  path={mdiFileDocument}
                  size={1.5}
                  className="text-[#4ECDC4] flex-shrink-0"
                />
                <div className="flex flex-wrap gap-1">
                  {sds.hazards?.slice(0, 2).map((hazard, hazardIndex) => (
                    <span
                      key={hazardIndex}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full"
                    >
                      {hazard}
                    </span>
                  ))}
                  {sds.hazards && sds.hazards.length > 2 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{sds.hazards.length - 2}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {sds.title}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Chemical:</span>{' '}
                  {sds.chemicalName}
                </div>
                {sds.casNumber && (
                  <div>
                    <span className="font-medium">CAS Number:</span>{' '}
                    {sds.casNumber}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#3db8b0] transition-colors text-sm font-medium">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SDSSheetsPanel;
