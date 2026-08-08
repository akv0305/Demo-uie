import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.admin.approvalMatrix, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.admin.approvalMatrix}
      group={t.nav.groupAdministration}
    />
  );
}
