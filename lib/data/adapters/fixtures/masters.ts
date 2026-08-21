import type {
  Equipment,
  HsnSac,
  Item,
  StockBalance,
  Subcontractor,
  Uom,
  Vendor,
  WbsNode,
} from '@/lib/data/types';

// ===========================================================================
// UOM
// ===========================================================================
export const uoms: Uom[] = [
  { id: 'UOM-01', code: 'NOS', name: 'Numbers', decimals: 0, category: 'COUNT', isBaseUnit: true, isActive: true },
  { id: 'UOM-02', code: 'KG', name: 'Kilogram', decimals: 3, category: 'WEIGHT', isBaseUnit: true, isActive: true },
  { id: 'UOM-03', code: 'MT', name: 'Metric Tonne', decimals: 3, category: 'WEIGHT', isActive: true },
  { id: 'UOM-04', code: 'BAG', name: 'Bag (50 kg)', decimals: 0, category: 'COUNT', isActive: true },
  { id: 'UOM-05', code: 'CUM', name: 'Cubic Metre', decimals: 3, category: 'VOLUME', isBaseUnit: true, isActive: true },
  { id: 'UOM-06', code: 'SQM', name: 'Square Metre', decimals: 2, category: 'AREA', isBaseUnit: true, isActive: true },
  { id: 'UOM-07', code: 'RMT', name: 'Running Metre', decimals: 2, category: 'LENGTH', isBaseUnit: true, isActive: true },
  { id: 'UOM-08', code: 'LTR', name: 'Litre', decimals: 2, category: 'VOLUME', isActive: true },
  { id: 'UOM-09', code: 'KL', name: 'Kilolitre', decimals: 3, category: 'VOLUME', isActive: true },
  { id: 'UOM-10', code: 'HOUR', name: 'Hour', decimals: 2, category: 'TIME', isBaseUnit: true, isActive: true },
  { id: 'UOM-11', code: 'DAY', name: 'Day', decimals: 2, category: 'TIME', isActive: true },
  { id: 'UOM-12', code: 'TRIP', name: 'Trip', decimals: 0, category: 'COUNT', isActive: true },
  { id: 'UOM-13', code: 'SET', name: 'Set', decimals: 0, category: 'COUNT', isActive: true },
  { id: 'UOM-14', code: 'ROLL', name: 'Roll', decimals: 0, category: 'COUNT', isActive: true },
  { id: 'UOM-15', code: 'BUNDLE', name: 'Bundle', decimals: 0, category: 'COUNT', isActive: true },
  { id: 'UOM-16', code: 'PAIR', name: 'Pair', decimals: 0, category: 'COUNT', isActive: true },
  { id: 'UOM-17', code: 'QTL', name: 'Quintal', decimals: 3, category: 'WEIGHT', isActive: false },
];

// ===========================================================================
// HSN / SAC
// ===========================================================================
export const hsnSacCodes: HsnSac[] = [
  { id: 'HSN-2523', code: '2523', description: 'Portland cement, clinkers', gstRate: 28, kind: 'HSN' },
  { id: 'HSN-7214', code: '7214', description: 'Bars and rods of iron or non-alloy steel', gstRate: 18, kind: 'HSN' },
  { id: 'HSN-2517', code: '2517', description: 'Pebbles, gravel, broken or crushed stone', gstRate: 5, kind: 'HSN' },
  { id: 'HSN-2505', code: '2505', description: 'Natural sands of all kinds', gstRate: 5, kind: 'HSN' },
  { id: 'HSN-2713', code: '2713', description: 'Petroleum bitumen', gstRate: 18, kind: 'HSN' },
  { id: 'HSN-3824', code: '3824', description: 'Prepared additives for cement and concrete', gstRate: 18, kind: 'HSN' },
  { id: 'HSN-3825', code: '3825', description: 'Ready mix concrete', gstRate: 18, kind: 'HSN' },
  { id: 'HSN-6810', code: '6810', description: 'Articles of cement, concrete or artificial stone', gstRate: 18, kind: 'HSN' },
  { id: 'HSN-4412', code: '4412', description: 'Plywood, veneered panels and similar laminated wood', gstRate: 18, kind: 'HSN' },
  { id: 'HSN-7217', code: '7217', description: 'Wire of iron or non-alloy steel', gstRate: 18, kind: 'HSN' },
  { id: 'HSN-2710', code: '2710', description: 'High speed diesel oil', gstRate: 0, kind: 'HSN' },
  { id: 'HSN-7306', code: '7306', description: 'Other tubes and pipes of iron or steel', gstRate: 18, kind: 'HSN' },
  { id: 'HSN-8311', code: '8311', description: 'Coated electrodes for arc welding', gstRate: 18, kind: 'HSN' },
  { id: 'HSN-6506', code: '6506', description: 'Safety headgear', gstRate: 18, kind: 'HSN' },
  { id: 'HSN-6211', code: '6211', description: 'Track suits and other garments — safety jackets', gstRate: 12, kind: 'HSN' },
  { id: 'SAC-9954', code: '995421', description: 'General construction services of highways and roads', gstRate: 18, kind: 'SAC' },
  { id: 'SAC-9973', code: '997313', description: 'Leasing or rental of construction machinery with operator', gstRate: 18, kind: 'SAC' },
  { id: 'SAC-9965', code: '996511', description: 'Road transport services of goods', gstRate: 5, kind: 'SAC' },
];

// ===========================================================================
// Items & materials
// ===========================================================================
export const items: Item[] = [
  { id: 'ITM-0001', code: 'CEM-OPC53', name: 'Cement OPC 53 Grade', group: 'CEMENT', specification: 'IS 269:2015, 53 Grade OPC, 50 kg bag', stockUomCode: 'BAG', hsnCode: '2523', gstRate: 28, reorderLevel: 2000, isAsset: false, isActive: true },
  { id: 'ITM-0002', code: 'CEM-PPC', name: 'Cement PPC (Fly Ash Based)', group: 'CEMENT', specification: 'IS 1489 Part 1, PPC, 50 kg bag', stockUomCode: 'BAG', hsnCode: '2523', gstRate: 28, reorderLevel: 1500, isAsset: false, isActive: true },
  { id: 'ITM-0011', code: 'STL-TMT08', name: 'TMT Bar Fe500D 8 mm', group: 'STEEL', specification: 'IS 1786:2008, Fe500D, 8 mm dia', stockUomCode: 'MT', hsnCode: '7214', gstRate: 18, reorderLevel: 8, isAsset: false, isActive: true },
  { id: 'ITM-0012', code: 'STL-TMT10', name: 'TMT Bar Fe500D 10 mm', group: 'STEEL', specification: 'IS 1786:2008, Fe500D, 10 mm dia', stockUomCode: 'MT', hsnCode: '7214', gstRate: 18, reorderLevel: 10, isAsset: false, isActive: true },
  { id: 'ITM-0013', code: 'STL-TMT12', name: 'TMT Bar Fe500D 12 mm', group: 'STEEL', specification: 'IS 1786:2008, Fe500D, 12 mm dia', stockUomCode: 'MT', hsnCode: '7214', gstRate: 18, reorderLevel: 15, isAsset: false, isActive: true },
  { id: 'ITM-0014', code: 'STL-TMT16', name: 'TMT Bar Fe500D 16 mm', group: 'STEEL', specification: 'IS 1786:2008, Fe500D, 16 mm dia', stockUomCode: 'MT', hsnCode: '7214', gstRate: 18, reorderLevel: 15, isAsset: false, isActive: true },
  { id: 'ITM-0015', code: 'STL-TMT20', name: 'TMT Bar Fe500D 20 mm', group: 'STEEL', specification: 'IS 1786:2008, Fe500D, 20 mm dia', stockUomCode: 'MT', hsnCode: '7214', gstRate: 18, reorderLevel: 12, isAsset: false, isActive: true },
  { id: 'ITM-0016', code: 'STL-TMT25', name: 'TMT Bar Fe500D 25 mm', group: 'STEEL', specification: 'IS 1786:2008, Fe500D, 25 mm dia', stockUomCode: 'MT', hsnCode: '7214', gstRate: 18, reorderLevel: 10, isAsset: false, isActive: true },
  { id: 'ITM-0021', code: 'AGG-20MM', name: 'Coarse Aggregate 20 mm', group: 'AGGREGATE', specification: 'Crushed stone aggregate, 20 mm nominal size', stockUomCode: 'CUM', hsnCode: '2517', gstRate: 5, reorderLevel: 250, isAsset: false, isActive: true },
  { id: 'ITM-0022', code: 'AGG-40MM', name: 'Coarse Aggregate 40 mm', group: 'AGGREGATE', specification: 'Crushed stone aggregate, 40 mm nominal size', stockUomCode: 'CUM', hsnCode: '2517', gstRate: 5, reorderLevel: 200, isAsset: false, isActive: true },
  { id: 'ITM-0031', code: 'SND-RIVER', name: 'River Sand', group: 'SAND', specification: 'Zone II natural river sand, screened', stockUomCode: 'CUM', hsnCode: '2505', gstRate: 5, reorderLevel: 150, isAsset: false, isActive: true },
  { id: 'ITM-0032', code: 'SND-MSAND', name: 'M-Sand (Manufactured Sand)', group: 'SAND', specification: 'IS 383 Zone II crushed stone sand', stockUomCode: 'CUM', hsnCode: '2505', gstRate: 5, reorderLevel: 200, isAsset: false, isActive: true },
  { id: 'ITM-0041', code: 'GRN-GSB', name: 'GSB Material (Granular Sub Base)', group: 'GRANULAR', specification: 'MoRTH Table 400-1 Grading II', stockUomCode: 'CUM', hsnCode: '2517', gstRate: 5, reorderLevel: 500, isAsset: false, isActive: true },
  { id: 'ITM-0042', code: 'GRN-WMM', name: 'WMM Material (Wet Mix Macadam)', group: 'GRANULAR', specification: 'MoRTH Clause 406 grading', stockUomCode: 'CUM', hsnCode: '2517', gstRate: 5, reorderLevel: 400, isAsset: false, isActive: true },
  { id: 'ITM-0051', code: 'BIT-VG30', name: 'Bitumen VG-30', group: 'BITUMEN', specification: 'IS 73:2013 Viscosity Grade VG-30', stockUomCode: 'MT', hsnCode: '2713', gstRate: 18, reorderLevel: 25, isAsset: false, isActive: true },
  { id: 'ITM-0052', code: 'BIT-EMUL', name: 'Bitumen Emulsion SS-1', group: 'BITUMEN', specification: 'IS 8887, slow setting emulsion for tack coat', stockUomCode: 'MT', hsnCode: '2713', gstRate: 18, reorderLevel: 10, isAsset: false, isActive: true },
  { id: 'ITM-0061', code: 'RMC-M20', name: 'Ready Mix Concrete M20', group: 'RMC', specification: 'Design mix M20, 20 mm aggregate, 100 mm slump', stockUomCode: 'CUM', hsnCode: '3825', gstRate: 18, reorderLevel: 0, isAsset: false, isActive: true },
  { id: 'ITM-0062', code: 'RMC-M25', name: 'Ready Mix Concrete M25', group: 'RMC', specification: 'Design mix M25, 20 mm aggregate, 100 mm slump', stockUomCode: 'CUM', hsnCode: '3825', gstRate: 18, reorderLevel: 0, isAsset: false, isActive: true },
  { id: 'ITM-0063', code: 'RMC-M30', name: 'Ready Mix Concrete M30', group: 'RMC', specification: 'Design mix M30, 20 mm aggregate, 120 mm slump', stockUomCode: 'CUM', hsnCode: '3825', gstRate: 18, reorderLevel: 0, isAsset: false, isActive: true },
  { id: 'ITM-0071', code: 'MSN-AAC', name: 'AAC Block 600x200x200 mm', group: 'MASONRY', specification: 'IS 2185 Part 3, autoclaved aerated concrete block', stockUomCode: 'NOS', hsnCode: '6810', gstRate: 18, reorderLevel: 3000, isAsset: false, isActive: true },
  { id: 'ITM-0081', code: 'SHT-PLY12', name: 'Shuttering Plywood 12 mm', group: 'SHUTTERING', specification: 'BWP grade film faced plywood 2440x1220x12 mm', stockUomCode: 'NOS', hsnCode: '4412', gstRate: 18, reorderLevel: 100, isAsset: false, isActive: true },
  { id: 'ITM-0091', code: 'CON-BWIRE', name: 'Binding Wire 18 Gauge', group: 'CONSUMABLE', specification: 'MS annealed binding wire, 18 SWG', stockUomCode: 'KG', hsnCode: '7217', gstRate: 18, reorderLevel: 300, isAsset: false, isActive: true },
  { id: 'ITM-0101', code: 'FUL-HSD', name: 'HSD Diesel', group: 'FUEL', specification: 'High speed diesel, BS-VI', stockUomCode: 'LTR', hsnCode: '2710', gstRate: 0, reorderLevel: 5000, isAsset: false, isActive: true },
  { id: 'ITM-0111', code: 'ADM-PCE', name: 'Concrete Admixture (PCE Based)', group: 'ADMIXTURE', specification: 'IS 9103 superplasticiser, polycarboxylate ether', stockUomCode: 'LTR', hsnCode: '3824', gstRate: 18, reorderLevel: 400, isAsset: false, isActive: true },
  { id: 'ITM-0121', code: 'PIP-GI50', name: 'GI Pipe 50 mm B Class', group: 'PIPES_FITTINGS', specification: 'IS 1239 Part 1, galvanised, medium class', stockUomCode: 'RMT', hsnCode: '7306', gstRate: 18, reorderLevel: 200, isAsset: false, isActive: true },
  { id: 'ITM-0131', code: 'ELC-ELEC', name: 'Welding Electrode 3.15 mm', group: 'ELECTRICAL', specification: 'IS 814 E6013, 3.15 mm x 350 mm', stockUomCode: 'KG', hsnCode: '8311', gstRate: 18, reorderLevel: 150, isAsset: false, isActive: true },
  { id: 'ITM-0141', code: 'SAF-HELM', name: 'Safety Helmet', group: 'SAFETY', specification: 'IS 2925, HDPE shell with ratchet harness', stockUomCode: 'NOS', hsnCode: '6506', gstRate: 18, reorderLevel: 100, isAsset: false, isActive: true },
  { id: 'ITM-0142', code: 'SAF-JACK', name: 'Reflective Safety Jacket', group: 'SAFETY', specification: 'Polyester mesh with 2 inch reflective tape', stockUomCode: 'NOS', hsnCode: '6211', gstRate: 12, reorderLevel: 150, isAsset: false, isActive: true },
];

// ===========================================================================
// Vendors
// ===========================================================================
export const vendors: Vendor[] = [
  { id: 'VEN-0001', code: 'UIE/V/0001', name: 'Sri Venkateswara Cement Agencies', category: 'CEMENT', gstin: '36AACFS4471P1Z8', pan: 'AACFS4471P', address: '5-8-231, Chikkadpally Main Road', city: 'Hyderabad', state: 'Telangana', contactPerson: 'V. Satyanarayana', phone: '+91 98490 11223', email: 'sales@svcementagencies.in', paymentTerms: '30 days from invoice', creditDays: 30, msmeNo: 'UDYAM-TS-02-0018842', bankAccount: '50100234789012', ifsc: 'HDFC0001234', isActive: true },
  { id: 'VEN-0002', code: 'UIE/V/0002', name: 'Bharathi Steel Traders', category: 'STEEL', gstin: '36AAKCB2298M1ZK', pan: 'AAKCB2298M', address: 'Survey 118, Balanagar Industrial Estate', city: 'Hyderabad', state: 'Telangana', contactPerson: 'B. Ramachandra Prasad', phone: '+91 99120 44556', email: 'orders@bharathisteel.co.in', paymentTerms: '15 days from receipt', creditDays: 15, msmeNo: 'UDYAM-TS-02-0022115', bankAccount: '30298765412300', ifsc: 'SBIN0020567', isActive: true },
  { id: 'VEN-0003', code: 'UIE/V/0003', name: 'Kakatiya Stone Crushers', category: 'AGGREGATE', gstin: '36AAGFK7712L1ZQ', pan: 'AAGFK7712L', address: 'Quarry Road, Shameerpet Mandal', city: 'Medchal', state: 'Telangana', contactPerson: 'K. Srinivas Reddy', phone: '+91 94408 77012', email: 'kakatiyacrushers@gmail.com', paymentTerms: '21 days from challan', creditDays: 21, bankAccount: '61234509871234', ifsc: 'UBIN0561231', isActive: true },
  { id: 'VEN-0004', code: 'UIE/V/0004', name: 'Deccan Bitumen & Petro Products', category: 'BITUMEN', gstin: '36AABCD5590N1Z2', pan: 'AABCD5590N', address: 'Plot 27, IDA Jeedimetla Phase III', city: 'Hyderabad', state: 'Telangana', contactPerson: 'A. Mohan Krishna', phone: '+91 98661 30045', email: 'supply@deccanbitumen.in', paymentTerms: 'Advance against dispatch', creditDays: 0, bankAccount: '00110987654321', ifsc: 'ICIC0000112', isActive: true },
  { id: 'VEN-0005', code: 'UIE/V/0005', name: 'Sai Ram Fuels & Lubricants', category: 'DIESEL', gstin: '36AAJFS3320K1ZY', pan: 'AAJFS3320K', address: 'NH-44 Service Road, Kompally', city: 'Hyderabad', state: 'Telangana', contactPerson: 'P. Sai Ram', phone: '+91 90000 66778', email: 'sairamfuels@outlook.in', paymentTerms: '7 days', creditDays: 7, bankAccount: '20045678901234', ifsc: 'AXIS0000456', isActive: true },
  { id: 'VEN-0006', code: 'UIE/V/0006', name: 'Nandi Hardware & Building Materials', category: 'HARDWARE', gstin: '36AADFN1180J1ZR', pan: 'AADFN1180J', address: '11-4-659, Red Hills, Lakdikapul', city: 'Hyderabad', state: 'Telangana', contactPerson: 'N. Lakshmi Narayana', phone: '+91 97012 33445', email: 'nandihardware@rediffmail.com', paymentTerms: '30 days', creditDays: 30, msmeNo: 'UDYAM-TS-02-0031007', bankAccount: '10023456789012', ifsc: 'KKBK0007890', isActive: true },
  { id: 'VEN-0007', code: 'UIE/V/0007', name: 'Vijaya Equipment Hirers', category: 'EQUIPMENT_HIRE', gstin: '37AAECV6634H1ZD', pan: 'AAECV6634H', address: 'D. No. 24-1-88, Machavaram', city: 'Vijayawada', state: 'Andhra Pradesh', contactPerson: 'G. Vijaya Bhaskar', phone: '+91 88012 55990', email: 'hire@vijayaequipments.in', paymentTerms: 'Monthly billing, 30 days', creditDays: 30, bankAccount: '38129876540011', ifsc: 'SBIN0004521', isActive: true },
  { id: 'VEN-0008', code: 'UIE/V/0008', name: 'Telangana Roadlines Carriers', category: 'TRANSPORT', gstin: '36AAFFT8845Q1ZW', pan: 'AAFFT8845Q', address: 'Transport Nagar, Bowenpally', city: 'Secunderabad', state: 'Telangana', contactPerson: 'T. Anjaneyulu', phone: '+91 94916 22334', email: 'ops@tsroadlines.co.in', paymentTerms: '15 days from LR', creditDays: 15, bankAccount: '55501234987600', ifsc: 'BARB0BOWENP', isActive: true },
  { id: 'VEN-0009', code: 'UIE/V/0009', name: 'Godavari Ready Mix Concrete', category: 'RMC', gstin: '36AAGCG9921F1ZT', pan: 'AAGCG9921F', address: 'Batching Plant, Gundlapochampally', city: 'Medchal', state: 'Telangana', contactPerson: 'D. Ravi Shankar', phone: '+91 91777 88990', email: 'dispatch@godavarirmc.in', paymentTerms: '21 days', creditDays: 21, bankAccount: '77012345678900', ifsc: 'IDIB000G521', isActive: true },
  { id: 'VEN-0010', code: 'UIE/V/0010', name: 'Sri Balaji Electricals & Switchgear', category: 'ELECTRICAL', gstin: '36AAJCS4478B1ZL', pan: 'AAJCS4478B', address: '15-1-503, Siddiamber Bazar', city: 'Hyderabad', state: 'Telangana', contactPerson: 'S. Balaji Prasad', phone: '+91 98853 44120', email: 'sales@balajielectricals.in', paymentTerms: '30 days', creditDays: 30, msmeNo: 'UDYAM-TS-02-0044219', bankAccount: '90012345600789', ifsc: 'CNRB0001902', isActive: true },
];

// ===========================================================================
// Subcontractors & labour contractors
// ===========================================================================
export const subcontractors: Subcontractor[] = [
  { id: 'SUB-0001', code: 'UIE/S/0001', name: 'Mahalakshmi Earthmovers & Contractors', trade: 'EARTHWORK', gstin: '36AAHFM2201C1ZG', pan: 'AAHFM2201C', contactPerson: 'M. Yadagiri', phone: '+91 94903 11078', city: 'Siddipet', state: 'Telangana', isLabourContractor: false, isActive: true },
  { id: 'SUB-0002', code: 'UIE/S/0002', name: 'Sri Sai Formwork Solutions', trade: 'SHUTTERING', gstin: '36AAKFS7790D1ZB', pan: 'AAKFS7790D', contactPerson: 'B. Sai Kumar', phone: '+91 99483 22106', city: 'Hyderabad', state: 'Telangana', isLabourContractor: false, isActive: true },
  { id: 'SUB-0003', code: 'UIE/S/0003', name: 'Ganapathi Bar Bending Works', trade: 'BAR_BENDING', gstin: '36AAGFG5512E1ZN', pan: 'AAGFG5512E', contactPerson: 'K. Ganapathi', phone: '+91 87901 45523', city: 'Medak', state: 'Telangana', isLabourContractor: true, licenceNo: 'ALC/TS/MDK/2024/0187', isActive: true },
  { id: 'SUB-0004', code: 'UIE/S/0004', name: 'Vishwa Concreting Contractors', trade: 'CONCRETING', gstin: '36AADFV3345H1ZJ', pan: 'AADFV3345H', contactPerson: 'R. Vishwanath', phone: '+91 90142 66701', city: 'Hyderabad', state: 'Telangana', isLabourContractor: false, isActive: true },
  { id: 'SUB-0005', code: 'UIE/S/0005', name: 'Anjali Blockwork & Plastering', trade: 'BLOCKWORK_PLASTER', gstin: '36AAMFA9987R1ZS', pan: 'AAMFA9987R', contactPerson: 'P. Anjaneyulu', phone: '+91 96522 78834', city: 'Zaheerabad', state: 'Telangana', isLabourContractor: true, licenceNo: 'ALC/TS/SRD/2025/0342', isActive: true },
  { id: 'SUB-0006', code: 'UIE/S/0006', name: 'Sagar Bituminous Works', trade: 'BITUMINOUS', gstin: '36AAEFS1123T1ZV', pan: 'AAEFS1123T', contactPerson: 'N. Sagar Rao', phone: '+91 98488 90012', city: 'Siddipet', state: 'Telangana', isLabourContractor: false, isActive: true },
  { id: 'SUB-0007', code: 'UIE/S/0007', name: 'Jyothi Electrical Contractors', trade: 'ELECTRICAL', gstin: '36AAJFJ6678W1ZH', pan: 'AAJFJ6678W', contactPerson: 'J. Ramakanth', phone: '+91 91009 33447', city: 'Hyderabad', state: 'Telangana', isLabourContractor: false, isActive: true },
  { id: 'SUB-0008', code: 'UIE/S/0008', name: 'Krishnaveni Plumbing Services', trade: 'PLUMBING', gstin: '37AAFFK4409Y1ZC', pan: 'AAFFK4409Y', contactPerson: 'V. Krishna Murthy', phone: '+91 73827 11556', city: 'Vijayawada', state: 'Andhra Pradesh', isLabourContractor: false, isActive: true },
  { id: 'SUB-0009', code: 'UIE/S/0009', name: 'Balaji Labour Suppliers', trade: 'EARTHWORK', gstin: '36AAPFB3021L1ZX', pan: 'AAPFB3021L', contactPerson: 'D. Balaraju', phone: '+91 70932 45518', city: 'Medchal', state: 'Telangana', isLabourContractor: true, licenceNo: 'ALC/TS/MCL/2025/0511', isActive: true },
];

// ===========================================================================
// Equipment & vehicles
// ===========================================================================
export const equipment: Equipment[] = [
  { id: 'EQP-0001', code: 'UIE/EQ/BP01', name: 'Concrete Batching Plant 30 cum/hr', type: 'Batching Plant', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-HMP', operatorEmployeeId: 'EMP-1031', status: 'WORKING', currentHmr: 8942, nextServiceDueHmr: 9000, nextServiceDueDate: '2026-08-20', isActive: true },
  { id: 'EQP-0002', code: 'UIE/EQ/BP02', name: 'Concrete Batching Plant 15 cum/hr', type: 'Batching Plant', ownership: 'OWNED', projectId: 'PRJ-IPARK', siteId: 'SITE-IPARK', status: 'IDLE', currentHmr: 5218, nextServiceDueHmr: 5400, nextServiceDueDate: '2026-09-12', isActive: true },
  { id: 'EQP-0003', code: 'UIE/EQ/HMP01', name: 'Hot Mix Plant 120 TPH', type: 'Hot Mix Plant', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-HMP', status: 'WORKING', currentHmr: 11430, nextServiceDueHmr: 11600, nextServiceDueDate: '2026-08-28', isActive: true },
  { id: 'EQP-0004', code: 'UIE/EQ/WMM01', name: 'Wet Mix Macadam Plant 100 TPH', type: 'WMM Plant', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-HMP', status: 'BREAKDOWN', currentHmr: 7615, nextServiceDueHmr: 7800, nextServiceDueDate: '2026-10-02', isActive: true },
  { id: 'EQP-0005', code: 'UIE/EQ/CRS01', name: 'Stone Crusher 200 TPH (3 Stage)', type: 'Crusher', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-HMP', status: 'WORKING', currentHmr: 15208, nextServiceDueHmr: 15300, nextServiceDueDate: '2026-08-14', isActive: true },
  { id: 'EQP-0006', code: 'UIE/EQ/EXC01', name: 'Excavator Tata Hitachi EX210LC', type: 'Excavator', registrationNo: 'TS07UB4412', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', status: 'WORKING', currentHmr: 12874, nextServiceDueHmr: 13000, nextServiceDueDate: '2026-09-05', isActive: true },
  { id: 'EQP-0007', code: 'UIE/EQ/EXC02', name: 'Excavator Komatsu PC210', type: 'Excavator', registrationNo: 'TS09UC7781', ownership: 'HIRED', hireVendorId: 'VEN-0007', hireRate: 1450, hireRateUnit: 'HRS', projectId: 'PRJ-IPARK', siteId: 'SITE-IPARK', status: 'WORKING', currentHmr: 6421, isActive: true },
  { id: 'EQP-0008', code: 'UIE/EQ/ROL01', name: 'Tandem Roller Escorts EC5250', type: 'Tandem Roller', registrationNo: 'TS07UD1120', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', status: 'WORKING', currentHmr: 4392, nextServiceDueHmr: 4500, nextServiceDueDate: '2026-08-19', isActive: true },
  { id: 'EQP-0009', code: 'UIE/EQ/ROL02', name: 'Soil Compactor Roller JCB VMT330', type: 'Soil Compactor', registrationNo: 'TS07UD1121', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', status: 'UNDER_MAINTENANCE', currentHmr: 5810, nextServiceDueHmr: 5800, nextServiceDueDate: '2026-07-30', isActive: true },
  { id: 'EQP-0010', code: 'UIE/EQ/PVR01', name: 'Paver Finisher Apollo AP550', type: 'Paver Finisher', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', status: 'IDLE', currentHmr: 3987, nextServiceDueHmr: 4100, nextServiceDueDate: '2026-09-22', isActive: true },
  { id: 'EQP-0011', code: 'UIE/EQ/TM01', name: 'Transit Mixer Ashok Leyland 6 cum', type: 'Transit Mixer', registrationNo: 'TS07UE3345', ownership: 'OWNED', projectId: 'PRJ-IPARK', siteId: 'SITE-IPARK', operatorEmployeeId: 'EMP-1033', status: 'WORKING', currentHmr: 98420, isActive: true },
  { id: 'EQP-0012', code: 'UIE/EQ/TM02', name: 'Transit Mixer Tata LPK 2518 6 cum', type: 'Transit Mixer', registrationNo: 'TS07UE3346', ownership: 'OWNED', projectId: 'PRJ-IPARK', siteId: 'SITE-IPARK', status: 'IDLE', currentHmr: 76210, isActive: true },
  { id: 'EQP-0013', code: 'UIE/EQ/TIP01', name: 'Tipper Tata 2518 16 cum', type: 'Tipper', registrationNo: 'TS07UF8890', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', operatorEmployeeId: 'EMP-1032', status: 'WORKING', currentHmr: 142850, nextServiceDueDate: '2026-08-11', isActive: true },
  { id: 'EQP-0014', code: 'UIE/EQ/TIP02', name: 'Tipper Ashok Leyland 2518 16 cum', type: 'Tipper', registrationNo: 'TS07UF8891', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', status: 'WORKING', currentHmr: 128340, isActive: true },
  { id: 'EQP-0015', code: 'UIE/EQ/TIP03', name: 'Tipper BharatBenz 2823C 18 cum', type: 'Tipper', registrationNo: 'AP16TG5567', ownership: 'HIRED', hireVendorId: 'VEN-0007', hireRate: 8500, hireRateUnit: 'DAY', projectId: 'PRJ-WH12', siteId: 'SITE-WH12', status: 'WORKING', currentHmr: 45120, isActive: true },
  { id: 'EQP-0016', code: 'UIE/EQ/WT01', name: 'Water Tanker 12 KL', type: 'Water Tanker', registrationNo: 'TS07UG2201', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', status: 'WORKING', currentHmr: 88760, isActive: true },
  { id: 'EQP-0017', code: 'UIE/EQ/CP01', name: 'Concrete Pump Schwing Stetter SP1800', type: 'Concrete Pump', ownership: 'OWNED', projectId: 'PRJ-ROB07', siteId: 'SITE-ROB07', status: 'WORKING', currentHmr: 2914, nextServiceDueHmr: 3000, nextServiceDueDate: '2026-09-30', isActive: true },
  { id: 'EQP-0018', code: 'UIE/EQ/DG01', name: 'DG Set 125 KVA Kirloskar', type: 'DG Set', ownership: 'OWNED', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-HMP', status: 'WORKING', currentHmr: 6742, nextServiceDueHmr: 6900, nextServiceDueDate: '2026-08-25', isActive: true },
  { id: 'EQP-0019', code: 'UIE/EQ/DG02', name: 'DG Set 62.5 KVA Cummins', type: 'DG Set', ownership: 'HIRED', hireVendorId: 'VEN-0007', hireRate: 2200, hireRateUnit: 'DAY', projectId: 'PRJ-WH12', siteId: 'SITE-WH12', status: 'IDLE', currentHmr: 1820, isActive: true },
  { id: 'EQP-0020', code: 'UIE/EQ/JCB01', name: 'JCB 3DX Backhoe Loader', type: 'Backhoe Loader', registrationNo: 'TS07UH4478', ownership: 'OWNED', projectId: 'PRJ-IPARK', siteId: 'SITE-IPARK', status: 'WORKING', currentHmr: 9218, nextServiceDueHmr: 9250, nextServiceDueDate: '2026-08-10', isActive: true },
  { id: 'EQP-0021', code: 'UIE/EQ/JCB02', name: 'JCB 3DX Plus Backhoe Loader', type: 'Backhoe Loader', registrationNo: 'TS07UH4479', ownership: 'HIRED', hireVendorId: 'VEN-0007', hireRate: 950, hireRateUnit: 'HRS', projectId: 'PRJ-ROB07', siteId: 'SITE-ROB07', status: 'BREAKDOWN', currentHmr: 4102, isActive: true },
];

// ===========================================================================
// WBS / cost codes — hierarchical
// ===========================================================================
export const wbsNodes: WbsNode[] = [
  // Road package
  { id: 'WBS-SH19-01', projectId: 'PRJ-SH19', code: '01', name: 'Road Works', parentId: null, level: 1, budgetedCost: 1684000000, actualCost: 712400000 },
  { id: 'WBS-SH19-0101', projectId: 'PRJ-SH19', code: '01.01', name: 'Earthwork', parentId: 'WBS-SH19-01', level: 2, uomCode: 'CUM', budgetedQty: 842000, executedQty: 498320, budgetedCost: 261020000, actualCost: 154479200 },
  { id: 'WBS-SH19-0102', projectId: 'PRJ-SH19', code: '01.02', name: 'Subgrade Preparation', parentId: 'WBS-SH19-01', level: 2, uomCode: 'CUM', budgetedQty: 168400, executedQty: 91240, budgetedCost: 84200000, actualCost: 45620000 },
  { id: 'WBS-SH19-0103', projectId: 'PRJ-SH19', code: '01.03', name: 'Granular Sub Base (GSB)', parentId: 'WBS-SH19-01', level: 2, uomCode: 'CUM', budgetedQty: 112500, executedQty: 58120, budgetedCost: 191250000, actualCost: 98804000 },
  { id: 'WBS-SH19-0104', projectId: 'PRJ-SH19', code: '01.04', name: 'Wet Mix Macadam (WMM)', parentId: 'WBS-SH19-01', level: 2, uomCode: 'CUM', budgetedQty: 84300, executedQty: 39875, budgetedCost: 185460000, actualCost: 87725000 },
  { id: 'WBS-SH19-0105', projectId: 'PRJ-SH19', code: '01.05', name: 'Dense Bituminous Macadam (DBM)', parentId: 'WBS-SH19-01', level: 2, uomCode: 'CUM', budgetedQty: 42150, executedQty: 14280, budgetedCost: 379350000, actualCost: 128520000 },
  { id: 'WBS-SH19-0106', projectId: 'PRJ-SH19', code: '01.06', name: 'Bituminous Concrete (BC)', parentId: 'WBS-SH19-01', level: 2, uomCode: 'CUM', budgetedQty: 21075, executedQty: 4210, budgetedCost: 231825000, actualCost: 46310000 },
  { id: 'WBS-SH19-02', projectId: 'PRJ-SH19', code: '02', name: 'Cross Drainage Works', parentId: null, level: 1, budgetedCost: 284500000, actualCost: 118600000 },
  { id: 'WBS-SH19-0201', projectId: 'PRJ-SH19', code: '02.01', name: 'Box Culverts', parentId: 'WBS-SH19-02', level: 2, uomCode: 'NOS', budgetedQty: 42, executedQty: 19, budgetedCost: 168000000, actualCost: 76000000 },
  { id: 'WBS-SH19-0202', projectId: 'PRJ-SH19', code: '02.02', name: 'Pipe Culverts', parentId: 'WBS-SH19-02', level: 2, uomCode: 'NOS', budgetedQty: 68, executedQty: 34, budgetedCost: 116500000, actualCost: 42600000 },
  // Bridge project
  { id: 'WBS-ROB-01', projectId: 'PRJ-ROB07', code: '01', name: 'Substructure', parentId: null, level: 1, budgetedCost: 312000000, actualCost: 82400000 },
  { id: 'WBS-ROB-0101', projectId: 'PRJ-ROB07', code: '01.01', name: 'Pile Foundation', parentId: 'WBS-ROB-01', level: 2, uomCode: 'RMT', budgetedQty: 4280, executedQty: 1920, budgetedCost: 128400000, actualCost: 57600000 },
  { id: 'WBS-ROB-0102', projectId: 'PRJ-ROB07', code: '01.02', name: 'Pile Cap', parentId: 'WBS-ROB-01', level: 2, uomCode: 'CUM', budgetedQty: 1840, executedQty: 620, budgetedCost: 73600000, actualCost: 24800000 },
  { id: 'WBS-ROB-0103', projectId: 'PRJ-ROB07', code: '01.03', name: 'Pier', parentId: 'WBS-ROB-01', level: 2, uomCode: 'CUM', budgetedQty: 1420, executedQty: 0, budgetedCost: 63900000, actualCost: 0 },
  { id: 'WBS-ROB-0104', projectId: 'PRJ-ROB07', code: '01.04', name: 'Pier Cap', parentId: 'WBS-ROB-01', level: 2, uomCode: 'CUM', budgetedQty: 780, executedQty: 0, budgetedCost: 46100000, actualCost: 0 },
  { id: 'WBS-ROB-02', projectId: 'PRJ-ROB07', code: '02', name: 'Superstructure', parentId: null, level: 1, budgetedCost: 268000000, actualCost: 0 },
  { id: 'WBS-ROB-0201', projectId: 'PRJ-ROB07', code: '02.01', name: 'PSC Girder', parentId: 'WBS-ROB-02', level: 2, uomCode: 'NOS', budgetedQty: 48, executedQty: 0, budgetedCost: 168000000, actualCost: 0 },
  { id: 'WBS-ROB-0202', projectId: 'PRJ-ROB07', code: '02.02', name: 'Deck Slab', parentId: 'WBS-ROB-02', level: 2, uomCode: 'CUM', budgetedQty: 1240, executedQty: 0, budgetedCost: 100000000, actualCost: 0 },
  // Industrial park
  { id: 'WBS-IP-01', projectId: 'PRJ-IPARK', code: '01', name: 'Internal Roads', parentId: null, level: 1, uomCode: 'SQM', budgetedQty: 128400, executedQty: 82150, budgetedCost: 462000000, actualCost: 295600000 },
  { id: 'WBS-IP-02', projectId: 'PRJ-IPARK', code: '02', name: 'Storm Water Drainage', parentId: null, level: 1, uomCode: 'RMT', budgetedQty: 18400, executedQty: 11200, budgetedCost: 221000000, actualCost: 134500000 },
  { id: 'WBS-IP-03', projectId: 'PRJ-IPARK', code: '03', name: 'Water Supply & Sewerage', parentId: null, level: 1, uomCode: 'RMT', budgetedQty: 22600, executedQty: 12840, budgetedCost: 186000000, actualCost: 105700000 },
  // Warehouse
  { id: 'WBS-WH-01', projectId: 'PRJ-WH12', code: '01', name: 'Civil & Structural', parentId: null, level: 1, budgetedCost: 298000000, actualCost: 102400000 },
  { id: 'WBS-WH-0101', projectId: 'PRJ-WH12', code: '01.01', name: 'Foundation & Plinth', parentId: 'WBS-WH-01', level: 2, uomCode: 'CUM', budgetedQty: 3420, executedQty: 2180, budgetedCost: 136800000, actualCost: 87200000 },
  { id: 'WBS-WH-0102', projectId: 'PRJ-WH12', code: '01.02', name: 'PEB Structure Erection', parentId: 'WBS-WH-01', level: 2, uomCode: 'MT', budgetedQty: 842, executedQty: 128, budgetedCost: 161200000, actualCost: 15200000 },
];

// ===========================================================================
// Stock balances
// ===========================================================================
export const stockBalances: StockBalance[] = [
  { itemId: 'ITM-0001', itemCode: 'CEM-OPC53', itemName: 'Cement OPC 53 Grade', siteId: 'SITE-SH19-KM32', siteName: 'SH-19 Site Store — Km 32+400 Camp', uomCode: 'BAG', quantity: 1420, rate: 392.5, value: 557350, reorderLevel: 2000, lastReceiptDate: '2026-08-04' },
  { itemId: 'ITM-0002', itemCode: 'CEM-PPC', itemName: 'Cement PPC (Fly Ash Based)', siteId: 'SITE-SH19-KM32', siteName: 'SH-19 Site Store — Km 32+400 Camp', uomCode: 'BAG', quantity: 2860, rate: 352.0, value: 1006720, reorderLevel: 1500, lastReceiptDate: '2026-08-02' },
  { itemId: 'ITM-0013', itemCode: 'STL-TMT12', itemName: 'TMT Bar Fe500D 12 mm', siteId: 'SITE-SH19-KM32', siteName: 'SH-19 Site Store — Km 32+400 Camp', uomCode: 'MT', quantity: 24.68, rate: 58400, value: 1441312, reorderLevel: 15, lastReceiptDate: '2026-07-29' },
  { itemId: 'ITM-0014', itemCode: 'STL-TMT16', itemName: 'TMT Bar Fe500D 16 mm', siteId: 'SITE-SH19-KM32', siteName: 'SH-19 Site Store — Km 32+400 Camp', uomCode: 'MT', quantity: 11.24, rate: 57900, value: 650796, reorderLevel: 15, lastReceiptDate: '2026-07-25' },
  { itemId: 'ITM-0015', itemCode: 'STL-TMT20', itemName: 'TMT Bar Fe500D 20 mm', siteId: 'SITE-ROB07', siteName: 'ROB Medak Site Store', uomCode: 'MT', quantity: 8.42, rate: 57600, value: 484992, reorderLevel: 12, lastReceiptDate: '2026-07-31' },
  { itemId: 'ITM-0021', itemCode: 'AGG-20MM', itemName: 'Coarse Aggregate 20 mm', siteId: 'SITE-SH19-HMP', siteName: 'SH-19 Hot Mix Plant Yard — Km 48+000', uomCode: 'CUM', quantity: 1842.5, rate: 1180, value: 2174150, reorderLevel: 250, lastReceiptDate: '2026-08-06' },
  { itemId: 'ITM-0022', itemCode: 'AGG-40MM', itemName: 'Coarse Aggregate 40 mm', siteId: 'SITE-SH19-HMP', siteName: 'SH-19 Hot Mix Plant Yard — Km 48+000', uomCode: 'CUM', quantity: 968.25, rate: 1090, value: 1055393, reorderLevel: 200, lastReceiptDate: '2026-08-05' },
  { itemId: 'ITM-0031', itemCode: 'SND-RIVER', itemName: 'River Sand', siteId: 'SITE-IPARK', siteName: 'Zaheerabad Park Site Store', uomCode: 'CUM', quantity: 124.5, rate: 2450, value: 305025, reorderLevel: 150, lastReceiptDate: '2026-08-01' },
  { itemId: 'ITM-0032', itemCode: 'SND-MSAND', itemName: 'M-Sand (Manufactured Sand)', siteId: 'SITE-IPARK', siteName: 'Zaheerabad Park Site Store', uomCode: 'CUM', quantity: 486.75, rate: 1320, value: 642510, reorderLevel: 200, lastReceiptDate: '2026-08-03' },
  { itemId: 'ITM-0041', itemCode: 'GRN-GSB', itemName: 'GSB Material (Granular Sub Base)', siteId: 'SITE-SH19-HMP', siteName: 'SH-19 Hot Mix Plant Yard — Km 48+000', uomCode: 'CUM', quantity: 3218.75, rate: 985, value: 3170469, reorderLevel: 500, lastReceiptDate: '2026-08-07' },
  { itemId: 'ITM-0042', itemCode: 'GRN-WMM', itemName: 'WMM Material (Wet Mix Macadam)', siteId: 'SITE-SH19-HMP', siteName: 'SH-19 Hot Mix Plant Yard — Km 48+000', uomCode: 'CUM', quantity: 284.5, rate: 1240, value: 352780, reorderLevel: 400, lastReceiptDate: '2026-08-06' },
  { itemId: 'ITM-0051', itemCode: 'BIT-VG30', itemName: 'Bitumen VG-30', siteId: 'SITE-SH19-HMP', siteName: 'SH-19 Hot Mix Plant Yard — Km 48+000', uomCode: 'MT', quantity: 18.42, rate: 52800, value: 972576, reorderLevel: 25, lastReceiptDate: '2026-08-04' },
  { itemId: 'ITM-0052', itemCode: 'BIT-EMUL', itemName: 'Bitumen Emulsion SS-1', siteId: 'SITE-SH19-HMP', siteName: 'SH-19 Hot Mix Plant Yard — Km 48+000', uomCode: 'MT', quantity: 12.85, rate: 48200, value: 619370, reorderLevel: 10, lastReceiptDate: '2026-07-30' },
  { itemId: 'ITM-0071', itemCode: 'MSN-AAC', itemName: 'AAC Block 600x200x200 mm', siteId: 'SITE-WH12', siteName: 'Batasingaram Warehouse Site Store', uomCode: 'NOS', quantity: 2140, rate: 68, value: 145520, reorderLevel: 3000, lastReceiptDate: '2026-07-28' },
  { itemId: 'ITM-0081', itemCode: 'SHT-PLY12', itemName: 'Shuttering Plywood 12 mm', siteId: 'SITE-MAIN', siteName: 'Central Store — Medchal Yard', uomCode: 'NOS', quantity: 218, rate: 1840, value: 401120, reorderLevel: 100, lastReceiptDate: '2026-07-22' },
  { itemId: 'ITM-0091', itemCode: 'CON-BWIRE', itemName: 'Binding Wire 18 Gauge', siteId: 'SITE-SH19-KM32', siteName: 'SH-19 Site Store — Km 32+400 Camp', uomCode: 'KG', quantity: 482.5, rate: 76.5, value: 36911, reorderLevel: 300, lastReceiptDate: '2026-08-01' },
  { itemId: 'ITM-0101', itemCode: 'FUL-HSD', itemName: 'HSD Diesel', siteId: 'SITE-SH19-HMP', siteName: 'SH-19 Hot Mix Plant Yard — Km 48+000', uomCode: 'LTR', quantity: 4280.5, rate: 94.8, value: 405791, reorderLevel: 5000, lastReceiptDate: '2026-08-07' },
  { itemId: 'ITM-0111', itemCode: 'ADM-PCE', itemName: 'Concrete Admixture (PCE Based)', siteId: 'SITE-IPARK', siteName: 'Zaheerabad Park Site Store', uomCode: 'LTR', quantity: 620.0, rate: 82.5, value: 51150, reorderLevel: 400, lastReceiptDate: '2026-07-26' },
  { itemId: 'ITM-0121', itemCode: 'PIP-GI50', itemName: 'GI Pipe 50 mm B Class', siteId: 'SITE-MAIN', siteName: 'Central Store — Medchal Yard', uomCode: 'RMT', quantity: 148.0, rate: 486, value: 71928, reorderLevel: 200, lastReceiptDate: '2026-07-18' },
  { itemId: 'ITM-0131', itemCode: 'ELC-ELEC', itemName: 'Welding Electrode 3.15 mm', siteId: 'SITE-MAIN', siteName: 'Central Store — Medchal Yard', uomCode: 'KG', quantity: 96.5, rate: 118, value: 11387, reorderLevel: 150, lastReceiptDate: '2026-07-20' },
  { itemId: 'ITM-0141', itemCode: 'SAF-HELM', itemName: 'Safety Helmet', siteId: 'SITE-MAIN', siteName: 'Central Store — Medchal Yard', uomCode: 'NOS', quantity: 62, rate: 285, value: 17670, reorderLevel: 100, lastReceiptDate: '2026-06-30' },
  { itemId: 'ITM-0142', itemCode: 'SAF-JACK', itemName: 'Reflective Safety Jacket', siteId: 'SITE-MAIN', siteName: 'Central Store — Medchal Yard', uomCode: 'NOS', quantity: 184, rate: 165, value: 30360, reorderLevel: 150, lastReceiptDate: '2026-07-12' },
];
