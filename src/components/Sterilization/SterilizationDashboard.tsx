import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSterilizationStore } from '../../store/sterilizationStore';
import PhaseTimer from './PhaseTimer';
import SterilizationScannerModal from './SterilizationScannerModal';
import CleaningLogTracker from './CleaningLogTracker';
import BiologicalIndicatorTest from './BiologicalIndicatorTest';
import PhaseCard from './PhaseCard';
import SterilizationErrorFallback from './SterilizationErrorFallback';
import Icon from '@mdi/react';
import { mdiBarcode, mdiChartLine, mdiFileDocument, mdiPlay, mdiAlert } from '@mdi/js';
import { checkBITestDue } from '@/utils/checkBITestDue';
import { createPortal } from 'react-dom';

interface SterilizationDashboardProps {
  SterilizationAnalyticsComponent?: React.ComponentType;
}

export default function SterilizationDashboard({
  SterilizationAnalyticsComponent,
}: SterilizationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'timers' | 'analytics' | 'logs'>('timers');
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);
  const [operatorName, setOperatorName] = useState('');

  const {
    currentCycle,
    startNewCycle,
    startPhase,
    completePhase,
    pausePhase,
    setModalOpen,
    showBITestModal,
    setShowBITestModal,
    recordBITestResult,
  } = useSterilizationStore();

  // Check for BI test due every minute
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    function loopCheck() {
      checkBITestDue();
      timeoutId = setTimeout(loopCheck, 60000);
    }

    loopCheck();

    return () => clearTimeout(timeoutId);
  }, []);

  const handleBITestComplete = useCallback(
    (result: { toolId: string; passed: boolean; date: Date }) => {
      recordBITestResult(result);
    },
    [recordBITestResult]
  );

  const handleStartNewCycle = useCallback(() => {
    if (operatorName.trim()) {
      startNewCycle(operatorName.trim());
      setShowNewCycleModal(false);
      setOperatorName('');
    }
  }, [operatorName, startNewCycle]);

  const handlePhaseStart = useCallback(
    (phaseId: string) => {
      startPhase(phaseId);
    },
    [startPhase]
  );

  const handlePhaseComplete = useCallback(
    (phaseId: string) => {
      completePhase(phaseId);
    },
    [completePhase]
  );

  const handlePhasePause = useCallback(
    (phaseId: string) => {
      pausePhase(phaseId);
    },
    [pausePhase]
  );

  const handleScanTool = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const handleTabChange = useCallback((tabId: 'timers' | 'analytics' | 'logs') => {
    setActiveTab(tabId);
  }, []);

  const handleOperatorNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOperatorName(e.target.value);
  }, []);

  const handleOperatorNameKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleStartNewCycle();
      }
    },
    [handleStartNewCycle]
  );

  const handleCloseNewCycleModal = useCallback(() => {
    setShowNewCycleModal(false);
    setOperatorName('');
  }, []);

  const handleCloseBITestModal = useCallback(() => {
    setShowBITestModal(false);
  }, [setShowBITestModal]);

  const tabs = [
    { id: 'timers', label: 'Phase Timers', icon: mdiPlay },
    { id: 'analytics', label: 'Analytics', icon: mdiChartLine },
    { id: 'logs', label: 'Cleaning Logs', icon: mdiFileDocument },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#5b5b5b] mb-1">Sterilization Management</h1>
          <p className="text-gray-500 text-sm">
            Manage sterilization cycles, track tools, and monitor performance
          </p>
        </div>

        {/* Scanner Container */}
        <div
          className="bg-white rounded-lg shadow p-6 flex items-center gap-4"
          style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
        >
          <span className="text-gray-600">Tool Scanner</span>
          <button
            onClick={handleScanTool}
            className="bg-[#4ECDC4] hover:bg-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
          >
            <Icon path={mdiBarcode} size={1} />
            Scan Tool
          </button>
        </div>
      </div>

      {/* Cycle Control Panel */}
      <div
        className="bg-white rounded-lg shadow p-6"
        style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Cycle Control</h2>
        </div>

        {!currentCycle ? (
          <div className="text-center py-6">
            <div className="mb-3">
              <Icon path={mdiAlert} size={2.5} className="text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Cycle</h3>
            <p className="text-gray-500 mb-3">
              Start a new sterilization cycle to begin processing tools
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Only show Active Cycle info if there's an active phase */}
            {currentCycle.phases.some(phase => phase.status === 'active') && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-800">Active Cycle: {currentCycle.id}</h3>
                  <p className="text-sm text-gray-600">
                    Started: {currentCycle.startTime.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Cycle Progress */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {currentCycle.phases.map(phase => (
                <div key={phase.id} className="text-center p-2 bg-gray-50 rounded-lg">
                  <div
                    className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                      phase.status === 'completed'
                        ? 'bg-green-500'
                        : phase.status === 'active'
                          ? 'bg-blue-500'
                          : phase.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-gray-300'
                    }`}
                  ></div>
                  <p className="text-sm font-medium text-gray-800">{phase.name}</p>
                  <p className="text-xs text-gray-500">{phase.tools.length} tools</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        className="bg-white rounded-lg shadow"
        style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
      >
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap gap-2 p-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as 'timers' | 'analytics' | 'logs')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#4ECDC4] text-white shadow-md'
                    : 'text-gray-600 hover:text-[#4ECDC4] hover:bg-gray-50'
                }`}
              >
                <Icon path={tab.icon} size={0.8} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'timers' && currentCycle && (
            <div className="space-y-4">
              {currentCycle.phases.map(phase => (
                <PhaseTimer
                  key={phase.id}
                  phase={phase}
                  onPhaseStart={handlePhaseStart}
                  onPhaseComplete={handlePhaseComplete}
                  onPhasePause={handlePhasePause}
                />
              ))}

              {/* Phase Cards */}
              <div className="space-y-4">
                <PhaseCard title="Bath 1">{/* Bath 1 content */}</PhaseCard>

                <PhaseCard title="Bath 2">{/* Bath 2 content */}</PhaseCard>

                <PhaseCard title="Drying">{/* Drying content */}</PhaseCard>

                <PhaseCard title="Autoclave">{/* Autoclave content */}</PhaseCard>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && <SterilizationAnalyticsComponent />}

          {activeTab === 'logs' && <CleaningLogTracker />}
        </div>
      </div>

      {/* New Cycle Modal */}
      {showNewCycleModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999]"
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              zIndex: 99999,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
            }}
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Start New Sterilization Cycle
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="operator-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Operator Name
                  </label>
                  <input
                    id="operator-name"
                    type="text"
                    value={operatorName}
                    onChange={handleOperatorNameChange}
                    placeholder="Enter operator name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                    onKeyPress={handleOperatorNameKeyPress}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleStartNewCycle}
                    disabled={!operatorName.trim()}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      operatorName.trim()
                        ? 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Start Cycle
                  </button>
                  <button
                    onClick={handleCloseNewCycleModal}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Scanner Modal */}
      <ErrorBoundary FallbackComponent={SterilizationErrorFallback}>
        <SterilizationScannerModal />
      </ErrorBoundary>

      {/* BI Test Modal */}
      <BiologicalIndicatorTest
        isOpen={showBITestModal}
        onClose={handleCloseBITestModal}
        onComplete={handleBITestComplete}
        operatorName={currentCycle?.operator || 'Operator'}
      />
    </div>
  );
}
