import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiMagnify, mdiClose, mdiBookOpen, mdiClock, mdiTag } from '@mdi/js';
import {
  searchCourses,
  getCourseById,
  CourseSearchResult,
} from '@/features/library/services/courseSearchService';

interface LinkedPrerequisiteInputProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder?: string;
}

const LinkedPrerequisiteInput: React.FC<LinkedPrerequisiteInputProps> = ({
  value,
  onChange,
  onRemove,
  placeholder = 'Search for a course...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CourseSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCourse, setSelectedCourse] =
    useState<CourseSearchResult | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If we have a value but no selected course, try to fetch the course details
    if (value && !selectedCourse) {
      const fetchCourseDetails = async () => {
        try {
          const course = await getCourseById(value);
          if (course) {
            setSelectedCourse(course);
            setSearchQuery(course.title);
          }
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
      };

      fetchCourseDetails();
    }
  }, [value, selectedCourse]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setShowDropdown(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCourses(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleCourseSelect = (course: CourseSearchResult) => {
    setSelectedCourse(course);
    onChange(course.id);
    setSearchQuery(course.title);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleClear = () => {
    setSelectedCourse(null);
    setSearchQuery('');
    onChange('');
    setSearchResults([]);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (selectedCourse) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <Icon path={mdiBookOpen} size={1.2} className="text-blue-600" />
        <div className="flex-1">
          <div className="font-medium text-blue-900">
            {selectedCourse.title}
          </div>
          <div className="text-sm text-blue-700 flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Icon path={mdiClock} size={0.8} />
              <span>{formatDuration(selectedCourse.estimated_duration)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Icon path={mdiTag} size={0.8} />
              <span className="capitalize">
                {selectedCourse.difficulty_level}
              </span>
            </span>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
          aria-label="Remove course"
        >
          <Icon path={mdiClose} size={1} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Icon
          path={mdiMagnify}
          size={1}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
          placeholder={placeholder}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <Icon path={mdiClose} size={1} />
          </button>
        )}
      </div>

      {showDropdown && (searchQuery.length >= 2 || isSearching) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4ECDC4] mx-auto mb-2"></div>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className="w-full text-left p-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="font-medium text-gray-900">
                    {course.title}
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-3 mt-1">
                    <span className="flex items-center space-x-1">
                      <Icon path={mdiClock} size={0.8} />
                      <span>{formatDuration(course.estimated_duration)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon path={mdiTag} size={0.8} />
                      <span className="capitalize">
                        {course.difficulty_level}
                      </span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No courses found matching "{searchQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default LinkedPrerequisiteInput;
