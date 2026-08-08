import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.procurement.vendorQuotations, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.procurement.vendorQuotations}
      group={t.nav.groupProcurement}
    />
  );
}
