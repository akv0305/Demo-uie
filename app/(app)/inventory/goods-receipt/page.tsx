import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.inventory.grn, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.inventory.grn}
      group={t.nav.groupInventory}
      helpTopic="grn"
    />
  );
}
