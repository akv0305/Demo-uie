import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.hr.labourAttendance, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.hr.labourAttendance}
      group={t.nav.groupHr}
    />
  );
}
