'use client';

import { useEffect, useState } from 'react';
import {
  fetchAuditFlags,
  fetchRecentActivity,
  fetchRecentAiSummaries,
} from '@/services/audit/auditDashboardService';
import type { AuditFlag, ActivityRecord, AiSummary } from '@/types/auditTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function AuditDashboardPage() {
  const [flags, setFlags] = useState<AuditFlag[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [summaries, setSummaries] = useState<AiSummary[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [flagData, actData, sumData] = await Promise.all([
        fetchAuditFlags(),
        fetchRecentActivity(),
        fetchRecentAiSummaries(),
      ]);
      setFlags(flagData);
      setActivities(actData);
      setSummaries(sumData);
    } catch (e) {
      console.error('Failed to load audit dashboard:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Audit & Compliance Dashboard</h1>
      {loading ? (
        <p className="flex items-center gap-2">
          <Loader2 className="animate-spin w-4 h-4" /> Loading…
        </p>
      ) : (
        <>
          <Card className="p-4">
            <h2 className="text-lg font-medium mb-2">
              🚨 Active Compliance Flags
            </h2>
            {flags.length === 0 ? (
              <p className="text-muted">No active flags 🎉</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Severity</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Table</th>
                    <th className="p-2 text-left">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {flags.map((f) => (
                    <tr key={f.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">
                        <Badge
                          variant={
                            f.severity === 'high'
                              ? 'destructive'
                              : f.severity === 'medium'
                                ? 'warning'
                                : 'default'
                          }
                        >
                          {f.severity}
                        </Badge>
                      </td>
                      <td className="p-2">{f.description}</td>
                      <td className="p-2">{f.related_table}</td>
                      <td className="p-2">
                        {new Date(f.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-medium mb-2">
              📄 Recent AI Audit Summaries
            </h2>
            {summaries.length === 0 ? (
              <p className="text-muted">No AI summaries yet.</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {summaries.map((s) => (
                  <li key={s.id} className="text-sm">
                    <strong>
                      {new Date(s.created_at).toLocaleDateString()}:
                    </strong>{' '}
                    {s.summary}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-medium mb-2">
              🕓 Recent Activity Logs
            </h2>
            {activities.length === 0 ? (
              <p className="text-muted">No recent activity.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Module</th>
                    <th className="p-2 text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">{a.activity_type}</td>
                      <td className="p-2">{a.activity_description}</td>
                      <td className="p-2">{a.module}</td>
                      <td className="p-2">
                        {new Date(a.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
