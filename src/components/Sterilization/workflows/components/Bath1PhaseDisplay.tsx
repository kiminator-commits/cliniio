import React from 'react';
import { useTimerStore } from '@/store/timerStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatTime } from '@/utils/formatTime';

interface Bath1PhaseDisplayProps {
  onPhaseComplete?: () => void;
  onPhasePause?: () => void;
}

export const Bath1PhaseDisplay: React.FC<Bath1PhaseDisplayProps> = ({
  onPhaseComplete,
  onPhasePause,
}) => {
  const timer = useTimerStore((state) => state.getTimer('bath1'));
  const { startTimer, pauseTimer, resetTimer } = useTimerStore();

  const handleStart = () => {
    startTimer('bath1', 1800); // 30 minutes in seconds
  };

  const handlePause = () => {
    pauseTimer('bath1');
    onPhasePause?.();
  };

  const handleComplete = () => {
    resetTimer('bath1');
    onPhaseComplete?.();
  };

  const progress = timer
    ? ((timer.duration - timer.timeRemaining) / timer.duration) * 100
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bath 1 Phase</span>
          <Badge variant={timer?.isRunning ? 'default' : 'secondary'}>
            {timer?.isRunning ? 'Active' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {timer ? formatTime(timer.timeRemaining) : '00:30:00'}
            </div>
            <div className="text-sm text-muted-foreground">Time Remaining</div>
          </div>

          <Progress value={progress} className="w-full" />

          <div className="flex gap-2">
            {!timer?.isRunning ? (
              <Button onClick={handleStart} className="flex-1">
                Start Bath 1
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePause}
                  variant="secondary"
                  className="flex-1"
                >
                  Pause
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  Complete
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
