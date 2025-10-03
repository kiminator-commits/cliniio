import React from 'react';
import Icon from '@mdi/react';
import { mdiCamera } from '@mdi/js';

interface BasicInfoForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  date_of_birth: string;
  bio: string;
  preferred_language: string;
  timezone: string;
}

interface BasicInfoTabProps {
  basicInfoForm: BasicInfoForm;
  setBasicInfoForm: React.Dispatch<React.SetStateAction<BasicInfoForm>>;
  userData: { avatar_url?: string } | null;
  uploadingPhoto: boolean;
  uploadProfilePhoto: (file: File) => Promise<void>;
  removeProfilePhoto: () => Promise<void>;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  basicInfoForm,
  setBasicInfoForm,
  userData,
  uploadingPhoto,
  uploadProfilePhoto,
  removeProfilePhoto,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h5 className="text-md font-medium text-gray-700 mb-4">
          Personal Information
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="first-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              value={basicInfoForm.first_name}
              onChange={(e) =>
                setBasicInfoForm((prev) => ({
                  ...prev,
                  first_name: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="last-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              value={basicInfoForm.last_name}
              onChange={(e) =>
                setBasicInfoForm((prev) => ({
                  ...prev,
                  last_name: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={basicInfoForm.email}
              onChange={(e) =>
                setBasicInfoForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={basicInfoForm.phone}
              onChange={(e) =>
                setBasicInfoForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Department
            </label>
            <input
              id="department"
              type="text"
              value={basicInfoForm.department}
              onChange={(e) =>
                setBasicInfoForm((prev) => ({
                  ...prev,
                  department: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Position
            </label>
            <input
              id="position"
              type="text"
              value={basicInfoForm.position}
              onChange={(e) =>
                setBasicInfoForm((prev) => ({
                  ...prev,
                  position: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="date-of-birth"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Date of Birth
            </label>
            <input
              id="date-of-birth"
              type="date"
              value={basicInfoForm.date_of_birth}
              onChange={(e) =>
                setBasicInfoForm((prev) => ({
                  ...prev,
                  date_of_birth: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              value={basicInfoForm.bio || ''}
              onChange={(e) =>
                setBasicInfoForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label
              htmlFor="preferred-language"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Preferred Language
            </label>
            <select
              id="preferred-language"
              value={basicInfoForm.preferred_language || 'en'}
              onChange={(e) =>
                setBasicInfoForm((prev) => ({
                  ...prev,
                  preferred_language: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Timezone
            </label>
            <select
              id="timezone"
              value={basicInfoForm.timezone || 'UTC'}
              onChange={(e) =>
                setBasicInfoForm((prev) => ({
                  ...prev,
                  timezone: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h5 className="text-md font-medium text-gray-700 mb-4">
          Profile Picture
        </h5>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {uploadingPhoto ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ECDC4]"></div>
              </div>
            ) : userData?.avatar_url ? (
              <img
                src={String(userData.avatar_url)}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <Icon path={mdiCamera} size={2} className="text-gray-400" />
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              id="profile-photo"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  uploadProfilePhoto(file);
                }
                // Reset the input value so the same file can be selected again
                e.target.value = '';
              }}
              className="hidden"
              disabled={uploadingPhoto}
            />
            <button
              type="button"
              className="px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors text-sm cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                if (uploadingPhoto) {
                  e.preventDefault();
                  return;
                }
                const input = document.getElementById(
                  'profile-photo'
                ) as HTMLInputElement;
                input.click();
              }}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
            </button>
            {userData?.avatar_url && (
              <button
                onClick={removeProfilePhoto}
                disabled={uploadingPhoto}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove Photo
              </button>
            )}
            <p className="text-xs text-gray-500">
              JPG, PNG or GIF. Max size 2MB.
            </p>
            {uploadingPhoto && (
              <p className="text-xs text-blue-600">Uploading photo...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
