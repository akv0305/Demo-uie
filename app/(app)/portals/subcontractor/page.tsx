import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.admin.subcontractorPortal, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.admin.subcontractorPortal}
      group={t.nav.groupPortals}
    />
  );
}
