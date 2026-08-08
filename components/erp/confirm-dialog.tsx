'use client';

import * as React from 'react';
import { AlertTriangle, Check, CornerUpLeft, RefreshCw, Send, X } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * (16) ConfirmDialog — used for submit, approve, reject, cancel and revise.
 * Remarks are mandatory where the action requires a reason.
 */
export type ConfirmIntent = 'SUBMIT' | 'APPROVE' | 'REJECT' | 'RETURN' | 'CANCEL' | 'REVISE' | 'DELETE';

const INTENT_META: Record<
  ConfirmIntent,
  {
    title: string;
    icon: typeof Check;
    confirmLabel: string;
    variant: 'default' | 'destructive' | 'success' | 'outline';
    remarksMandatory: boolean;
  }
> = {
  SUBMIT: { title: t.common.submit, icon: Send, confirmLabel: t.common.submit, variant: 'default', remarksMandatory: false },
  APPROVE: { title: t.common.approve, icon: Check, confirmLabel: t.common.approve, variant: 'success', remarksMandatory: false },
  REJECT: { title: t.common.reject, icon: X, confirmLabel: t.common.reject, variant: 'destructive', remarksMandatory: true },
  RETURN: { title: t.common.returnForCorrection, icon: CornerUpLeft, confirmLabel: t.common.returnForCorrection, variant: 'default', remarksMandatory: true },
  CANCEL: { title: t.common.cancel, icon: X, confirmLabel: t.common.confirm, variant: 'destructive', remarksMandatory: true },
  REVISE: { title: t.common.revise, icon: RefreshCw, confirmLabel: t.common.revise, variant: 'default', remarksMandatory: true },
  DELETE: { title: t.common.delete, icon: AlertTriangle, confirmLabel: t.common.delete, variant: 'destructive', remarksMandatory: false },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  intent,
  documentLabel,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent: ConfirmIntent;
  /** Document number or record name shown in the message. */
  documentLabel?: string;
  description?: string;
  onConfirm: (remarks: string) => void;
}) {
  const meta = INTENT_META[intent];
  const Icon = meta.icon;
  const [remarks, setRemarks] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setRemarks('');
      setTouched(false);
    }
  }, [open]);

  const remarksMissing = meta.remarksMandatory && remarks.trim().length === 0;

  const handleConfirm = () => {
    setTouched(true);
    if (remarksMissing) return;
    onConfirm(remarks.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full',
                meta.variant === 'destructive'
                  ? 'bg-danger/10 text-danger'
                  : meta.variant === 'success'
                    ? 'bg-success/10 text-success'
                    : 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            {meta.title}
          </DialogTitle>
          <DialogDescription>
            {description ?? (documentLabel ? `${meta.title}: ${documentLabel}` : undefined)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-remarks" className="text-xs uppercase tracking-wide text-muted-foreground">
            {t.approval.remarks}
            {meta.remarksMandatory && (
              <span className="ml-0.5 text-danger" aria-hidden="true">
                *
              </span>
            )}
          </Label>
          <Textarea
            id="confirm-remarks"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            aria-invalid={touched && remarksMissing}
            className={cn(touched && remarksMissing && 'border-danger')}
          />
          {touched && remarksMissing ? (
            <p role="alert" className="text-xs text-danger">
              {t.common.remarksRequired}
            </p>
          ) : (
            !meta.remarksMandatory && (
              <p className="text-xs text-muted-foreground">{t.common.optional}</p>
            )
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button variant={meta.variant} onClick={handleConfirm}>
            <Icon />
            {meta.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
