import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.documents.library, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.documents.library}
      group={t.nav.groupDocuments}
    />
  );
}
