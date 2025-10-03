import { useState, useCallback, useRef } from 'react';

export interface ColumnWidths {
  [key: string]: number;
}

export const useColumnResizing = (initialWidths: ColumnWidths = {}) => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(initialWidths);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const startResizing = useCallback(
    (columnKey: string, startX: number, startWidth: number) => {
      setIsResizing(true);
      setResizingColumn(columnKey);
      startXRef.current = startX;
      startWidthRef.current = startWidth;
    },
    []
  );

  const resizeColumn = useCallback(
    (currentX: number) => {
      if (!isResizing || !resizingColumn) return;

      const deltaX = currentX - startXRef.current;
      const newWidth = Math.max(100, startWidthRef.current + deltaX); // Minimum 100px width

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    },
    [isResizing, resizingColumn]
  );

  const handleResize = useCallback(
    (columnKey: string, currentX: number) => {
      if (!isResizing || resizingColumn !== columnKey) return;
      resizeColumn(currentX);
    },
    [isResizing, resizingColumn, resizeColumn]
  );

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    setResizingColumn(null);
  }, []);

  const resetColumnWidths = useCallback(() => {
    setColumnWidths(initialWidths);
  }, [initialWidths]);

  return {
    columnWidths,
    isResizing,
    resizingColumn,
    startResizing,
    resizeColumn: handleResize,
    stopResizing,
    resetColumnWidths,
  };
};
