'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { ComparisonScreen } from '@/features/procurement/comparison-screen';
import { listProjects, listQuotations, listRfqs } from '@/lib/data';
import type { Project, Quotation, Rfq } from '@/lib/data/types';
import { buildComparison } from '@/lib/procurement/comparison';

export default function Page() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [rfqs, setRfqs] = React.useState<Rfq[]>([]);
  const [rfqId, setRfqId] = React.useState('');
  const [quotations, setQuotations] = React.useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const list = await listProjects();
        setProjects(list);
        if (list.length) setProjectId((cur) => cur || list[0].id);
      } catch (err) {
        console.error('[comparison] projects failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  // Enquiries for the selected project. Changing project clears the selection.
  React.useEffect(() => {
    if (!projectId) return;
    void (async () => {
      setIsLoading(true);
      try {
        const rfq = await listRfqs({ projectId, pageSize: 500 });
        const floated = rfq.rows.filter((r) => r.status === 'SUBMITTED' || r.status === 'CLOSED');
        setRfqs(floated);
        setRfqId(floated[0]?.id ?? '');
      } catch (err) {
        console.error('[comparison] enquiries failed', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [projectId]);

  React.useEffect(() => {
    if (!rfqId) {
      setQuotations([]);
      return;
    }
    void (async () => {
      setIsLoading(true);
      try {
        const qtn = await listQuotations({ rfqId, pageSize: 200 });
        setQuotations(qtn.rows);
      } catch (err) {
        console.error('[comparison] offers failed', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [rfqId]);

  const projectOptions: Option[] = projects.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
  }));

  const rfqOptions: Option[] = rfqs.map((r) => ({
    value: r.id,
    label: r.documentNo,
    hint: r.title,
  }));

  const comparison = React.useMemo(
    () => buildComparison(rfqs.find((r) => r.id === rfqId) ?? null, quotations),
    [rfqs, rfqId, quotations],
  );

  return (
    <ComparisonScreen
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      rfqId={rfqId}
      onRfqChange={setRfqId}
      rfqOptions={rfqOptions}
      comparison={comparison}
    />
  );
}
