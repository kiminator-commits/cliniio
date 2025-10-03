// import { securityAuditService } from './SecurityAuditService';
import { logger } from '../../utils/_core/logger';

export interface ComplianceStandard {
  id: string;
  name: string;
  version: string;
  description: string;
  requirements: ComplianceRequirement[];
  lastUpdated: Date;
}

export interface ComplianceRequirement {
  id: string;
  standardId: string;
  code: string;
  title: string;
  description: string;
  category:
    | 'access_control'
    | 'data_protection'
    | 'audit_logging'
    | 'encryption'
    | 'incident_response'
    | 'user_management';
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: ComplianceEvidence[];
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  lastAssessed: Date;
  notes?: string;
}

export interface ComplianceEvidence {
  id: string;
  requirementId: string;
  type:
    | 'documentation'
    | 'configuration'
    | 'log_entry'
    | 'test_result'
    | 'policy';
  title: string;
  description: string;
  evidence: string;
  collectedAt: Date;
  collectedBy: string;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface ComplianceAssessment {
  id: string;
  standardId: string;
  facilityId?: string;
  assessedAt: Date;
  assessedBy: string;
  status: 'in_progress' | 'completed' | 'failed';
  results: {
    totalRequirements: number;
    compliant: number;
    nonCompliant: number;
    partial: number;
    notApplicable: number;
    complianceScore: number;
  };
  findings: ComplianceFinding[];
  recommendations: string[];
}

export interface ComplianceFinding {
  id: string;
  requirementId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface ComplianceReport {
  id: string;
  standardId: string;
  facilityId?: string;
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  generatedBy: string;
  summary: {
    overallScore: number;
    totalRequirements: number;
    compliant: number;
    nonCompliant: number;
    partial: number;
    notApplicable: number;
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
  };
  requirements: ComplianceRequirement[];
  findings: ComplianceFinding[];
  recommendations: string[];
}

export class ComplianceService {
  private static instance: ComplianceService;
  private standards: Map<string, ComplianceStandard> = new Map();
  private assessments: Map<string, ComplianceAssessment> = new Map();
  private reports: Map<string, ComplianceReport> = new Map();

  private constructor() {
    this.initializeDefaultStandards();
  }

  static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  /**
   * Create compliance standard
   */
  createStandard(
    standard: Omit<ComplianceStandard, 'id' | 'lastUpdated'>
  ): ComplianceStandard {
    const newStandard: ComplianceStandard = {
      ...standard,
      id: `std_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date(),
    };

    this.standards.set(newStandard.id, newStandard);
    logger.info(
      `Compliance standard created: ${newStandard.name}`,
      newStandard
    );

    return newStandard;
  }

  /**
   * Get compliance standard
   */
  getStandard(standardId: string): ComplianceStandard | null {
    return this.standards.get(standardId) || null;
  }

  /**
   * Get all compliance standards
   */
  getAllStandards(): ComplianceStandard[] {
    return Array.from(this.standards.values());
  }

  /**
   * Start compliance assessment
   */
  startAssessment(
    standardId: string,
    facilityId: string | undefined,
    assessedBy: string
  ): ComplianceAssessment {
    const standard = this.standards.get(standardId);
    if (!standard) {
      throw new Error(`Compliance standard not found: ${standardId}`);
    }

    const assessment: ComplianceAssessment = {
      id: `assess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      standardId,
      facilityId,
      assessedAt: new Date(),
      assessedBy,
      status: 'in_progress',
      results: {
        totalRequirements: standard.requirements.length,
        compliant: 0,
        nonCompliant: 0,
        partial: 0,
        notApplicable: 0,
        complianceScore: 0,
      },
      findings: [],
      recommendations: [],
    };

    this.assessments.set(assessment.id, assessment);
    logger.info(`Compliance assessment started: ${assessment.id}`, assessment);

    return assessment;
  }

  /**
   * Assess requirement compliance
   */
  assessRequirement(
    assessmentId: string,
    requirementId: string,
    status: ComplianceRequirement['status'],
    evidence: string,
    notes?: string
  ): void {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    const standard = this.standards.get(assessment.standardId);
    if (!standard) {
      throw new Error(`Standard not found: ${assessment.standardId}`);
    }

    const requirement = standard.requirements.find(
      (r) => r.id === requirementId
    );
    if (!requirement) {
      throw new Error(`Requirement not found: ${requirementId}`);
    }

    // Update requirement status
    requirement.status = status;
    requirement.lastAssessed = new Date();
    requirement.notes = notes;

    // Add evidence
    const evidenceEntry: ComplianceEvidence = {
      id: `evid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requirementId,
      type: 'test_result',
      title: `Assessment evidence for ${requirement.code}`,
      description: evidence,
      evidence,
      collectedAt: new Date(),
      collectedBy: assessment.assessedBy,
      verified: false,
    };

    requirement.evidence.push(evidenceEntry);

    // Update assessment results
    this.updateAssessmentResults(assessment);

    logger.info(`Requirement assessed: ${requirement.code} - ${status}`, {
      assessmentId,
      requirementId,
      status,
    });
  }

  /**
   * Add compliance finding
   */
  addFinding(
    assessmentId: string,
    requirementId: string,
    severity: ComplianceFinding['severity'],
    title: string,
    description: string,
    evidence: string,
    recommendation: string,
    assignedTo?: string,
    dueDate?: Date
  ): ComplianceFinding {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    const finding: ComplianceFinding = {
      id: `find_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requirementId,
      severity,
      title,
      description,
      evidence,
      recommendation,
      status: 'open',
      assignedTo,
      dueDate,
    };

    assessment.findings.push(finding);
    assessment.recommendations.push(recommendation);

    logger.info(`Compliance finding added: ${finding.title}`, finding);

    return finding;
  }

  /**
   * Complete assessment
   */
  completeAssessment(assessmentId: string): ComplianceAssessment {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    assessment.status = 'completed';
    this.updateAssessmentResults(assessment);

    logger.info(
      `Compliance assessment completed: ${assessmentId}`,
      assessment.results
    );

    return assessment;
  }

  /**
   * Generate compliance report
   */
  generateReport(
    standardId: string,
    facilityId: string | undefined,
    period: { start: Date; end: Date },
    generatedBy: string
  ): ComplianceReport {
    const standard = this.standards.get(standardId);
    if (!standard) {
      throw new Error(`Compliance standard not found: ${standardId}`);
    }

    // Get assessments for the period
    const periodAssessments = Array.from(this.assessments.values()).filter(
      (a) =>
        a.standardId === standardId &&
        a.facilityId === facilityId &&
        a.assessedAt >= period.start &&
        a.assessedAt <= period.end
    );

    // Calculate summary statistics
    const totalRequirements = standard.requirements.length;
    const compliant = standard.requirements.filter(
      (r) => r.status === 'compliant'
    ).length;
    const nonCompliant = standard.requirements.filter(
      (r) => r.status === 'non_compliant'
    ).length;
    const partial = standard.requirements.filter(
      (r) => r.status === 'partial'
    ).length;
    const notApplicable = standard.requirements.filter(
      (r) => r.status === 'not_applicable'
    ).length;

    const overallScore =
      totalRequirements > 0
        ? ((compliant + partial * 0.5) / totalRequirements) * 100
        : 0;

    // Get all findings
    const allFindings = periodAssessments.flatMap((a) => a.findings);
    const criticalFindings = allFindings.filter(
      (f) => f.severity === 'critical'
    ).length;
    const highFindings = allFindings.filter(
      (f) => f.severity === 'high'
    ).length;
    const mediumFindings = allFindings.filter(
      (f) => f.severity === 'medium'
    ).length;
    const lowFindings = allFindings.filter((f) => f.severity === 'low').length;

    // Get all recommendations
    const allRecommendations = periodAssessments.flatMap(
      (a) => a.recommendations
    );

    const report: ComplianceReport = {
      id: `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      standardId,
      facilityId,
      period,
      generatedAt: new Date(),
      generatedBy,
      summary: {
        overallScore,
        totalRequirements,
        compliant,
        nonCompliant,
        partial,
        notApplicable,
        criticalFindings,
        highFindings,
        mediumFindings,
        lowFindings,
      },
      requirements: standard.requirements,
      findings: allFindings,
      recommendations: [...new Set(allRecommendations)], // Remove duplicates
    };

    this.reports.set(report.id, report);
    logger.info(`Compliance report generated: ${report.id}`, report.summary);

    return report;
  }

  /**
   * Get compliance status
   */
  getComplianceStatus(
    standardId: string,
    facilityId?: string
  ): {
    standard: ComplianceStandard;
    overallScore: number;
    requirements: ComplianceRequirement[];
    criticalFindings: ComplianceFinding[];
    lastAssessment?: Date;
  } {
    const standard = this.standards.get(standardId);
    if (!standard) {
      throw new Error(`Compliance standard not found: ${standardId}`);
    }

    // Get latest assessment
    const latestAssessment = Array.from(this.assessments.values())
      .filter((a) => a.standardId === standardId && a.facilityId === facilityId)
      .sort((a, b) => b.assessedAt.getTime() - a.assessedAt.getTime())[0];

    const totalRequirements = standard.requirements.length;
    const compliant = standard.requirements.filter(
      (r) => r.status === 'compliant'
    ).length;
    const partial = standard.requirements.filter(
      (r) => r.status === 'partial'
    ).length;
    const overallScore =
      totalRequirements > 0
        ? ((compliant + partial * 0.5) / totalRequirements) * 100
        : 0;

    const criticalFindings =
      latestAssessment?.findings.filter((f) => f.severity === 'critical') || [];

    return {
      standard,
      overallScore,
      requirements: standard.requirements,
      criticalFindings,
      lastAssessment: latestAssessment?.assessedAt,
    };
  }

  /**
   * Update assessment results
   */
  private updateAssessmentResults(assessment: ComplianceAssessment): void {
    const standard = this.standards.get(assessment.standardId);
    if (!standard) return;

    const requirements = standard.requirements;
    assessment.results = {
      totalRequirements: requirements.length,
      compliant: requirements.filter((r) => r.status === 'compliant').length,
      nonCompliant: requirements.filter((r) => r.status === 'non_compliant')
        .length,
      partial: requirements.filter((r) => r.status === 'partial').length,
      notApplicable: requirements.filter((r) => r.status === 'not_applicable')
        .length,
      complianceScore: 0,
    };

    assessment.results.complianceScore =
      assessment.results.totalRequirements > 0
        ? ((assessment.results.compliant + assessment.results.partial * 0.5) /
            assessment.results.totalRequirements) *
          100
        : 0;
  }

  /**
   * Initialize default compliance standards
   */
  private initializeDefaultStandards(): void {
    // HIPAA-like standard for healthcare data
    const hipaaStandard = this.createStandard({
      name: 'Healthcare Data Protection',
      version: '1.0',
      description:
        'Standards for protecting healthcare data and patient privacy',
      requirements: [
        {
          id: 'req_001',
          standardId: '',
          code: 'AC-1',
          title: 'Access Control Policy',
          description: 'Implement and maintain access control policies',
          category: 'access_control',
          severity: 'high',
          evidence: [],
          status: 'not_applicable',
          lastAssessed: new Date(),
        },
        {
          id: 'req_002',
          standardId: '',
          code: 'DP-1',
          title: 'Data Encryption',
          description: 'Encrypt sensitive data at rest and in transit',
          category: 'data_protection',
          severity: 'critical',
          evidence: [],
          status: 'not_applicable',
          lastAssessed: new Date(),
        },
        {
          id: 'req_003',
          standardId: '',
          code: 'AL-1',
          title: 'Audit Logging',
          description: 'Maintain comprehensive audit logs of all data access',
          category: 'audit_logging',
          severity: 'high',
          evidence: [],
          status: 'not_applicable',
          lastAssessed: new Date(),
        },
        {
          id: 'req_004',
          standardId: '',
          code: 'UM-1',
          title: 'User Management',
          description:
            'Implement proper user account management and access controls',
          category: 'user_management',
          severity: 'high',
          evidence: [],
          status: 'not_applicable',
          lastAssessed: new Date(),
        },
      ],
    });

    // Update requirement standard IDs
    hipaaStandard.requirements.forEach((req) => {
      req.standardId = hipaaStandard.id;
    });

    logger.info('Default compliance standards initialized');
  }
}

// Singleton instance
export const complianceService = ComplianceService.getInstance();
