import { ChangeEvent } from 'react';

export type FormControlElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;
export type FormControlChangeEvent = ChangeEvent<FormControlElement>;

export type FormControlChangeHandler = (event: FormControlChangeEvent) => void;

export type StatusType =
  | 'In Stock'
  | 'Low Stock'
  | 'Out of Stock'
  | 'Available'
  | 'In Use'
  | 'Operational';

export type RoomStatusType =
  | 'Dirty'
  | 'LowInventory'
  | 'Biohazard'
  | 'Theft'
  | 'InProgress'
  | 'Supervisor'
  | 'Isolation'
  | 'Quarantine'
  | 'OutOfService'
  | 'Unassigned'
  | 'Available'
  | 'PublicAreas'
  | 'IN USE';
