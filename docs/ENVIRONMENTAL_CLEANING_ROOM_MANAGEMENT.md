# Environmental Cleaning Room Management System

## Overview

The Environmental Cleaning Room Management System allows administrators to create and manage rooms for cleaning workflows. Staff can scan room barcodes to track cleaning status and completion.

## Workflow

### 1. Admin Setup (Settings Page)

**Location**: Settings → Environmental Cleaning → Room Management

**Actions**:

- Create rooms with custom names (treatment rooms, back rooms, public areas, etc.)
- Assign barcodes to each room (manual entry or auto-generate)
- Set department and floor information
- Activate/deactivate rooms as needed

**Example Room Creation**:

- Name: "Operating Room 1"
- Barcode: "OR001"
- Department: "Surgery"
- Floor: "2nd Floor"

### 2. Staff Workflow (Environmental Clean Page)

**Location**: Environmental Clean page

**Process**:

1. **Scan Room**: Staff clicks "Scan Room" button
2. **Enter Barcode**: Staff enters room barcode (e.g., "OR001")
3. **Room Data Populates**: System finds room and displays information
4. **Update Status**: Staff can update room status (Dirty, In Progress, Clean)
5. **Complete Cleaning**: When cleaning is finished, staff marks room as complete
6. **Move to Completed**: Room moves to completed rooms dashboard

## Technical Implementation

### Data Flow

1. **Room Store** (`src/store/roomStore.ts`)
   - Stores room data with barcodes
   - Provides methods for CRUD operations
   - Includes `getRoomByBarcode()` method for scanning

2. **Bridge Hook** (`src/hooks/useEnvironmentalCleanRooms.ts`)
   - Connects room store to Environmental Clean system
   - Converts room data to Environmental Clean format

3. **Environmental Clean Service** (`src/pages/EnvironmentalClean/services/EnvironmentalCleanService.ts`)
   - Handles barcode scanning logic
   - Updates room status
   - Manages cleaning completion

4. **Environmental Clean Store** (`src/pages/EnvironmentalClean/store/environmentalCleanStore.ts`)
   - Manages Environmental Clean state
   - Handles room scanning and status updates

### Key Components

- **RoomManagement** (`src/components/Settings/RoomManagement.tsx`)
  - Admin interface for creating/managing rooms
  - Includes barcode generation functionality

- **EnvironmentalCleanScanModal** (`src/pages/EnvironmentalClean/components/EnvironmentalCleanScanModal.tsx`)
  - Staff interface for scanning room barcodes
  - Displays scanned room information
  - Allows status updates

- **EnvironmentalCleanContent** (`src/pages/EnvironmentalClean/components/EnvironmentalCleanContent.tsx`)
  - Main Environmental Clean page
  - Integrates scanning workflow

## Sample Barcodes

The system includes sample barcodes for testing:

- OR001 (Operating Room 1)
- ICU101 (ICU Room 101)
- SUP001 (Supply Room A)
- ER001 (Emergency Room)
- LAB001 (Laboratory)
- RAD001 (Radiology)
- PHY001 (Physiotherapy)
- ADM001 (Administration)

## Usage Instructions

### For Administrators

1. Navigate to Settings → Environmental Cleaning
2. Click "Add Room" to create a new room
3. Enter room details:
   - Name (e.g., "Treatment Room 2")
   - Department (e.g., "Emergency")
   - Floor (e.g., "1st Floor")
   - Barcode (enter manually or click "Generate")
4. Click "Add Room" to save

### For Staff

1. Navigate to Environmental Clean page
2. Click "Scan Room" button
3. Enter room barcode (e.g., "OR001")
4. Review room information displayed
5. Update room status if needed
6. Click "Complete Cleaning" when finished

## Status Types

- **Dirty**: Room needs cleaning
- **In Progress**: Cleaning is currently being performed
- **Clean**: Room has been cleaned and is ready for use

## Benefits

- **Centralized Management**: All rooms managed in one place
- **Barcode Integration**: Easy scanning workflow for staff
- **Status Tracking**: Real-time status updates
- **Audit Trail**: Complete logging of cleaning activities
- **Flexible Naming**: Custom room names for any facility type
