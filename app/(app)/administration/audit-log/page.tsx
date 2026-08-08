import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.admin.auditLog, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.admin.auditLog}
      group={t.nav.groupAdministration}
    />
  );
}
