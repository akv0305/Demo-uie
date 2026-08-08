import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.project.dpr, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.project.dpr}
      group={t.nav.groupProjectControls}
      helpTopic="dpr"
    />
  );
}
