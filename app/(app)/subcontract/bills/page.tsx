import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.subcontract.bills, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.subcontract.bills}
      group={t.nav.groupSubcontract}
    />
  );
}
