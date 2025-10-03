import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus, mdiTable } from '@mdi/js';

interface TableBuilderProps {
  onInsertTable: (tableText: string) => void;
  onClose: () => void;
}

export const TableBuilder: React.FC<TableBuilderProps> = ({
  onInsertTable,
  onClose,
}) => {
  const [tableData, setTableData] = useState<string[][]>([
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]);
  const [tableHeaders, setTableHeaders] = useState([
    'Column 1',
    'Column 2',
    'Column 3',
  ]);

  const addTableColumn = () => {
    setTableHeaders((prev) => [...prev, `Column ${prev.length + 1}`]);
    setTableData((prev) => prev.map((row) => [...row, '']));
  };

  const removeTableColumn = (colIndex: number) => {
    if (tableHeaders.length > 1) {
      setTableHeaders((prev) => prev.filter((_, index) => index !== colIndex));
      setTableData((prev) =>
        prev.map((row) => row.filter((_, index) => index !== colIndex))
      );
    }
  };

  const addTableRow = () => {
    setTableData((prev) => [...prev, new Array(tableHeaders.length).fill('')]);
  };

  const removeTableRow = (rowIndex: number) => {
    if (tableData.length > 1) {
      setTableData((prev) => prev.filter((_, index) => index !== rowIndex));
    }
  };

  const updateTableCell = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  const updateTableHeader = (colIndex: number, value: string) => {
    const newHeaders = [...tableHeaders];
    newHeaders[colIndex] = value;
    setTableHeaders(newHeaders);
  };

  const insertTableIntoContent = () => {
    // Create a modern table format that's actually readable
    let tableText = '\n\n';

    // Add headers
    tableText += '| ' + tableHeaders.join(' | ') + ' |\n';
    tableText += '|' + tableHeaders.map(() => '---').join('|') + '|\n';

    // Add data rows
    tableData.forEach((row) => {
      tableText += '| ' + row.map((cell) => cell || ' ').join(' | ') + ' |\n';
    });

    tableText += '\n';

    onInsertTable(tableText);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon path={mdiTable} size={1.2} className="text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Table Builder
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon path={mdiPlus} size={1.5} className="rotate-45" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Table Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={addTableColumn}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Icon path={mdiPlus} size={0.8} />
              Add Column
            </button>
            <button
              onClick={addTableRow}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              <Icon path={mdiPlus} size={0.8} />
              Add Row
            </button>
          </div>

          {/* Table Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Table Preview</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map((header, colIndex) => (
                      <th
                        key={colIndex}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={header}
                            onChange={(e) =>
                              updateTableHeader(colIndex, e.target.value)
                            }
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {tableHeaders.length > 1 && (
                            <button
                              onClick={() => removeTableColumn(colIndex)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                              title="Remove column"
                            >
                              <Icon path={mdiMinus} size={0.8} />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-3 py-2 whitespace-nowrap text-sm text-gray-900"
                        >
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) =>
                              updateTableCell(
                                rowIndex,
                                colIndex,
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter content..."
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {tableData.length > 1 && (
                          <button
                            onClick={() => removeTableRow(rowIndex)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            title="Remove row"
                          >
                            <Icon path={mdiMinus} size={0.8} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Edit column headers to describe your data</li>
              <li>• Fill in table cells with your content</li>
              <li>• Add or remove columns and rows as needed</li>
              <li>• Click "Insert Table" to add it to your content</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
          >
            Cancel
          </button>
          <button
            onClick={insertTableIntoContent}
            className="px-4 py-2 text-sm font-medium text-white bg-[#4ECDC4] border border-transparent rounded-md hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
          >
            Insert Table
          </button>
        </div>
      </div>
    </div>
  );
};
