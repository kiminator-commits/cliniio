import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/Layout/PageLayout';
import Icon from '@mdi/react';
import {
  mdiUpdate,
  mdiShape,
  mdiCheckCircle,
  mdiClockAlert,
  mdiBookOpen,
  mdiAccountCheck,
  mdiBookEducation,
  mdiMapMarkerPath,
  mdiFileDocument,
  mdiShieldCheck,
  mdiDelete,
} from '@mdi/js';
import DataTable from '../../components/DataTable';
import LearningProgressService from '../../services/learningProgressService';

interface ContentItem {
  id: string;
  title: string;
  category: string;
  status?: string;
  dueDate?: string;
  progress?: number;
  department?: string;
  lastUpdated?: string;
}

const LearningPathwaysTable: React.FC<{
  items: ContentItem[];
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: 'In Progress' | 'Completed') => void;
}> = ({ items, onDelete, onStatusUpdate }) => (
  <div className="mt-4">
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pathway Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Courses
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map(item => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
              <td className="px-4 py-3 text-sm text-gray-500">-</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <select
                  value={item.status || 'Not Started'}
                  onChange={e =>
                    onStatusUpdate(item.id, e.target.value as 'In Progress' | 'Completed')
                  }
                  className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {item.progress ? `${item.progress}%` : '0%'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Icon path={mdiDelete} size={0.8} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ProceduresTable: React.FC<{
  items: ContentItem[];
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: 'In Progress' | 'Completed') => void;
}> = ({ items, onDelete, onStatusUpdate }) => (
  <div className="mt-4">
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Procedure Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map(item => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{item.department || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{item.lastUpdated || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <select
                  value={item.status || 'Not Started'}
                  onChange={e =>
                    onStatusUpdate(item.id, e.target.value as 'In Progress' | 'Completed')
                  }
                  className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Icon path={mdiDelete} size={0.8} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PoliciesTable: React.FC<{
  items: ContentItem[];
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: 'In Progress' | 'Completed') => void;
}> = ({ items, onDelete, onStatusUpdate }) => (
  <div className="mt-4">
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Policy Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map(item => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{item.lastUpdated || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <select
                  value={item.status || 'Not Started'}
                  onChange={e =>
                    onStatusUpdate(item.id, e.target.value as 'In Progress' | 'Completed')
                  }
                  className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Icon path={mdiDelete} size={0.8} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const KnowledgeHub: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedContent, setSelectedContent] = useState<ContentItem[]>([]);
  const [progressService] = useState(() => LearningProgressService.getInstance());

  useEffect(() => {
    // Load learning progress items when component mounts
    const loadProgressItems = () => {
      const progressItems = progressService.getAllProgressItems();
      const contentItems: ContentItem[] = progressItems.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        status: item.status,
        dueDate: item.dueDate,
        progress: item.progress,
        department: item.department,
        lastUpdated: item.lastUpdated,
      }));
      setSelectedContent(contentItems);
    };

    loadProgressItems();

    // Listen for storage changes to update the UI
    const handleStorageChange = () => {
      loadProgressItems();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [progressService]);

  const getCategoryCount = (category: string) => {
    return selectedContent.filter(item => item.category === category).length;
  };

  const handleDeleteContent = (id: string) => {
    progressService.removeItem(id);
    setSelectedContent(prev => prev.filter(item => item.id !== id));
  };

  const handleStatusUpdate = (id: string, newStatus: 'In Progress' | 'Completed') => {
    progressService.updateItemStatus(id, newStatus);
    setSelectedContent(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const renderTable = () => {
    const categoryItems = selectedContent.filter(item => item.category === selectedCategory);

    const renderEmptyState = () => (
      <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {selectedCategory === 'Courses'
                    ? 'Course Name'
                    : selectedCategory === 'Learning Pathways'
                      ? 'Pathway Name'
                      : selectedCategory === 'Procedures'
                        ? 'Procedure Name'
                        : selectedCategory === 'Policies'
                          ? 'Policy Name'
                          : 'Content Name'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {selectedCategory === 'Courses'
                    ? 'Status'
                    : selectedCategory === 'Learning Pathways'
                      ? 'Courses'
                      : selectedCategory === 'Procedures'
                        ? 'Department'
                        : selectedCategory === 'Policies'
                          ? 'Category'
                          : 'Category'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {selectedCategory === 'Courses'
                    ? 'Due Date'
                    : selectedCategory === 'Learning Pathways'
                      ? 'Status'
                      : selectedCategory === 'Procedures'
                        ? 'Last Updated'
                        : selectedCategory === 'Policies'
                          ? 'Last Updated'
                          : 'Last Updated'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {selectedCategory === 'Courses'
                    ? 'Progress'
                    : selectedCategory === 'Learning Pathways'
                      ? 'Progress'
                      : selectedCategory === 'Procedures'
                        ? 'Status'
                        : selectedCategory === 'Policies'
                          ? 'Status'
                          : 'Status'}
                </th>
                <th className="w-10 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {!selectedCategory
                    ? 'Select a category to view content.'
                    : 'No content available in this category.'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );

    if (!selectedCategory) {
      return renderEmptyState();
    }

    if (categoryItems.length === 0) {
      return renderEmptyState();
    }

    switch (selectedCategory) {
      case 'Courses':
        return (
          <div className="mt-4">
            <DataTable
              items={categoryItems}
              columns={[
                { header: 'Course Name', accessor: 'title' },
                {
                  header: 'Status',
                  accessor: 'status',
                  render: (item: ContentItem) => (
                    <select
                      value={item.status || 'Not Started'}
                      onChange={e =>
                        handleStatusUpdate(item.id, e.target.value as 'In Progress' | 'Completed')
                      }
                      className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  ),
                },
                { header: 'Due Date', accessor: 'dueDate' },
                { header: 'Progress', accessor: 'progress' },
              ]}
              onDelete={handleDeleteContent}
            />
          </div>
        );
      case 'Learning Pathways':
        return (
          <LearningPathwaysTable
            items={categoryItems}
            onDelete={handleDeleteContent}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      case 'Procedures':
        return (
          <ProceduresTable
            items={categoryItems}
            onDelete={handleDeleteContent}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      case 'Policies':
        return (
          <PoliciesTable
            items={categoryItems}
            onDelete={handleDeleteContent}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      default:
        return renderEmptyState();
    }
  };

  const recentUpdates = [
    {
      type: 'new',
      title: 'Infection Control Basics',
      icon: mdiBookOpen,
      time: '2 hours ago',
    },
    {
      type: 'completed',
      title: 'Patient Safety Protocols',
      icon: mdiCheckCircle,
      time: '1 day ago',
    },
    {
      type: 'assigned',
      title: 'Emergency Response Training',
      icon: mdiAccountCheck,
      time: '2 days ago',
    },
    {
      type: 'overdue',
      title: 'HIPAA Compliance',
      icon: mdiClockAlert,
      time: 'Due in 3 days',
    },
  ];

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#5b5b5b] mb-1">Knowledge Hub</h1>
            <p className="text-gray-500 text-sm">
              Access training materials and educational resources
            </p>
          </div>
          <button
            onClick={() => navigate('/library')}
            className="rounded-md bg-[#4ECDC4] px-4 py-2 text-white hover:bg-[#3db8b0] transition"
          >
            + Library
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col gap-4 lg:w-[35%]">
            <div
              className="bg-white rounded-lg shadow p-4"
              style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
            >
              <h2 className="text-lg font-semibold text-[#5b5b5b] flex items-center mb-2">
                <Icon path={mdiUpdate} size={1.1} color="#4ECDC4" className="mr-2" />
                Recent Updates
              </h2>
              <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: '175px' }}>
                {recentUpdates.map((update, index) => (
                  <div
                    key={index}
                    className="flex items-center py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#5b5b5b]">{update.title}</p>
                      <p className="text-xs text-gray-500">{update.time}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        update.type === 'new'
                          ? 'bg-blue-100 text-blue-700'
                          : update.type === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : update.type === 'assigned'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="bg-white rounded-lg shadow p-6"
              style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
            >
              <h2 className="text-lg font-semibold text-[#5b5b5b] flex items-center mb-4">
                <Icon path={mdiShape} size={1.1} color="#4ECDC4" className="mr-2" />
                Categories
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('Courses')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-[#5b5b5b] flex items-center justify-between ${
                    selectedCategory === 'Courses'
                      ? 'bg-[#4ECDC4] bg-opacity-10'
                      : 'hover:bg-[#4ECDC4] hover:bg-opacity-10'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon path={mdiBookEducation} size={0.9} color="#4ECDC4" className="mr-2" />
                    Courses
                  </div>
                  <span className="text-sm text-gray-500">{getCategoryCount('Courses')}</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('Learning Pathways')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-[#5b5b5b] flex items-center justify-between ${
                    selectedCategory === 'Learning Pathways'
                      ? 'bg-[#4ECDC4] bg-opacity-10'
                      : 'hover:bg-[#4ECDC4] hover:bg-opacity-10'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon path={mdiMapMarkerPath} size={0.9} color="#4ECDC4" className="mr-2" />
                    Learning Pathways
                  </div>
                  <span className="text-sm text-gray-500">
                    {getCategoryCount('Learning Pathways')}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedCategory('Procedures')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-[#5b5b5b] flex items-center justify-between ${
                    selectedCategory === 'Procedures'
                      ? 'bg-[#4ECDC4] bg-opacity-10'
                      : 'hover:bg-[#4ECDC4] hover:bg-opacity-10'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon path={mdiFileDocument} size={0.9} color="#4ECDC4" className="mr-2" />
                    Procedures
                  </div>
                  <span className="text-sm text-gray-500">{getCategoryCount('Procedures')}</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('Policies')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-[#5b5b5b] flex items-center justify-between ${
                    selectedCategory === 'Policies'
                      ? 'bg-[#4ECDC4] bg-opacity-10'
                      : 'hover:bg-[#4ECDC4] hover:bg-opacity-10'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon path={mdiShieldCheck} size={0.9} color="#4ECDC4" className="mr-2" />
                    Policies
                  </div>
                  <span className="text-sm text-gray-500">{getCategoryCount('Policies')}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:w-[65%] pl-4">
            <div
              className="bg-white rounded-lg shadow p-6"
              style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
            >
              <h2 className="text-lg font-semibold text-[#5b5b5b] flex items-center">
                <Icon
                  path={
                    selectedCategory === 'Courses'
                      ? mdiBookEducation
                      : selectedCategory === 'Learning Pathways'
                        ? mdiMapMarkerPath
                        : selectedCategory === 'Procedures'
                          ? mdiFileDocument
                          : mdiShieldCheck
                  }
                  size={1.1}
                  color="#4ECDC4"
                  className="mr-2"
                />
                {selectedCategory}
              </h2>
              {renderTable()}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default KnowledgeHub;
