import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.subcontract.measurements, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.subcontract.measurements}
      group={t.nav.groupSubcontract}
      helpTopic="measurementSheet"
    />
  );
}
