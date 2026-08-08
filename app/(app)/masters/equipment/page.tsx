import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.masters.equipment, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.masters.equipment}
      group={t.nav.groupMasters}
    />
  );
}
