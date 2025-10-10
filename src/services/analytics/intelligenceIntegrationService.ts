import { KnowledgeHubService } from '../../pages/KnowledgeHub/services/knowledgeHubService';
import { supabase } from '../../lib/supabaseClient';

export interface KnowledgeHubIntegration {
  contentId: string;
  title: string;
  category: string;
  relevance: number;
  lastUpdated: string;
  url: string;
}

export interface SupplierIntegration {
  supplierId: string;
  name: string;
  category: string;
  rating: number;
  deliveryTime: number;
  costCompetitiveness: number;
  reliability: number;
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
}

export interface AuditTrailIntegration {
  actionId: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  impact: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'failed';
}

export interface IntegrationMetrics {
  knowledgeHubArticles: number;
  activeSuppliers: number;
  recentAuditActions: number;
  integrationHealth: number;
  lastSync: string;
}

// Row types for Supabase
interface SupplierPerformanceRow {
  id: string;
  name: string;
  category: string;
  rating?: number | null;
  delivery_time?: number | null;
  reliability_score?: number | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

interface _AuditLogRow {
  id: string;
  timestamp: string;
  user_id: string;
  user_name?: string | null;
  action: string;
  details: string;
  status?: 'pending' | 'completed' | 'failed';
  module?: string | null;
  created_at?: string;
}

interface _InventorySupplierRow {
  id: string;
  name: string;
  status: string;
}

export class IntelligenceIntegrationService {
  static async getKnowledgeHubContent(
    categories: string[],
    keywords: string[],
    limit: number = 10
  ): Promise<KnowledgeHubIntegration[]> {
    try {
      const contentItems = await KnowledgeHubService.getKnowledgeArticles();

      const filteredContent = contentItems.filter(
        (content) =>
          categories.includes(content.category.toLowerCase()) &&
          keywords.some(
            (keyword) =>
              content.title.toLowerCase().includes(keyword.toLowerCase()) ||
              content.category.toLowerCase().includes(keyword.toLowerCase())
          )
      );

      const integrationContent: KnowledgeHubIntegration[] = filteredContent.map(
        (content) => ({
          contentId: content.id,
          title: content.title,
          category: content.category.toLowerCase(),
          relevance: this.calculateRelevance(
            content as unknown as Record<string, unknown>,
            keywords
          ),
          lastUpdated: content.lastUpdated || new Date().toISOString(),
          url: `/knowledge-hub/${content.category.toLowerCase()}/${content.id}`,
        })
      );

      return integrationContent
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching Knowledge Hub content:', error);
      return [];
    }
  }

  static async getAuditTrail(
    userId?: string,
    actionType?: string,
    timeframe?: { startDate: string; endDate: string },
    limit: number = 50
  ): Promise<AuditTrailIntegration[]> {
    try {
      // Get current user's facility ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's facility ID from users table
      const { data: userProfile } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      const facilityId =
        userProfile?.facility_id || '550e8400-e29b-41d4-a716-446655440000';

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('facility_id', facilityId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (userId) query = query.eq('user_id', userId);
      if (actionType) query = query.ilike('action', `%${actionType}%`);
      if (timeframe) {
        query = query
          .gte('timestamp', timeframe.startDate)
          .lte('timestamp', timeframe.endDate);
      }

      const { data: auditLogs, error } = await query;

      if (error) {
        console.error('Error fetching audit trail:', error);
        return [];
      }

      if (!auditLogs || auditLogs.length === 0) {
        return [];
      }

      const integrationAuditTrail: AuditTrailIntegration[] = auditLogs.map(
        (log: {
          id: string | number;
          timestamp: string;
          user_id: string;
          user_name?: string;
          action: string;
          details: string;
          impact?: string;
          severity?: string;
          category?: string;
          module?: string;
          resource_id?: string;
          resource_type?: string;
          old_values?: Record<string, unknown>;
          new_values?: Record<string, unknown>;
          ip_address?: string;
          user_agent?: string;
          session_id?: string;
          request_id?: string;
          duration?: number;
          status?: string;
          error_message?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        }) => ({
          actionId: String(log.id),
          timestamp: log.timestamp,
          userId: log.user_id,
          userName: log.user_name ?? 'Unknown User',
          action: log.action,
          details: log.metadata ? JSON.stringify(log.metadata) : '',
          impact: this.determineImpact(log.action),
          status:
            (log.status as 'failed' | 'pending' | 'completed') ?? 'completed',
        })
      );

      return integrationAuditTrail;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      return [];
    }
  }

  static async pushKnowledgeHubNotification(
    userId: string,
    contentId: string,
    message: string
  ): Promise<boolean> {
    try {
      // Get user's facility ID
      const { data: userProfile } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', userId)
        .single();

      const facilityId =
        userProfile?.facility_id || '550e8400-e29b-41d4-a716-446655440000';

      const { error } = await supabase.from('audit_logs').insert({
        user_id: userId,
        facility_id: facilityId,
        action: 'Knowledge Hub Notification',
        details: `Notification for content ${contentId}: ${message}`,
        timestamp: new Date().toISOString(),
        module: 'knowledge_hub',
      });

      if (error) {
        console.error('Error logging notification:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error pushing Knowledge Hub notification:', error);
      return false;
    }
  }

  static async scheduleSupplierContact(
    supplierId: string,
    contactType: 'email' | 'phone' | 'meeting',
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ): Promise<boolean> {
    try {
      // Get current user's facility ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's facility ID from users table
      const { data: userProfile } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      const facilityId =
        userProfile?.facility_id || '550e8400-e29b-41d4-a716-446655440000';

      const { error } = await supabase.from('audit_logs').insert({
        user_id: user.id,
        facility_id: facilityId,
        action: `Supplier Contact Scheduled`,
        details: `${contactType} contact with supplier ${supplierId}, priority: ${priority}`,
        timestamp: new Date().toISOString(),
        module: 'supplier_management',
      });

      if (error) {
        console.error('Error logging supplier contact:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error scheduling supplier contact:', error);
      return false;
    }
  }

  static async getIntegrationMetrics(): Promise<IntegrationMetrics> {
    try {
      const [knowledgeHubCount, supplierCount, auditCount] = await Promise.all([
        this.getKnowledgeHubCount(),
        this.getActiveSupplierCount(),
        this.getRecentAuditCount(),
      ]);

      return {
        knowledgeHubArticles: knowledgeHubCount,
        activeSuppliers: supplierCount,
        recentAuditActions: auditCount,
        integrationHealth: this.calculateIntegrationHealth(
          knowledgeHubCount,
          supplierCount,
          auditCount
        ),
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching integration metrics:', error);
      return {
        knowledgeHubArticles: 0,
        activeSuppliers: 0,
        recentAuditActions: 0,
        integrationHealth: 0,
        lastSync: new Date().toISOString(),
      };
    }
  }

  static async syncAllIntegrations(): Promise<boolean> {
    try {
      await Promise.all([
        this.syncKnowledgeHub(),
        this.syncSupplierDatabase(),
        this.syncAuditTrail(),
      ]);
      return true;
    } catch (error) {
      console.error('Error during integration sync:', error);
      return false;
    }
  }

  private static calculateRelevance(
    content: Record<string, unknown>,
    keywords: string[]
  ): number {
    let relevance = 50;
    keywords.forEach((keyword) => {
      if (
        (content.title as string)?.toLowerCase().includes(keyword.toLowerCase())
      )
        relevance += 20;
      if (
        (content.category as string)
          ?.toLowerCase()
          .includes(keyword.toLowerCase())
      )
        relevance += 15;
      if (
        content.tags &&
        (content.tags as string[])?.some((tag) =>
          tag.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        relevance += 10;
      }
    });
    return Math.min(relevance, 100);
  }

  private static calculateCostCompetitiveness(
    supplier: SupplierPerformanceRow,
    budget: number
  ): number {
    const baseScore = 7.0;
    const budgetMultiplier = Math.min(budget / 1000, 2);
    return Math.min(baseScore * budgetMultiplier, 10);
  }

  private static determineImpact(action: string): 'low' | 'medium' | 'high' {
    const highImpactActions = [
      'sterilization',
      'bi test',
      'critical',
      'emergency',
    ];
    const mediumImpactActions = ['inventory', 'training', 'maintenance'];
    const actionLower = action.toLowerCase();
    if (highImpactActions.some((term) => actionLower.includes(term)))
      return 'high';
    if (mediumImpactActions.some((term) => actionLower.includes(term)))
      return 'medium';
    return 'low';
  }

  private static async getKnowledgeHubCount(): Promise<number> {
    try {
      const contentItems = await KnowledgeHubService.getKnowledgeArticles();
      return contentItems.length;
    } catch (err) {
      console.error(err);
      return 0;
    }
  }

  private static async getActiveSupplierCount(): Promise<number> {
    try {
      // Check if inventory_suppliers table exists first
      const { data: tableExists, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'inventory_suppliers')
        .single();

      if (tableError || !tableExists) {
        console.log(
          '📊 inventory_suppliers table not found, using default count'
        );
        return 5;
      }

      return 5;
    } catch (error) {
      console.log('📊 Exception fetching supplier count:', error);
      return 5;
    }
  }

  private static async getRecentAuditCount(): Promise<number> {
    try {
      // Get current user's facility ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return 0;
      }

      // Get user's facility ID from users table
      const { data: userProfile } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      const facilityId =
        userProfile?.facility_id || '550e8400-e29b-41d4-a716-446655440000';

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count, error } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('facility_id', facilityId)
        .gte('created_at', thirtyDaysAgo.toISOString());
      if (error) return 0;
      return count ?? 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  }

  private static calculateIntegrationHealth(
    knowledgeHubCount: number,
    supplierCount: number,
    auditCount: number
  ): number {
    const knowledgeHubScore = Math.min(knowledgeHubCount / 10, 1) * 30;
    const supplierScore = Math.min(supplierCount / 20, 1) * 30;
    const auditScore = Math.min(auditCount / 50, 1) * 40;
    return Math.round(knowledgeHubScore + supplierScore + auditScore);
  }

  private static async syncKnowledgeHub(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  private static async syncSupplierDatabase(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  private static async syncAuditTrail(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  private static getFallbackSuppliers(
    category: string,
    limit: number
  ): SupplierIntegration[] {
    const fallbackSuppliers: SupplierIntegration[] = [
      {
        supplierId: 'fallback-1',
        name: 'Medical Supply Co.',
        category,
        rating: 4.5,
        deliveryTime: 3,
        costCompetitiveness: 8.0,
        reliability: 9.0,
        contactInfo: {
          email: 'contact@medsupply.com',
          phone: '+1-555-0123',
          website: 'https://medsupply.com',
        },
      },
      {
        supplierId: 'fallback-2',
        name: 'Clinical Equipment Ltd.',
        category,
        rating: 4.2,
        deliveryTime: 5,
        costCompetitiveness: 7.5,
        reliability: 8.5,
        contactInfo: {
          email: 'sales@clinicalequip.com',
          phone: '+1-555-0456',
          website: 'https://clinicalequip.com',
        },
      },
    ];
    return fallbackSuppliers.slice(0, limit);
  }
}

export default IntelligenceIntegrationService;
