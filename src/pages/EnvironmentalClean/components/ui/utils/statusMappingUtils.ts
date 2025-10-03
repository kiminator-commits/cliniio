import {
  mdiBroom,
  mdiProgressClock,
  mdiCheckCircle,
  mdiBiohazard,
  mdiShieldAlert,
  mdiPackageVariant,
  mdiWrench,
  mdiOfficeBuilding,
} from '@mdi/js';
import { StatusMappingConfig } from '../types/RoomStatusTypes';

export const createStatusMappingConfig = (): StatusMappingConfig => {
  const iconMap: Record<string, string> = {
    default: mdiShieldAlert, // Default fallback icon
    broom: mdiBroom,
    'progress-clock': mdiProgressClock,
    'check-circle': mdiCheckCircle,
    biohazard: mdiBiohazard,
    'shield-alert': mdiShieldAlert,
    'package-variant': mdiPackageVariant,
    wrench: mdiWrench,
    'office-building': mdiOfficeBuilding,
    'account-supervisor': mdiShieldAlert,
    'shield-lock': mdiShieldAlert,
    'shield-cross': mdiShieldAlert,
    'help-circle': mdiShieldAlert,
    'alert-circle': mdiShieldAlert,
    account: mdiShieldAlert,
    'clipboard-check': mdiShieldAlert,
  };

  const colorMap: Record<string, string> = {
    '#16a34a': '#16a34a',
    '#dc2626': '#dc2626',
    '#ca8a04': '#ca8a04',
    '#9333ea': '#9333ea',
    '#4b5563': '#4b5563',
    '#b45309': '#b45309',
    '#047857': '#047857',
    '#8B5CF6': '#8B5CF6',
    '#EA580C': '#EA580C',
    '#9CA3AF': '#9CA3AF',
    '#059669': '#059669',
    '#3B82F6': '#3B82F6',
    '#F59E0B': '#F59E0B',
  };

  const bgColorMap: Record<string, string> = {
    '#16a34a': 'bg-green-100',
    '#dc2626': 'bg-red-100',
    '#ca8a04': 'bg-yellow-100',
    '#9333ea': 'bg-purple-100',
    '#4b5563': 'bg-gray-100',
    '#b45309': 'bg-amber-100',
    '#047857': 'bg-emerald-100',
    '#8B5CF6': 'bg-purple-100',
    '#EA580C': 'bg-amber-100',
    '#9CA3AF': 'bg-gray-100',
    '#059669': 'bg-green-100',
    '#3B82F6': 'bg-blue-100',
    '#F59E0B': 'bg-amber-100',
  };

  const borderColorMap: Record<string, string> = {
    '#16a34a': 'border-green-500',
    '#dc2626': 'border-red-500',
    '#ca8a04': 'border-yellow-500',
    '#9333ea': 'border-purple-500',
    '#4b5563': 'border-gray-500',
    '#b45309': 'border-amber-500',
    '#047857': 'border-emerald-500',
    '#8B5CF6': 'border-purple-500',
    '#EA580C': 'border-amber-500',
    '#9CA3AF': 'border-gray-500',
    '#059669': 'border-green-500',
    '#3B82F6': 'border-blue-500',
    '#F59E0B': 'border-amber-500',
  };

  const bgColorSelectedMap: Record<string, string> = {
    '#16a34a': 'bg-green-50',
    '#dc2626': 'bg-red-50',
    '#ca8a04': 'bg-yellow-50',
    '#9333ea': 'bg-purple-50',
    '#4b5563': 'bg-gray-50',
    '#b45309': 'bg-amber-50',
    '#047857': 'bg-emerald-50',
    '#8B5CF6': 'bg-purple-50',
    '#EA580C': 'bg-amber-50',
    '#9CA3AF': 'bg-gray-50',
    '#059669': 'bg-green-50',
    '#3B82F6': 'bg-blue-50',
    '#F59E0B': 'bg-amber-50',
  };

  const textColorMap: Record<string, string> = {
    '#16a34a': 'text-green-600',
    '#dc2626': 'text-red-600',
    '#ca8a04': 'text-yellow-600',
    '#9333ea': 'text-purple-600',
    '#4b5563': 'text-gray-600',
    '#b45309': 'text-amber-600',
    '#047857': 'text-emerald-600',
    '#8B5CF6': 'text-purple-600',
    '#EA580C': 'text-amber-600',
    '#9CA3AF': 'text-gray-600',
    '#059669': 'text-green-600',
    '#3B82F6': 'text-blue-600',
    '#F59E0B': 'text-amber-600',
  };

  return {
    iconMap,
    colorMap,
    bgColorMap,
    borderColorMap,
    bgColorSelectedMap,
    textColorMap,
  };
};

export const getStatusIcon = (
  iconName: string,
  iconMap: Record<string, string>
): string => {
  return iconMap[iconName] || mdiShieldAlert;
};

export const getStatusColor = (
  color: string,
  colorMap: Record<string, string>
): string => {
  return colorMap[color] || '#4b5563';
};

export const getStatusBgColor = (
  color: string,
  bgColorMap: Record<string, string>
): string => {
  return bgColorMap[color] || 'bg-gray-100';
};

export const getStatusBorderColor = (
  color: string,
  borderColorMap: Record<string, string>
): string => {
  return borderColorMap[color] || 'border-gray-500';
};

export const getStatusBgColorSelected = (
  color: string,
  bgColorSelectedMap: Record<string, string>
): string => {
  return bgColorSelectedMap[color] || 'bg-gray-50';
};

export const getStatusTextColor = (
  color: string,
  textColorMap: Record<string, string>
): string => {
  return textColorMap[color] || 'text-gray-600';
};
