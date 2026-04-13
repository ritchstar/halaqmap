import { getSupabaseClient } from '@/integrations/supabase/client';
import {
  FULL_ADMIN_PERMISSIONS,
  normalizeAdminPermissions,
  type AdminPermissions,
} from '@/lib/adminPermissions';
import { getAdminAllowedEmail } from '@/config/adminAuth';

export type AdminRoleRow = {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  permissions: AdminPermissions;
  updated_at: string | null;
};

export type AdminAccess = {
  allowed: boolean;
  bootstrap: boolean;
  email: string;
  displayName: string;
  permissions: AdminPermissions;
};

const EXTRA_BOOTSTRAP_EMAILS = ['admin@halaqmap.com'];

function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
}

function isBootstrapEmail(email: string): boolean {
  const e = normalizeEmail(email);
  const all = new Set([normalizeEmail(getAdminAllowedEmail()), ...EXTRA_BOOTSTRAP_EMAILS.map(normalizeEmail)]);
  return all.has(e);
}

export async function resolveAdminAccess(email: string): Promise<AdminAccess> {
  const normalized = normalizeEmail(email);
  if (isBootstrapEmail(normalized)) {
    return {
      allowed: true,
      bootstrap: true,
      email: normalized,
      displayName: 'Admin Root',
      permissions: FULL_ADMIN_PERMISSIONS,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      allowed: false,
      bootstrap: false,
      email: normalized,
      displayName: normalized,
      permissions: normalizeAdminPermissions({}),
    };
  }

  const { data, error } = await client
    .from('platform_admin_roles')
    .select('email, display_name, is_active, permissions')
    .eq('email', normalized)
    .maybeSingle();

  if (error || !data || data.is_active !== true) {
    return {
      allowed: false,
      bootstrap: false,
      email: normalized,
      displayName: normalized,
      permissions: normalizeAdminPermissions({}),
    };
  }

  return {
    allowed: true,
    bootstrap: false,
    email: normalized,
    displayName: data.display_name?.trim() || normalized,
    permissions: normalizeAdminPermissions(data.permissions),
  };
}

export async function listAdminRoles(): Promise<AdminRoleRow[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('platform_admin_roles')
    .select('id, email, display_name, is_active, permissions, updated_at')
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    email: String(r.email),
    display_name: r.display_name != null ? String(r.display_name) : null,
    is_active: Boolean(r.is_active),
    permissions: normalizeAdminPermissions(r.permissions),
    updated_at: r.updated_at != null ? String(r.updated_at) : null,
  }));
}

export async function upsertAdminRole(input: {
  email: string;
  displayName?: string;
  isActive?: boolean;
  permissions: AdminPermissions;
  createdByEmail?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };
  const normalized = normalizeEmail(input.email);
  const payload = {
    email: normalized,
    display_name: input.displayName?.trim() || null,
    is_active: input.isActive ?? true,
    permissions: input.permissions,
    created_by_email: input.createdByEmail ?? null,
  };
  const { error } = await client.from('platform_admin_roles').upsert(payload, { onConflict: 'email' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteAdminRoleByEmail(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };
  const { error } = await client.from('platform_admin_roles').delete().eq('email', normalizeEmail(email));
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
