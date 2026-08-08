'use client';

import { Building2, FolderKanban } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useApp } from './app-context';

/**
 * Company and project selectors. Deliberately prominent: users work across
 * multiple companies and projects and must always know their current context.
 */
export function ContextSelectors({ className }: { className?: string }) {
  const { companies, projects, user, selectCompany, selectProject } = useApp();

  if (!user) return null;

  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center', className)}>
      {/* Company */}
      <div className="flex min-w-0 items-center gap-2">
        <span className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground xl:flex">
          <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
          {t.nav.company}
        </span>
        <Select value={user.companyId} onValueChange={(v) => void selectCompany(v)}>
          <SelectTrigger
            id="company-selector"
            aria-label={t.nav.selectCompany}
            className="h-8 w-full min-w-0 border-primary/30 bg-primary/5 font-medium sm:w-[190px]"
          >
            <SelectValue placeholder={t.nav.selectCompany} />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project */}
      <div className="flex min-w-0 items-center gap-2">
        <span className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground xl:flex">
          <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
          {t.nav.project}
        </span>
        <Select
          value={user.projectId ?? 'ALL'}
          onValueChange={(v) => void selectProject(v === 'ALL' ? null : v)}
        >
          <SelectTrigger
            id="project-selector"
            aria-label={t.nav.selectProject}
            className="h-8 w-full min-w-0 border-primary/30 bg-primary/5 font-medium sm:w-[230px]"
          >
            <SelectValue placeholder={t.nav.selectProject} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t.nav.allProjects}</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.shortName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
