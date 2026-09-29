'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { terminology as t } from '@/config/terminology.config';
import type { Option } from '@/components/erp';
import { DocumentUploadScreen } from '@/features/documents/document-upload-screen';
import type { DocumentUploadValues } from '@/features/documents/document-schema';
import { LINKABLE_ENTITIES } from '@/features/documents/document-schema';
import {
  createRecord,
  getCurrentUser,
  listAttachmentCategories,
  listCompanies,
  listEmployees,
  listEquipment,
  listProjects,
  listSubcontractors,
  listVendors,
} from '@/lib/data';
import type { Attachment } from '@/lib/data/types';
import { entityTypeLabel } from '@/lib/documents/attachments';

export default function Page() {
  const router = useRouter();

  const [optionsByEntity, setOptionsByEntity] = React.useState<Record<string, Option[]>>({});
  const [categories, setCategories] = React.useState<string[]>([]);
  const [uploaderName, setUploaderName] = React.useState('');
  const [selectedEntityKey, setSelectedEntityKey] = React.useState('vendors');
  const [lastSaved, setLastSaved] = React.useState<Attachment | null>(null);

  React.useEffect(() => {
    void (async () => {
      try {
        const [cats, user, vendors, subs, equipment, employees, projects, companies] =
          await Promise.all([
            listAttachmentCategories(),
            getCurrentUser(),
            listVendors({ pageSize: 500 }),
            listSubcontractors({ pageSize: 500 }),
            listEquipment({ pageSize: 500 }),
            listEmployees({ pageSize: 500 }),
            listProjects(),
            listCompanies(),
          ]);

        setCategories(cats);
        setUploaderName(user.name);
        setOptionsByEntity({
          vendors: vendors.rows.map((v) => ({ value: v.id, label: `${v.code} — ${v.name}` })),
          subcontractors: subs.rows.map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
          equipment: equipment.rows.map((e) => ({ value: e.id, label: `${e.code} — ${e.name}` })),
          employees: employees.rows.map((e) => ({ value: e.id, label: `${e.code} — ${e.name}` })),
          projects: projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })),
          companies: companies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` })),
          documents: [],
        });
      } catch (err) {
        // Temporary during bring-up — replace with ErrorState (DEF-039).
        console.error('[document-upload] load failed', err);
      }
    })();
  }, []);

  const entityOptions: Option[] = LINKABLE_ENTITIES.filter((k) => k !== 'documents').map((k) => ({
    value: k,
    label: entityTypeLabel(k),
  }));

  const categoryOptions: Option[] = categories.map((c) => ({ value: c, label: c }));

  const handleSubmit = async (values: DocumentUploadValues) => {
    const file = values.files[0];
    // Empty strings would produce an Invalid Date downstream — omit instead.
    const saved = await createRecord<Attachment>('attachments', {
      entityKey: values.entityKey,
      entityId: values.entityId,
      fileName: file.name,
      category: values.category,
      sizeKb: file.sizeKb,
      uploadedByName: uploaderName,
      uploadedOn: new Date().toISOString(),
      ...(values.validFrom ? { validFrom: values.validFrom } : {}),
      ...(values.expiryDate ? { expiryDate: values.expiryDate } : {}),
      ...(values.remarks ? { remarks: values.remarks } : {}),
    });
    setLastSaved(saved);
  };

  return (
    <DocumentUploadScreen
      entityOptions={entityOptions}
      recordOptions={optionsByEntity[selectedEntityKey] ?? []}
      categoryOptions={categoryOptions}
      selectedEntityKey={selectedEntityKey}
      onEntityKeyChange={setSelectedEntityKey}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/documents/library')}
      lastSaved={lastSaved}
    />
  );
}
