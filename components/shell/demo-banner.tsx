'use client';

import * as React from 'react';
import { Info, X } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import { store } from '@/lib/data/store';

const KEY = 'demoBannerDismissed';

/** Persistent, dismissible notice at the top of the content region. */
export function DemoBanner() {
  const [dismissed, setDismissed] = React.useState(true);

  // Read after mount so the static export markup stays stable.
  React.useEffect(() => {
    setDismissed(store.getPreference<boolean>(KEY, false));
  }, []);

  if (dismissed) return null;

  return (
    <aside
      id="demo-banner"
      role="note"
      className="mb-section flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
      <p className="flex-1 text-sm text-foreground">{t.common.demoBanner}</p>
      <Button
        variant="ghost"
        size="iconSm"
        aria-label={t.common.dismiss}
        onClick={() => {
          store.setPreference<boolean>(KEY, true);
          setDismissed(true);
        }}
      >
        <X />
      </Button>
    </aside>
  );
}
