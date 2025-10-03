import React from 'react';

interface EmptyStateProps {
  selectedCategory: string | null;
}
export const EmptyState: React.FC<EmptyStateProps> = ({ selectedCategory }) => (
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
