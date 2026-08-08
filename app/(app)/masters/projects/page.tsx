import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.masters.projects, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.masters.projects}
      group={t.nav.groupMasters}
    />
  );
}
