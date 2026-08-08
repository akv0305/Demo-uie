import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.subcontract.workOrders, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.subcontract.workOrders}
      group={t.nav.groupSubcontract}
      helpTopic="workOrder"
    />
  );
}
