import React from 'react';
import Icon from '@mdi/react';
import { mdiCog } from '@mdi/js';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';
import { LearningGeneralSettings } from './types';

interface GeneralTabProps {
  settings: LearningGeneralSettings;
  onSettingsChange: (settings: LearningGeneralSettings) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = <K extends keyof LearningGeneralSettings>(
    key: K,
    value: LearningGeneralSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiCog} size={1.5} className="text-blue-600" />
          <div>
            <h4 className="text-lg font-semibold text-blue-800">
              General Learning Settings
            </h4>
            <p className="text-sm text-blue-700">
              Basic configuration for learning and training modules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup title="Core Features">
            <ToggleSwitch
              id="enable-learning-paths"
              checked={settings.enableLearningPaths}
              onChange={(checked) =>
                updateSetting('enableLearningPaths', checked)
              }
              label="Enable Learning Paths"
            />
            <ToggleSwitch
              id="enable-certifications"
              checked={settings.enableCertifications}
              onChange={(checked) =>
                updateSetting('enableCertifications', checked)
              }
              label="Enable Certifications"
            />
            <ToggleSwitch
              id="enable-progress-tracking"
              checked={settings.enableProgressTracking}
              onChange={(checked) =>
                updateSetting('enableProgressTracking', checked)
              }
              label="Enable Progress Tracking"
            />
            <ToggleSwitch
              id="enable-social-learning"
              checked={settings.enableSocialLearning}
              onChange={(checked) =>
                updateSetting('enableSocialLearning', checked)
              }
              label="Enable Social Learning"
            />
          </FormGroup>

          <FormGroup title="Content Management">
            <div>
              <label
                htmlFor="default-content-type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Default Content Type
              </label>
              <select
                id="default-content-type"
                value={settings.defaultContentType}
                onChange={(e) =>
                  updateSetting('defaultContentType', e.target.value)
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#4ECDC4] focus:ring-[#4ECDC4]"
              >
                <option value="course">Course</option>
                <option value="procedure">Procedure</option>
                <option value="policy">Policy</option>
                <option value="learning_pathway">Learning Pathway</option>
              </select>
            </div>
            <ToggleSwitch
              id="enable-content-rating"
              checked={settings.enableContentRating}
              onChange={(checked) =>
                updateSetting('enableContentRating', checked)
              }
              label="Enable Content Rating"
            />
            <ToggleSwitch
              id="require-content-approval"
              checked={settings.requireContentApproval}
              onChange={(checked) =>
                updateSetting('requireContentApproval', checked)
              }
              label="Require Content Approval"
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
