import { useContext } from "react";
import { AccountAccessContext } from "../context/account-access-context";

export const useAccountAccess = () => useContext(AccountAccessContext);
