'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Info, LogIn } from 'lucide-react';
import { themeConfig } from '@/config/theme.config';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { listRoles, setSession } from '@/lib/data';
import type { UserRole } from '@/lib/data/types';
import { TextField, SelectField, type Option } from '@/components/erp';
import { BrandLogo } from '@/components/shell/brand-logo';

/**
 * FILE 6 — Login page. No real authentication: any credentials proceed.
 * The role picker changes which navigation items appear, so the demonstration
 * can be walked through from different viewpoints.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('PROJECT_MANAGER');
  const [roleOptions, setRoleOptions] = React.useState<Option[]>([]);

  React.useEffect(() => {
    void (async () => {
      const roles = await listRoles();
      setRoleOptions(roles.map((r) => ({ value: r.role, label: r.label, hint: r.name })));
    })();
  }, []);

  const signIn = async () => {
    await setSession({ role });
    router.push('/home');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <BrandLogo height={48} hideTagline className="items-center" />
          <p className="text-sm text-muted-foreground">{t.common.appTagline}</p>
        </div>

        <Card className="p-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void signIn();
            }}
            className="flex flex-col gap-4"
          >
            <header>
              <h1 className="text-lg font-heading text-foreground">{t.login.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t.login.subtitle}</p>
            </header>

            <TextField
              id="login-email"
              label={t.login.email}
              value={email}
              onChange={setEmail}
              placeholder={t.login.emailPlaceholder}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {t.login.password}
                <span className="ml-0.5 text-danger" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.login.passwordPlaceholder}
                className="flex h-field w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Role picker — drives navigation visibility */}
            <SelectField
              id="login-role"
              label={t.login.rolePicker}
              value={role}
              onChange={(v) => setRole(v as UserRole)}
              options={roleOptions}
              helperText={t.login.rolePickerHint}
            />

            <Button type="submit" className="mt-1 w-full">
              <LogIn />
              {t.login.signIn}
            </Button>

            <button
              type="button"
              className="text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {t.login.forgotPassword}
            </button>
          </form>
        </Card>

        {/* Demonstration notice */}
        <aside
          role="note"
          className="mt-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-foreground">{t.login.demoNotice}</p>
        </aside>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {themeConfig.brand.appName}
        </p>
      </div>
    </main>
  );
}
