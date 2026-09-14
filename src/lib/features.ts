/** Billing screens stay hidden unless explicitly enabled at build time. */
export const BILLING_ENABLED =
    process.env.NEXT_PUBLIC_BILLING_ENABLED?.trim().toLowerCase() === 'true';
