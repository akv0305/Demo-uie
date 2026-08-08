import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.inventory.materialIssue, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.inventory.materialIssue}
      group={t.nav.groupInventory}
      helpTopic="materialIssue"
    />
  );
}
