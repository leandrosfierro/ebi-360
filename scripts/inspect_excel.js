
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'public/EBI_MVP_Algoritmo_v1.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Sheets found:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Columns:', data[0]);
    console.log('Sample Row:', data[1]);
});
