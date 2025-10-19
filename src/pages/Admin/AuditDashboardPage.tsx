'use client';

import { useEffect, useState } from 'react';
import {
  fetchAuditFlags,
  fetchRecentActivity,
  fetchHistoricalCompliance,
} from '@/services/audit/auditDashboardService';
import type { AuditFlag, ActivityRecord } from '@/types/auditTypes';
import { Card } from '@/components/ui/card';
import { Loader2, X, AlertTriangle, Clock, Database, Download, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useFacility } from '@/contexts/FacilityContext';
import { useUser } from '@/contexts/UserContext';

export default function AuditDashboardPage() {
  const { getCurrentFacilityId } = useFacility();
  const { currentUser } = useUser();
  
  const [flags, setFlags] = useState<AuditFlag[]>([]);
  const [_activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<AuditFlag | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showHistorical, setShowHistorical] = useState(false);
  const [_historicalFlags, setHistoricalFlags] = useState<AuditFlag[]>([]);
  const [expandedFlags, setExpandedFlags] = useState<Set<string>>(new Set());

  async function loadData() {
    setLoading(true);
    try {
      const [flagData, actData] = await Promise.all([
        fetchAuditFlags(),
        fetchRecentActivity(),
      ]);
      setFlags(flagData);
      setActivities(actData);
    } catch (e) {
      console.error('Failed to load audit dashboard:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistoricalData() {
    try {
      const historicalData = await fetchHistoricalCompliance();
      setHistoricalFlags(historicalData);
    } catch (e) {
      console.error('Failed to load historical compliance data:', e);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleViewDetails = (flag: AuditFlag) => {
    setSelectedFlag(flag);
  };

  const handleCloseModal = () => {
    setSelectedFlag(null);
  };

  const toggleExpanded = (flagId: string) => {
    const newExpanded = new Set(expandedFlags);
    if (newExpanded.has(flagId)) {
      newExpanded.delete(flagId);
    } else {
      newExpanded.add(flagId);
    }
    setExpandedFlags(newExpanded);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-orange-500 text-white';
      case 'low':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleMarkResolved = async (flagId: string) => {
    setResolving(flagId);
    try {
      // Get current user info
      const { data: { user: _user } } = await supabase.auth.getUser();
      
      // Update the audit flag as resolved
      const { error: updateError } = await supabase
        .from('audit_flags')
        .update({ 
          resolved: true
        })
        .eq('id', flagId);

      if (updateError) {
        console.error('Failed to resolve audit flag:', updateError);
        alert('Failed to resolve compliance issue: ' + updateError.message);
        return;
      }

      console.log('Successfully updated audit flag in database');

  // Create audit log entry for the resolution
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert({
      id: crypto.randomUUID(),
      module: 'compliance',
      table_name: 'audit_flags',
      action: 'compliance_issue_resolved',
      record_id: flagId,
      user_id: currentUser?.id || '00000000-0000-0000-0000-000000000000', // Use actual user ID or fallback
      facility_id: getCurrentFacilityId() || 'unknown-facility',
      metadata: {
        resolution_timestamp: new Date().toISOString(),
        resolved_by: currentUser?.email || 'system',
        resolution_type: 'manual_resolution',
      },
      created_at: new Date().toISOString(),
    });

      if (auditError) {
        console.error('Failed to create audit log:', auditError);
      }

      console.log('Refreshing data...');
      // Refresh the data
      await loadData();
      
      // Force a re-render by updating the flags state directly
      const updatedFlags = flags.filter(flag => flag.id !== flagId);
      setFlags(updatedFlags);
      console.log('Data refreshed, current flags count:', updatedFlags.length);
      
      // Close modal if it was open for this flag
      if (selectedFlag?.id === flagId) {
        setSelectedFlag(null);
      }
      
      console.log('Compliance issue resolved successfully:', flagId);
      
      // Dispatch custom event to notify other components AFTER data refresh
      setTimeout(() => {
        console.log('Dispatching complianceIssueResolved event');
        window.dispatchEvent(new CustomEvent('complianceIssueResolved', { 
          detail: { flagId, resolvedCount: updatedFlags.length } 
        }));
      }, 500);
    } catch (error) {
      console.error('Error resolving compliance issue:', error);
    } finally {
      setResolving(null);
    }
  };

  const handleExportComplianceReport = async () => {
    setExporting(true);
    try {
      // Get current user and facility info
      const { data: { user: _user } } = await supabase.auth.getUser();
      
      // Create compliance report data
      const reportData = {
        generated_at: new Date().toISOString(),
        generated_by: _user?.email || 'system',
        facility_id: getCurrentFacilityId() || 'unknown-facility',
        active_issues: flags.filter(f => !f.resolved),
        resolved_issues: flags.filter(f => f.resolved),
        total_issues: flags.length,
        severity_breakdown: {
          high: flags.filter(f => f.severity === 'high' && !f.resolved).length,
          medium: flags.filter(f => f.severity === 'medium' && !f.resolved).length,
          low: flags.filter(f => f.severity === 'low' && !f.resolved).length,
        }
      };

      // Create audit log for export
      await supabase
        .from('audit_logs')
        .insert({
          id: crypto.randomUUID(),
          module: 'compliance',
          table_name: 'audit_flags',
          action: 'compliance_report_exported',
          record_id: null,
          user_id: _user?.id || 'system',
          facility_id: getCurrentFacilityId() || 'unknown-facility',
          metadata: {
            export_timestamp: new Date().toISOString(),
            exported_by: _user?.email || 'system',
            report_summary: reportData,
          },
          created_at: new Date().toISOString(),
        });

      // Create and download the file
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting compliance report:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Audit & Compliance Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowHistorical(!showHistorical);
              if (!showHistorical) loadHistoricalData();
            }}
            className={`px-4 py-2 rounded transition-colors ${
              showHistorical 
                ? 'bg-purple-500 text-white hover:bg-purple-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showHistorical ? 'Hide Historical' : 'View Historical'}
          </button>
          <button
            onClick={handleExportComplianceReport}
            disabled={exporting || flags.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>
      {loading ? (
        <p className="flex items-center gap-2">
          <Loader2 className="animate-spin w-4 h-4" /> Loading…
        </p>
      ) : (
        <>
          <Card className="p-4">
            <h2 className="text-lg font-medium mb-2">
              🚨 Active Compliance Issues ({flags.length})
            </h2>
            {flags.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-muted text-lg">No active compliance issues!</p>
                <p className="text-muted text-sm mt-2">All systems are operating within compliance standards.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flags.map((flag) => {
                  const isExpanded = expandedFlags.has(flag.id);
                  return (
                    <div key={flag.id} className="border rounded-lg hover:shadow-md transition-all">
                      {/* Collapsible Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleExpanded(flag.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                flag.severity === 'high'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : flag.severity === 'medium'
                                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}
                            >
                              {flag.severity.toUpperCase()} SEVERITY
                            </span>
                            {flag.compliance_standard && (
                              <span className="text-sm bg-[#4ECDC4] text-white px-3 py-1 rounded font-medium">
                                {flag.compliance_standard}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(flag);
                              }}
                              className="px-3 py-1 bg-[#4ECDC4] text-white text-sm rounded hover:bg-[#3BB5AD] transition-colors"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkResolved(flag.id);
                              }}
                              disabled={resolving === flag.id}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            >
                              {resolving === flag.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {resolving === flag.id ? 'Resolving...' : 'Resolve'}
                            </button>
                          </div>
                        </div>
                        
                        {/* Issue Description - Always Visible */}
                        <div className="mt-3">
                          <p className="text-gray-900 font-medium">{flag.description}</p>
                        </div>
                      </div>

                      {/* Expandable Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t bg-gray-50/50">
                          <div className="pt-4 space-y-4">
                            {/* Compliance Requirements */}
                            {flag.compliance_standard && (
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Compliance Requirement</h4>
                                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <span className="font-medium text-gray-600">Standard:</span>
                                      <p className="text-gray-800 font-semibold">{flag.compliance_standard}</p>
                                    </div>
                                    {flag.regulation_reference && (
                                      <div>
                                        <span className="font-medium text-gray-600">Reference:</span>
                                        <p className="text-gray-800">{flag.regulation_reference}</p>
                                      </div>
                                    )}
                                  </div>
                                  {flag.requirement_description && (
                                    <div className="mt-3">
                                      <span className="font-medium text-blue-800">Requirement:</span>
                                      <p className="text-blue-700 mt-1">{flag.requirement_description}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Corrective Actions */}
                            {flag.corrective_action && (
                              <div>
                                <h4 className="font-semibold text-green-900 mb-2">Required Actions</h4>
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <div className="text-green-800 whitespace-pre-line text-sm">
                                    {flag.corrective_action}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Assignment & Timeline */}
                            {(flag.responsible_party || flag.due_date) && (
                              <div>
                                <h4 className="font-semibold text-purple-900 mb-2">Assignment & Timeline</h4>
                                <div className="bg-purple-50 p-3 rounded-lg">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {flag.responsible_party && (
                                      <div>
                                        <span className="font-medium text-purple-800">Responsible:</span>
                                        <p className="text-purple-700 font-semibold">{flag.responsible_party}</p>
                                      </div>
                                    )}
                                    {flag.due_date && (
                                      <div>
                                        <span className="font-medium text-purple-800">Due Date:</span>
                                        <p className="text-purple-700 font-semibold">{new Date(flag.due_date).toLocaleDateString()}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Technical Details */}
                            <div className="border-t pt-3">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>📋 System: {flag.related_table.replace('_', ' ')}</span>
                                {flag.related_id && <span>🔗 Record: {flag.related_id.slice(0, 8)}...</span>}
                                <span>📅 Detected: {new Date(flag.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

        </>
      )}
      
      {/* Compliance Issue Details Modal */}
      {selectedFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(selectedFlag.severity)}
                  <h2 className="text-xl font-semibold">Compliance Issue Details</h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Issue Information */}
              <div className="space-y-6">
                {/* Severity and Status */}
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getSeverityColor(selectedFlag.severity)}`}>
                    {selectedFlag.severity.toUpperCase()} SEVERITY
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${selectedFlag.resolved ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {selectedFlag.resolved ? 'RESOLVED' : 'ACTIVE'}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Issue Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedFlag.description}</p>
                </div>

                {/* Technical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Related Table</h4>
                    </div>
                    <p className="text-blue-700">{selectedFlag.related_table}</p>
                  </div>
                  
                  {selectedFlag.related_id && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-green-900">Record ID</h4>
                      </div>
                      <p className="text-green-700 font-mono text-sm">{selectedFlag.related_id}</p>
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Timeline</h4>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Created:</strong> {new Date(selectedFlag.created_at).toLocaleString()}</p>
                    <p><strong>Age:</strong> {Math.floor((Date.now() - new Date(selectedFlag.created_at).getTime()) / (1000 * 60 * 60 * 24))} days</p>
                  </div>
                </div>

                {/* Compliance Requirements */}
                {selectedFlag.compliance_standard && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Compliance Requirements</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Standard:</span>
                        <span className="text-blue-700 ml-2">{selectedFlag.compliance_standard}</span>
                      </div>
                      {selectedFlag.regulation_reference && (
                        <div>
                          <span className="font-medium text-blue-800">Reference:</span>
                          <span className="text-blue-700 ml-2">{selectedFlag.regulation_reference}</span>
                        </div>
                      )}
                      {selectedFlag.requirement_description && (
                        <div>
                          <span className="font-medium text-blue-800">Requirement:</span>
                          <p className="text-blue-700 mt-1">{selectedFlag.requirement_description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Corrective Actions */}
                {selectedFlag.corrective_action && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Required Corrective Actions</h4>
                    <div className="text-sm text-green-800 whitespace-pre-line">
                      {selectedFlag.corrective_action}
                    </div>
                  </div>
                )}

                {/* Responsible Party & Due Date */}
                {(selectedFlag.responsible_party || selectedFlag.due_date) && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Assignment & Timeline</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {selectedFlag.responsible_party && (
                        <div>
                          <span className="font-medium text-purple-800">Responsible Party:</span>
                          <p className="text-purple-700">{selectedFlag.responsible_party}</p>
                        </div>
                      )}
                      {selectedFlag.due_date && (
                        <div>
                          <span className="font-medium text-purple-800">Due Date:</span>
                          <p className="text-purple-700">{new Date(selectedFlag.due_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleMarkResolved(selectedFlag.id)}
                  disabled={resolving === selectedFlag.id}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {resolving === selectedFlag.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {resolving === selectedFlag.id ? 'Resolving...' : 'Mark as Resolved'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
