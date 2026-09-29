'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { formatDate, formatNumber } from '@/lib/format';
import type { DailyProgressReport } from '@/lib/data/types';

const weatherLabel = (w: DailyProgressReport['weather']) =>
  ({
    CLEAR: t.project.wthCLEAR,
    CLOUDY: t.project.wthCLOUDY,
    LIGHT_RAIN: t.project.wthLIGHT_RAIN,
    HEAVY_RAIN: t.project.wthHEAVY_RAIN,
    EXTREME_HEAT: t.project.wthEXTREME_HEAT,
  })[w];

export const manpowerOf = (r: DailyProgressReport) =>
  r.labourLines.reduce((a, l) => a + l.skilledCount + l.unskilledCount, 0);

export function dprColumns(siteName: (id: string) => string): ColumnDef<DailyProgressReport>[] {
  return [
    {
      key: 'date',
      header: t.common.date,
      sortable: true,
      width: '8rem',
      cell: (r) => <span className="font-medium text-foreground">{formatDate(r.date)}</span>,
    },
    { key: 'documentNo', header: t.common.documentNo, cell: (r) => r.documentNo },
    { key: 'siteId', header: t.masters.siteName, cell: (r) => siteName(r.siteId) },
    {
      key: 'weather',
      header: t.project.weather,
      cell: (r) => (
        <span className="text-muted-foreground">
          {weatherLabel(r.weather)}
          {r.rainfallMm ? ` · ${r.rainfallMm} mm` : ''}
        </span>
      ),
    },
    {
      key: 'activities',
      header: t.project.dprActivities,
      align: 'right',
      cell: (r) => <span className="num">{r.progressLines.length}</span>,
    },
    {
      key: 'manpower',
      header: t.project.dprLabourTotal,
      align: 'right',
      cell: (r) => <span className="num">{formatNumber(manpowerOf(r))}</span>,
    },
    {
      key: 'hoursLost',
      header: t.project.dprHoursLost,
      align: 'right',
      hideOnCard: true,
      cell: (r) =>
        r.hoursLost ? (
          <span className="num text-danger">{r.hoursLost}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: 'preparedByName', header: t.project.dprPreparedBy, hiddenByDefault: true, cell: (r) => r.preparedByName },
    {
      key: 'status',
      header: t.common.status,
      align: 'center',
      cell: (r) => <StatusChip status={r.status} />,
    },
  ];
}
