import { enhancedRAGService } from './EnhancedRAGService';
import { logger } from '../../logging/structuredLogger';

export interface DocumentMigrationResult {
  success: boolean;
  documentId: string;
  title: string;
  chunksCreated: number;
  error?: string;
}

export interface MigrationProgress {
  totalDocuments: number;
  processedDocuments: number;
  successfulDocuments: number;
  failedDocuments: number;
  currentDocument?: string;
  errors: string[];
}

/**
 * Document Migration Service
 * Migrates existing knowledge base documents to vector embeddings
 */
export class DocumentMigrationService {
  private static instance: DocumentMigrationService;

  private constructor() {}

  static getInstance(): DocumentMigrationService {
    if (!DocumentMigrationService.instance) {
      DocumentMigrationService.instance = new DocumentMigrationService();
    }
    return DocumentMigrationService.instance;
  }

  /**
   * Migrate all existing knowledge base documents to vector embeddings
   */
  async migrateAllDocuments(facilityId?: string): Promise<MigrationProgress> {
    const progress: MigrationProgress = {
      totalDocuments: 0,
      processedDocuments: 0,
      successfulDocuments: 0,
      failedDocuments: 0,
      errors: []
    };

    try {
      logger.info('Starting document migration to vector embeddings', {
        module: 'document-migration',
        facilityId: facilityId || 'unknown'
      });

      // Get all existing documents from knowledge base
      const { supabase } = await import('@/lib/supabaseClient');
      
      let query = supabase
        .from('knowledge_articles')
        .select('id, title, content, category, source, facility_id, created_at, updated_at');

      if (facilityId) {
        query = query.eq('facility_id', facilityId);
      }

      const { data: documents, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      if (!documents || documents.length === 0) {
        logger.info('No documents found for migration', {
          module: 'document-migration',
          facilityId: facilityId || 'unknown'
        });
        return progress;
      }

      progress.totalDocuments = documents.length;

      logger.info('Found documents for migration', {
        module: 'document-migration',
        facilityId: facilityId || 'unknown'
      }, {
        totalDocuments: documents.length
      });

      // Process each document
      for (const doc of documents) {
        progress.currentDocument = doc.title;
        progress.processedDocuments++;

        try {
          const result = await this.migrateDocument(doc);
          
          if (result.success) {
            progress.successfulDocuments++;
            logger.info('Document migrated successfully', {
              module: 'document-migration',
              facilityId: facilityId || 'unknown'
            }, {
              documentId: doc.id,
              title: doc.title,
              chunksCreated: result.chunksCreated
            });
          } else {
            progress.failedDocuments++;
            progress.errors.push(`Failed to migrate ${doc.title}: ${result.error}`);
            logger.error('Document migration failed', {
              module: 'document-migration',
              facilityId: facilityId || 'unknown'
            }, {
              documentId: doc.id,
              title: doc.title,
              error: result.error
            });
          }

        } catch (error) {
          progress.failedDocuments++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          progress.errors.push(`Error migrating ${doc.title}: ${errorMessage}`);
          
          logger.error('Document migration error', {
            module: 'document-migration',
            facilityId: facilityId || 'unknown'
          }, {
            documentId: doc.id,
            title: doc.title,
            error: errorMessage
          });
        }
      }

      logger.info('Document migration completed', {
        module: 'document-migration',
        facilityId: facilityId || 'unknown'
      }, {
        totalDocuments: progress.totalDocuments,
        successfulDocuments: progress.successfulDocuments,
        failedDocuments: progress.failedDocuments
      });

      return progress;

    } catch (error) {
      logger.error('Document migration failed', {
        module: 'document-migration',
        facilityId: facilityId || 'unknown'
      }, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Migrate a single document to vector embeddings
   */
  private async migrateDocument(doc: any): Promise<DocumentMigrationResult> {
    try {
      // First, insert the document into the documents table
      const { supabase } = await import('@/lib/supabaseClient');
      
      const { data: insertedDoc, error: insertError } = await supabase
        .from('documents')
        .insert({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
          source: doc.source || 'knowledge_base',
          facility_id: doc.facility_id,
          created_at: doc.created_at,
          updated_at: doc.updated_at
        })
        .select()
        .single();

      if (insertError) {
        return {
          success: false,
          documentId: doc.id,
          title: doc.title,
          chunksCreated: 0,
          error: `Failed to insert document: ${insertError.message}`
        };
      }

      // Process the document for vector embeddings
      await enhancedRAGService.indexDocument(insertedDoc);

      // Get the number of chunks created
      const { data: chunks, error: chunksError } = await supabase
        .from('document_chunks')
        .select('id')
        .eq('document_id', doc.id);

      if (chunksError) {
        return {
          success: false,
          documentId: doc.id,
          title: doc.title,
          chunksCreated: 0,
          error: `Failed to count chunks: ${chunksError.message}`
        };
      }

      return {
        success: true,
        documentId: doc.id,
        title: doc.title,
        chunksCreated: chunks?.length || 0
      };

    } catch (error) {
      return {
        success: false,
        documentId: doc.id,
        title: doc.title,
        chunksCreated: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get migration status for a facility
   */
  async getMigrationStatus(facilityId?: string): Promise<{
    totalDocuments: number;
    migratedDocuments: number;
    migrationProgress: number;
    lastMigration?: string;
  }> {
    try {
      const { supabase } = await import('@/lib/supabaseClient');

      // Count total knowledge articles
      let knowledgeQuery = supabase.from('knowledge_articles').select('id', { count: 'exact' });
      if (facilityId) {
        knowledgeQuery = knowledgeQuery.eq('facility_id', facilityId);
      }
      const { count: totalDocuments } = await knowledgeQuery;

      // Count migrated documents
      let documentsQuery = supabase.from('documents').select('id', { count: 'exact' });
      if (facilityId) {
        documentsQuery = documentsQuery.eq('facility_id', facilityId);
      }
      const { count: migratedDocuments } = await documentsQuery;

      // Get last migration time
      const { data: lastDoc } = await supabase
        .from('documents')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const migrationProgress = totalDocuments ? (migratedDocuments / totalDocuments) * 100 : 0;

      return {
        totalDocuments: totalDocuments || 0,
        migratedDocuments: migratedDocuments || 0,
        migrationProgress: Math.round(migrationProgress * 100) / 100,
        lastMigration: lastDoc?.created_at
      };

    } catch (error) {
      logger.error('Failed to get migration status', {
        module: 'document-migration',
        facilityId: facilityId || 'unknown'
      }, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Clean up failed migrations
   */
  async cleanupFailedMigrations(facilityId?: string): Promise<{
    cleanedDocuments: number;
    cleanedChunks: number;
  }> {
    try {
      const { supabase } = await import('@/lib/supabaseClient');

      // Find documents without chunks (failed migrations)
      const { data: orphanedDocs } = await supabase
        .from('documents')
        .select('id')
        .not('id', 'in', 
          supabase
            .from('document_chunks')
            .select('document_id')
        );

      if (!orphanedDocs || orphanedDocs.length === 0) {
        return { cleanedDocuments: 0, cleanedChunks: 0 };
      }

      // Delete orphaned documents (this will cascade to chunks)
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .in('id', orphanedDocs.map(doc => doc.id));

      if (deleteError) {
        throw new Error(`Failed to clean up documents: ${deleteError.message}`);
      }

      logger.info('Cleaned up failed migrations', {
        module: 'document-migration',
        facilityId: facilityId || 'unknown'
      }, {
        cleanedDocuments: orphanedDocs.length
      });

      return {
        cleanedDocuments: orphanedDocs.length,
        cleanedChunks: 0 // Cascaded deletion
      };

    } catch (error) {
      logger.error('Failed to cleanup migrations', {
        module: 'document-migration',
        facilityId: facilityId || 'unknown'
      }, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

// Export singleton instance
export const documentMigrationService = DocumentMigrationService.getInstance();
