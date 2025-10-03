import {
  UserProfileData,
  BasicInformationFormData,
} from '../types/UserProfileTypes';

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRoleBadgeColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'technician':
      return 'bg-blue-100 text-blue-800';
    case 'nurse':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getDefaultUserData = (): UserProfileData => ({
  id: '',
  email: '',
  full_name: '',
  role: 'user',
  facility_id: null,
  department: null,
  position: null,
  phone: null,
  avatar_url: null,
  preferences: {},
  last_login: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const getDefaultFormData = (
  userData: UserProfileData
): BasicInformationFormData => ({
  first_name: userData.full_name?.split(' ')[0] || '',
  last_name: userData.full_name?.split(' ').slice(1).join(' ') || '',
  email: userData.email,
  phone: userData.phone || '',
  department: userData.department || '',
  position: userData.position || '',
  date_of_birth: '',
});

export const getDefaultPasswordData = () => ({
  currentPassword: '*********',
  newPassword: '',
  confirmPassword: '',
});
