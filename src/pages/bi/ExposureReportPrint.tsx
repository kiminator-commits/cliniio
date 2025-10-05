import React, { useEffect } from 'react';

interface ExposureReportPrintProps {
  exposures: Record<string, unknown>[];
  facilityName: string;
  reportDate: string;
}

export default function ExposureReportPrint({
  exposures,
  facilityName,
  reportDate,
}: ExposureReportPrintProps) {
  useEffect(() => {
    // Automatically trigger print dialog once
    window.print();
  }, []);

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        color: '#111',
        backgroundColor: '#fff',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        Patient Exposure Report
      </h1>
      <p
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}
      >
        {facilityName} — {reportDate}
      </p>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.85rem',
        }}
      >
        <thead>
          <tr>
            {Object.keys(exposures[0] || {}).map((key) => (
              <th
                key={key}
                style={{
                  border: '1px solid #ccc',
                  padding: '6px',
                  textAlign: 'left',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 600,
                }}
              >
                {key.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exposures.map((row, idx) => (
            <tr key={idx}>
              {Object.keys(row).map((key) => (
                <td
                  key={key}
                  style={{
                    border: '1px solid #ccc',
                    padding: '5px 6px',
                  }}
                >
                  {String(row[key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p
        style={{
          textAlign: 'center',
          marginTop: '2rem',
          fontSize: '0.75rem',
          color: '#666',
        }}
      >
        Generated on {new Date().toLocaleString()}
      </p>
    </div>
  );
}
