import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.hr.employees, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.hr.employees}
      group={t.nav.groupHr}
    />
  );
}
