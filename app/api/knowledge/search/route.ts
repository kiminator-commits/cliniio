import { NextRequest, NextResponse } from 'next/server';
import { enhancedSearchService } from '../../../../../src/services/knowledge/EnhancedSearchService';
import { optimizedKnowledgeSearch } from '../../../../../src/services/knowledge/OptimizedKnowledgeSearchService';
import { logger } from '../../../../../src/services/logging/structuredLogger';

export async function POST(req: NextRequest) {
  try {
    const { action, query, pagination, filters, facilityId } = await req.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required parameter: action' },
        { status: 400 }
      );
    }

    logger.info('Knowledge search API called', {
      module: 'knowledge-search-api',
      facilityId: facilityId || 'unknown'
    }, {
      action,
      query: query?.substring(0, 100),
      page: pagination?.page,
      limit: pagination?.limit
    });

    switch (action) {
      case 'search': {
        if (!query) {
          return NextResponse.json(
            { error: 'Missing required parameter: query' },
            { status: 400 }
          );
        }

        const searchPagination = pagination || { page: 1, limit: 10 };
        const searchFilters = { ...filters, facilityId };

        const searchResult = await enhancedSearchService.fullTextSearch(
          query,
          searchPagination,
          searchFilters
        );

        return NextResponse.json({
          success: true,
          result: searchResult
        });
      }

      case 'popular': {
        const popularArticles = await optimizedKnowledgeSearch.getPopularArticles(
          facilityId,
          pagination?.limit || 10
        );

        return NextResponse.json({
          success: true,
          articles: popularArticles
        });
      }

      case 'analytics': {
        const analytics = await enhancedSearchService.getSearchAnalytics(facilityId);
        return NextResponse.json({
          success: true,
          analytics
        });
      }

      case 'refresh-views': {
        await enhancedSearchService.refreshMaterializedViews();
        return NextResponse.json({
          success: true,
          message: 'Materialized views refreshed successfully'
        });
      }

      case 'clear-cache': {
        optimizedKnowledgeSearch.clearCache();
        return NextResponse.json({
          success: true,
          message: 'Search cache cleared successfully'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: search, popular, analytics, refresh-views, clear-cache' },
          { status: 400 }
        );
    }

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

      case 'analytics': {
        const analytics = await enhancedSearchService.getSearchAnalytics(facilityId || undefined);
        return NextResponse.json({
          success: true,
          analytics
        });
      }

      case 'cache-stats': {
        const cacheStats = optimizedKnowledgeSearch.getCacheStats();
        return NextResponse.json({
          success: true,
          cacheStats
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: popular, analytics, cache-stats' },
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
