import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { InventoryItem } from '@/types/inventoryTypes';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useTrackedTools } from '@/hooks/inventory/useTrackedTools';
import tableStyles from './TableStyles.module.css';
import actionStyles from './TableActions.module.css';
import Icon from '@mdi/react';
import { mdiStar, mdiEye } from '@mdi/js';

interface TableActionsRef {
  focusEdit: () => void;
  focusFavorite: () => void;
  focusTrack: () => void;
  focusDelete: () => void;
}

interface TableActionsProps {
  item: InventoryItem;
  activeTab: string;
  onEdit: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onToggleFavorite?: (itemId: string) => void;
  onTrackToggle?: (item: InventoryItem) => void;
  isTracked?: boolean;
}

const TableActions = React.memo(
  forwardRef<TableActionsRef | null, TableActionsProps>(
    (
      {
        item,
        activeTab,
        onEdit,
        onDelete: _onDelete,
        onToggleFavorite,
        onTrackToggle,
        isTracked = false,
      },
      ref
    ) => {
      const { favorites, toggleFavorite, openDeleteModal } =
        useInventoryStore();
      const { getToolTrackers } = useTrackedTools();
      const isFavorite = favorites.includes(item.id);

      // Get queue information for this tool
      const queueInfo = getToolTrackers(item.id);
      const queueCount = queueInfo.length;
      const isInQueue = queueInfo.some(
        (tracker) => tracker.doctorName === 'Current Doctor'
      ); // You'd get actual doctor name

      // Find your position in the queue (this would need actual user identification)
      const yourPosition = isInQueue
        ? queueInfo.findIndex(
            (tracker) => tracker.doctorName === 'Current Doctor'
          ) + 1
        : 0;

      // Handle edit action
      const handleEditItem = (item: InventoryItem) => {
        onEdit(item);
      };

      const editButtonRef = useRef<HTMLButtonElement>(null);
      const favoriteButtonRef = useRef<HTMLButtonElement>(null);
      const trackButtonRef = useRef<HTMLButtonElement>(null);
      const deleteButtonRef = useRef<HTMLButtonElement>(null);

      useImperativeHandle(
        ref,
        (): TableActionsRef => ({
          focusEdit: () => editButtonRef.current?.focus(),
          focusFavorite: () => favoriteButtonRef.current?.focus(),
          focusTrack: () => trackButtonRef.current?.focus(),
          focusDelete: () => deleteButtonRef.current?.focus(),
        })
      );

      const handleActionKeyDown = (
        event: React.KeyboardEvent,
        buttonType: string
      ) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          switch (buttonType) {
            case 'edit':
              onEdit(item);
              break;
            case 'favorite':
              toggleFavorite(item.id);
              break;
            case 'track':
              onTrackToggle?.(item);
              break;
            case 'delete':
              handleDeleteClick();
              break;
          }
        }
      };

      const handleTrackToggle = () => {
        onTrackToggle?.(item);
      };

      const handleFavoriteToggle = () => {
        if (onToggleFavorite) {
          onToggleFavorite(item.id);
        } else {
          toggleFavorite(item.id);
        }
      };

      const handleDeleteClick = () => {
        openDeleteModal(item);
      };

      const trackingTooltip = isTracked
        ? `Stop tracking (You are ${yourPosition}/${queueCount} in queue)`
        : `Start tracking (${queueCount} in queue)`;

      return (
        <td className={tableStyles.tableCell}>
          <div className={tableStyles.actionGroup}>
            {/* Edit button */}
            <button
              ref={editButtonRef}
              onClick={() => handleEditItem(item)}
              onKeyDown={(e) => handleActionKeyDown(e, 'edit')}
              className={`${tableStyles.actionButton} ${tableStyles.editButton} text-xs px-2 py-0.5 flex items-center`}
              aria-label={`Edit ${item.name || 'item'}`}
              tabIndex={0}
            >
              <svg
                className="inline-block mr-1"
                width="12"
                height="12"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M15.502 1.94a1.5 1.5 0 0 1 0 2.12l-1.439 1.439-2.12-2.12 1.439-1.439a1.5 1.5 0 0 1 2.12 0zm-2.561 2.561-9.193 9.193a.5.5 0 0 0-.121.196l-1 3a.5.5 0 0 0 .633.633l3-1a.5.5 0 0 0 .196-.12l9.193-9.194-2.12-2.12z" />
              </svg>
              Edit
            </button>

            {/* Favorite button - only for tools */}
            {activeTab === 'tools' && (
              <button
                ref={favoriteButtonRef}
                onClick={handleFavoriteToggle}
                onKeyDown={(e) => handleActionKeyDown(e, 'favorite')}
                className={`${tableStyles.actionButton} ${
                  isFavorite
                    ? '!text-yellow-500 !bg-yellow-50 !border-yellow-200 hover:!text-yellow-600'
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                } transition-colors duration-200`}
                aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
                aria-pressed={isFavorite}
                tabIndex={0}
              >
                <Icon
                  path={mdiStar}
                  size={0.8}
                  className={isFavorite ? 'fill-current' : ''}
                  aria-hidden="true"
                />
              </button>
            )}

            {/* Track button - only for tools and supplies */}
            {(activeTab === 'tools' || activeTab === 'supplies') && (
              <div className={actionStyles.tooltipContainer}>
                <button
                  ref={trackButtonRef}
                  onClick={handleTrackToggle}
                  onKeyDown={(e) => handleActionKeyDown(e, 'track')}
                  className={`${tableStyles.actionButton} ${tableStyles.trackButton} ${
                    isTracked ? tableStyles.tracked : ''
                  } relative`}
                  aria-label={trackingTooltip}
                  aria-pressed={isTracked}
                  tabIndex={0}
                >
                  <Icon path={mdiEye} size={1.2} aria-hidden="true" />
                  {queueCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {queueCount}
                    </span>
                  )}
                </button>
                <div className={actionStyles.tooltipContent}>
                  {trackingTooltip}
                  <div className={actionStyles.tooltipArrow}></div>
                </div>
              </div>
            )}
            {/* Delete button */}
            <button
              ref={deleteButtonRef}
              onClick={handleDeleteClick}
              onKeyDown={(e) => handleActionKeyDown(e, 'delete')}
              className={`${tableStyles.actionButton} ${tableStyles.deleteButton} text-xs px-2 py-0.5 flex items-center`}
              aria-label={`Delete ${item.name || 'item'}`}
              tabIndex={0}
            >
              <svg
                className="inline-block mr-1"
                width="12"
                height="12"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path
                  fillRule="evenodd"
                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                />
              </svg>
              Delete
            </button>
          </div>
        </td>
      );
    }
  )
);

TableActions.displayName = 'TableActions';

export default TableActions;
