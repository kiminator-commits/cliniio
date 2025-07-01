import { HOME_UI_CONSTANTS } from '../constants/homeUiConstants';
import clsx from 'clsx';

export const calculateNavBarMargins = (drawerOpen: boolean) => {
  // Menu icon width + desired gap (12px + 60px)
  const navBarMarginLeft = drawerOpen
    ? HOME_UI_CONSTANTS.NAV_BAR_MARGIN_LEFT_DRAWER_OPEN
    : HOME_UI_CONSTANTS.NAV_BAR_MARGIN_LEFT_DRAWER_CLOSED;
  // Top margin to align with Cliniio logo
  const navBarMarginTop = HOME_UI_CONSTANTS.NAV_BAR_MARGIN_TOP;

  return {
    navBarMarginLeft,
    navBarMarginTop,
  };
};

export function getSectionCardClass() {
  return clsx(HOME_UI_CONSTANTS.sectionBox, 'mb-4');
}

export function getTaskCardClass() {
  return clsx(HOME_UI_CONSTANTS.taskCard, 'mb-4');
}

export function getLeaderboardSectionClass() {
  return clsx(HOME_UI_CONSTANTS.sectionBox, 'mb-4', 'lg:col-span-6');
}
