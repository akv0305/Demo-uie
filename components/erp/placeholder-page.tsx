'use client';

import { Construction } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { EmptyState } from './empty-state';
import { PageHeader } from './page-header';
import { RecordContextBar } from './record-context-bar';
import { useApp } from '@/components/shell/app-context';
import type { HelpKey } from './help-hint';

/**
 * Standard placeholder used by every navigation route that is in scope but not
 * yet built: a page header plus an "In preparation" empty state.
 */
export function PlaceholderPage({
  title,
  group,
  helpTopic,
  showContextBar = true,
}: {
  title: string;
  group?: string;
  helpTopic?: HelpKey;
  showContextBar?: boolean;
}) {
  const { company, project, site } = useApp();

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={group ? [{ label: t.nav.home, href: '/home' }, { label: group }] : undefined}
        helpTopic={helpTopic}
      />
      {showContextBar && (
        <RecordContextBar
          companyName={company?.name}
          projectName={project?.shortName}
          siteName={site?.name}
        />
      )}
      <EmptyState
        icon={Construction}
        headline={t.common.inPreparation}
        description={t.common.inPreparationHint}
      />
    </>
  );
}
