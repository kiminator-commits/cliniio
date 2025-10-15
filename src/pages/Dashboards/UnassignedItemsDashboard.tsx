'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * Simple dashboard listing sterilized tools with no location assigned.
 * Enables staff to correct traceability gaps quickly.
 */
export default function UnassignedItemsDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id,name,batch_id,scanned_location,created_at')
      .is('scanned_location', null)
      .limit(200);
    if (error) console.error(error);
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Unassigned Items Dashboard</h1>
      {loading ? (
        <p className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </p>
      ) : items.length === 0 ? (
        <Card className="p-4">All items are assigned 🎉</Card>
      ) : (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Item ID</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Batch</th>
                <th className="text-left p-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-b hover:bg-muted/30">
                  <td className="p-2 font-mono">{i.id}</td>
                  <td className="p-2">{i.name ?? '—'}</td>
                  <td className="p-2">{i.batch_id ?? '—'}</td>
                  <td className="p-2">
                    {new Date(i.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
