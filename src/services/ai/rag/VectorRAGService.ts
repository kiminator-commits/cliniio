import { supabase } from '@/lib/supabaseClient';
import { logger } from '../../logging/structuredLogger';

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  embedding: number[];
  chunk_index: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  facility_id?: string;
  created_at: string;
  updated_at: string;
}

export interface VectorSearchResult {
  chunk: DocumentChunk;
  document: Document;
  similarity: number;
  relevance_score: number;
}

export interface RAGContext {
  query: string;
  results: VectorSearchResult[];
  total_results: number;
  search_time_ms: number;
}

/**
 * Vector RAG Pipeline Service
 * Handles document chunking, embeddings, and semantic search
 */
export class VectorRAGService {
  private static instance: VectorRAGService;
  private readonly CHUNK_SIZE = 1000; // Characters per chunk
  private readonly CHUNK_OVERLAP = 200; // Overlap between chunks
  private readonly MAX_RESULTS = 10;

  private constructor() {}

  static getInstance(): VectorRAGService {
    if (!VectorRAGService.instance) {
      VectorRAGService.instance = new VectorRAGService();
    }
    return VectorRAGService.instance;
  }

  /**
   * Process and chunk a document for vector storage
   */
  async processDocument(document: Document): Promise<void> {
    try {
      logger.info('Processing document for vector storage', {
        module: 'vector-rag',
        facilityId: document.facility_id
      }, {
        documentId: document.id,
        title: document.title,
        contentLength: document.content.length
      });

      // Delete existing chunks for this document
      await supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', document.id);

      // Chunk the document
      const chunks = this.chunkDocument(document.content, document.id);

      // Generate embeddings for each chunk
      const chunksWithEmbeddings = await Promise.all(
        chunks.map(async (chunk) => ({
          ...chunk,
          embedding: await this.generateEmbedding(chunk.content)
        }))
      );

      // Store chunks in database
      const { error } = await supabase
        .from('document_chunks')
        .insert(chunksWithEmbeddings);

      if (error) {
        throw new Error(`Failed to store document chunks: ${error.message}`);
      }

      logger.info('Document processed successfully', {
        module: 'vector-rag',
        facilityId: document.facility_id
      }, {
        documentId: document.id,
        chunksCreated: chunksWithEmbeddings.length
      });

    } catch (error) {
      logger.error('Failed to process document', {
        module: 'vector-rag',
        facilityId: document.facility_id
      }, {
        documentId: document.id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Perform semantic search using vector embeddings
   */
  async semanticSearch(
    query: string,
    facilityId?: string,
    category?: string,
    limit: number = this.MAX_RESULTS
  ): Promise<RAGContext> {
    const startTime = Date.now();

    try {
      logger.info('Performing semantic search', {
        module: 'vector-rag',
        facilityId: facilityId || 'unknown'
      }, {
        query: query.substring(0, 100),
        category,
        limit
      });

      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Build the search query
      let searchQuery = supabase
        .from('document_chunks')
        .select(`
          *,
          documents!inner(
            id,
            title,
            content,
            category,
            source,
            facility_id,
            created_at,
            updated_at
          )
        `)
        .limit(limit);

      // Add facility filter if provided
      if (facilityId) {
        searchQuery = searchQuery.eq('documents.facility_id', facilityId);
      }

      // Add category filter if provided
      if (category) {
        searchQuery = searchQuery.eq('documents.category', category);
      }

      // Perform vector similarity search
      const { data, error } = await searchQuery;

      if (error) {
        throw new Error(`Vector search failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          query,
          results: [],
          total_results: 0,
          search_time_ms: Date.now() - startTime
        };
      }

      // Calculate similarity scores
      const results: VectorSearchResult[] = data.map((row) => {
        const similarity = this.calculateCosineSimilarity(queryEmbedding, row.embedding);
        const relevanceScore = this.calculateRelevanceScore(query, row.content, similarity);

        return {
          chunk: {
            id: row.id,
            document_id: row.document_id,
            content: row.content,
            embedding: row.embedding,
            chunk_index: row.chunk_index,
            metadata: row.metadata,
            created_at: row.created_at
          },
          document: {
            id: row.documents.id,
            title: row.documents.title,
            content: row.documents.content,
            category: row.documents.category,
            source: row.documents.source,
            facility_id: row.documents.facility_id,
            created_at: row.documents.created_at,
            updated_at: row.documents.updated_at
          },
          similarity,
          relevance_score: relevanceScore
        };
      });

      // Sort by relevance score
      results.sort((a, b) => b.relevance_score - a.relevance_score);

      const searchTime = Date.now() - startTime;

      logger.info('Semantic search completed', {
        module: 'vector-rag',
        facilityId: facilityId || 'unknown'
      }, {
        query: query.substring(0, 100),
        resultsFound: results.length,
        searchTimeMs: searchTime
      });

      return {
        query,
        results,
        total_results: results.length,
        search_time_ms: searchTime
      };

    } catch (error) {
      logger.error('Semantic search failed', {
        module: 'vector-rag',
        facilityId: facilityId || 'unknown'
      }, {
        query: query.substring(0, 100),
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Chunk document content into smaller pieces
   */
  private chunkDocument(content: string, documentId: string): Omit<DocumentChunk, 'embedding'>[] {
    const chunks: Omit<DocumentChunk, 'embedding'>[] = [];
    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + this.CHUNK_SIZE, content.length);
      let chunkContent = content.slice(startIndex, endIndex);

      // Try to break at sentence boundaries
      if (endIndex < content.length) {
        const lastSentenceEnd = chunkContent.lastIndexOf('.');
        const lastQuestionEnd = chunkContent.lastIndexOf('?');
        const lastExclamationEnd = chunkContent.lastIndexOf('!');
        
        const lastBreak = Math.max(lastSentenceEnd, lastQuestionEnd, lastExclamationEnd);
        
        if (lastBreak > this.CHUNK_SIZE * 0.7) { // Only break if we're not losing too much content
          chunkContent = chunkContent.slice(0, lastBreak + 1);
        }
      }

      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        document_id: documentId,
        content: chunkContent.trim(),
        chunk_index: chunkIndex,
        metadata: {
          start_char: startIndex,
          end_char: startIndex + chunkContent.length,
          chunk_size: chunkContent.length
        },
        created_at: new Date().toISOString()
      });

      startIndex += chunkContent.length - this.CHUNK_OVERLAP;
      chunkIndex++;
    }

    return chunks;
  }

  /**
   * Generate embedding for text using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.substring(0, 8000) // Limit input length
        })
      });

      if (!response.ok) {
        throw new Error(`Embedding generation failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;

    } catch (error) {
      logger.error('Failed to generate embedding', {
        module: 'vector-rag'
      }, {
        textLength: text.length,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Calculate relevance score combining similarity and keyword matching
   */
  private calculateRelevanceScore(query: string, content: string, similarity: number): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    let keywordMatches = 0;
    for (const word of queryWords) {
      if (contentWords.includes(word)) {
        keywordMatches++;
      }
    }
    
    const keywordScore = keywordMatches / queryWords.length;
    
    // Combine similarity (70%) and keyword matching (30%)
    return (similarity * 0.7) + (keywordScore * 0.3);
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(facilityId?: string): Promise<{
    totalDocuments: number;
    totalChunks: number;
    averageChunksPerDocument: number;
    categories: Record<string, number>;
  }> {
    try {
      let documentsQuery = supabase.from('documents').select('id, category');
      let chunksQuery = supabase.from('document_chunks').select('document_id');

      if (facilityId) {
        documentsQuery = documentsQuery.eq('facility_id', facilityId);
      }

      const [documentsResult, chunksResult] = await Promise.all([
        documentsQuery,
        chunksQuery
      ]);

      if (documentsResult.error || chunksResult.error) {
        throw new Error('Failed to fetch document statistics');
      }

      const documents = documentsResult.data || [];
      const chunks = chunksResult.data || [];

      const categories: Record<string, number> = {};
      documents.forEach(doc => {
        categories[doc.category] = (categories[doc.category] || 0) + 1;
      });

      return {
        totalDocuments: documents.length,
        totalChunks: chunks.length,
        averageChunksPerDocument: documents.length > 0 ? chunks.length / documents.length : 0,
        categories
      };

    } catch (error) {
      logger.error('Failed to get document statistics', {
        module: 'vector-rag',
        facilityId: facilityId || 'unknown'
      }, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

// Export singleton instance
export const vectorRAGService = VectorRAGService.getInstance();
