import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.admin.rolesPermissions, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.admin.rolesPermissions}
      group={t.nav.groupAdministration}
    />
  );
}
