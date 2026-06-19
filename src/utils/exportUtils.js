import * as XLSX from "xlsx";

export const downloadExcel = (data, headers, sheetName = "Sheet1", filename = "export.xlsx") => {
  if (!data || !data.length) return;

  // Transform data to match headers
  const formattedData = data.map(row => {
    const newRow = {};
    headers.forEach(h => {
      newRow[h.label] = h.format ? h.format(row[h.key], row) : (row[h.key] || "");
    });
    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Set column widths
  const colWidths = headers.map(h => ({ wch: Math.max(h.label.length, 15) }));
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};
