import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.plant.breakdowns, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.plant.breakdowns}
      group={t.nav.groupPlant}
    />
  );
}
