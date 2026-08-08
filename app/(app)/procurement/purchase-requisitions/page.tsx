import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.procurement.purchaseRequisitions, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.procurement.purchaseRequisitions}
      group={t.nav.groupProcurement}
      helpTopic="purchaseRequisition"
    />
  );
}
