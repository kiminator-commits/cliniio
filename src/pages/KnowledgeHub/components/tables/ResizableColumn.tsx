import React, { useRef, useEffect } from 'react';

interface ResizableColumnProps {
  children: React.ReactNode;
  columnKey: string;
  width: number;
  onResize: (columnKey: string, width: number) => void;
  onStartResize: (
    columnKey: string,
    startX: number,
    startWidth: number
  ) => void;
  onStopResize: () => void;
  isResizing: boolean;
  className?: string;
}

export const ResizableColumn: React.FC<ResizableColumnProps> = ({
  children,
  columnKey,
  width,
  onResize,
  onStartResize,
  onStopResize,
  isResizing,
  className = '',
}) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        console.log('Mouse move during resize:', e.clientX);
        onResize(columnKey, e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        onStopResize();
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, columnKey, onResize, onStopResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Mouse down on resize handle for column:', columnKey);
    if (columnRef.current) {
      const rect = columnRef.current.getBoundingClientRect();
      const startWidth = rect.width;
      console.log(
        'Starting resize with width:',
        startWidth,
        'at X:',
        e.clientX
      );
      onStartResize(columnKey, e.clientX, startWidth);
    }
  };

  return (
    <div
      ref={columnRef}
      className={`relative ${className}`}
      style={{ width: `${width}px` }}
    >
      {children}
      <div
        ref={resizeHandleRef}
        className="absolute top-0 right-0 w-3 h-full cursor-col-resize hover:bg-blue-500 hover:opacity-50 transition-colors z-20 bg-transparent"
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (columnRef.current) {
              const rect = columnRef.current.getBoundingClientRect();
              const startWidth = rect.width;
              onStartResize(columnKey, rect.left, startWidth);
            }
          }
        }}
        role="button"
        tabIndex={0}
        title="Drag to resize column"
        style={{ right: '-1px' }}
      />
    </div>
  );
};
