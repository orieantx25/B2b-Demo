"use client";

import { useEffect, useState } from "react";
import { Button, Input, Label, PageHeader } from "@/components/ui";
import { useSaveSettings, useSettings } from "@/lib/api/hooks";
import { useAppStore } from "@/store/app-store";

export default function AdminSettingsPage() {
  const { data, isLoading } = useSettings();
  const save = useSaveSettings();
  const addToast = useAppStore((s) => s.addToast);
  const [form, setForm] = useState({
    org_name: "",
    legacy_portal_utm_url: "",
    legacy_portal_coupon_url: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        org_name: data.org_name || "",
        legacy_portal_utm_url: data.legacy_portal_utm_url || "",
        legacy_portal_coupon_url: data.legacy_portal_coupon_url || "",
      });
    }
  }, [data]);

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Settings"
        subtitle="Org defaults and legacy Admin Portal integration URLs for UTM / Coupon create."
      />
      {isLoading ? (
        <p className="text-sm text-[#6b6b6b]">Loading…</p>
      ) : (
        <div className="card-surface max-w-xl space-y-4 p-4">
          <div>
            <Label htmlFor="org">Organization name</Label>
            <Input
              id="org"
              value={form.org_name}
              onChange={(e) => setForm({ ...form, org_name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="utm-url">Legacy UTM create URL</Label>
            <Input
              id="utm-url"
              value={form.legacy_portal_utm_url}
              onChange={(e) => setForm({ ...form, legacy_portal_utm_url: e.target.value })}
              placeholder="https://admin.example.com/utm/create"
            />
          </div>
          <div>
            <Label htmlFor="coupon-url">Legacy Coupon create URL</Label>
            <Input
              id="coupon-url"
              value={form.legacy_portal_coupon_url}
              onChange={(e) => setForm({ ...form, legacy_portal_coupon_url: e.target.value })}
              placeholder="https://admin.example.com/coupon/create"
            />
          </div>
          <Button
            disabled={save.isPending}
            onClick={() =>
              void save
                .mutateAsync(form)
                .then(() => addToast({ title: "Settings saved", variant: "success" }))
                .catch((e) =>
                  addToast({ title: e instanceof Error ? e.message : "Save failed", variant: "error" })
                )
            }
          >
            Save settings
          </Button>
        </div>
      )}
    </div>
  );
}
