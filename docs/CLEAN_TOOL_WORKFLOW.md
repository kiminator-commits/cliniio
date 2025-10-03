# Clean Tool Workflow

## Overview

The Clean Tool Workflow is designed for clinicians who need to quickly scan tools before using them on patients. This workflow ensures traceability compliance while maintaining a simple, seamless experience for busy medical professionals.

## Features

### 1. Simple Traceability Codes

- **Format**: Letter + Number (e.g., A1, B2, C3)
- **Daily Consistency**: Same code generated for the entire day
- **Easy to Type**: Simple format for quick EMR entry
- **Traceable**: Can be used to track tool usage in case of issues (failed BIs, MRSA, etc.)

### 2. Mobile-Friendly Interface

- **Responsive Design**: Optimized for mobile devices
- **Large Code Display**: Prominent code display for easy reading
- **Copy Functionality**: One-tap copy to clipboard
- **Quick Workflow**: Minimal steps from scan to completion

### 3. Tool Status Management

- **Automatic Status Update**: Tools are marked as "dirty" after use
- **Inventory Integration**: Changes reflected immediately in inventory system
- **Audit Trail**: All actions logged for compliance

## How to Use

### Step 1: Access the Scanner

1. Navigate to the Sterilization section
2. Click "Scan Tool" button
3. Select "Clean Tool" workflow

### Step 2: Scan the Tool

1. Position the tool's barcode in the camera view
2. Click the scan button or use mobile shortcut
3. Wait for scan confirmation

### Step 3: Get Traceability Code

1. After successful scan, the workflow result screen appears
2. **Prominently displayed traceability code** (e.g., "A1")
3. Click "Copy Code" to copy to clipboard
4. Enter this code in your patient's EMR chart

### Step 4: Confirm and Close

1. Review the status update (tool marked as dirty)
2. Click "Confirm & Close" to complete the workflow

## Mobile Configuration

### Shortcuts Setup

The Clean Tool Workflow integrates with existing mobile settings:

1. Go to **Settings** → **Profile & Account**
2. Scroll to **Mobile Device Shortcuts**
3. Configure **Clean Scans** shortcut:
   - Enable/disable the shortcut
   - Set shortcut name
   - Choose physical shortcut (e.g., Volume Down + Power)

### Available Shortcuts

- Double-tap back
- Volume Up + Down
- Volume Down + Power
- Camera button long press
- Side button double-tap
- Home screen widget
- Lock screen action

## Technical Details

### Code Generation

- **Algorithm**: Based on day of year for daily consistency
- **Range**: A1-Z9 (26 letters × 9 numbers = 234 unique daily codes)
- **Validation**: Ensures proper format (Letter + Number 1-9)

### Status Changes

- **Before**: Tool status = "complete" (ready for use)
- **After**: Tool status = "failed" (marked as dirty)
- **Inventory**: Immediately unavailable for other users

### Audit Logging

All workflow actions are logged with:

- Tool ID and name
- Barcode scanned
- Traceability code generated
- Timestamp
- User information

## Compliance Benefits

### Traceability

- **Patient Safety**: Track which tools were used on which patients
- **Infection Control**: Quick identification in case of contamination
- **Regulatory Compliance**: Meets healthcare traceability requirements

### Documentation

- **EMR Integration**: Simple codes for patient chart entry
- **Audit Trail**: Complete history of tool usage
- **Quality Assurance**: Track sterilization compliance

## Troubleshooting

### Common Issues

**Code not displaying**

- Ensure tool is in "complete" status
- Check that scan was successful
- Refresh page if needed

**Tool not found**

- Verify barcode is properly scanned
- Check if tool exists in inventory
- Ensure tool is in correct status

**Copy not working**

- Check browser clipboard permissions
- Try manual copy/paste
- Ensure mobile device supports clipboard API

### Support

For technical issues, contact your system administrator or refer to the Knowledge Hub for additional documentation.
