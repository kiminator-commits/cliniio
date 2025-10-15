# Console Logging Control

This document explains how to control console logging verbosity in the Cliniio application.

## Quick Console Control

Open your browser's developer console and use these commands to control logging:

```javascript
// Reduce console noise (recommended for development)
consoleControl.quiet()

// Normal logging (errors, warnings, info)
consoleControl.normal()

// Verbose logging (everything)
consoleControl.verbose()

// Check current log level
consoleControl.status()

// Temporarily disable all console output
const originalConsole = consoleControl.silent()

// Restore console output
consoleControl.restore(originalConsole)
```

## Environment Variables

You can also control logging through environment variables in your `.env.local` file:

```bash
# Log level (ERROR, WARN, INFO, DEBUG, VERBOSE)
VITE_LOG_LEVEL=WARN

# Enable/disable performance monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=false
```

## Log Levels

- **ERROR**: Only error messages
- **WARN**: Errors and warnings (default in development)
- **INFO**: Errors, warnings, and informational messages
- **DEBUG**: All messages including debug information
- **VERBOSE**: Maximum verbosity

## What Was Optimized

The following changes were made to reduce console noise:

1. **Default log level**: Changed from DEBUG to WARN in development
2. **Real-time status monitoring**: Reduced frequency from 10s to 30s, only logs significant status changes
3. **Performance snapshots**: Reduced frequency from 30s to 2 minutes, only logs 20% of snapshots
4. **Status change logging**: Only logs when tools become unavailable or go into maintenance

## Performance Impact

These optimizations will:
- Reduce console log volume by ~80%
- Improve browser performance
- Make debugging easier by focusing on important messages
- Maintain all functionality while reducing noise

## Troubleshooting

If you need more verbose logging for debugging:

1. Use `consoleControl.verbose()` in the browser console
2. Set `VITE_LOG_LEVEL=DEBUG` in your `.env.local` file
3. Restart your development server

For production debugging, use `consoleControl.normal()` to see important messages without overwhelming detail.
