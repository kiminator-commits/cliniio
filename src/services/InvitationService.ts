import { supabase } from '@/lib/supabaseClient';

export interface UserInvitation {
  id: string;
  email: string;
  facility_id: string;
  invited_by: string;
  role: string;
  permissions: Record<string, boolean>;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationData {
  email: string;
  facility_id: string;
  invited_by: string;
  role: string;
  permissions: Record<string, boolean>;
}

export interface TierLimits {
  tier1: number; // 0-5 Users
  tier2: number; // 6-15 Users  
  tier3: number; // 16-21 Users
  tier4: number; // 21+ Users
}

class InvitationService {
  private readonly TIER_LIMITS: TierLimits = {
    tier1: 5,    // 0-5 Users
    tier2: 15,  // 6-15 Users
    tier3: 21,  // 16-21 Users
    tier4: 999999 // 21+ Users
  };

  private readonly TIER_NAMES = {
    tier1: '0-5 Users',
    tier2: '6-15 Users', 
    tier3: '16-21 Users',
    tier4: '21+ Users'
  };

  /**
   * Check if facility can add more users based on tier
   */
  async checkTierLimits(facilityId: string): Promise<{ canAdd: boolean; currentCount: number; limit: number; tier: string }> {
    try {
      // Get current user count (excluding soft-deleted users)
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('facility_id', facilityId)
        .is('deleted_at', null) // Only count non-deleted users
        .or('is_active.is.null,is_active.eq.true'); // Include users where is_active is null or true

      if (usersError) {
        throw new Error(`Failed to get user count: ${usersError.message}`);
      }

      const currentCount = users?.length || 0;
      
      // Determine current tier based on user count (matching billing logic)
      let currentTier: string;
      let limit: number;
      
      if (currentCount >= 0 && currentCount <= 5) {
        currentTier = 'tier1';
        limit = this.TIER_LIMITS.tier1;
      } else if (currentCount >= 6 && currentCount <= 15) {
        currentTier = 'tier2';
        limit = this.TIER_LIMITS.tier2;
      } else if (currentCount >= 16 && currentCount <= 21) {
        currentTier = 'tier3';
        limit = this.TIER_LIMITS.tier3;
      } else {
        currentTier = 'tier4';
        limit = this.TIER_LIMITS.tier4;
      }

      const canAdd = currentCount < limit;

      return {
        canAdd,
        currentCount,
        limit,
        tier: this.TIER_NAMES[currentTier as keyof typeof this.TIER_NAMES]
      };
    } catch (error) {
      console.error('Error checking tier limits:', error);
      throw error;
    }
  }

  /**
   * Send invitation via Supabase Auth
   */
  async sendInvitation(email: string, userData: Record<string, unknown>): Promise<{ data: unknown; error: unknown }> {
    try {
      // Note: This requires Supabase Admin API with service role key
      // You'll need to set up a server-side endpoint for this
      const response = await fetch('/api/auth/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }

  /**
   * Create invitation record in database
   */
  async createInvitation(invitationData: CreateInvitationData): Promise<UserInvitation> {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          email: invitationData.email,
          facility_id: invitationData.facility_id,
          invited_by: invitationData.invited_by,
          role: invitationData.role,
          permissions: invitationData.permissions,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create invitation: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }

  /**
   * Get invitations for a facility
   */
  async getInvitations(facilityId: string): Promise<UserInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get invitations: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting invitations:', error);
      throw error;
    }
  }

  /**
   * Update invitation status
   */
  async updateInvitationStatus(invitationId: string, status: UserInvitation['status']): Promise<void> {
    try {
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('user_invitations')
        .update(updateData)
        .eq('id', invitationId);

      if (error) {
        throw new Error(`Failed to update invitation: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating invitation:', error);
      throw error;
    }
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) {
        throw new Error(`Failed to cancel invitation: ${error.message}`);
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      throw error;
    }
  }

  /**
   * Resend invitation (create new invitation for same email)
   */
  async resendInvitation(invitationId: string): Promise<UserInvitation> {
    try {
      // Get original invitation
      const { data: originalInvitation, error: getError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (getError) {
        throw new Error(`Failed to get original invitation: ${getError.message}`);
      }

      // Cancel old invitation
      await this.cancelInvitation(invitationId);

      // Create new invitation
      const newInvitation = await this.createInvitation({
        email: originalInvitation.email,
        facility_id: originalInvitation.facility_id,
        invited_by: originalInvitation.invited_by,
        role: originalInvitation.role,
        permissions: originalInvitation.permissions
      });

      return newInvitation;
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  }

  /**
   * Clean up invitations for a deleted user
   */
  async cleanupUserInvitations(userId: string, facilityId: string): Promise<void> {
    try {
      // Cancel any pending invitations for this user
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('invited_by', userId)
        .eq('facility_id', facilityId)
        .eq('status', 'pending');

      if (error) {
        throw new Error(`Failed to cleanup invitations: ${error.message}`);
      }
    } catch (error) {
      console.error('Error cleaning up user invitations:', error);
      throw error;
    }
  }
}

export const invitationService = new InvitationService();
