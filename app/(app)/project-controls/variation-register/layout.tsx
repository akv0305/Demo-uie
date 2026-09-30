import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.project.variationRegister, robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
