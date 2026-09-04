import { createContext } from "react";
import type { InternalRole } from "../lib/accessPolicy";

export type AccountAccess = {
  business: boolean;
  homeowner: boolean;
  contractor: boolean;
  partner: boolean;
  role: InternalRole | null;
  userId: string | null;
  loading: boolean;
  error: boolean;
};

export const emptyAccountAccess: AccountAccess = {
  business: false,
  homeowner: false,
  contractor: false,
  partner: false,
  role: null,
  userId: null,
  loading: true,
  error: false,
};

export const AccountAccessContext = createContext<AccountAccess>(emptyAccountAccess);
