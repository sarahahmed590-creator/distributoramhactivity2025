import React, { useState, useRef } from 'react';
import { Trash2, Plus, Download, FileSpreadsheet, Presentation, Upload, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DistributorCompetition() {
  const [distributors, setDistributors] = useState([
    { id: 1, name: 'Distributor 1', activities: '', amhSold: '', urusSold: '' }
  ]);
  
  const [pointSettings, setPointSettings] = useState({
    activityPoints: 5,
    amhPoints: 1,
    urusPoints: 1
  });

  const [newDistributorName, setNewDistributorName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const addDistributor = () => {
    if (newDistributorName.trim()) {
      setDistributors([...distributors, {
        id: Date.now(),
        name: newDistributorName.trim(),
        activities: '',
        amhSold: '',
        urusSold: ''
      }]);
      setNewDistributorName('');
    }
  };

  const bulkImportDistributors = () => {
    const names = bulkNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    const newDistributors = names.map(name => ({
      id: Date.now() + Math.random(),
      name: name,
      activities: '',
      amhSold: '',
      urusSold: ''
    }));
    
    setDistributors([...distributors, ...newDistributors]);
    setBulkNames('');
    setShowBulkImport(false);
  };

  const removeDistributor = (id) => {
    setDistributors(distributors.filter(d => d.id !== id));
  };

  const updateDistributor = (id, field, value) => {
    setDistributors(distributors.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const calculatePoints = (activities, amhSold, urusSold) => {
    const activityScore = (activities || 0) * pointSettings.activityPoints;
    const amhScore = (amhSold || 0) * pointSettings.amhPoints;
    const urusScore = (urusSold || 0) * pointSettings.urusPoints;
    return activityScore + amhScore + urusScore;
  };

  const calculateTotalQuantity = (activities, amhSold, urusSold) => {
    return (activities || 0) + (amhSold || 0) + (urusSold || 0);
  };

  const calculateReward = (rank, totalSales, activities, points) => {
    const hasActivity = (activities || 0) > 0;
    
    if (points >= 100 && hasActivity) {
      return '5 AMH';
    } else if (points >= 60 && hasActivity) {
      return '3 AMH';
    } else if (points >= 40 && hasActivity) {
      return '2 AMH';
    } else if (points >= 20 && hasActivity) {
      return '1 AMH';
    }
    return 'No reward';
  };

  const downloadExcel = () => {
    // Create data rows with formulas
    const dataRows = rankedDistributors.map((d, index) => {
      const rowNum = index + 2; // +2 because row 1 is header
      return {
        'Rank': d.rank,
        'Distributor': d.name,
        'Activities': d.activities,
        'AMH Sold': d.amhSold,
        'URUS Sold': d.urusSold,
        'Total Quantity': { f: `C${rowNum}+D${rowNum}+E${rowNum}` },
        'Total Sales': { f: `D${rowNum}+E${rowNum}` },
        'Points': { f: `(C${rowNum}*${pointSettings.activityPoints})+(D${rowNum}*${pointSettings.amhPoints})+(E${rowNum}*${pointSettings.urusPoints})` },
        'Reward': { 
          f: `IF(AND(C${rowNum}>0,H${rowNum}>=100),"5 AMH",IF(AND(C${rowNum}>0,H${rowNum}>=60),"3 AMH",IF(AND(C${rowNum}>0,H${rowNum}>=40),"2 AMH",IF(AND(C${rowNum}>0,H${rowNum}>=20),"1 AMH","No reward"))))` 
        }
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    
    // Add settings sheet
    const settingsData = [
      ['Point Settings', ''],
      ['Activity Multiplier', pointSettings.activityPoints],
      ['AMH Multiplier', pointSettings.amhPoints],
      ['URUS Multiplier', pointSettings.urusPoints],
      ['', ''],
      ['Reward Rules', ''],
      ['5 AMH', 'At least 100 points + Activity'],
      ['3 AMH', 'At least 60 points + Activity'],
      ['2 AMH', 'At least 40 points + Activity'],
      ['1 AMH', 'At least 20 points + Activity']
    ];
    
    const settingsSheet = XLSX.utils.aoa_to_sheet(settingsData);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Competition Results');
    XLSX.utils.book_append_sheet(workbook, settingsSheet, 'Settings');
    
    // Set column widths for results sheet
    worksheet['!cols'] = [
      { wch: 8 },  // Rank
      { wch: 20 }, // Distributor
      { wch: 12 }, // Activities
      { wch: 12 }, // AMH Sold
      { wch: 12 }, // URUS Sold
      { wch: 15 }, // Total Quantity
      { wch: 12 }, // Total Sales
      { wch: 10 }, // Points
      { wch: 15 }  // Reward
    ];
    
    // Set column widths for settings sheet
    settingsSheet['!cols'] = [
      { wch: 25 },
      { wch: 15 }
    ];

    XLSX.writeFile(workbook, 'distributor_competition_results.xlsx');
  };

  const downloadPPT = () => {
    // Create HTML content for PPT
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Distributor Competition Results</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      background: linear-gradient(135deg, #1e293b 0%, #1e40af 50%, #1e293b 100%);
      color: white;
      padding: 40px;
      margin: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    h1 {
      font-size: 48px;
      margin: 0 0 10px 0;
      color: #fff;
    }
    .subtitle {
      font-size: 24px;
      color: #93c5fd;
    }
    .company {
      font-size: 20px;
      color: #60a5fa;
      margin-top: 10px;
    }
    .rules {
      background: rgba(6, 182, 212, 0.2);
      border: 2px solid rgba(6, 182, 212, 0.3);
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 40px;
    }
    .rules h2 {
      color: #67e8f9;
      margin-top: 0;
      font-size: 28px;
    }
    .rules-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    .rule-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 10px;
    }
    .rule-title {
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 5px;
    }
    .rule-desc {
      font-size: 14px;
      color: #93c5fd;
    }
    .point-system {
      border-top: 1px solid rgba(6, 182, 212, 0.3);
      padding-top: 20px;
      margin-top: 20px;
    }
    .point-system h3 {
      color: #a5f3fc;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 15px;
      overflow: hidden;
    }
    th {
      background: rgba(255, 255, 255, 0.1);
      color: #67e8f9;
      padding: 15px;
      text-align: left;
      font-size: 16px;
    }
    td {
      padding: 12px 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    tr:nth-child(1), tr:nth-child(2), tr:nth-child(3) {
      background: rgba(234, 179, 8, 0.1);
    }
    tr:nth-child(4), tr:nth-child(5), tr:nth-child(6), tr:nth-child(7) {
      background: rgba(59, 130, 246, 0.1);
    }
    tr:nth-child(8), tr:nth-child(9), tr:nth-child(10), tr:nth-child(11), tr:nth-child(12) {
      background: rgba(34, 197, 94, 0.1);
    }
    .rank {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      font-weight: bold;
      background: rgba(255, 255, 255, 0.2);
    }
    .rank-1 { background: #eab308; color: black; }
    .rank-2 { background: #9ca3af; color: black; }
    .rank-3 { background: #ea580c; color: white; }
    .reward {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
    }
    .reward-5 { background: #eab308; color: black; }
    .reward-3 { background: #3b82f6; color: white; }
    .reward-2 { background: #22c55e; color: white; }
    .reward-1 { background: #a855f7; color: white; }
    .reward-none { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Distributor Competition</h1>
    <div class="subtitle">AMH/URUS Sales Ranking & Rewards</div>
    <div class="company">Jack World No.1</div>
  </div>

  <div class="rules">
    <h2>Competition Rules</h2>
    <div class="rules-grid">
      <div class="rule-item">
        <div class="rule-title">5 free AMH</div>
        <div class="rule-desc">At least 100 points</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">3 free AMH</div>
        <div class="rule-desc">At least 60 points</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">2 free AMH</div>
        <div class="rule-desc">At least 40 points</div>
      </div>
      <div class="rule-item">
        <div class="rule-title">1 free AMH</div>
        <div class="rule-desc">At least 20 points</div>
      </div>
    </div>
    <div class="point-system">
      <h3>Point System:</h3>
      <div style="font-size: 14px; color: #a5f3fc;">
        <div>• Each Activity = ${pointSettings.activityPoints} points</div>
        <div>• Each AMH sold = ${pointSettings.amhPoints} point</div>
        <div>• Each URUS sold = ${pointSettings.urusPoints} point</div>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Distributor</th>
        <th class="text-center">Activities</th>
        <th class="text-center">AMH Sold</th>
        <th class="text-center">URUS Sold</th>
        <th class="text-center">Total Qty</th>
        <th class="text-center">Total Sales</th>
        <th class="text-center">Points</th>
        <th class="text-center">Reward</th>
      </tr>
    </thead>
    <tbody>
      ${rankedDistributors.map(d => `
        <tr>
          <td>
            <span class="rank ${d.rank <= 3 ? `rank-${d.rank}` : ''}">
              ${d.rank}
            </span>
          </td>
          <td class="font-bold">${d.name}</td>
          <td class="text-center">${d.activities}</td>
          <td class="text-center">${d.amhSold}</td>
          <td class="text-center">${d.urusSold}</td>
          <td class="text-center font-bold">${d.totalQuantity}</td>
          <td class="text-center font-bold">${d.totalSales}</td>
          <td class="text-center font-bold" style="color: #fde047;">${d.points}</td>
          <td class="text-center">
            <span class="reward ${
              d.reward === '5 AMH' ? 'reward-5' :
              d.reward === '3 AMH' ? 'reward-3' :
              d.reward === '2 AMH' ? 'reward-2' :
              d.reward === '1 AMH' ? 'reward-1' :
              'reward-none'
            }">
              ${d.reward}
            </span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'distributor_competition_presentation.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadFillableTemplate = () => {
    // Create template with current distributors or empty template
    const templateData = distributors.length > 1 || distributors[0].name !== 'Distributor 1' 
      ? distributors.map(d => ({
          'Distributor Name': d.name,
          'Activities': '',
          'AMH Sold': '',
          'URUS Sold': ''
        }))
      : [
          { 'Distributor Name': '', 'Activities': '', 'AMH Sold': '', 'URUS Sold': '' },
          { 'Distributor Name': '', 'Activities': '', 'AMH Sold': '', 'URUS Sold': '' },
          { 'Distributor Name': '', 'Activities': '', 'AMH Sold': '', 'URUS Sold': '' }
        ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Add instructions sheet
    const instructions = [
      ['HOW TO USE THIS TEMPLATE'],
      [''],
      ['1. Fill in the distributor names in the "Distributor Name" column'],
      ['2. Enter the number of activities in the "Activities" column'],
      ['3. Enter the number of AMH sold in the "AMH Sold" column'],
      ['4. Enter the number of URUS sold in the "URUS Sold" column'],
      ['5. Save the file'],
      ['6. Click "Upload Results" button in the competition tracker'],
      ['7. Select this saved file'],
      [''],
      ['IMPORTANT NOTES:'],
      ['- Do not change the column headers'],
      ['- Leave cells empty if no data (do not put 0)'],
      ['- Make sure all names are spelled correctly'],
      ['- Only numbers allowed in Activities, AMH Sold, and URUS Sold columns']
    ];
    
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Competition Data');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
    
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 }
    ];
    
    instructionsSheet['!cols'] = [{ wch: 70 }];
    
    XLSX.writeFile(workbook, 'competition_fillable_template.xlsx');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Read the Competition Data sheet
        const worksheet = workbook.Sheets['Competition Data'];
        if (!worksheet) {
          setUploadError('Could not find "Competition Data" sheet. Please use the downloaded template.');
          return;
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          setUploadError('No data found in the file.');
          return;
        }
        
        // Validate and import data
        const importedDistributors = jsonData
          .filter(row => row['Distributor Name'] && row['Distributor Name'].toString().trim() !== '')
          .map((row, index) => ({
            id: Date.now() + index,
            name: row['Distributor Name'].toString().trim(),
            activities: row['Activities'] ? parseInt(row['Activities']) || '' : '',
            amhSold: row['AMH Sold'] ? parseInt(row['AMH Sold']) || '' : '',
            urusSold: row['URUS Sold'] ? parseInt(row['URUS Sold']) || '' : ''
          }));
        
        if (importedDistributors.length === 0) {
          setUploadError('No valid distributor data found.');
          return;
        }
        
        // Replace all distributors with imported data
        setDistributors(importedDistributors);
        alert(`Successfully imported ${importedDistributors.length} distributors!`);
        
      } catch (error) {
        setUploadError('Error reading file. Please make sure it is a valid Excel file.');
        console.error(error);
      }
    };
    
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset file input
  };

  const downloadRewardSummary = () => {
    // Only include distributors who won rewards
    const allWinners = [
      ...rewardSummary.fiveAMH.map(d => ({ ...d, rewardAmount: 5, rewardText: '5 AMH', color: '#eab308' })),
      ...rewardSummary.threeAMH.map(d => ({ ...d, rewardAmount: 3, rewardText: '3 AMH', color: '#3b82f6' })),
      ...rewardSummary.twoAMH.map(d => ({ ...d, rewardAmount: 2, rewardText: '2 AMH', color: '#22c55e' })),
      ...rewardSummary.oneAMH.map(d => ({ ...d, rewardAmount: 1, rewardText: '1 AMH', color: '#a855f7' }))
    ];

    if (allWinners.length === 0) {
      alert('No distributors have won rewards yet.');
      return;
    }

    // Create HTML with all certificates
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Distributor Reward Certificates</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    
    .certificate {
      width: 297mm;
      height: 210mm;
      page-break-after: always;
      background: linear-gradient(135deg, #1e293b 0%, #1e40af 50%, #1e293b 100%);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 60px;
      box-sizing: border-box;
    }
    
    .certificate:last-child {
      page-break-after: avoid;
    }
    
    .border {
      position: absolute;
      top: 30px;
      left: 30px;
      right: 30px;
      bottom: 30px;
      border: 8px solid rgba(6, 182, 212, 0.5);
      border-radius: 20px;
    }
    
    .inner-border {
      position: absolute;
      top: 45px;
      left: 45px;
      right: 45px;
      bottom: 45px;
      border: 3px solid rgba(6, 182, 212, 0.3);
      border-radius: 15px;
    }
    
    .content {
      position: relative;
      z-index: 10;
      text-align: center;
    }
    
    .logo {
      font-size: 32px;
      color: #60a5fa;
      font-weight: bold;
      margin-bottom: 20px;
    }
    
    .title {
      font-size: 56px;
      font-weight: bold;
      margin-bottom: 40px;
      color: #67e8f9;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    
    .awarded-to {
      font-size: 24px;
      color: #93c5fd;
      margin-bottom: 20px;
    }
    
    .distributor-name {
      font-size: 72px;
      font-weight: bold;
      margin-bottom: 50px;
      color: white;
      text-shadow: 0 0 30px rgba(103, 232, 249, 0.5);
    }
    
    .reward-box {
      background: rgba(255, 255, 255, 0.1);
      border: 4px solid;
      border-radius: 20px;
      padding: 40px 80px;
      margin-bottom: 50px;
      backdrop-filter: blur(10px);
    }
    
    .reward-label {
      font-size: 28px;
      color: #93c5fd;
      margin-bottom: 15px;
    }
    
    .reward-amount {
      font-size: 96px;
      font-weight: bold;
      line-height: 1;
      margin-bottom: 10px;
      text-shadow: 0 0 40px currentColor;
    }
    
    .reward-text {
      font-size: 36px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .performance {
      background: rgba(6, 182, 212, 0.1);
      border: 2px solid rgba(6, 182, 212, 0.3);
      border-radius: 15px;
      padding: 30px 50px;
      margin-bottom: 40px;
      display: inline-block;
    }
    
    .perf-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      text-align: center;
    }
    
    .perf-item {
      display: flex;
      flex-direction: column;
    }
    
    .perf-label {
      font-size: 18px;
      color: #93c5fd;
      margin-bottom: 10px;
    }
    
    .perf-value {
      font-size: 42px;
      font-weight: bold;
      color: #fde047;
    }
    
    .congratulations {
      font-size: 32px;
      color: #67e8f9;
      font-style: italic;
      margin-top: 30px;
    }
    
    .footer {
      position: absolute;
      bottom: 60px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 20px;
      color: #60a5fa;
    }
    
    @media print {
      body { margin: 0; }
      .certificate { page-break-after: always; }
    }
  </style>
</head>
<body>
  ${allWinners.map(d => `
    <div class="certificate">
      <div class="border"></div>
      <div class="inner-border"></div>
      
      <div class="content">
        <div class="logo">Jack World No.1</div>
        <div class="title">Reward Certificate</div>
        <div class="awarded-to">This certificate is awarded to</div>
        <div class="distributor-name">${d.name}</div>
        
        <div class="reward-box" style="border-color: ${d.color};">
          <div class="reward-label">You Have Earned</div>
          <div class="reward-amount" style="color: ${d.color};">${d.rewardAmount}</div>
          <div class="reward-text" style="color: ${d.color};">FREE AMH MACHINES</div>
        </div>
        
        <div class="performance">
          <div class="perf-grid">
            <div class="perf-item">
              <div class="perf-label">Activities</div>
              <div class="perf-value">${d.activities}</div>
            </div>
            <div class="perf-item">
              <div class="perf-label">Total Points</div>
              <div class="perf-value">${d.points}</div>
            </div>
            <div class="perf-item">
              <div class="perf-label">Rank</div>
              <div class="perf-value">#${d.rank}</div>
            </div>
          </div>
        </div>
        
        <div class="congratulations">Congratulations on your outstanding performance!</div>
      </div>
      
      <div class="footer">
        Distributor Competition Results • AMH/URUS Sales Rewards
      </div>
    </div>
  `).join('')}
  
  <script>
    // Auto-print dialog after a short delay
    setTimeout(() => {
      window.print();
    }, 500);
  </script>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'distributor_reward_certificates.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const rankedDistributors = distributors
    .map(d => ({
      ...d,
      totalSales: (d.amhSold || 0) + (d.urusSold || 0),
      totalQuantity: calculateTotalQuantity(d.activities, d.amhSold, d.urusSold),
      points: calculatePoints(d.activities, d.amhSold, d.urusSold)
    }))
    .map((d, index) => {
      // Calculate what rank they would have if sorted
      const sorted = [...distributors].map(dist => ({
        id: dist.id,
        points: calculatePoints(dist.activities, dist.amhSold, dist.urusSold)
      })).sort((a, b) => b.points - a.points);
      
      const rank = sorted.findIndex(s => s.id === d.id) + 1;
      
      return {
        ...d,
        rank: rank,
        reward: calculateReward(rank, d.totalSales, d.activities, d.points)
      };
    });

  // Calculate reward summary
  const rewardSummary = {
    fiveAMH: rankedDistributors.filter(d => d.reward === '5 AMH'),
    threeAMH: rankedDistributors.filter(d => d.reward === '3 AMH'),
    twoAMH: rankedDistributors.filter(d => d.reward === '2 AMH'),
    oneAMH: rankedDistributors.filter(d => d.reward === '1 AMH')
  };

  const totalFreeMachines = 
    (rewardSummary.fiveAMH.length * 5) +
    (rewardSummary.threeAMH.length * 3) +
    (rewardSummary.twoAMH.length * 2) +
    (rewardSummary.oneAMH.length * 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Distributor Competition</h1>
              <p className="text-blue-200">AMH/URUS Sales Ranking & Rewards</p>
            </div>
            <div className="text-right">
              <div className="text-blue-400 font-semibold">Jack World No.1</div>
            </div>
          </div>

          {/* Rules Summary */}
          <div className="bg-cyan-500/20 rounded-xl p-6 mb-8 border border-cyan-400/30">
            <h2 className="text-xl font-bold text-cyan-300 mb-4">Competition Rules</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-cyan-100">
              <div>
                <div className="font-semibold mb-2">5 free AMH</div>
                <div className="text-xs">At least 100 points</div>
              </div>
              <div>
                <div className="font-semibold mb-2">3 free AMH</div>
                <div className="text-xs">At least 60 points</div>
              </div>
              <div>
                <div className="font-semibold mb-2">2 free AMH</div>
                <div className="text-xs">At least 40 points</div>
              </div>
              <div>
                <div className="font-semibold mb-2">1 free AMH</div>
                <div className="text-xs">At least 20 points</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-cyan-400/30">
              <div className="text-cyan-200 font-semibold mb-3">Point System:</div>
              <div className="text-sm text-cyan-100 mb-3">
                <div className="mb-1">• Each Activity = 5 points</div>
                <div className="mb-1">• Each AMH sold = 1 point</div>
                <div>• Each URUS sold = 1 point</div>
              </div>
              <div className="text-cyan-200 font-semibold mb-3">Adjust Multipliers (Optional):</div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-cyan-300 block mb-1">Activity Multiplier</label>
                  <input
                    type="number"
                    value={pointSettings.activityPoints}
                    onChange={(e) => setPointSettings({...pointSettings, activityPoints: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/20 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    min="0"
                  />
                  <div className="text-xs text-cyan-200 mt-1">1 activity × {pointSettings.activityPoints} = {pointSettings.activityPoints} points</div>
                </div>
                <div>
                  <label className="text-xs text-cyan-300 block mb-1">AMH Multiplier</label>
                  <input
                    type="number"
                    value={pointSettings.amhPoints}
                    onChange={(e) => setPointSettings({...pointSettings, amhPoints: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/20 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    min="0"
                  />
                  <div className="text-xs text-cyan-200 mt-1">1 AMH × {pointSettings.amhPoints} = {pointSettings.amhPoints} point(s)</div>
                </div>
                <div>
                  <label className="text-xs text-cyan-300 block mb-1">URUS Multiplier</label>
                  <input
                    type="number"
                    value={pointSettings.urusPoints}
                    onChange={(e) => setPointSettings({...pointSettings, urusPoints: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/20 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    min="0"
                  />
                  <div className="text-xs text-cyan-200 mt-1">1 URUS × {pointSettings.urusPoints} = {pointSettings.urusPoints} point(s)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Distributor Section */}
          <div className="bg-white/5 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Add Distributors</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={newDistributorName}
                onChange={(e) => setNewDistributorName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDistributor()}
                className="flex-1 bg-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Enter distributor name..."
              />
              <button
                onClick={addDistributor}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold"
              >
                <Plus size={20} />
                Add
              </button>
              <button
                onClick={() => setShowBulkImport(!showBulkImport)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Bulk Import
              </button>
            </div>
            
            {showBulkImport && (
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Paste distributor names (one per line)</h3>
                <textarea
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  className="w-full bg-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 min-h-[150px]"
                  placeholder="Distributor 1&#10;Distributor 2&#10;Distributor 3&#10;..."
                />
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={bulkImportDistributors}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
                  >
                    Import All
                  </button>
                  <button
                    onClick={() => {
                      setBulkNames('');
                      setShowBulkImport(false);
                    }}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-2 rounded-lg transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Table */}
          <div className="bg-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4 flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-white">Competition Results</h2>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={downloadFillableTemplate}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm"
                >
                  <FileDown size={18} />
                  Fillable Template
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm"
                >
                  <Upload size={18} />
                  Upload Results
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={downloadExcel}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm"
                >
                  <FileSpreadsheet size={18} />
                  Excel
                </button>
                <button
                  onClick={downloadPPT}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm"
                >
                  <Presentation size={18} />
                  Presentation
                </button>
              </div>
            </div>
            {uploadError && (
              <div className="px-6 pb-4">
                <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 text-red-300 text-sm">
                  {uploadError}
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr className="text-cyan-300">
                    <th className="px-6 py-3 text-left">Rank</th>
                    <th className="px-6 py-3 text-left">Distributor</th>
                    <th className="px-6 py-3 text-center">Activities</th>
                    <th className="px-6 py-3 text-center">AMH Sold</th>
                    <th className="px-6 py-3 text-center">URUS Sold</th>
                    <th className="px-6 py-3 text-center">Total Qty</th>
                    <th className="px-6 py-3 text-center">Total Sales</th>
                    <th className="px-6 py-3 text-center">Points</th>
                    <th className="px-4 py-3 text-center w-32">Reward</th>
                    <th className="px-6 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedDistributors.map((d, idx) => (
                    <tr 
                      key={d.id} 
                      className={`border-t border-white/10 ${
                        idx < 3 ? 'bg-yellow-500/10' : 
                        idx < 7 ? 'bg-blue-500/10' : 
                        idx < 12 ? 'bg-green-500/10' : 
                        'bg-white/5'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          d.rank === 1 ? 'bg-yellow-500 text-black' :
                          d.rank === 2 ? 'bg-gray-400 text-black' :
                          d.rank === 3 ? 'bg-orange-600 text-white' :
                          'bg-white/20 text-white'
                        }`}>
                          {d.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        <input
                          type="text"
                          value={d.name}
                          onChange={(e) => updateDistributor(d.id, 'name', e.target.value)}
                          className="w-full bg-white/20 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 font-semibold"
                          placeholder="Distributor name"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={d.activities}
                          onChange={(e) => updateDistributor(d.id, 'activities', e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          className="w-20 bg-white/20 text-cyan-300 text-center px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          min="0"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={d.amhSold}
                          onChange={(e) => updateDistributor(d.id, 'amhSold', e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          className="w-20 bg-white/20 text-cyan-300 text-center px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          min="0"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={d.urusSold}
                          onChange={(e) => updateDistributor(d.id, 'urusSold', e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                          className="w-20 bg-white/20 text-cyan-300 text-center px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          min="0"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4 text-center text-cyan-200 font-semibold">{d.totalQuantity}</td>
                      <td className="px-6 py-4 text-center text-white font-semibold">{d.totalSales}</td>
                      <td className="px-6 py-4 text-center text-yellow-300 font-bold">{d.points}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-block px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                          d.reward === '5 AMH' ? 'bg-yellow-500 text-black' :
                          d.reward === '3 AMH' ? 'bg-blue-500 text-white' :
                          d.reward === '2 AMH' ? 'bg-green-500 text-white' :
                          d.reward === '1 AMH' ? 'bg-purple-500 text-white' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {d.reward}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => removeDistributor(d.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-2 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reward Summary */}
          <div className="bg-white/5 rounded-xl p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Reward Summary</h2>
              <button
                onClick={downloadRewardSummary}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold"
              >
                <Download size={20} />
                Download Certificates
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {rewardSummary.fiveAMH.length > 0 && (
                <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-yellow-300">5 Free AMH Winners</h3>
                    <span className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold">
                      {rewardSummary.fiveAMH.length} × 5 = {rewardSummary.fiveAMH.length * 5} AMH
                    </span>
                  </div>
                  <div className="space-y-2">
                    {rewardSummary.fiveAMH.map(d => (
                      <div key={d.id} className="text-yellow-100 flex items-center justify-between">
                        <span className="font-semibold">{d.name}</span>
                        <span className="text-yellow-300">{d.points} points</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rewardSummary.threeAMH.length > 0 && (
                <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-blue-300">3 Free AMH Winners</h3>
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
                      {rewardSummary.threeAMH.length} × 3 = {rewardSummary.threeAMH.length * 3} AMH
                    </span>
                  </div>
                  <div className="space-y-2">
                    {rewardSummary.threeAMH.map(d => (
                      <div key={d.id} className="text-blue-100 flex items-center justify-between">
                        <span className="font-semibold">{d.name}</span>
                        <span className="text-blue-300">{d.points} points</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rewardSummary.twoAMH.length > 0 && (
                <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-green-300">2 Free AMH Winners</h3>
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full font-bold">
                      {rewardSummary.twoAMH.length} × 2 = {rewardSummary.twoAMH.length * 2} AMH
                    </span>
                  </div>
                  <div className="space-y-2">
                    {rewardSummary.twoAMH.map(d => (
                      <div key={d.id} className="text-green-100 flex items-center justify-between">
                        <span className="font-semibold">{d.name}</span>
                        <span className="text-green-300">{d.points} points</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rewardSummary.oneAMH.length > 0 && (
                <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-purple-300">1 Free AMH Winners</h3>
                    <span className="bg-purple-500 text-white px-4 py-2 rounded-full font-bold">
                      {rewardSummary.oneAMH.length} × 1 = {rewardSummary.oneAMH.length * 1} AMH
                    </span>
                  </div>
                  <div className="space-y-2">
                    {rewardSummary.oneAMH.map(d => (
                      <div key={d.id} className="text-purple-100 flex items-center justify-between">
                        <span className="font-semibold">{d.name}</span>
                        <span className="text-purple-300">{d.points} points</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 rounded-xl p-6 text-center">
              <div className="text-cyan-300 text-lg mb-2">Total Free Machines to Distribute</div>
              <div className="text-6xl font-bold text-white mb-2">{totalFreeMachines}</div>
              <div className="text-cyan-200 text-xl">AMH Machines</div>
              <div className="mt-4 text-sm text-cyan-300">
                {rewardSummary.fiveAMH.length + rewardSummary.threeAMH.length + rewardSummary.twoAMH.length + rewardSummary.oneAMH.length} distributors won rewards
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}