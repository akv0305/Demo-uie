import Link from 'next/link';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-xl font-heading text-foreground">{t.common.errorTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.common.errorHint}</p>
        <Button asChild className="mt-5" size="sm">
          <Link href="/home">{t.nav.home}</Link>
        </Button>
      </div>
    </main>
  );
}
