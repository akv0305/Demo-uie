'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { ImportWizard, PageHeader, type ImportPreviewRow } from '@/components/erp';

const COLUMNS = [
  { key: 'code', header: t.masters.itemCode },
  { key: 'name', header: t.masters.itemName },
  { key: 'group', header: t.masters.itemGroup },
  { key: 'stockUom', header: t.masters.stockUom },
  { key: 'hsnCode', header: t.masters.hsnCode },
  { key: 'reorderLevel', header: t.masters.reorderLevel },
];

/**
 * Preview rows are illustrative: the demo build does not parse the uploaded
 * workbook. They show the validation the real import will apply (DEF-023).
 */
const SAMPLE_PREVIEW: ImportPreviewRow[] = [
  { rowNo: 2, values: { code: 'CEM-OPC53', name: 'OPC 53 Grade Cement', group: 'CEMENT', stockUom: 'MT', hsnCode: '2523', reorderLevel: '50' } },
  { rowNo: 3, values: { code: 'STL-TMT12', name: 'TMT Bar 12mm Fe500D', group: 'STEEL', stockUom: 'MT', hsnCode: '7214', reorderLevel: '10' } },
  { rowNo: 4, values: { code: 'agg-20', name: 'Coarse Aggregate 20mm', group: 'AGGREGATE', stockUom: 'CUM', hsnCode: '2517', reorderLevel: '100' }, errors: ['Item code must be in capitals.'] },
  { rowNo: 5, values: { code: 'FUL-HSD', name: 'High Speed Diesel', group: 'FUEL', stockUom: 'LTR', hsnCode: '2710', reorderLevel: '2000' } },
  { rowNo: 6, values: { code: 'SHT-PLY12', name: 'Shuttering Plywood 12mm', group: 'SHUTTERING', stockUom: 'NOS', hsnCode: '', reorderLevel: '25' }, errors: ['HSN code is required.'] },
  { rowNo: 7, values: { code: 'CEM-OPC53', name: 'OPC Cement duplicate row', group: 'CEMENT', stockUom: 'BAG', hsnCode: '2523', reorderLevel: '' }, errors: ['Item code already exists in row 2.'] },
];

export default function ItemImportPage() {
  const [preview, setPreview] = React.useState<ImportPreviewRow[]>([]);

  return (
    <>
      <PageHeader
        title={t.masters.itemImport}
        subtitle={t.importWizard.step1Hint}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.masters.items, href: '/masters/items' },
          { label: t.masters.itemImport },
        ]}
        helpTopic="item"
        secondaryActions={[{ label: t.common.backToList, href: '/masters/items' }]}
      />

      <ImportWizard
        columns={COLUMNS}
        previewRows={preview}
        onFileSelected={() => setPreview(SAMPLE_PREVIEW)}
        onDownloadTemplate={() => undefined}
        onConfirm={() => undefined}
      />
    </>
  );
}
