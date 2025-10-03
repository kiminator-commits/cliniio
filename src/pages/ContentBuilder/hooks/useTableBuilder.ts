import { useState, useCallback } from 'react';

interface TableBuilderState {
  showTableBuilder: boolean;
  tableData: string[][];
  tableHeaders: string[];
}

interface TableBuilderActions {
  setShowTableBuilder: (show: boolean) => void;
  setTableData: (data: string[][]) => void;
  setTableHeaders: (headers: string[]) => void;
  addTableColumn: () => void;
  removeTableColumn: (colIndex: number) => void;
  addTableRow: () => void;
  removeTableRow: (rowIndex: number) => void;
  updateTableCell: (rowIndex: number, colIndex: number, value: string) => void;
  updateTableHeader: (colIndex: number, value: string) => void;
  insertTableIntoContent: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
  resetTable: () => void;
}

export function useTableBuilder(
  initialState?: Partial<TableBuilderState>
): TableBuilderState & TableBuilderActions {
  const [showTableBuilder, setShowTableBuilder] = useState(
    initialState?.showTableBuilder || false
  );
  const [tableData, setTableData] = useState<string[][]>(
    initialState?.tableData || [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ]
  );
  const [tableHeaders, setTableHeaders] = useState<string[]>(
    initialState?.tableHeaders || ['Column 1', 'Column 2', 'Column 3']
  );

  const addTableColumn = useCallback(() => {
    const newHeaders = [...tableHeaders, `Column ${tableHeaders.length + 1}`];
    setTableHeaders(newHeaders);
    const newData = tableData.map((row) => [...row, '']);
    setTableData(newData);
  }, [tableHeaders, tableData]);

  const removeTableColumn = useCallback(
    (colIndex: number) => {
      if (tableHeaders.length > 1) {
        const newHeaders = tableHeaders.filter(
          (_, index) => index !== colIndex
        );
        setTableHeaders(newHeaders);
        const newData = tableData.map((row) =>
          row.filter((_, index) => index !== colIndex)
        );
        setTableData(newData);
      }
    },
    [tableHeaders, tableData]
  );

  const addTableRow = useCallback(() => {
    const newData = [...tableData, new Array(tableHeaders.length).fill('')];
    setTableData(newData);
  }, [tableData, tableHeaders.length]);

  const removeTableRow = useCallback(
    (rowIndex: number) => {
      if (tableData.length > 1) {
        const newData = tableData.filter((_, index) => index !== rowIndex);
        setTableData(newData);
      }
    },
    [tableData]
  );

  const updateTableCell = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      const newData = [...tableData];
      newData[rowIndex][colIndex] = value;
      setTableData(newData);
    },
    [tableData]
  );

  const updateTableHeader = useCallback(
    (colIndex: number, value: string) => {
      const newHeaders = [...tableHeaders];
      newHeaders[colIndex] = value;
      setTableHeaders(newHeaders);
    },
    [tableHeaders]
  );

  const insertTableIntoContent = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = document.getElementById(
        'content-main-tab'
      ) as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;

        let tableText = '\n\n';
        tableText += '| ' + tableHeaders.join(' | ') + ' |\n';
        tableText += '|' + tableHeaders.map(() => '---').join('|') + '|\n';
        tableData.forEach((row) => {
          tableText +=
            '| ' + row.map((cell) => cell || ' ').join(' | ') + ' |\n';
        });
        tableText += '\n';

        const newContent =
          content.substring(0, start) + tableText + content.substring(start);
        onContentChange(newContent);
        setShowTableBuilder(false);

        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + tableText.length,
            start + tableText.length
          );
        }, 0);
      }
    },
    [tableHeaders, tableData]
  );

  const resetTable = useCallback(() => {
    setTableData([
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ]);
    setTableHeaders(['Column 1', 'Column 2', 'Column 3']);
    setShowTableBuilder(false);
  }, []);

  return {
    showTableBuilder,
    tableData,
    tableHeaders,
    setShowTableBuilder,
    setTableData,
    setTableHeaders,
    addTableColumn,
    removeTableColumn,
    addTableRow,
    removeTableRow,
    updateTableCell,
    updateTableHeader,
    insertTableIntoContent,
    resetTable,
  };
}
