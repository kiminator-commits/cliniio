import React from 'react';
import Icon from '@mdi/react';
import { mdiTarget } from '@mdi/js';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';
import { LearningPathSettings } from './types';

interface LearningPathsTabProps {
  settings: LearningPathSettings;
  onSettingsChange: (settings: LearningPathSettings) => void;
}

const LearningPathsTab: React.FC<LearningPathsTabProps> = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = <K extends keyof LearningPathSettings>(
    key: K,
    value: LearningPathSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiTarget} size={1.5} className="text-orange-600" />
          <div>
            <h4 className="text-lg font-semibold text-orange-800">
              Learning Path Configuration
            </h4>
            <p className="text-sm text-orange-700">
              Configure learning paths and progress tracking
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup title="Path Features">
            <ToggleSwitch
              id="enable-custom-paths"
              checked={settings.enableCustomPaths}
              onChange={(checked) =>
                updateSetting('enableCustomPaths', checked)
              }
              label="Enable Custom Learning Paths"
            />
            <ToggleSwitch
              id="enable-prerequisites"
              checked={settings.enablePrerequisites}
              onChange={(checked) =>
                updateSetting('enablePrerequisites', checked)
              }
              label="Enable Prerequisites"
            />
            <ToggleSwitch
              id="enable-branching"
              checked={settings.enableBranching}
              onChange={(checked) => updateSetting('enableBranching', checked)}
              label="Enable Branching Paths"
            />
            <ToggleSwitch
              id="adaptive-path-generation"
              checked={settings.adaptivePathGeneration}
              onChange={(checked) =>
                updateSetting('adaptivePathGeneration', checked)
              }
              label="AI Adaptive Path Generation"
            />
          </FormGroup>

          <FormGroup title="Progress & Gamification">
            <ToggleSwitch
              id="enable-milestones"
              checked={settings.enableMilestones}
              onChange={(checked) => updateSetting('enableMilestones', checked)}
              label="Enable Learning Milestones"
            />
            <ToggleSwitch
              id="enable-progress-gamification"
              checked={settings.enableProgressGamification}
              onChange={(checked) =>
                updateSetting('enableProgressGamification', checked)
              }
              label="Enable Progress Gamification"
            />
            <ToggleSwitch
              id="enable-learning-streaks"
              checked={settings.enableLearningStreaks}
              onChange={(checked) =>
                updateSetting('enableLearningStreaks', checked)
              }
              label="Enable Learning Streaks"
            />
            <ToggleSwitch
              id="enable-achievement-badges"
              checked={settings.enableAchievementBadges}
              onChange={(checked) =>
                updateSetting('enableAchievementBadges', checked)
              }
              label="Enable Achievement Badges"
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

export default LearningPathsTab;
