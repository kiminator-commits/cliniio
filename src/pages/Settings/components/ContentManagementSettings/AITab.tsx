import React, { useEffect, useState, useCallback } from 'react';
import { useContentAISettings } from '../../../../hooks/useContentAISettings';
import { toast } from 'react-hot-toast';
import { contentSuggestionService, type AISuggestion } from '../../../../services/contentSuggestionService';
import { useFacility } from '../../../../contexts/FacilityContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../contexts/UserContext';
import { PermissionService } from '../../../../services/permissionService';

export const AITab: React.FC = () => {
  const { settings, loading, error, updateSetting, facilityLoading } = useContentAISettings();
  const { getCurrentFacilityId } = useFacility();
  const facilityId = getCurrentFacilityId();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [canToggleAISuggestions, setCanToggleAISuggestions] = useState(false);

  const handleToggleChange = async (key: keyof typeof settings, value: boolean) => {
    try {
      await updateSetting(key, value);
      toast.success(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${value ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update setting');
    }
  };

  const handleConfidenceChange = async (value: string) => {
    try {
      await updateSetting('confidenceThreshold', parseFloat(value));
      toast.success('Confidence threshold updated');
    } catch {
      toast.error('Failed to update confidence threshold');
    }
  };

  const loadSuggestions = useCallback(async () => {
    if (!facilityId) return;
    try {
      setSuggestionsLoading(true);
      const data = await contentSuggestionService.getPendingSuggestions(facilityId);
      setSuggestions(data);
    } catch (e) {
      console.error('Failed to load AI suggestions', e);
    } finally {
      setSuggestionsLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleCreateInBuilder = async (s: AISuggestion) => {
    try {
      await contentSuggestionService.acceptSuggestion(s.id);
      // Deep link to Content Builder with prefilled title and suggestion id
      const params = new URLSearchParams({ title: s.topic, suggestionId: s.id });
      navigate(`/content-builder?${params.toString()}`);
    } catch (e) {
      console.error('Failed to accept suggestion', e);
      toast.error('Failed to open Content Builder');
    }
  };

  // Permission check: admin/manager allowed; fallback to currentUser role if mapping missing
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (!currentUser?.id || !facilityId) {
          setCanToggleAISuggestions(false);
          return;
        }
        const perms = await PermissionService.getUserPermissions(currentUser.id, facilityId);
        const roleFromMapping = perms?.role;
        // Fallbacks from user context if role mapping is unavailable
        const roleFromUser: string | undefined = currentUser?.role;
        const effectiveRole = roleFromMapping || roleFromUser;
        const effectiveRoleLower = (effectiveRole || '').toString().toLowerCase();
        setCanToggleAISuggestions(effectiveRoleLower === 'administrator' || effectiveRoleLower === 'admin' || effectiveRoleLower === 'manager');
      } catch (e) {
        console.error('AI suggestions permission check failed', e);
        setCanToggleAISuggestions(false);
      }
    };
    checkPermission();
  }, [currentUser, facilityId]);

  if (facilityLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-11"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          AI Content Suggestions
        </h3>
        <div className="space-y-4">
          <div className={`flex items-center justify-between ${!canToggleAISuggestions ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-sm text-gray-600">Enable AI suggestions</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="enable-ai-suggestions"
                className="sr-only peer"
                checked={settings.enableAISuggestions}
                onChange={(e) => handleToggleChange('enableAISuggestions', e.target.checked)}
                disabled={!canToggleAISuggestions}
              />
              <div className={`w-11 h-6 ${settings.enableAISuggestions ? 'bg-[#4ECDC4]' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.enableAISuggestions ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Enable AI suggestions</span>
            </label>
          </div>
          {/* Greyed-out only when lacking permission, consistent with other settings */}
          <div className={`flex items-center justify-between ${!canToggleAISuggestions ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-sm text-gray-600">
              Content optimization suggestions
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="content-optimization"
                className="sr-only peer"
                checked={settings.contentOptimization}
                onChange={(e) => handleToggleChange('contentOptimization', e.target.checked)}
                disabled={!canToggleAISuggestions}
              />
              <div className={`w-11 h-6 ${settings.contentOptimization ? 'bg-[#4ECDC4]' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.contentOptimization ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Content optimization suggestions</span>
            </label>
          </div>
          <div className={`flex items-center justify-between ${!canToggleAISuggestions ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-sm text-gray-600">
              Duplicate detection (internal library)
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="duplicate-detection"
                className="sr-only peer"
                checked={settings.plagiarismCheck}
                onChange={(e) => handleToggleChange('plagiarismCheck', e.target.checked)}
                disabled={!canToggleAISuggestions}
              />
              <div className={`w-11 h-6 ${settings.plagiarismCheck ? 'bg-[#4ECDC4]' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.plagiarismCheck ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Duplicate detection (internal library)</span>
            </label>
          </div>
          <div className={`flex items-center justify-between ${!canToggleAISuggestions ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-sm text-gray-600">
              Automatic tagging
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="auto-tagging"
                className="sr-only peer"
                checked={settings.autoTagging}
                onChange={(e) => handleToggleChange('autoTagging', e.target.checked)}
                disabled={!canToggleAISuggestions}
              />
              <div className={`w-11 h-6 ${settings.autoTagging ? 'bg-[#4ECDC4]' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.autoTagging ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Automatic tagging</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          AI Configuration
        </h4>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="confidence-threshold"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Suggestion Confidence Threshold
            </label>
            <select
              id="confidence-threshold"
              value={settings.confidenceThreshold || 0.8}
              onChange={(e) => handleConfidenceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0.7">70% - Balanced</option>
              <option value="0.8">80% - Recommended</option>
              <option value="0.9">90% - High Quality</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-gray-900">Suggested Topics</h4>
          {suggestionsLoading && (
            <span className="text-xs text-gray-500">Loading…</span>
          )}
        </div>
        {suggestions.length === 0 && !suggestionsLoading ? (
          <p className="text-sm text-gray-500">No suggestions right now. Check back later.</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between">
                <div className="pr-4">
                  <div className="text-sm font-medium text-gray-900">{s.title || s.topic}</div>
                  <div className="text-xs text-gray-500 mt-1 capitalize">{s.suggestion_type} • Priority: {s.priority}</div>
                  {s.description && (
                    <div className="text-sm text-gray-600 mt-2">{s.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {s.suggestion_type === 'create' && (
                    <button
                      onClick={() => handleCreateInBuilder(s)}
                      className="px-3 py-2 text-sm rounded-md bg-[#4ECDC4] text-white hover:opacity-90"
                    >
                      Create in Builder
                    </button>
                  )}
                  {s.suggestion_type === 'improve' && (
                    <button
                      onClick={() => navigate(`/content-builder?editId=${s.related_content_id || ''}&suggestionId=${s.id}`)}
                      className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:opacity-90"
                    >
                      Edit Content
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
