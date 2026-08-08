import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.subcontract.deductions, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.subcontract.deductions}
      group={t.nav.groupSubcontract}
      helpTopic="tds"
    />
  );
}
