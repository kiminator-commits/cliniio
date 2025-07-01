import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiClipboardList,
  mdiFileDocument,
  mdiClose,
  mdiTools,
  mdiAccountGroup,
  mdiCalendarWeek,
  mdiOfficeBuilding,
  mdiBroom,
  mdiMagnify,
  mdiArrowLeft,
} from '@mdi/js';
import { Button } from 'react-bootstrap';
import { BaseModal } from '@/components/BaseModal';

interface Category {
  id: string;
  title: string;
  iconColor: string;
  icon: string;
}

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  requiredQuantity: number;
  category: string;
  status?: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  inventoryItems?: InventoryItem[];
  sds?: SDSSheet;
  instructions: string;
  completed?: boolean;
}

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

interface SDSSheet {
  id: string;
  name: string;
  category: string;
  lastUpdated: string;
  url: string;
  sections: string[];
}

const categories: Category[] = [
  { id: 'setup', title: 'Setup/Take Down', iconColor: '#FF6B6B', icon: mdiTools },
  { id: 'patient', title: 'Per Patient', iconColor: '#4ECDC4', icon: mdiAccountGroup },
  { id: 'weekly', title: 'Weekly', iconColor: '#45B7D1', icon: mdiCalendarWeek },
  { id: 'public', title: 'Public Spaces', iconColor: '#96CEB4', icon: mdiOfficeBuilding },
  { id: 'deep', title: 'Deep Clean', iconColor: '#FF9F1C', icon: mdiBroom },
];

// Sample checklists - in a real app, this would come from a database
const setupChecklists: Checklist[] = [
  {
    id: 'treatment-room',
    title: 'Treatment Room Setup',
    items: [
      {
        id: 'clean-surfaces',
        title: 'Clean and sanitize all surfaces with CaviWipes',
        inventoryItems: [
          {
            id: 'caviwipes-001',
            name: 'CaviWipes',
            currentStock: 100,
            requiredQuantity: 2,
            category: 'Cleaning Supplies',
          },
        ],
        sds: {
          id: '2',
          name: 'CaviWipes SDS',
          category: 'Cleaning',
          lastUpdated: '2024-03-19',
          url: '/sds/caviwipes.pdf',
          sections: [],
        },
        instructions: 'Use 2 wipes per surface. Allow to air dry for 3 minutes.',
        completed: false,
      },
      {
        id: 'restock-supplies',
        title: 'Restock Treatment Room Supplies',
        inventoryItems: [
          {
            id: 'gloves-001',
            name: 'Nitrile Gloves',
            currentStock: 500,
            requiredQuantity: 10,
            category: 'Medical Supplies',
          },
          {
            id: 'gauze-001',
            name: 'Sterile Gauze',
            currentStock: 200,
            requiredQuantity: 5,
            category: 'Medical Supplies',
          },
          {
            id: 'alcohol-001',
            name: 'Alcohol Swabs',
            currentStock: 300,
            requiredQuantity: 10,
            category: 'Medical Supplies',
          },
        ],
        instructions: 'Verify all supplies are present and in date',
        completed: false,
      },
      {
        id: 'prepare-bed',
        title: 'Prepare Treatment Bed',
        inventoryItems: [
          {
            id: 'bed-linens-001',
            name: 'Disposable Bed Linens',
            currentStock: 50,
            requiredQuantity: 1,
            category: 'Bedding',
          },
          {
            id: 'pillow-001',
            name: 'Disposable Pillow Covers',
            currentStock: 75,
            requiredQuantity: 1,
            category: 'Bedding',
          },
        ],
        instructions: 'Clean and prepare bed with fresh linens',
        completed: false,
      },
      {
        id: 'setup-equipment',
        title: 'Set up Treatment Equipment',
        inventoryItems: [
          {
            id: 'monitor-001',
            name: 'Vital Signs Monitor',
            currentStock: 1,
            requiredQuantity: 1,
            category: 'Equipment',
            status: 'Operational',
          },
          {
            id: 'suction-001',
            name: 'Suction Unit',
            currentStock: 1,
            requiredQuantity: 1,
            category: 'Equipment',
            status: 'Operational',
          },
        ],
        instructions: 'Verify all equipment is operational and properly connected',
        completed: false,
      },
      {
        id: 'check-temperature',
        title: 'Check Room Temperature and Environment',
        inventoryItems: [
          {
            id: 'thermometer-001',
            name: 'Room Thermometer',
            currentStock: 1,
            requiredQuantity: 1,
            category: 'Equipment',
          },
        ],
        instructions: 'Ensure room temperature is between 68-72°F and humidity is between 30-60%',
        completed: false,
      },
    ],
  },
  {
    id: 'waiting-room',
    title: 'Waiting Room Setup',
    items: [
      {
        id: 'clean-surfaces-waiting',
        title: 'Clean and sanitize all surfaces',
        inventoryItems: [
          {
            id: 'caviwipes-002',
            name: 'CaviWipes',
            currentStock: 100,
            requiredQuantity: 3,
            category: 'Cleaning Supplies',
          },
        ],
        sds: {
          id: '2',
          name: 'CaviWipes SDS',
          category: 'Cleaning',
          lastUpdated: '2024-03-19',
          url: '/sds/caviwipes.pdf',
          sections: [],
        },
        instructions:
          'Clean all surfaces including chairs, tables, and reception desk. Allow surfaces to air dry for 3 minutes.',
        completed: false,
      },
      {
        id: 'restock-materials',
        title: 'Restock magazines and reading materials',
        inventoryItems: [
          {
            id: 'magazines-001',
            name: 'Current Magazines',
            currentStock: 20,
            requiredQuantity: 5,
            category: 'Reading Materials',
          },
          {
            id: 'brochures-001',
            name: 'Patient Brochures',
            currentStock: 50,
            requiredQuantity: 10,
            category: 'Reading Materials',
          },
        ],
        instructions: 'Ensure all magazines are current and brochures are up to date',
        completed: false,
      },
      {
        id: 'water-dispenser',
        title: 'Check and refill water dispenser',
        inventoryItems: [
          {
            id: 'water-cups-001',
            name: 'Disposable Water Cups',
            currentStock: 200,
            requiredQuantity: 20,
            category: 'Supplies',
          },
        ],
        instructions: 'Clean water dispenser, refill if needed, and restock cups',
        completed: false,
      },
      {
        id: 'arrange-seating',
        title: 'Arrange seating',
        inventoryItems: [
          {
            id: 'chairs-001',
            name: 'Waiting Room Chairs',
            currentStock: 12,
            requiredQuantity: 8,
            category: 'Furniture',
          },
        ],
        instructions: 'Arrange chairs in a socially distanced manner, clean all surfaces',
        completed: false,
      },
      {
        id: 'check-environment',
        title: 'Check room temperature and environment',
        inventoryItems: [
          {
            id: 'thermometer-002',
            name: 'Room Thermometer',
            currentStock: 1,
            requiredQuantity: 1,
            category: 'Equipment',
          },
        ],
        instructions: 'Ensure room temperature is between 68-72°F and humidity is between 30-60%',
        completed: false,
      },
    ],
  },
];

const perPatientChecklists: Checklist[] = [
  {
    id: 'patient-room',
    title: 'Patient Room Cleaning',
    items: [],
  },
];

const weeklyChecklists: Checklist[] = [
  {
    id: 'weekly-clean',
    title: 'Weekly Deep Clean',
    items: [],
  },
];

const publicSpacesChecklists: Checklist[] = [
  {
    id: 'public-spaces',
    title: 'Public Spaces Cleaning',
    items: [],
  },
];

const deepCleanChecklists: Checklist[] = [
  {
    id: 'deep-clean',
    title: 'Deep Clean Protocol',
    items: [],
  },
];

const sampleSDSSheets: SDSSheet[] = [
  {
    id: '1',
    name: 'Bleach SDS',
    category: 'Cleaning',
    lastUpdated: '2024-03-20',
    url: '/sds/bleach.pdf',
    sections: [],
  },
  {
    id: '2',
    name: 'Disinfectant SDS',
    category: 'Cleaning',
    lastUpdated: '2024-03-19',
    url: '/sds/disinfectant.pdf',
    sections: [],
  },
  {
    id: '3',
    name: 'Hand Sanitizer SDS',
    category: 'Sanitization',
    lastUpdated: '2024-03-18',
    url: '/sds/hand-sanitizer.pdf',
    sections: [],
  },
];

const CleaningChecklists: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [activeTab, setActiveTab] = useState<'checklists' | 'sds'>('checklists');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSDS, setSelectedSDS] = useState<SDSSheet | null>(null);
  const [sdsCategory, setSdsCategory] = useState<string>('all');
  const [bypassedItems, setBypassedItems] = useState<Set<string>>(new Set());
  const [adjustedQuantities, setAdjustedQuantities] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [stolenItems, setStolenItems] = useState<
    Array<{ item: string; quantity: number; notes: string }>
  >([]);
  const [prnItems, setPrnItems] = useState<
    Array<{ item: string; quantity: number; reason: string }>
  >([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSelectedChecklist(null);
    setShowModal(true);
  };

  const handleChecklistSelect = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setSelectedChecklist(null);
    setShowModal(false);
  };

  const handleMarkComplete = () => {
    // In a real app, this would save to a database
    handleCloseModal();
  };

  const handleBypassItem = (itemId: string) => {
    setBypassedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleAdjustQuantity = (itemId: string, inventoryItemId: string, adjustment: number) => {
    setAdjustedQuantities(prev => ({
      ...prev,
      [`${itemId}-${inventoryItemId}`]: (prev[`${itemId}-${inventoryItemId}`] || 0) + adjustment,
    }));
  };

  const handleAddStolenItem = () => {
    setStolenItems([...stolenItems, { item: '', quantity: 1, notes: '' }]);
  };

  const handleAddPrnItem = () => {
    setPrnItems([...prnItems, { item: '', quantity: 1, reason: '' }]);
  };

  const handleUpdateStolenItem = (index: number, field: string, value: string | number) => {
    const updated = [...stolenItems];
    updated[index] = { ...updated[index], [field]: value };
    setStolenItems(updated);
  };

  const handleUpdatePrnItem = (index: number, field: string, value: string | number) => {
    const updated = [...prnItems];
    updated[index] = { ...updated[index], [field]: value };
    setPrnItems(updated);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Speech recognition implementation would go here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Stop recording implementation would go here
  };

  const getChecklistsForCategory = (categoryId: string): Checklist[] => {
    switch (categoryId) {
      case 'setup':
        return setupChecklists;
      case 'patient':
        return perPatientChecklists;
      case 'weekly':
        return weeklyChecklists;
      case 'public':
        return publicSpacesChecklists;
      case 'deep':
        return deepCleanChecklists;
      default:
        return [];
    }
  };

  const renderChecklistItem = (item: ChecklistItem) => (
    <div key={item.id} className="border-b border-gray-200 py-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 px-4">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-[#5b5b5b]">{item.title}</h3>
            <button
              onClick={() => handleBypassItem(item.id)}
              className={`ml-4 px-3 py-1 text-sm rounded-full transition-colors ${
                bypassedItems.has(item.id)
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              type="button"
            >
              {bypassedItems.has(item.id) ? 'Not Needed' : 'Mark Not Needed'}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">{item.instructions}</p>

          {item.inventoryItems && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700">Required Items:</h4>
              <ul className="mt-1 space-y-1">
                {item.inventoryItems.map(invItem => {
                  const adjustedQty = adjustedQuantities[`${item.id}-${invItem.id}`] || 0;
                  const finalRequiredQty = invItem.requiredQuantity + adjustedQty;

                  return (
                    <li key={invItem.id} className="flex items-center text-sm text-gray-600">
                      <span className="w-32">{invItem.name}</span>
                      <span className="mx-2">•</span>
                      <span>Required: {finalRequiredQty}</span>
                      <span className="mx-2">•</span>
                      <span>Available: {invItem.currentStock}</span>
                      {invItem.status && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Status: {invItem.status}</span>
                        </>
                      )}
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          onClick={() => handleAdjustQuantity(item.id, invItem.id, -1)}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          type="button"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleAdjustQuantity(item.id, invItem.id, 1)}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {item.sds && (
            <div className="mt-2">
              <button
                onClick={() => setSelectedSDS(item.sds)}
                className="inline-flex items-center text-sm text-[#4ECDC4] hover:text-[#3db8b0]"
                type="button"
              >
                <Icon path={mdiFileDocument} size={1} className="mr-1" />
                View SDS Sheet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const filteredSDSSheets = sampleSDSSheets.filter(sheet => {
    const matchesSearch = sheet.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = sdsCategory === 'all' || sheet.category === sdsCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className="p-6 bg-white rounded-lg shadow"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            className={`pb-2 px-1 font-medium flex items-center ${activeTab === 'checklists' ? 'text-[#5b5b5b] border-b-2 border-[#4ECDC4]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('checklists')}
            type="button"
          >
            <Icon path={mdiClipboardList} size={1.1} color="#4ECDC4" className="mr-2" />
            Cleaning Checklists
          </button>
          <button
            className={`pb-2 px-1 font-medium flex items-center ${activeTab === 'sds' ? 'text-[#5b5b5b] border-b-2 border-[#4ECDC4]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('sds')}
            type="button"
          >
            <Icon path={mdiFileDocument} size={1.1} color="#4ECDC4" className="mr-2" />
            SDS Sheets
          </button>
        </div>
      </div>

      {activeTab === 'checklists' && (
        <>
          <div className="p-6">
            <div
              role="tablist"
              aria-label="Cleaning Category Tabs"
              className="grid grid-cols-5 gap-4"
            >
              {categories.map(category => (
                <button
                  key={category.id}
                  role="tab"
                  aria-selected={selectedCategory?.id === category.id}
                  aria-controls={`panel-${category.id}`}
                  id={`tab-${category.id}`}
                  onClick={() => handleCategoryClick(category)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full ${
                    selectedCategory?.id === category.id
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon path={category.icon} size={1.2} color={category.iconColor} />
                  <span>{category.title}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <div
              role="tabpanel"
              id={`panel-${selectedCategory.id}`}
              aria-labelledby={`tab-${selectedCategory.id}`}
              className="p-6 bg-white rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${selectedCategory.iconColor}20` }}
                >
                  <Icon
                    path={selectedCategory.icon}
                    size={1.5}
                    color={selectedCategory.iconColor}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedCategory.title}</h3>
              </div>
              <div className="space-y-4">
                {selectedCategory.id === 'setup' && !selectedChecklist && (
                  <div className="space-y-4">
                    {setupChecklists.map(checklist => (
                      <div
                        key={checklist.id}
                        onClick={() => handleChecklistSelect(checklist)}
                        onKeyDown={e => e.key === 'Enter' && handleChecklistSelect(checklist)}
                        className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${checklist.title} checklist`}
                      >
                        <h3 className="font-medium text-[#5b5b5b]">{checklist.title}</h3>
                      </div>
                    ))}
                  </div>
                )}

                {selectedChecklist && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#5b5b5b]">
                      {selectedChecklist.title}
                    </h3>
                    <div className="space-y-2">
                      {selectedChecklist.items.map(item => renderChecklistItem(item))}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleMarkComplete}
                        className="bg-[#4ECDC4] text-white px-4 py-2 rounded-lg hover:bg-[#3db8b0] transition-colors"
                        type="button"
                      >
                        Mark All Complete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'sds' && (
        <button
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setActiveTab('checklists')}
          onKeyDown={e => e.key === 'Escape' && setActiveTab('checklists')}
          type="button"
          aria-label="Close SDS Sheets"
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            role="document"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Icon path={mdiFileDocument} size={1.2} color="#4ECDC4" className="mr-2" />
                <h2 className="text-xl font-semibold text-[#5b5b5b]">SDS Sheets</h2>
              </div>
              <button
                onClick={() => setActiveTab('checklists')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close SDS Sheets"
                type="button"
              >
                <Icon path={mdiClose} size={1.2} color="#5b5b5b" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search SDS sheets..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
                <Icon
                  path={mdiMagnify}
                  size={1}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
              <select
                value={sdsCategory}
                onChange={e => setSdsCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              >
                <option value="all">All Categories</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Sanitization">Sanitization</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredSDSSheets.map(sheet => (
                <div
                  key={sheet.id}
                  onClick={() => setSelectedSDS(sheet)}
                  onKeyDown={e => e.key === 'Enter' && setSelectedSDS(sheet)}
                  className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${sheet.name} SDS sheet`}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[#5b5b5b]">{sheet.name}</h3>
                    <span className="text-sm text-gray-500">•</span>
                    <p className="text-sm text-gray-500">{sheet.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{sheet.lastUpdated}</span>
                    <Icon path={mdiFileDocument} size={1} color="#4ECDC4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </button>
      )}

      {/* Modal */}
      <BaseModal
        show={showModal}
        onClose={handleCloseModal}
        title={selectedCategory?.title || 'Select Checklist'}
        footer={
          <div className="flex justify-between w-full">
            <Button
              variant="success"
              onClick={handleMarkComplete}
              className="bg-brand-primary hover:bg-brand-primary text-white font-medium py-2 px-4 rounded-md"
            >
              Mark Complete
            </Button>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            >
              Close
            </Button>
          </div>
        }
      >
        {!selectedChecklist ? (
          <div className="space-y-3">
            {selectedCategory &&
              getChecklistsForCategory(selectedCategory.id).map(checklist => (
                <div
                  key={checklist.id}
                  onClick={() => handleChecklistSelect(checklist)}
                  onKeyDown={e => e.key === 'Enter' && handleChecklistSelect(checklist)}
                  className="w-full p-3 text-left bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${checklist.title} checklist`}
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-1">{checklist.title}</h3>
                  <p className="text-sm text-gray-600">{checklist.description}</p>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800">{selectedChecklist.title}</h2>
              <button
                onClick={() => setSelectedChecklist(null)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
              >
                <Icon path={mdiArrowLeft} size={1} className="mr-1" />
                Back to Lists
              </button>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {selectedChecklist.items.map(item => renderChecklistItem(item))}
            </div>

            {/* Stolen Items Section */}
            <div className="mt-4 border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-800">Reported Stolen Items</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStolenItems([])}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleAddStolenItem}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm"
                  >
                    + Add Stolen Item
                  </button>
                </div>
              </div>
              {stolenItems.map((item, index) => (
                <div key={index} className="flex gap-3 mb-2">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.item}
                    onChange={e => handleUpdateStolenItem(index, 'item', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e =>
                      handleUpdateStolenItem(index, 'quantity', parseInt(e.target.value))
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    value={item.notes}
                    onChange={e => handleUpdateStolenItem(index, 'notes', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>

            {/* PRN Items Section */}
            <div className="mt-4 border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-800">PRN Cleaning Items</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPrnItems([])}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleAddPrnItem}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm"
                  >
                    + Add PRN Item
                  </button>
                </div>
              </div>
              {prnItems.map((item, index) => (
                <div key={index} className="flex gap-3 mb-2">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.item}
                    onChange={e => handleUpdatePrnItem(index, 'item', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => handleUpdatePrnItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Reason"
                    value={item.reason}
                    onChange={e => handleUpdatePrnItem(index, 'reason', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>

            {/* Notes Section */}
            <div className="mt-4 border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-800">Notes</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNotes('')}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Clear Notes
                  </button>
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`px-3 py-1 rounded-md text-sm ${
                      isRecording
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any additional notes here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}
      </BaseModal>

      {/* SDS Modal */}
      <BaseModal
        show={!!selectedSDS}
        onClose={() => setSelectedSDS(null)}
        title="Safety Data Sheet"
      >
        {selectedSDS && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">{selectedSDS.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedSDS.name}</p>
              <div className="flex flex-wrap gap-2">
                {selectedSDS.sections.map(section => (
                  <span
                    key={section}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
};

export default CleaningChecklists;
