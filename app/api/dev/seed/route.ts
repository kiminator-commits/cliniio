import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withSecureDev, AuthenticatedRequest } from '../_middleware/secureDev';
import { validateEnvironmentSafety } from '../_middleware/secureDev';
import { logger } from '@/utils/_core/logger';

type SeedItem = {
  name: string;
  category: string;
  quantity: number;
  unit_cost?: number | null;
  reorder_point?: number | null;
  data?: Record<string, unknown> | null;
};

const DEFAULT_FACILITY_ID = '550e8400-e29b-41d4-a716-446655440000';

// Use realistic medical categories (our normalization layer maps these to UI buckets)
const DEFAULT_ITEMS: SeedItem[] = [
  {
    name: 'Surgical Scissors',
    category: 'Surgical Instruments',
    quantity: 15,
    unit_cost: 12.5,
    reorder_point: 3,
    data: { size: '14cm', material: 'Stainless' },
  },
  {
    name: 'Sterile Gauze Pads (4x4)',
    category: 'Medical Supplies',
    quantity: 240,
    unit_cost: 0.18,
    reorder_point: 100,
    data: { pack: 100, brand: 'Medix' },
  },
  {
    name: 'Ultrasonic Cleaner Solution',
    category: 'Chemicals',
    quantity: 8,
    unit_cost: 18.5,
    reorder_point: 2,
    data: { dilution: '1:10' },
  },
  {
    name: 'Autoclave Indicator Tape',
    category: 'Sterilization Supplies',
    quantity: 12,
    unit_cost: 3.2,
    reorder_point: 4,
    data: { width_mm: 19 },
  },
];

async function handleSeedRequest(
  req: AuthenticatedRequest
): Promise<NextResponse> {
  // Additional environment safety check
  const envSafety = validateEnvironmentSafety();
  if (!envSafety.isSafe) {
    logger.warn('API: Environment safety check failed', {
      reason: envSafety.reason,
      userId: req.user?.id,
    });
    return NextResponse.json(
      {
        error: 'Operation not allowed in current environment',
        details: envSafety.reason,
      },
      { status: 403 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    logger.error('API: Missing required environment variables', {
      hasUrl: !!url,
      hasServiceKey: !!serviceKey,
      userId: req.user?.id,
    });
    return NextResponse.json(
      {
        error:
          'Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set on the server.',
      },
      { status: 500 }
    );
  }

  // Service-role client bypasses RLS for inserts
  const admin = createClient(url, serviceKey, { db: { schema: 'public' } });

  // Use validated data from middleware
  const validatedData = (
    req as AuthenticatedRequest & {
      validatedData: { facility_id?: string };
    }
  ).validatedData;
  const facility_id: string = validatedData?.facility_id || DEFAULT_FACILITY_ID;

  // If items already exist for this facility, skip to keep the operation idempotent
  const { data: existing, error: existErr } = await admin
    .from('inventory_items')
    .select('id', { count: 'exact', head: false })
    .eq('facility_id', facility_id)
    .limit(1);

  if (existErr) {
    logger.error('API: Database error checking existing items', {
      error: existErr.message,
      facility_id,
      userId: req.user?.id,
    });
    return NextResponse.json({ error: existErr.message }, { status: 500 });
  }

  if (existing && existing.length > 0) {
    logger.info('API: Seed operation skipped - items already exist', {
      facility_id,
      count_existing: existing.length,
      userId: req.user?.id,
    });
    return NextResponse.json({
      skipped: true,
      reason: 'Inventory items already exist for this facility.',
      facility_id,
      count_existing: existing.length,
    });
  }

  // Prepare rows using only columns that actually exist in your DB
  const now = new Date().toISOString();
  const rows = DEFAULT_ITEMS.map((it) => ({
    facility_id,
    name: it.name,
    category: it.category,
    quantity: it.quantity,
    unit_cost: it.unit_cost ?? null,
    reorder_point: it.reorder_point ?? null,
    data: it.data ?? null,
    created_at: now,
    updated_at: now,
  }));

  const { data: inserted, error: insertErr } = await admin
    .from('inventory_items')
    .insert(rows)
    .select('id,name,category,quantity');

  if (insertErr) {
    logger.error('API: Database error inserting seed data', {
      error: insertErr.message,
      facility_id,
      userId: req.user?.id,
    });
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  logger.info('API: Seed operation completed successfully', {
    facility_id,
    inserted_count: inserted?.length ?? 0,
    userId: req.user?.id,
  });

  return NextResponse.json({
    ok: true,
    facility_id,
    inserted_count: inserted?.length ?? 0,
    inserted,
  });
}

// Export the secured POST handler
export const POST = withSecureDev(handleSeedRequest, {
  requiredRole: 'Administrator',
  rateLimitConfig: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3, // 3 requests per 15 minutes for seeding operations
  },
});
