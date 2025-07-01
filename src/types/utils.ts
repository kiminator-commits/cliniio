import { ChangeEvent } from 'react';
import { FormControlElement } from 'react-bootstrap';

export type FormControlChangeEvent = ChangeEvent<FormControlElement>;

export type FormControlChangeHandler = (e: FormControlChangeEvent) => void;

export type StatusType =
  | 'In Stock'
  | 'Low Stock'
  | 'Out of Stock'
  | 'Available'
  | 'Active'
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
  | 'PublicAreas';
