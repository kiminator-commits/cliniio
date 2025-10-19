import { NextRequest, NextResponse } from 'next/server';
import { optimizedKnowledgeSearch } from '../../../../../src/services/knowledge/OptimizedKnowledgeSearchService';
import { logger } from '../../../../../src/services/logging/structuredLogger';

export async function POST(req: NextRequest) {
  try {
    const { query, page = 1, limit = 10, facilityId, source } = await req.json();

    logger.info('Knowledge search API called', {
      module: 'knowledge-search-api',
      facilityId: facilityId || 'unknown'
    }, {
      query: query?.substring(0, 100),
      page,
      limit,
      source
    });

    const pagination = { page, limit };
    const filters = { facilityId, source };

    const result = await optimizedKnowledgeSearch.searchKnowledgeArticles(
      query || '',
      pagination,
      filters
    );

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Knowledge search API error', {
      module: 'knowledge-search-api'
    }, {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: 'Knowledge search failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const facilityId = url.searchParams.get('facilityId');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    logger.info('Knowledge search GET API called', {
      module: 'knowledge-search-api',
      facilityId: facilityId || 'unknown'
    }, {
      action,
      limit
    });

    switch (action) {
      case 'popular': {
        const popularArticles = await optimizedKnowledgeSearch.getPopularArticles(
          facilityId || undefined,
          limit
        );

        return NextResponse.json({
          success: true,
          articles: popularArticles
        });
      }

      case 'cache-stats': {
        const cacheStats = optimizedKnowledgeSearch.getCacheStats();
        return NextResponse.json({
          success: true,
          cacheStats
        });
      }

      case 'clear-cache':
        optimizedKnowledgeSearch.clearCache();
        return NextResponse.json({
          success: true,
          message: 'Search cache cleared successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: popular, cache-stats, clear-cache' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Knowledge search GET API error', {
      module: 'knowledge-search-api'
    }, {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: 'Knowledge search failed' },
      { status: 500 }
    );
  }
}
