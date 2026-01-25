import React from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const FileUpload = ({ onFileUpload, parseOnClient = false }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const fileType = file.name.split('.').pop().toLowerCase();

    if (!file) {
      return;
    }

    if (!parseOnClient) {
      // Pass the raw file to the parent component for backend upload
      onFileUpload(file);
      return;
    }

    // If parsing on the client-side, proceed with reading the file
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;

      if (fileType === 'csv') {
        // Parse CSV file using papaparse
        Papa.parse(data, {
          header: true,
          complete: (results) => {
            onFileUpload(results.data);  // Pass parsed CSV data to the parent
          },
        });
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        // Parse Excel file using xlsx
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        onFileUpload(parsedData);  // Pass parsed Excel data to the parent
      }
    };

    if (fileType === 'csv') {
      reader.readAsText(file);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      reader.readAsBinaryString(file);
    }
  };

  return (
    <>
        <div>
            <label htmlFor="fileUpload">Upload Excel (.xlsx) file: </label>
            <input type="file" id="fileUpload" accept=".xlsx" onChange={handleFileChange} />
        </div>
    </>
  );
};

export default FileUpload;