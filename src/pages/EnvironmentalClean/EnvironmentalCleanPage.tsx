import React, { useState } from 'react';
import { EnvironmentalCleanProvider } from '../../contexts/EnvironmentalCleanContext';
import EnvironmentalCleanHeader from './components/ui/EnvironmentalCleanHeader';
import RoomStatusSummary from './components/ui/RoomStatusSummary';
import CleaningAnalytics from './components/ui/CleaningAnalytics';
import RecentlyCleaned from './components/ui/RecentlyCleaned';
import CleaningChecklists from './components/ui/CleaningChecklists';
import { PageLayout } from '@/components/Layout/PageLayout';
import { Button } from 'react-bootstrap';
import Icon from '@mdi/react';
import {
  mdiBroom,
  mdiProgressClock,
  mdiCheckCircle,
  mdiPackageVariant,
  mdiShieldAlert,
  mdiWrench,
  mdiBiohazard,
} from '@mdi/js';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { ScanRoomModal } from '../../components/ScanRoomModal';
import { BaseModal } from '@/components/BaseModal';

const EnvironmentalCleanPage: React.FC = () => {
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
  };

  const handleCancelScan = () => {
    setSelectedStatus(null);
    setHasScanned(false);
  };

  const handleDoneScan = () => {
    setShowScanModal(false);
    setSelectedStatus(null);
    setHasScanned(false);
  };

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="!min-h-screen !overflow-y-auto">
        <PageLayout>
          <EnvironmentalCleanProvider>
            <div className="p-6 space-y-6">
              <EnvironmentalCleanHeader onScan={() => setShowScanModal(true)} />

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <RoomStatusSummary />
                    </div>
                    <div className="flex-1">
                      <CleaningAnalytics />
                      <div className="mt-4">
                        <RecentlyCleaned />
                      </div>
                    </div>
                  </div>
                  <div>
                    <CleaningChecklists />
                  </div>
                </div>
              </div>
            </div>

            <BaseModal
              show={showScanModal}
              onClose={() => setShowScanModal(false)}
              title={selectedStatus ? 'Scan Room Barcode' : 'Update Room Status'}
              footer={
                selectedStatus ? (
                  <>
                    <Button
                      variant="secondary"
                      onClick={handleCancelScan}
                      className="bg-gray-500 hover:bg-gray-600 border-gray-500 hover:border-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Cancel
                    </Button>
                    {hasScanned && (
                      <Button
                        variant="success"
                        onClick={handleDoneScan}
                        className="bg-brand-primary hover:bg-brand-primary text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                      >
                        Done
                      </Button>
                    )}
                  </>
                ) : null
              }
            >
              {!selectedStatus ? (
                <>
                  <Button
                    variant="outline-secondary"
                    className="w-full mb-2 border border-gray-300 hover:bg-[#4ECDC4] hover:border-[#4ECDC4] hover:text-white transition-colors duration-200"
                    onClick={() => handleStatusSelect('Dirty')}
                  >
                    <div className="flex items-center gap-2">
                      <Icon path={mdiBroom} size={0.8} color="#dc2626" />
                      <span>Dirty</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="w-full mb-2 border border-gray-300 hover:bg-[#4ECDC4] hover:border-[#4ECDC4] hover:text-white transition-colors duration-200"
                    onClick={() => handleStatusSelect('In Progress')}
                  >
                    <div className="flex items-center gap-2">
                      <Icon path={mdiProgressClock} size={0.8} color="#ca8a04" />
                      <span>In Progress</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="w-full mb-2 border border-gray-300 hover:bg-[#4ECDC4] hover:border-[#4ECDC4] hover:text-white transition-colors duration-200"
                    onClick={() => handleStatusSelect('Available')}
                  >
                    <div className="flex items-center gap-2">
                      <Icon path={mdiCheckCircle} size={0.8} color="#16a34a" />
                      <span>Available</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="w-full mb-2 border border-gray-300 hover:bg-[#4ECDC4] hover:border-[#4ECDC4] hover:text-white transition-colors duration-200"
                    onClick={() => handleStatusSelect('Low Inventory')}
                  >
                    <div className="flex items-center gap-2">
                      <Icon path={mdiPackageVariant} size={0.8} color="#9333ea" />
                      <span>Low Inventory</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="w-full mb-2 border border-gray-300 hover:bg-[#4ECDC4] hover:border-[#4ECDC4] hover:text-white transition-colors duration-200"
                    onClick={() => handleStatusSelect('Theft')}
                  >
                    <div className="flex items-center gap-2">
                      <Icon path={mdiShieldAlert} size={0.8} color="#4b5563" />
                      <span>Theft</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="w-full mb-2 border border-gray-300 hover:bg-[#4ECDC4] hover:border-[#4ECDC4] hover:text-white transition-colors duration-200"
                    onClick={() => handleStatusSelect('Biohazard')}
                  >
                    <div className="flex items-center gap-2">
                      <Icon path={mdiBiohazard} size={0.8} color="#dc2626" />
                      <span>Biohazard</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="w-full mb-2 border border-gray-300 hover:bg-[#4ECDC4] hover:border-[#4ECDC4] hover:text-white transition-colors duration-200"
                    onClick={() => handleStatusSelect('Out of Service')}
                  >
                    <div className="flex items-center gap-2">
                      <Icon path={mdiWrench} size={0.8} color="#b45309" />
                      <span>Out of Service</span>
                    </div>
                  </Button>
                </>
              ) : (
                <div className="relative bg-black h-64 sm:h-80 rounded-lg overflow-hidden">
                  {/* Camera feed simulation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>

                  {/* Scanning animation */}
                  <div className="absolute left-0 right-0 h-1 bg-[#4ECDC4] animate-scan"></div>

                  {/* QR Code outline */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-[#4ECDC4] w-48 h-48 rounded-lg">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#4ECDC4] rounded-tl"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#4ECDC4] rounded-tr"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#4ECDC4] rounded-bl"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#4ECDC4] rounded-br"></div>
                  </div>

                  {/* Camera status indicator */}
                  <div className="absolute bottom-4 right-4 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                    <span className="text-white text-xs">Camera active</span>
                  </div>
                </div>
              )}
            </BaseModal>
            <ScanRoomModal show={showScanModal} onHide={() => setShowScanModal(false)} />
          </EnvironmentalCleanProvider>
        </PageLayout>
      </div>
    </ErrorBoundary>
  );
};

export default EnvironmentalCleanPage;
