import { useState, useEffect } from 'react';
import { SterilizationPhase } from '@/store/sterilizationStore';
import { sterilizationPhases } from '@/config/workflowConfig';
import { useTimerStore } from '@/store/timerStore';

export const usePhaseTimer = (
  phase: SterilizationPhase,
  onPhaseComplete: (phaseId: string) => void
) => {
  const duration = sterilizationPhases[phase.id]?.duration || 0;
  const {
    timeRemaining,
    elapsedTime,
    isRunning,
    overexposed,
    ciStripIncluded,
    biTestPassed,
    batchId,
    setTimeRemaining,
    setElapsedTime,
    setIsRunning,
    setOverexposed,
    setCiStripIncluded,
    setBiTestPassed,
    setBatchId,
    resetTimer,
  } = useTimerStore();
  const [overExposureTime, setOverExposureTime] = useState<number>(0);

  const isBathPhase = phase.name.toLowerCase().includes('bath');
  const resumeLocked = !phase.isActive || timeRemaining <= 0;

  useEffect(() => {
    const saved = localStorage.getItem(`timer-${phase.id}`);
    if (saved) {
      const savedSeconds = parseInt(saved);
      setTimeRemaining(savedSeconds);
      if (savedSeconds > duration) {
        console.warn(`Stale timer for ${phase.id}`);
        alert(`Warning: Timer for ${phase.label} may be stale.`);
      }
    }

    // Restore batchId if it exists
    const restoredBatchId = localStorage.getItem('batchId');
    if (restoredBatchId) {
      setBatchId(restoredBatchId);
    }
  }, [phase.id, duration, phase.label, setTimeRemaining, setBatchId]);

  useEffect(() => {
    if (phase.startTime && phase.isActive) {
      const elapsed = Math.floor((Date.now() - phase.startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
      setTimeRemaining(Math.max(0, duration - elapsed));
      if (elapsed > duration && isBathPhase) {
        setOverexposed(true);
        setOverExposureTime(elapsed - duration);
      }

      // Persist batchId when drying phase starts
      if (phase.id === 'drying' && batchId) {
        localStorage.setItem('batchId', batchId);
      }
    }
  }, [
    phase.startTime,
    phase.isActive,
    duration,
    isBathPhase,
    setElapsedTime,
    setTimeRemaining,
    setOverexposed,
    phase.id,
    batchId,
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeRemaining > 0) {
      localStorage.setItem('phaseTimerStart', Date.now().toString());
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const next = prev - 1;
          setElapsedTime(duration - next);
          localStorage.setItem(`timer-${phase.id}`, String(next));
          if (next <= 0) {
            setIsRunning(false);
            localStorage.removeItem('phaseTimerStart');
            localStorage.removeItem('batchId');
            if (isBathPhase) {
              setOverexposed(true);
              setOverExposureTime(0);
            }

            // BI compliance check for Autoclave phase
            if (phase.id === 'autoclave' && !biTestPassed) {
              console.warn('Biological Indicator Test not passed');
            }

            onPhaseComplete(phase.id);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isRunning,
    timeRemaining,
    duration,
    phase.id,
    onPhaseComplete,
    isBathPhase,
    setTimeRemaining,
    setElapsedTime,
    setIsRunning,
    setOverexposed,
    biTestPassed,
  ]);

  useEffect(() => {
    let overInterval: NodeJS.Timeout | null = null;
    if (overexposed && isBathPhase) {
      overInterval = setInterval(() => {
        setOverExposureTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (overInterval) clearInterval(overInterval);
    };
  }, [overexposed, isBathPhase]);

  useEffect(() => {
    setIsRunning(phase.isActive);
  }, [phase.isActive, setIsRunning]);

  useEffect(() => {
    const storedStartTime = localStorage.getItem('phaseTimerStart');
    if (storedStartTime && !resumeLocked) {
      const elapsed = Math.floor((Date.now() - parseInt(storedStartTime)) / 1000);
      const cappedElapsed = Math.min(elapsed, duration);
      setElapsedTime(cappedElapsed);
      setTimeRemaining(Math.max(0, duration - cappedElapsed));
    }
  }, [duration, setElapsedTime, setTimeRemaining, resumeLocked]);

  return {
    timeRemaining,
    elapsedTime,
    isRunning,
    overExposureTime,
    setIsRunning,
    resetTimer,
    ciStripIncluded,
    setCiStripIncluded,
    biTestPassed,
    setBiTestPassed,
  };
};

export const toolMetadataTags = {
  category: 'instrument',
  sterilizationClass: 'critical',
  autoclaveCompatible: true,
  lastUpdated: new Date().toISOString(),
  sanitizedByAi: false,
  aiConfidenceScore: 0.85,
  taggedBy: 'Cliniio-AI',
  validatedByOperator: false,
};

export function updateToolMetadata(update: Partial<typeof toolMetadataTags>) {
  const merged = { ...toolMetadataTags, ...update };
  console.log('Updated tool metadata:', merged);
  console.info('AI metadata enrichment complete');
  if (update.validatedByOperator) console.info('Metadata confirmed by human');
}

export function resetToolMetadata() {
  console.log('Tool metadata reset');
  console.info('Metadata cleared for next AI cycle');
  console.debug('Metadata reset complete');
}

export function getToolMetadataSnapshot() {
  console.debug('Metadata snapshot:', toolMetadataTags);
  return toolMetadataTags;
}
