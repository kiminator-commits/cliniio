import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { FacilityService } from '../../../services/facilityService';

interface OfficeClosure {
  id: string;
  closure_date: string;
  closure_type: 'holiday' | 'weekend' | 'custom' | 'maintenance';
  description: string;
  is_recurring: boolean;
  recurring_pattern?: string;
}

const OfficeClosuresManager: React.FC = () => {
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [closures, setClosures] = useState<OfficeClosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClosure, setNewClosure] = useState({
    closure_date: '',
    closure_type: 'holiday' as const,
    description: '',
    is_recurring: false,
  });

  useEffect(() => {
    const loadFacilityId = async () => {
      try {
        const id = await FacilityService.getCurrentFacilityId();
        setFacilityId(id);
      } catch (error) {
        console.error('Failed to load facility ID:', error);
      }
    };

    loadFacilityId();
  }, []);

  const loadClosures = useCallback(async () => {
    if (!facilityId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('office_closures')
        .select('*')
        .eq('facility_id', facilityId)
        .order('closure_date', { ascending: true });

      if (error) {
        console.error('Error loading closures:', error);
        return;
      }

      setClosures(
        (data as Record<string, unknown>[]).map((item) => ({
          id: item.id as string,
          closure_date: item.closure_date as string,
          closure_type: item.closure_type as
            | 'holiday'
            | 'maintenance'
            | 'custom',
          description:
            ((item.data as { description?: string })?.description as string) ||
            '',
          is_recurring: item.is_recurring as boolean,
        })) || []
      );
    } catch (error) {
      console.error('Error loading closures:', error);
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    if (facilityId) {
      loadClosures();
    }
  }, [facilityId, loadClosures]);

  const addClosure = async () => {
    if (!facilityId || !newClosure.closure_date) return;

    try {
      setSaving(true);
      const { error } = await supabase.from('office_closures').insert({
        facility_id: facilityId,
        closure_date: newClosure.closure_date,
        closure_type: newClosure.closure_type,
        description: newClosure.description,
        is_recurring: newClosure.is_recurring,
      });

      if (error) {
        console.error('Error adding closure:', error);
        return;
      }

      // Reset form and reload
      setNewClosure({
        closure_date: '',
        closure_type: 'holiday',
        description: '',
        is_recurring: false,
      });
      setShowAddForm(false);
      loadClosures();
    } catch (error) {
      console.error('Error adding closure:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteClosure = async (id: string) => {
    try {
      const { error } = await supabase
        .from('office_closures')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting closure:', error);
        return;
      }

      loadClosures();
    } catch (error) {
      console.error('Error deleting closure:', error);
    }
  };

  const getClosureTypeLabel = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'Holiday';
      case 'maintenance':
        return 'Maintenance';
      case 'custom':
        return 'Custom';
      default:
        return type;
    }
  };

  const getClosureTypeColor = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'custom':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="space-y-2">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h6 className="text-sm font-medium text-gray-700">
          Office Closures & Holidays
        </h6>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 text-sm bg-[#4ECDC4] text-white rounded-md hover:bg-[#45b8b0] transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Closure'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-md space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="closureDate"
                className="block text-xs text-gray-600 mb-1"
              >
                Date
              </label>
              <input
                id="closureDate"
                type="date"
                value={newClosure.closure_date}
                onChange={(e) =>
                  setNewClosure((prev) => ({
                    ...prev,
                    closure_date: e.target.value,
                  }))
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]"
              />
            </div>
            <div>
              <label
                htmlFor="closureType"
                className="block text-xs text-gray-600 mb-1"
              >
                Type
              </label>
              <select
                id="closureType"
                value={newClosure.closure_type}
                onChange={(e) =>
                  setNewClosure(
                    (prev) =>
                      ({
                        ...prev,
                        closure_type: e.target.value as
                          | 'holiday'
                          | 'maintenance'
                          | 'custom',
                      }) as typeof prev
                  )
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]"
              >
                <option value="holiday">Holiday</option>
                <option value="maintenance">Maintenance</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="closureDescription"
              className="block text-xs text-gray-600 mb-1"
            >
              Description
            </label>
            <input
              id="closureDescription"
              type="text"
              value={newClosure.description}
              onChange={(e) =>
                setNewClosure((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="e.g., Christmas Day, Annual Maintenance"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={newClosure.is_recurring}
              onChange={(e) =>
                setNewClosure((prev) => ({
                  ...prev,
                  is_recurring: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-[#4ECDC4] focus:ring-[#4ECDC4]"
            />
            <label htmlFor="recurring" className="text-sm text-gray-600">
              Recurring annually
            </label>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={addClosure}
              disabled={saving || !newClosure.closure_date}
              className="px-3 py-1 text-sm bg-[#4ECDC4] text-white rounded hover:bg-[#45b8b0] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Adding...' : 'Add Closure'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {closures.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No office closures configured. Add holidays and maintenance days
            above.
          </p>
        ) : (
          closures.map((closure) => (
            <div
              key={closure.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getClosureTypeColor(closure.closure_type)}`}
                  >
                    {getClosureTypeLabel(closure.closure_type)}
                  </span>
                  {closure.is_recurring && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Recurring
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(closure.closure_date).toLocaleDateString()}
                </div>
                {closure.description && (
                  <div className="text-sm text-gray-600">
                    {closure.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteClosure(closure.id)}
                className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete closure"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-500">
        Office closures are automatically excluded from streak calculations.
        Users won't lose their streak on holidays or maintenance days.
      </p>
    </div>
  );
};

export default OfficeClosuresManager;
