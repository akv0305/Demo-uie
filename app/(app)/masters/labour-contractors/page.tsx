import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.masters.labourContractors, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.masters.labourContractors}
      group={t.nav.groupMasters}
    />
  );
}
