'use client';

import * as React from 'react';
import {
  getCurrentUser,
  listCompanies,
  listProjects,
  listSites,
  setSession,
} from '@/lib/data';
import type { Company, CurrentUser, Project, Site, UserRole } from '@/lib/data/types';

interface AppContextValue {
  user: CurrentUser | null;
  companies: Company[];
  projects: Project[];
  sites: Site[];
  company: Company | null;
  project: Project | null;
  site: Site | null;
  isLoading: boolean;
  selectCompany: (companyId: string) => Promise<void>;
  selectProject: (projectId: string | null) => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
}

const AppContext = React.createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [sites, setSites] = React.useState<Site[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    const [nextUser, nextCompanies] = await Promise.all([getCurrentUser(), listCompanies()]);
    const companyId = nextUser.companyId;
    const nextProjects = await listProjects({ companyId });

    // Keep the selected project consistent with the selected company.
    let projectId = nextUser.projectId;
    if (projectId && !nextProjects.some((p) => p.id === projectId)) {
      projectId = nextProjects[0]?.id ?? null;
      await setSession({ projectId });
    }

    const nextSites = await listSites({ companyId, projectId: projectId ?? undefined });

    setUser({ ...nextUser, projectId });
    setCompanies(nextCompanies);
    setProjects(nextProjects);
    setSites(nextSites);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const selectCompany = React.useCallback(
    async (companyId: string) => {
      const nextProjects = await listProjects({ companyId });
      const projectId = nextProjects[0]?.id ?? null;
      await setSession({ companyId, projectId });
      await load();
    },
    [load],
  );

  const selectProject = React.useCallback(
    async (projectId: string | null) => {
      await setSession({ projectId });
      await load();
    },
    [load],
  );

  const selectRole = React.useCallback(
    async (role: UserRole) => {
      await setSession({ role });
      await load();
    },
    [load],
  );

  const company = React.useMemo(
    () => companies.find((c) => c.id === user?.companyId) ?? null,
    [companies, user?.companyId],
  );
  const project = React.useMemo(
    () => projects.find((p) => p.id === user?.projectId) ?? null,
    [projects, user?.projectId],
  );
  const site = React.useMemo(
    () => sites.find((s) => s.id === user?.siteId) ?? sites.find((s) => s.isStore) ?? null,
    [sites, user?.siteId],
  );

  const value: AppContextValue = {
    user,
    companies,
    projects,
    sites,
    company,
    project,
    site,
    isLoading,
    selectCompany,
    selectProject,
    selectRole,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
