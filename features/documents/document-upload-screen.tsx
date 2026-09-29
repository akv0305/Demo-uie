'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  DateField,
  FileUploadField,
  FormLayout,
  FormSection,
  PageHeader,
  SearchableSelectField,
  SelectField,
  TextareaField,
  type Option,
} from '@/components/erp';
import type { Attachment } from '@/lib/data/types';
import {
  documentUploadSchema,
  emptyUpload,
  type DocumentUploadValues,
} from './document-schema';

export interface DocumentUploadScreenProps {
  /** Entity-type choices, already labelled. */
  entityOptions: Option[];
  /** Records for the currently chosen entity type. */
  recordOptions: Option[];
  categoryOptions: Option[];
  selectedEntityKey: string;
  onEntityKeyChange: (v: string) => void;
  onSubmit: (values: DocumentUploadValues) => Promise<void>;
  onCancel: () => void;
  lastSaved?: Attachment | null;
}

export function DocumentUploadScreen({
  entityOptions,
  recordOptions,
  categoryOptions,
  selectedEntityKey,
  onEntityKeyChange,
  onSubmit,
  onCancel,
  lastSaved,
}: DocumentUploadScreenProps) {
  const [saving, setSaving] = React.useState(false);

  const form = useForm<DocumentUploadValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: emptyUpload,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    setSaving(true);
    try {
      await onSubmit(values);
      form.reset(emptyUpload);
    } finally {
      setSaving(false);
    }
  });

  return (
    <>
      <PageHeader
        title={t.documents.upload}
        subtitle={t.documents.uploadSubtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.nav.groupDocuments },
          { label: t.documents.library, href: '/documents/library' },
        ]}
        helpTopic="documentLink"
        secondaryActions={[{ label: t.documents.goToLibrary, href: '/documents/library' }]}
      />

      {lastSaved && (
        <p
          role="status"
          className="mb-section rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-foreground"
        >
          {t.documents.uploadDone}
        </p>
      )}

      <FormLayout
        isDirty={isDirty}
        isSaving={saving}
        submitLabel={t.common.upload}
        onSubmit={submit}
        onCancel={onCancel}
      >
        <FormSection title={t.documents.secFile} columns={1}>
          <Controller
            control={form.control}
            name="files"
            render={({ field }) => (
              <FileUploadField
                id="doc-files"
                label={t.documents.documentName}
                required
                files={field.value}
                onFilesChange={field.onChange}
                multiple={false}
                error={errors.files?.message}
              />
            )}
          />
        </FormSection>

        <FormSection title={t.documents.secClassify} columns={2}>
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <SelectField
                id="doc-category"
                label={t.documents.documentType}
                required
                value={field.value}
                onChange={field.onChange}
                options={categoryOptions}
                error={errors.category?.message}
              />
            )}
          />
          <TextareaField
            id="doc-remarks"
            label={t.documents.remarks}
            rows={2}
            value={form.watch('remarks')}
            onChange={(v) => form.setValue('remarks', v, { shouldDirty: true })}
            error={errors.remarks?.message}
            maxLength={300}
          />
        </FormSection>

        <FormSection title={t.documents.secLink} helpTopic="documentLink" columns={2}>
          <Controller
            control={form.control}
            name="entityKey"
            render={({ field }) => (
              <SelectField
                id="doc-entity"
                label={t.documents.linkEntity}
                required
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onEntityKeyChange(v);
                  form.setValue('entityId', '', { shouldDirty: true });
                }}
                options={entityOptions}
                error={errors.entityKey?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="entityId"
            render={({ field }) => (
              <SearchableSelectField
                id="doc-record"
                label={t.documents.linkRecord}
                required
                value={field.value}
                onChange={field.onChange}
                options={recordOptions}
                error={errors.entityId?.message}
                helperText={selectedEntityKey ? undefined : t.documents.recordRequired}
              />
            )}
          />
        </FormSection>

        <FormSection title={t.documents.secValidity} helpTopic="documentExpiry" columns={2}>
          <Controller
            control={form.control}
            name="validFrom"
            render={({ field }) => (
              <DateField
                id="doc-valid-from"
                label={t.documents.validFrom}
                value={field.value}
                onChange={field.onChange}
                error={errors.validFrom?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <DateField
                id="doc-expiry"
                label={t.documents.validTo}
                value={field.value}
                onChange={field.onChange}
                min={form.watch('validFrom') || undefined}
                error={errors.expiryDate?.message}
                helperText={t.documents.noExpiry}
              />
            )}
          />
        </FormSection>
      </FormLayout>
    </>
  );
}

export default DocumentUploadScreen;
