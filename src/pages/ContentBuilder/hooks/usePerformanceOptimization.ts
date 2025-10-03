import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounced operations for performance optimization
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedFunc = useCallback(
    (...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => func(...args), delay);
    },
    [func, delay]
  );

  return debouncedFunc as T;
}

// Throttled operations for performance optimization
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);

  const throttledFunc = useCallback(
    (...args: unknown[]) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        func(...args);
        lastRun.current = now;
      }
    },
    [func, delay]
  );

  return throttledFunc as T;
}

// Expensive calculation optimization
export function useExpensiveCalculation<T>(
  calculation: () => T,
  dependencies: unknown[]
): T {
  return useMemo(calculation, [calculation, ...dependencies]);
}

// Virtual scrolling optimization for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  return useMemo(() => {
    const startIndex = Math.max(0, Math.floor(0 / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil(containerHeight / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, overscan]);
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver !== 'undefined') {
      observerRef.current = new IntersectionObserver(callback, options);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return observerRef.current;
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
  });

  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastTime = useRef<number>(0);

  useEffect(() => {
    const updateMetrics = () => {
      const now = performance.now();
      frameCount.current++;

      if (now - lastTime.current >= 1000) {
        const fps = Math.round(
          (frameCount.current * 1000) / (now - lastTime.current)
        );
        frameCount.current = 0;
        lastTime.current = now;

        setMetrics((prev) => ({
          ...prev,
          fps,
          memoryUsage:
            (
              performance as Performance & {
                memory?: { usedJSHeapSize: number };
              }
            ).memory?.usedJSHeapSize || 0,
        }));
      }
    };

    const animationId = requestAnimationFrame(updateMetrics);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics((prev) => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      renderTime,
    }));
  }, []);

  return { metrics, startRender, endRender };
}

// Batch updates for multiple state changes
export function useBatchUpdates() {
  const isBatchingRef = useRef(false);
  const pendingUpdatesRef = useRef<(() => void)[]>([]);

  const batchUpdate = useCallback((updates: (() => void)[]) => {
    if (isBatchingRef.current) {
      pendingUpdatesRef.current.push(...updates);
      return;
    }

    isBatchingRef.current = true;
    updates.forEach((update) => update());
    isBatchingRef.current = false;

    // Process any pending updates that came in during batching
    if (pendingUpdatesRef.current.length > 0) {
      const pending = [...pendingUpdatesRef.current];
      pendingUpdatesRef.current = [];
      batchUpdate(pending);
    }
  }, []);

  return { batchUpdate };
}

// Memory optimization hook for large objects
export function useMemoryOptimizedState<T>(
  initialState: T,
  maxSize: number = 1000
) {
  const stateRef = useRef<T>(initialState);
  const sizeRef = useRef(0);

  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      const nextState =
        typeof newState === 'function'
          ? (newState as (prev: T) => T)(stateRef.current)
          : newState;

      // Check memory usage and cleanup if necessary
      const newSize = JSON.stringify(nextState).length;
      if (newSize > maxSize) {
        // Implement cleanup logic here
        console.warn('State size exceeded limit, consider cleanup');
      }

      stateRef.current = nextState;
      sizeRef.current = newSize;
    },
    [maxSize]
  );

  const getState = useCallback(() => stateRef.current, []);
  const getSize = useCallback(() => sizeRef.current, []);

  return [getState, setState, getSize] as const;
}

// Course-specific performance optimizations
export function useCoursePerformanceOptimization(courseData: unknown) {
  // Memoize expensive course calculations
  const courseStats = useMemo(() => {
    if (!courseData) return null;

    const course = courseData as {
      modules?: Array<{ lessons?: unknown[]; estimatedDuration?: number }>;
    };

    return {
      totalModules: course.modules?.length || 0,
      totalLessons:
        course.modules?.reduce(
          (acc: number, m) => acc + (m.lessons?.length || 0),
          0
        ) || 0,
      totalDuration:
        course.modules?.reduce(
          (acc: number, m) => acc + (m.estimatedDuration || 0),
          0
        ) || 0,
      hasContent:
        course.modules?.some((m) =>
          m.lessons?.some((l) => (l as { content?: unknown }).content)
        ) || false,
    };
  }, [courseData]);

  // Optimize module rendering with virtualization
  const courseModules = (courseData as { modules?: unknown[] })?.modules;
  const moduleVirtualization = useMemo(() => {
    if (!courseModules) return null;

    const itemHeight = 120; // Estimated height per module
    const containerHeight = 600; // Container height
    const overscan = 3; // Render 3 extra items for smooth scrolling

    return {
      itemHeight,
      containerHeight,
      overscan,
      totalHeight: courseModules.length * itemHeight,
    };
  }, [courseModules]);

  // Debounced course validation
  const debouncedValidation = useDebounce(() => {
    // Course validation logic here
    console.log('Validating course...');
  }, 500);

  // Memory usage monitoring for large courses
  const memoryUsage = useMemo(() => {
    if (!courseData) return 0;
    return JSON.stringify(courseData).length;
  }, [courseData]);

  // Performance warnings
  useEffect(() => {
    if (memoryUsage > 100000) {
      // 100KB threshold
      console.warn('Course data size is large, consider optimization');
    }

    if (
      (courseStats as { totalModules?: number })?.totalModules &&
      (courseStats as { totalModules?: number }).totalModules! > 20
    ) {
      console.warn('Large number of modules detected, consider pagination');
    }

    if (
      (courseStats as { totalLessons?: number })?.totalLessons &&
      (courseStats as { totalLessons?: number }).totalLessons! > 100
    ) {
      console.warn('Large number of lessons detected, consider lazy loading');
    }
  }, [memoryUsage, courseStats]);

  return {
    courseStats,
    moduleVirtualization,
    debouncedValidation,
    memoryUsage,
    isLargeCourse:
      memoryUsage > 100000 ||
      ((courseStats as { totalModules?: number })?.totalModules &&
        (courseStats as { totalModules?: number }).totalModules! > 20) ||
      ((courseStats as { totalLessons?: number })?.totalLessons &&
        (courseStats as { totalLessons?: number }).totalLessons! > 100),
  };
}

// Text editor performance optimization
export function useTextEditorPerformance(
  content: string,
  maxLength: number = 10000
) {
  // Debounced content updates
  const debouncedContentUpdate = useDebounce(() => {
    // Handle content update
    console.log('Updating content...');
  }, 300);

  // Content size monitoring
  const contentSize = useMemo(() => content.length, [content]);
  const isLargeContent = contentSize > maxLength;

  // Performance optimization for large content
  const optimizedContent = useMemo(() => {
    if (isLargeContent) {
      // For large content, only process visible portions
      return content.substring(0, maxLength) + '...';
    }
    return content;
  }, [content, isLargeContent, maxLength]);

  // Memory cleanup for large content
  useEffect(() => {
    if (isLargeContent) {
      console.warn('Large content detected, consider chunking or lazy loading');
    }
  }, [isLargeContent]);

  return {
    debouncedContentUpdate,
    contentSize,
    isLargeContent,
    optimizedContent,
  };
}

// Media handling performance optimization
export function useMediaPerformanceOptimization(
  mediaItems: Array<{ size?: number }>
) {
  // Lazy load media items
  const visibleMediaItems = useMemo(() => {
    // Only load first 10 media items initially
    return mediaItems.slice(0, 10);
  }, [mediaItems]);

  // Virtual scrolling for media grid
  const mediaVirtualization = useMemo(() => {
    const itemSize = 200; // Media item size
    const containerHeight = 600;
    const overscan = 5;

    return {
      itemSize,
      containerHeight,
      overscan,
      totalHeight: mediaItems.length * itemSize,
    };
  }, [mediaItems]);

  // Memory optimization for media
  const mediaMemoryUsage = useMemo(() => {
    return mediaItems.reduce((acc, item) => {
      return acc + (item.size || 0);
    }, 0);
  }, [mediaItems]);

  return {
    visibleMediaItems,
    mediaVirtualization,
    mediaMemoryUsage,
    isLargeMediaCollection: mediaMemoryUsage > 50000000, // 50MB threshold
  };
}

// Form performance optimization
export function useFormPerformanceOptimization() {
  // Debounced form validation
  const debouncedValidation = useDebounce(() => {
    // Form validation logic
    console.log('Validating form...');
  }, 300);

  // Memoized validation results
  const validationResults = useMemo(() => {
    // Validation logic here
    return {};
  }, []);

  // Batch form updates
  const { batchUpdate } = useBatchUpdates();

  const batchFormUpdate = useCallback(
    (updates: Array<() => void>) => {
      batchUpdate(updates);
    },
    [batchUpdate]
  );

  return {
    debouncedValidation,
    validationResults,
    batchFormUpdate,
  };
}
