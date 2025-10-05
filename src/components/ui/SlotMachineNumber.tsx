import React, { useState, useEffect, useRef } from 'react';

interface SlotMachineNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const SlotMachineNumber: React.FC<SlotMachineNumberProps> = ({
  value,
  duration = 2000,
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const startAnimation = () => {
      setIsAnimating(true);
      startTimeRef.current = Date.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current!;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);

        // Calculate current value with some randomness for slot machine effect
        const randomFactor = Math.sin(elapsed * 0.01) * 0.1;
        const currentValue = Math.floor(value * easeOut + randomFactor * value);

        setDisplayValue(Math.max(0, Math.min(value, currentValue)));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
          setIsAnimating(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    const timer = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, delay]);

  return (
    <span
      className={`inline-block transition-all duration-300 ${
        isAnimating ? 'animate-pulse' : ''
      } ${className}`}
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

// Slot machine container for multiple numbers
interface SlotMachineStatsProps {
  streak: number;
  level: number;
  points: number;
  className?: string;
}

export const SlotMachineStats: React.FC<SlotMachineStatsProps> = ({
  streak,
  level,
  points,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">
          Current Streak:
        </span>
        <SlotMachineNumber
          value={streak}
          duration={1500}
          delay={0}
          className="text-lg font-bold text-orange-500"
          suffix=" days"
        />
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Level:</span>
        <SlotMachineNumber
          value={level}
          duration={1500}
          delay={500}
          className="text-lg font-bold text-blue-500"
        />
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Points:</span>
        <SlotMachineNumber
          value={points}
          duration={2000}
          delay={1000}
          className="text-lg font-bold text-green-500"
        />
      </div>
    </div>
  );
};

export default SlotMachineNumber;
