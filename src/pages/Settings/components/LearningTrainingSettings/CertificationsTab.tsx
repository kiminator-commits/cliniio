import React from 'react';
import Icon from '@mdi/react';
import { mdiCertificate } from '@mdi/js';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';
import { CertificationSettings } from './types';

interface CertificationsTabProps {
  settings: CertificationSettings;
  onSettingsChange: (settings: CertificationSettings) => void;
}

const CertificationsTab: React.FC<CertificationsTabProps> = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = <K extends keyof CertificationSettings>(
    key: K,
    value: CertificationSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiCertificate} size={1.5} className="text-green-600" />
          <div>
            <h4 className="text-lg font-semibold text-green-800">
              Certification Management
            </h4>
            <p className="text-sm text-green-700">
              Configure certification and compliance tracking
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup title="Certification Features">
            <ToggleSwitch
              id="enable-auto-certification"
              checked={settings.enableAutoCertification}
              onChange={(checked) =>
                updateSetting('enableAutoCertification', checked)
              }
              label="Enable Auto-Certification"
            />
            <ToggleSwitch
              id="require-re-certification"
              checked={settings.requireReCertification}
              onChange={(checked) =>
                updateSetting('requireReCertification', checked)
              }
              label="Require Re-Certification"
            />
            <ToggleSwitch
              id="enable-certification-templates"
              checked={settings.enableCertificationTemplates}
              onChange={(checked) =>
                updateSetting('enableCertificationTemplates', checked)
              }
              label="Enable Certification Templates"
            />
          </FormGroup>

          <FormGroup title="Assessment Settings">
            <div>
              <label
                htmlFor="passing-score-threshold"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Passing Score Threshold
              </label>
              <input
                id="passing-score-threshold"
                type="number"
                min="50"
                max="100"
                value={settings.passingScoreThreshold}
                onChange={(e) =>
                  updateSetting(
                    'passingScoreThreshold',
                    parseInt(e.target.value)
                  )
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#4ECDC4] focus:ring-[#4ECDC4]"
              />
            </div>
            <div>
              <label
                htmlFor="max-assessment-attempts"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Max Assessment Attempts
              </label>
              <input
                id="max-assessment-attempts"
                type="number"
                min="1"
                max="10"
                value={settings.maxAssessmentAttempts}
                onChange={(e) =>
                  updateSetting(
                    'maxAssessmentAttempts',
                    parseInt(e.target.value)
                  )
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#4ECDC4] focus:ring-[#4ECDC4]"
              />
            </div>
            <div>
              <label
                htmlFor="certification-expiry-days"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Certification Expiry (Days)
              </label>
              <input
                id="certification-expiry-days"
                type="number"
                min="30"
                max="1095"
                value={settings.certificationExpiryDays}
                onChange={(e) =>
                  updateSetting(
                    'certificationExpiryDays',
                    parseInt(e.target.value)
                  )
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#4ECDC4] focus:ring-[#4ECDC4]"
              />
            </div>
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

export default CertificationsTab;
