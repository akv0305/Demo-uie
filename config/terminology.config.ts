/**
 * =============================================================================
 * TERMINOLOGY CONFIGURATION — SINGLE SOURCE OF TRUTH FOR ALL VISIBLE TEXT
 * =============================================================================
 *
 * No component may contain a hardcoded user-visible string. Every label,
 * heading, button caption, column title, empty-state sentence and help hint is
 * read from this dictionary.
 *
 * Alias comments mark terms the client is likely to rename during requirement
 * discussion. Renaming the value here updates every screen that uses it.
 *
 * English only.
 */

export const terminology = {
  // ===========================================================================
  common: {
    appTagline: 'Contractor Management System',
    demoBanner: 'Sample data — for requirement discussion only.',
    dismiss: 'Dismiss',
    loading: 'Loading…',
    save: 'Save',
    saveDraft: 'Save Draft',
    submit: 'Submit',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    edit: 'Edit',
    delete: 'Delete',
    remove: 'Remove',
    view: 'View',
    print: 'Print',
    download: 'Download',
    upload: 'Upload',
    search: 'Search',
    searchPlaceholder: 'Search documents, vendors, items…',
    filters: 'Filters',
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    clearFilters: 'Clear All',
    clear: 'Clear',
    apply: 'Apply',
    reset: 'Reset',
    actions: 'Actions',
    addRow: 'Add Row',
    deleteRow: 'Delete Row',
    total: 'Total',
    subtotal: 'Sub Total',
    grandTotal: 'Grand Total',
    approve: 'Approve',
    reject: 'Reject',
    returnForCorrection: 'Return for Correction', // client may call this 'Send Back'
    revise: 'Revise',
    remarks: 'Remarks',
    remarksRequired: 'Remarks are mandatory for this action.',
    requiredField: 'This field is required.',
    optional: 'Optional',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    none: 'None',
    selected: 'selected',
    rowsSelected: 'row(s) selected',
    of: 'of',
    page: 'Page',
    rowsPerPage: 'Rows per page',
    showing: 'Showing',
    to: 'to',
    entries: 'entries',
    noRecords: 'No records found',
    noRecordsHint: 'Adjust the filters above or create a new record to get started.',
    exportExcel: 'Export to Excel',
    exportPdf: 'Export to PDF',
    columns: 'Columns',
    columnVisibility: 'Show / hide columns',
    retry: 'Retry',
    errorTitle: 'Something went wrong',
    errorHint: 'The information could not be loaded. Please try again.',
    inPreparation: 'In preparation',
    inPreparationHint:
      'This screen is part of the agreed scope and will be built after the requirement discussion is signed off.',
    unsavedChanges: 'You have unsaved changes',
    unsavedChangesHint: 'If you leave this page now, the details you entered will be lost.',
    stayOnPage: 'Stay on this Page',
    discardChanges: 'Discard Changes',
    createdBy: 'Created By',
    createdOn: 'Created On',
    modifiedBy: 'Modified By',
    modifiedOn: 'Modified On',
    from: 'From',
    dateRange: 'Date Range',
    fromDate: 'From Date',
    toDate: 'To Date',
    status: 'Status',
    documentNo: 'Document No.', // client may call this 'Ref No.'
    date: 'Date',
    amount: 'Amount',
    quantity: 'Quantity',
    rate: 'Rate',
    unit: 'Unit',
    uom: 'UOM',
    description: 'Description',
    narration: 'Narration',
    attachments: 'Attachments',
    dragDropHint: 'Drag and drop files here, or click to browse',
    fileName: 'File Name',
    category: 'Category',
    uploadedBy: 'Uploaded By',
    uploadedOn: 'Uploaded On',
    expiryDate: 'Expiry Date',
    noAttachments: 'No documents attached',
    noAttachmentsHint: 'Attach supporting documents such as quotations, photographs or approvals.',
    currency: 'INR',
    currencySymbol: '₹',
    inLakh: 'Lakh',
    inCrore: 'Cr',
    helpTitle: 'What is this?',
    viewDetails: 'View Details',
    backToList: 'Back to List',
    selectPlaceholder: 'Select…',
    searchSelectPlaceholder: 'Type to search…',
    noOptions: 'No matching options',
    trendUp: 'up',
    trendDown: 'down',
    vsLastMonth: 'vs last month',
    drillDown: 'View breakdown',
  },

  // ===========================================================================
  nav: {
    home: 'Home',
    groupMasters: 'Masters',
    groupProjectControls: 'Project Controls',
    groupProcurement: 'Procurement',
    groupInventory: 'Stores & Inventory',
    groupSubcontract: 'Subcontractors',
    groupPlant: 'Plant & Fleet',
    groupHr: 'HR & Labour',
    groupDocuments: 'Documents',
    groupOrderBook: 'Order Book MIS',
    groupReports: 'Reports',
    groupHandover: 'Accounts Handover',
    groupAdministration: 'Administration',
    groupPortals: 'External Portals',
    collapseSidebar: 'Collapse menu',
    expandSidebar: 'Expand menu',
    notifications: 'Notifications',
    profile: 'My Profile',
    changePassword: 'Change Password',
    logout: 'Sign Out',
    company: 'Company',
    project: 'Project',
    site: 'Site',
    selectCompany: 'Select Company',
    selectProject: 'Select Project',
    allProjects: 'All Projects',
    showcase: 'Component Showcase',
  },

  // ===========================================================================
  masters: {
    companies: 'Companies',
    projects: 'Projects',
    sitesStores: 'Sites & Stores',
    departments: 'Departments',
    employees: 'Employees',
    vendors: 'Vendors', // client may call this 'Suppliers'
    subcontractors: 'Subcontractors',
    labourContractors: 'Labour Contractors', // client may call this 'Mistri / Petty Contractors'
    items: 'Items & Materials',
    uom: 'UOM',
    uomFull: 'Units of Measurement',
    hsnSac: 'HSN/SAC',
    equipment: 'Equipment & Vehicles',
    wbs: 'WBS / Cost Codes', // client may call this 'BOQ Heads' or 'Activity Codes'
    taxCategories: 'Tax Categories',
    documentCategories: 'Document Categories',

    companyName: 'Company Name',
    legalName: 'Legal Name',
    companyCode: 'Code',
    companyType: 'Entity Type',
    gstin: 'GSTIN',
    pan: 'PAN',
    cin: 'CIN',
    address: 'Address',
    city: 'City',
    state: 'State',
    pincode: 'PIN Code',
    contactPerson: 'Contact Person',
    phone: 'Phone',
    email: 'Email',

    projectCode: 'Project Code',
    projectName: 'Project Name',
    client: 'Client', // client may call this 'Employer'
    contractValue: 'Contract Value',
    projectType: 'Project Type',
    startDate: 'Start Date',
    endDate: 'Scheduled Completion',
    physicalProgress: 'Physical Progress',
    financialProgress: 'Financial Progress',
    chainageFrom: 'Chainage From',
    chainageTo: 'Chainage To',
    projectManager: 'Project Manager',
    location: 'Location',

    itemCode: 'Item Code',
    itemName: 'Item Name',
    itemGroup: 'Item Group',
    specification: 'Specification',
    stockUom: 'Stock UOM',
    reorderLevel: 'Reorder Level',
    hsnCode: 'HSN Code',
    gstRate: 'GST Rate',
    isAsset: 'Capital Item',

    vendorCode: 'Vendor Code',
    vendorName: 'Vendor Name',
    vendorCategory: 'Supply Category',
    paymentTerms: 'Payment Terms',
    creditDays: 'Credit Days',
    msmeNo: 'MSME Registration No.',
    bankAccount: 'Bank Account No.',
    ifsc: 'IFSC Code',

    employeeCode: 'Employee Code',
    employeeName: 'Employee Name',
    designation: 'Designation',
    department: 'Department',
    dateOfJoining: 'Date of Joining',
    reportingTo: 'Reporting To',

    trade: 'Trade',
    siteName: 'Site / Store Name',
    siteType: 'Type',
    storeKeeper: 'Store Keeper',
  },

  // ===========================================================================
  project: {
    dashboard: 'Project Dashboard',
    contractSummary: 'Contract Summary',
    wbsBudget: 'WBS & Budget',
    dpr: 'Daily Progress Report', // client may call this 'DPR' or 'Site Report'
    dprShort: 'DPR',
    hindranceRegister: 'Hindrance Register', // client may call this 'Delay Register'
    variationRegister: 'Variation Register', // client may call this 'EOT / Extra Items'
    claimRegister: 'Claim Register',
    bgRetention: 'BG & Retention Register', // Bank Guarantee & Retention Money
    orderBook: 'Order Book',
    projectSalesMis: 'Project Sales MIS',

    budgetedQty: 'Budgeted Quantity',
    executedQty: 'Executed Quantity',
    balanceQty: 'Balance Quantity',
    budgetedCost: 'Budgeted Cost',
    actualCost: 'Actual Cost',
    costVariance: 'Cost Variance',
    workDone: 'Work Done',
    manpowerDeployed: 'Manpower Deployed',
    weather: 'Weather',
    hindranceReason: 'Reason for Hindrance',
    bgNumber: 'BG Number',
    bgType: 'BG Type',
    bgAmount: 'BG Amount',
    validUpto: 'Valid Upto',
    retentionHeld: 'Retention Held',
  },

  // ===========================================================================
  procurement: {
    purchaseRequisitions: 'Purchase Requisitions',
    purchaseRequisition: 'Purchase Requisition', // client may call this 'Indent'
    prShort: 'PR',
    rfq: 'RFQ / Enquiry', // client may call this 'Enquiry'
    vendorQuotations: 'Vendor Quotations', // client may call this 'Offers'
    quotationComparison: 'Quotation Comparison', // client may call this 'Comparative Statement'
    purchaseOrders: 'Purchase Orders',
    purchaseOrder: 'Purchase Order',
    poShort: 'PO',
    purchaseInvoiceCapture: 'Purchase Invoice Capture', // client may call this 'Bill Entry'

    requiredBy: 'Required By',
    indentedBy: 'Indented By',
    priority: 'Priority',
    justification: 'Justification',
    deliveryLocation: 'Delivery Location',
    deliverySchedule: 'Delivery Schedule',
    quotedRate: 'Quoted Rate',
    basicAmount: 'Basic Amount',
    discount: 'Discount',
    taxableAmount: 'Taxable Amount',
    cgst: 'CGST',
    sgst: 'SGST',
    igst: 'IGST',
    freight: 'Freight',
    poValue: 'PO Value',
    orderedQty: 'Ordered Quantity',
    receivedQty: 'Received Quantity',
    pendingQty: 'Pending Quantity',
    invoiceNo: 'Invoice No.',
    invoiceDate: 'Invoice Date',
    invoiceAmount: 'Invoice Amount',
  },

  // ===========================================================================
  inventory: {
    grn: 'Goods Receipt (GRN)', // client may call this 'MRN' or 'Material Receipt'
    grnShort: 'GRN',
    materialIssue: 'Material Issue', // client may call this 'Issue Slip'
    materialReturn: 'Material Return',
    stockTransfer: 'Stock Transfer',
    stockAdjustment: 'Stock Adjustment', // client may call this 'Physical Verification'
    stockSummary: 'Stock Summary',
    stockLedger: 'Stock Ledger',
    openingStock: 'Opening Stock',

    receivedFrom: 'Received From',
    challanNo: 'Supplier Challan No.',
    challanDate: 'Challan Date',
    vehicleNo: 'Vehicle No.',
    gateEntryNo: 'Gate Entry No.',
    challanQty: 'Challan Quantity',
    acceptedQty: 'Accepted Quantity',
    rejectedQty: 'Rejected Quantity',
    shortageQty: 'Shortage',
    issuedTo: 'Issued To',
    issuePurpose: 'Purpose',
    costCode: 'Cost Code',
    fromStore: 'From Store',
    toStore: 'To Store',
    stockInHand: 'Stock in Hand',
    stockValue: 'Stock Value',
    lastReceiptDate: 'Last Receipt Date',
    consumption: 'Consumption',
    inwardQty: 'Inward',
    outwardQty: 'Outward',
    closingQty: 'Closing',
  },

  // ===========================================================================
  subcontract: {
    workOrders: 'Work Orders', // client may call this 'Sub Contract' or 'Labour Order'
    workOrder: 'Work Order',
    woShort: 'WO',
    measurements: 'Measurements',
    measurementSheet: 'Measurement Sheet', // client may call this 'MB' (Measure Book)
    bills: 'Bills', // client may call this 'RA Bills'
    raBill: 'Running Account Bill',
    deductions: 'Deductions & Recovery',

    subcontractorName: 'Subcontractor Name',
    workDescription: 'Work Description',
    woValue: 'Work Order Value',
    agreedRate: 'Agreed Rate',
    measuredQty: 'Measured Quantity',
    cumulativeQty: 'Cumulative Quantity',
    previousQty: 'Previous Quantity',
    thisBillQty: 'This Bill Quantity',
    billNo: 'Bill No.',
    billAmount: 'Bill Amount',
    tds: 'TDS',
    retention: 'Retention',
    advanceRecovery: 'Advance Recovery',
    materialRecovery: 'Material Recovery',
    penalty: 'Penalty',
    netPayable: 'Net Payable',
    measuredBy: 'Measured By',
    checkedBy: 'Checked By',
  },

  // ===========================================================================
  plant: {
    equipmentRegister: 'Equipment Register',
    deployment: 'Deployment',
    logBook: 'Log Book',
    fuelIssue: 'Fuel Issue', // client may call this 'Diesel Issue'
    maintenance: 'Maintenance',
    breakdowns: 'Breakdowns',

    equipmentCode: 'Equipment Code',
    equipmentName: 'Equipment',
    equipmentType: 'Equipment Type',
    registrationNo: 'Registration No.',
    ownership: 'Ownership',
    owned: 'Owned',
    hired: 'Hired',
    hireVendor: 'Hire Vendor',
    hireRate: 'Hire Rate',
    operator: 'Operator',
    deployedAt: 'Deployed At',
    openingHmr: 'Opening HMR / KM',
    closingHmr: 'Closing HMR / KM',
    hoursWorked: 'Hours Worked',
    idleHours: 'Idle Hours',
    breakdownHours: 'Breakdown Hours',
    dieselIssued: 'Diesel Issued (Ltr)',
    avgConsumption: 'Average Consumption',
    maintenanceType: 'Maintenance Type',
    nextServiceDue: 'Next Service Due',
    breakdownReason: 'Breakdown Reason',
    downtime: 'Downtime',
    resolvedOn: 'Resolved On',
  },

  // ===========================================================================
  hr: {
    employees: 'Employees',
    attendance: 'Attendance',
    leave: 'Leave',
    payroll: 'Payroll',
    salaryAdvances: 'Salary Advances',
    expenseClaims: 'Expense Claims', // client may call this 'Reimbursement'
    labourAttendance: 'Labour Attendance', // client may call this 'Muster Roll'
    labourCompliance: 'Labour Compliance', // ESI / PF / licence tracking

    presentDays: 'Present Days',
    absentDays: 'Absent Days',
    overtimeHours: 'Overtime Hours',
    leaveType: 'Leave Type',
    leaveBalance: 'Leave Balance',
    grossSalary: 'Gross Salary',
    deduction: 'Deductions',
    netSalary: 'Net Salary',
    advanceAmount: 'Advance Amount',
    claimAmount: 'Claim Amount',
    expenseHead: 'Expense Head',
    gangSize: 'Gang Size',
    skilledCount: 'Skilled',
    unskilledCount: 'Unskilled',
    pfNumber: 'PF Number',
    esiNumber: 'ESI Number',
    licenceNo: 'Licence No.',
  },

  // ===========================================================================
  documents: {
    library: 'Document Library',
    upload: 'Upload',
    expiryTracker: 'Expiry Tracker',
    documentName: 'Document Name',
    documentType: 'Document Type',
    linkedTo: 'Linked To',
    validFrom: 'Valid From',
    validTo: 'Valid To',
    daysToExpiry: 'Days to Expiry',
    expired: 'Expired',
    expiringSoon: 'Expiring Soon',
  },

  // ===========================================================================
  reports: {
    catalogue: 'Reports Catalogue',
    exportBatches: 'Export Batches',
    exportLog: 'Export Log',
    reportName: 'Report Name',
    module: 'Module',
    batchNo: 'Batch No.',
    exportedOn: 'Exported On',
    recordCount: 'Records',
  },

  // ===========================================================================
  admin: {
    users: 'Users',
    rolesPermissions: 'Roles & Permissions',
    approvalMatrix: 'Approval Matrix',
    numberSeries: 'Number Series',
    auditLog: 'Audit Log',
    vendorPortal: 'Vendor Portal',
    subcontractorPortal: 'Subcontractor Portal',
    userName: 'User Name',
    role: 'Role',
    lastLogin: 'Last Login',
    active: 'Active',
    inactive: 'Inactive',
    level: 'Level',
    approver: 'Approver',
    seriesPrefix: 'Prefix',
    nextNumber: 'Next Number',
  },

  // ===========================================================================
  status: {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    RETURNED: 'Returned',
    REVISED: 'Revised',
    CANCELLED: 'Cancelled',
    CLOSED: 'Closed',
  },

  // ===========================================================================
  approval: {
    title: 'Approval Status',
    level: 'Level',
    approver: 'Approver',
    action: 'Action',
    actionedOn: 'Action Date',
    remarks: 'Remarks',
    waitingWith: 'Currently waiting with',
    notStarted: 'Not yet reached this level',
    pending: 'Awaiting action',
    completed: 'Approval completed',
    noWorkflow: 'This document does not require approval.',
  },

  // ===========================================================================
  audit: {
    title: 'Audit Trail',
    user: 'User',
    timestamp: 'Date & Time',
    action: 'Action',
    changes: 'Changed Fields',
    noEntries: 'No activity recorded yet',
    noEntriesHint: 'Every change made to this document will be listed here.',
    fieldChanged: 'changed from',
    fieldChangedTo: 'to',
  },

  // ===========================================================================
  detail: {
    tabDetails: 'Details',
    tabLineItems: 'Line Items',
    tabAttachments: 'Attachments',
    tabApprovals: 'Approvals',
    tabAudit: 'Audit Trail',
    summary: 'Summary',
  },

  // ===========================================================================
  importWizard: {
    title: 'Import from Excel',
    step1: 'Download Template',
    step2: 'Upload File',
    step3: 'Preview & Validate',
    step4: 'Confirm Import',
    step1Hint:
      'Download the Excel template, fill in your data and keep the column headings unchanged.',
    downloadTemplate: 'Download Template',
    step2Hint: 'Upload the filled template. Only .xlsx and .csv files are accepted.',
    step3Hint: 'Rows with errors are highlighted. Correct them in the file and upload again.',
    step4Hint: 'Confirm to import all valid rows. Rows with errors will be skipped.',
    rowNo: 'Row',
    validationError: 'Error',
    rowsValid: 'Rows ready to import',
    rowsFailed: 'Rows with errors',
    rowsImported: 'Rows imported',
    importComplete: 'Import completed',
    next: 'Next',
    back: 'Back',
    startImport: 'Start Import',
    done: 'Done',
  },

  // ===========================================================================
  home: {
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    contextLine: 'You are working in',
    waitingForMyAction: 'Waiting for my action',
    waitingForMyActionHint: 'Documents that cannot move forward until you approve or reject them.',
    nothingWaiting: 'Nothing is waiting for your action',
    nothingWaitingHint: 'Approvals assigned to you will appear here.',
    myPendingTasks: 'My pending tasks',
    myPendingTasksHint: 'Work you have started but not yet completed.',
    noPendingTasks: 'You are up to date',
    noPendingTasksHint: 'New tasks will appear here as work progresses.',
    alerts: 'Alerts',
    alertsHint: 'Items that need attention soon.',
    noAlerts: 'No alerts',
    noAlertsHint: 'Expiries, low stock and breakdowns will be flagged here.',
    quickCreate: 'Quick Create',
    newPr: 'New Purchase Requisition',
    newGrn: 'New GRN',
    newIssue: 'New Material Issue',
    newDpr: 'New DPR',
    newFuelIssue: 'New Fuel Issue',
    dprNotSubmitted: 'Daily Progress Report not submitted for today',
    draftsNotSubmitted: 'Draft documents not yet submitted',
    returnedForCorrection: 'Documents returned to you for correction',
    docsExpiring: 'Documents expiring within 30 days',
    lowStock: 'Items below reorder level',
    equipmentBreakdown: 'Equipment currently under breakdown',
    overdueMaintenance: 'Equipment with overdue maintenance',
    pendingCount: 'pending',
    openItem: 'Open',
    viewAll: 'View all',
  },

  // ===========================================================================
  login: {
    title: 'Sign in',
    subtitle: 'Enter your credentials to continue',
    email: 'Email',
    emailPlaceholder: 'name@company.co.in',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign in',
    demoNotice:
      'Demonstration environment. Sign-in is not verified — any email and password will proceed.',
    rolePicker: 'Continue as',
    rolePickerHint:
      'Choose a role to see the application from that person’s point of view. The menu changes to match the role.',
    forgotPassword: 'Forgot password?',
        // --- Added: login brand panel & form states ---
    brandHeading: 'Enterprise Resource Planning',
    brandSubheading:
      'One system for projects, procurement, stores, subcontractors, plant and people.',
    brandPointProjects: 'Track project progress, budgets and daily site activity',
    brandPointProcurement: 'Control indents, purchase orders and material receipts',
    brandPointStores: 'Know exactly what stock is at every site store',
    brandPointVisibility: 'Give management one reliable view across all projects',
    emailRequired: 'Please enter your email address',
    passwordRequired: 'Please enter your password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    signingIn: 'Signing in…',
    viewAs: 'View the system as',
    supportNote: 'For access or password help, contact your system administrator.',
  },

  // ===========================================================================
  roles: {
    ADMINISTRATOR: 'Administrator',
    PROJECT_MANAGER: 'Project Manager',
    SITE_ENGINEER: 'Site Engineer',
    STORE_KEEPER: 'Store Keeper',
    PROCUREMENT_OFFICER: 'Procurement Officer',
    ACCOUNTS: 'Accounts',
    MANAGEMENT: 'Management',
    VENDOR: 'Vendor',
    SUBCONTRACTOR: 'Subcontractor',
  },

  // ===========================================================================
  // Plain-English explanations shown by HelpHint for first-time ERP users.
  help: {
    purchaseRequisition:
      'A written request from the site asking the purchase department to buy materials. It does not order anything by itself — it becomes a Purchase Order only after approval.',
    purchaseOrder:
      'The official order sent to a vendor confirming what you are buying, at what rate and by when. Once issued, the vendor can supply against it.',
    grn: 'Recorded when material physically arrives at the store. It confirms how much was actually received and accepted, which may be less than what was ordered.',
    materialIssue:
      'Records material going out of the store to a work location. This is what turns stored stock into project cost.',
    measurementSheet:
      'The record of work physically measured at site. Subcontractor bills are prepared from these measured quantities.',
    workOrder:
      'The agreement with a subcontractor for a defined scope of work at agreed rates, against which measurements and bills are raised.',
    dpr: 'A daily record of work done, manpower, equipment and weather at site. It is the base record for progress reporting.',
    wbs: 'A coded breakdown of the project into activities such as earthwork or subgrade, so that cost and progress can be tracked activity by activity.',
    approvalTimeline:
      'Shows who has to approve this document and in what order. The highlighted level is the person it is currently waiting with.',
    statusChip:
      'Shows where the document has reached in its workflow, from Draft through to Approved or Closed.',
    companyProjectContext:
      'You may work across more than one company and project. This shows which one you are currently working in — all records you create belong to it.',
    retention:
      'A percentage of the bill amount held back until the work is complete, released later as per contract terms.',
    tds: 'Tax deducted at source from the payable amount as required under the Income Tax Act.',
  },
} as const;

export type Terminology = typeof terminology;
export type StatusKey = keyof typeof terminology.status;
export type RoleKey = keyof typeof terminology.roles;

export const t = terminology;
export default terminology;
