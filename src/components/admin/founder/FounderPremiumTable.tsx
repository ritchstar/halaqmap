import type { ComponentProps, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { cn } from '@/lib/utils';

type ShellProps = {
  children: ReactNode;
  className?: string;
};

/** Premium table container — obsidian glass + horizontal scroll. */
export function FounderPremiumTableShell({ children, className }: ShellProps) {
  return <div className={cn(founderTheme.tableWrap, className)}>{children}</div>;
}

export function FounderPremiumTable({ className, ...props }: ComponentProps<typeof Table>) {
  return <Table className={cn(className)} {...props} />;
}

export function FounderPremiumTableHeader(props: ComponentProps<typeof TableHeader>) {
  return <TableHeader {...props} />;
}

export function FounderPremiumTableBody(props: ComponentProps<typeof TableBody>) {
  return <TableBody {...props} />;
}

export function FounderPremiumTableRow({ className, ...props }: ComponentProps<typeof TableRow>) {
  return <TableRow className={cn(founderTheme.tableRow, className)} {...props} />;
}

export function FounderPremiumTableHead({ className, ...props }: ComponentProps<typeof TableHead>) {
  return <TableHead className={cn(founderTheme.tableHead, 'px-5 py-4', className)} {...props} />;
}

export function FounderPremiumTableCell({
  className,
  muted,
  ...props
}: ComponentProps<typeof TableCell> & { muted?: boolean }) {
  return (
    <TableCell
      className={cn(muted ? founderTheme.tableCellMuted : founderTheme.tableCell, className)}
      {...props}
    />
  );
}
