/**
 * Utility for exporting data to Microsoft Excel-compatible CSV files.
 * Includes UTF-8 BOM (\uFEFF) so Excel on Windows & Mac renders special characters (ñ, á, é, í, ó, ú, m², $) correctly.
 */

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  // Format each cell to escape quotes and commas
  const formatCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(formatCell).join(',');
  const dataRows = rows.map((row) => row.map(formatCell).join(',')).join('\r\n');

  // \uFEFF ensures Excel recognizes UTF-8 encoding
  const csvContent = `\uFEFF${headerRow}\r\n${dataRows}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
