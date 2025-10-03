import { useState, useMemo } from 'react';
import { Policy } from '../models';

interface UsePoliciesProps {
  forReview: Policy[];
  library: Policy[];
  archived: Policy[];
}

export const usePolicies = ({
  forReview,
  library,
  archived,
}: UsePoliciesProps) => {
  // State management
  const [activePolicyTab, setActivePolicyTab] = useState('forReview');
  const [policyCurrentPage, setPolicyCurrentPage] = useState(1);
  const [policySearchQuery, setPolicySearchQuery] = useState('');
  const [selectedPolicyDomain, setSelectedPolicyDomain] = useState('All');
  const [selectedPolicyType, setSelectedPolicyType] = useState('All');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showPolicyDetail, setShowPolicyDetail] = useState(false);

  // Derived state
  const uniquePolicyDomains = useMemo(() => {
    const domains = new Set<string>();
    [...forReview, ...library, ...archived].forEach((policy) => {
      if (policy.domain) domains.add(policy.domain);
    });
    return Array.from(domains);
  }, [forReview, library, archived]);

  const uniquePolicyTypes = useMemo(() => {
    const types = new Set<string>();
    [...forReview, ...library, ...archived].forEach((policy) => {
      if (policy.tags) {
        policy.tags.forEach((tag) => types.add(tag));
      }
    });
    return Array.from(types);
  }, [forReview, library, archived]);

  // Helper functions
  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      Required: 'bg-red-100 text-red-800',
      Optional: 'bg-blue-100 text-blue-800',
      New: 'bg-green-100 text-green-800',
      Updated: 'bg-yellow-100 text-yellow-800',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  const isPolicyOverdue = (policy: Policy) => {
    if (!policy.dueDate) return false;
    const dueDate = new Date(policy.dueDate);
    const now = new Date();
    return now > dueDate;
  };

  const getStatusBackground = (status: string) => {
    const backgrounds: { [key: string]: string } = {
      'Pending Review': 'bg-yellow-100',
      Active: 'bg-green-100',
      Archived: 'bg-gray-100',
    };
    return backgrounds[status] || 'bg-gray-100';
  };

  const getStatusIconColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Pending Review': 'text-yellow-800',
      Active: 'text-green-800',
      Archived: 'text-gray-800',
    };
    return colors[status] || 'text-gray-800';
  };

  const getFilteredPolicies = () => {
    let policies: Policy[] = [];
    switch (activePolicyTab) {
      case 'forReview':
        policies = forReview;
        break;
      case 'library':
        policies = library;
        break;
      case 'archived':
        policies = archived;
        break;
      default:
        policies = forReview;
    }

    return policies.filter((policy) => {
      const matchesSearch =
        policy.title.toLowerCase().includes(policySearchQuery.toLowerCase()) ||
        policy.domain.toLowerCase().includes(policySearchQuery.toLowerCase());
      const matchesDomain =
        selectedPolicyDomain === 'All' ||
        policy.domain === selectedPolicyDomain;
      const matchesType =
        selectedPolicyType === 'All' ||
        policy.tags?.includes(selectedPolicyType);
      return matchesSearch && matchesDomain && matchesType;
    });
  };

  const getPaginatedPolicies = () => {
    const filtered = getFilteredPolicies();
    const startIndex = (policyCurrentPage - 1) * 10;
    return filtered.slice(startIndex, startIndex + 10);
  };

  const totalPolicyPages = Math.ceil(getFilteredPolicies().length / 10);

  // Event handlers
  const handlePolicyClick = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowPolicyDetail(true);
  };

  const handleClosePolicyDetail = () => {
    setShowPolicyDetail(false);
    setSelectedPolicy(null);
  };

  return {
    activePolicyTab,
    setActivePolicyTab,
    policyCurrentPage,
    setPolicyCurrentPage,
    policySearchQuery,
    setPolicySearchQuery,
    selectedPolicyDomain,
    setSelectedPolicyDomain,
    selectedPolicyType,
    setSelectedPolicyType,
    selectedPolicy,
    showPolicyDetail,
    uniquePolicyDomains,
    uniquePolicyTypes,
    totalPolicyPages,
    getTagColor,
    getFilteredPolicies,
    getPaginatedPolicies,
    handlePolicyClick,
    handleClosePolicyDetail,
    isPolicyOverdue,
    getStatusBackground,
    getStatusIconColor,
  };
};
