import { NextRequest, NextResponse } from 'next/server';
import { documentMigrationService } from '../../../src/services/ai/rag/DocumentMigrationService';
import { logger } from '../../../src/services/logging/structuredLogger';

export async function POST(req: NextRequest) {
  try {
    const { facilityId, action } = await req.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required parameter: action' },
        { status: 400 }
      );
    }

    logger.info('Document migration API called', {
      module: 'document-migration-api',
      facilityId: facilityId || 'unknown'
    }, {
      action,
      facilityId
    });

    switch (action) {
      case 'migrate': {
        const migrationResult = await documentMigrationService.migrateAllDocuments(facilityId);
        return NextResponse.json({
          success: true,
          result: migrationResult
        });
      }

      case 'status': {
        const status = await documentMigrationService.getMigrationStatus(facilityId);
        return NextResponse.json({
          success: true,
          status
        });
      }

      case 'cleanup': {
        const cleanupResult = await documentMigrationService.cleanupFailedMigrations(facilityId);
        return NextResponse.json({
          success: true,
          result: cleanupResult
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: migrate, status, cleanup' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Document migration API error', {
      module: 'document-migration-api'
    }, {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: 'Document migration failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const facilityId = url.searchParams.get('facilityId');

    logger.info('Document migration status requested', {
      module: 'document-migration-api',
      facilityId: facilityId || 'unknown'
    });

    const status = await documentMigrationService.getMigrationStatus(facilityId || undefined);

    return NextResponse.json({
      success: true,
      status
    });

  } catch (error) {
    logger.error('Document migration status API error', {
      module: 'document-migration-api'
    }, {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: 'Failed to get migration status' },
      { status: 500 }
    );
  }
}
