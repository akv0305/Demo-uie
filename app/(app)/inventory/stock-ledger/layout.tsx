import { terminology as t } from '@/config/terminology.config';

export const metadata = {
  title: t.inventory.slFull,
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
