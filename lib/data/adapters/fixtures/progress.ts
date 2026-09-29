import type { DailyProgressReport } from '@/lib/data/types';

/**
 * Daily progress reports for SH-19, the most fully populated project.
 * Statuses deliberately spread so the register and approval chip both
 * demonstrate. Numbering follows FY 2025-26 => 2526.
 */
export const dailyProgressReports: DailyProgressReport[] = [
  {
    id: 'DPR-0001',
    documentNo: 'UIE/DPR/2526/0041',
    date: '2026-09-22',
    companyId: 'CMP-UIE',
    projectId: 'PRJ-SH19',
    siteId: 'SITE-SH19-KM32',
    status: 'APPROVED',
    revisionNo: 0,
    weather: 'CLEAR',
    progressLines: [
      { id: 'DPL-1', wbsId: 'WBS-SH19-0101', uomCode: 'CUM', todayQty: 1840, cumulativeQty: 494620, location: 'Km 33+400 to 33+900', remarks: 'Cutting in hard murrum' },
      { id: 'DPL-2', wbsId: 'WBS-SH19-0102', uomCode: 'CUM', todayQty: 620, cumulativeQty: 128400, location: 'Km 33+100 to 33+400' },
    ],
    labourLines: [
      { id: 'DLL-1', trade: 'EARTHWORK', skilledCount: 6, unskilledCount: 28 },
      { id: 'DLL-2', trade: 'BAR_BENDING', subcontractorId: 'SUB-0003', skilledCount: 9, unskilledCount: 4 },
    ],
    equipmentLines: [
      { id: 'DEL-1', equipmentId: 'EQP-0006', hoursWorked: 8.5, idleHours: 1, breakdownHours: 0, dieselIssued: 62 },
      { id: 'DEL-2', equipmentId: 'EQP-0013', hoursWorked: 7, idleHours: 2, breakdownHours: 0, dieselIssued: 48 },
    ],
    safetyIncidents: 0,
    generalRemarks: 'Client representative inspected embankment layer at Km 33+600.',
    preparedByName: 'Anand Kumar Vemula',
    createdBy: 'EMP-0004',
    createdOn: '2026-09-22T18:40:00',
    approvals: [
      { level: 1, approverName: 'Ravindra Reddy Palle', approverRole: 'Project Manager', action: 'APPROVED', actionedOn: '2026-09-23T09:15:00', remarks: 'Quantities tally with the MB.' },
    ],
  },
  {
    id: 'DPR-0002',
    documentNo: 'UIE/DPR/2526/0042',
    date: '2026-09-23',
    companyId: 'CMP-UIE',
    projectId: 'PRJ-SH19',
    siteId: 'SITE-SH19-KM32',
    status: 'APPROVED',
    revisionNo: 0,
    weather: 'HEAVY_RAIN',
    rainfallMm: 68,
    hoursLost: 6,
    progressLines: [
      { id: 'DPL-3', wbsId: 'WBS-SH19-0101', uomCode: 'CUM', todayQty: 240, cumulativeQty: 494860, location: 'Km 33+900' },
    ],
    labourLines: [{ id: 'DLL-3', trade: 'EARTHWORK', skilledCount: 4, unskilledCount: 12 }],
    equipmentLines: [
      { id: 'DEL-3', equipmentId: 'EQP-0006', hoursWorked: 2, idleHours: 6, breakdownHours: 0, dieselIssued: 18 },
    ],
    hindranceRemarks: 'Heavy rain from 11:00. Earthwork suspended; compaction not possible on saturated subgrade.',
    safetyIncidents: 0,
    preparedByName: 'Anand Kumar Vemula',
    createdBy: 'EMP-0004',
    createdOn: '2026-09-23T17:55:00',
    approvals: [
      { level: 1, approverName: 'Ravindra Reddy Palle', approverRole: 'Project Manager', action: 'APPROVED', actionedOn: '2026-09-24T08:30:00' },
    ],
  },
  {
    id: 'DPR-0003',
    documentNo: 'UIE/DPR/2526/0043',
    date: '2026-09-24',
    companyId: 'CMP-UIE',
    projectId: 'PRJ-SH19',
    siteId: 'SITE-SH19-KM32',
    status: 'PENDING_APPROVAL',
    revisionNo: 0,
    weather: 'CLOUDY',
    progressLines: [
      { id: 'DPL-4', wbsId: 'WBS-SH19-0101', uomCode: 'CUM', todayQty: 1520, cumulativeQty: 496380, location: 'Km 33+900 to 34+300' },
    ],
    labourLines: [
      { id: 'DLL-4', trade: 'EARTHWORK', skilledCount: 6, unskilledCount: 26 },
      { id: 'DLL-5', trade: 'CONCRETING', skilledCount: 8, unskilledCount: 10 },
    ],
    equipmentLines: [
      { id: 'DEL-4', equipmentId: 'EQP-0006', hoursWorked: 8, idleHours: 1, breakdownHours: 0, dieselIssued: 58 },
      { id: 'DEL-5', equipmentId: 'EQP-0021', hoursWorked: 6.5, idleHours: 1.5, breakdownHours: 0, dieselIssued: 34 },
    ],
    safetyIncidents: 0,
    preparedByName: 'Anand Kumar Vemula',
    createdBy: 'EMP-0004',
    createdOn: '2026-09-24T18:20:00',
    approvals: [
      { level: 1, approverName: 'Ravindra Reddy Palle', approverRole: 'Project Manager', action: 'PENDING' },
    ],
  },
  {
    id: 'DPR-0004',
    documentNo: 'UIE/DPR/2526/0044',
    date: '2026-09-25',
    companyId: 'CMP-UIE',
    projectId: 'PRJ-SH19',
    siteId: 'SITE-SH19-KM32',
    status: 'RETURNED',
    revisionNo: 1,
    weather: 'CLEAR',
    progressLines: [
      { id: 'DPL-5', wbsId: 'WBS-SH19-0101', uomCode: 'CUM', todayQty: 1710, cumulativeQty: 498090, location: 'Km 34+300 to 34+700' },
    ],
    labourLines: [{ id: 'DLL-6', trade: 'EARTHWORK', skilledCount: 5, unskilledCount: 24 }],
    equipmentLines: [
      { id: 'DEL-6', equipmentId: 'EQP-0006', hoursWorked: 9, idleHours: 0, breakdownHours: 0, dieselIssued: 66 },
    ],
    safetyIncidents: 0,
    preparedByName: 'Anand Kumar Vemula',
    createdBy: 'EMP-0004',
    createdOn: '2026-09-25T19:05:00',
    approvals: [
      { level: 1, approverName: 'Ravindra Reddy Palle', approverRole: 'Project Manager', action: 'RETURNED', actionedOn: '2026-09-26T10:20:00', remarks: 'Diesel issued to the excavator looks high against 9 hours. Recheck the log book.' },
    ],
  },
  {
    id: 'DPR-0005',
    documentNo: 'UIE/DPR/2526/0045',
    date: '2026-09-26',
    companyId: 'CMP-UIE',
    projectId: 'PRJ-SH19',
    siteId: 'SITE-SH19-KM32',
    status: 'DRAFT',
    revisionNo: 0,
    weather: 'CLEAR',
    progressLines: [
      { id: 'DPL-6', wbsId: 'WBS-SH19-0101', uomCode: 'CUM', todayQty: 980, cumulativeQty: 499070, location: 'Km 34+700' },
    ],
    labourLines: [{ id: 'DLL-7', trade: 'EARTHWORK', skilledCount: 4, unskilledCount: 18 }],
    equipmentLines: [
      { id: 'DEL-7', equipmentId: 'EQP-0006', hoursWorked: 5, idleHours: 3, breakdownHours: 1, dieselIssued: 36 },
    ],
    hindranceRemarks: 'Excavator down for one hour — hydraulic hose replaced from site stock.',
    safetyIncidents: 0,
    preparedByName: 'Anand Kumar Vemula',
    createdBy: 'EMP-0004',
    createdOn: '2026-09-26T18:10:00',
  },
];
