import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.reports.exportBatches, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.reports.exportBatches}
      group={t.nav.groupHandover}
    />
  );
}
