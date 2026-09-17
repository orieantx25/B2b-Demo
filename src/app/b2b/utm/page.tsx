"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { CreateCouponModal } from "@/components/create-coupon-modal";
import { CreateUtmModal } from "@/components/create-utm-modal";

export default function B2BUtmPage() {
  const [couponOpen, setCouponOpen] = useState(false);
  const [utmOpen, setUtmOpen] = useState(false);

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="UTM & Coupons"
        subtitle="Create tracking links and partner coupons in-app. Records sync from the Admin Portal."
      />

      <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setUtmOpen(true)}
          className="card-surface flex min-h-[140px] flex-col items-start justify-between p-5 text-left transition hover:border-[#e31c24]"
        >
          <div>
            <div className="text-lg font-semibold text-[#111]">Create UTM</div>
            <p className="mt-1 text-sm text-[#6b6b6b]">
              Landing page, UTM params, short URL preview, map to a consultant.
            </p>
          </div>
          <span className="mt-4 text-sm font-semibold text-[#e31c24]">Open form →</span>
        </button>
        <button
          type="button"
          onClick={() => setCouponOpen(true)}
          className="card-surface flex min-h-[140px] flex-col items-start justify-between p-5 text-left transition hover:border-[#e31c24]"
        >
          <div>
            <div className="text-lg font-semibold text-[#111]">Create Coupon</div>
            <p className="mt-1 text-sm text-[#6b6b6b]">
              Code, discount, validity, and consultant mapping — Created by is auto-filled.
            </p>
          </div>
          <span className="mt-4 text-sm font-semibold text-[#e31c24]">Open form →</span>
        </button>
      </div>

      <CreateUtmModal open={utmOpen} onClose={() => setUtmOpen(false)} />
      <CreateCouponModal open={couponOpen} onClose={() => setCouponOpen(false)} />
    </div>
  );
}
