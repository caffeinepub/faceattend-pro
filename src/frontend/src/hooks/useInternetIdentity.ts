import type { Identity } from "@icp-sdk/core/agent";
// Internet Identity is NOT used in this app.
// This is a stub to satisfy any lingering imports.
import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useMemo,
} from "react";

export type Status =
  | "initializing"
  | "idle"
  | "logging-in"
  | "success"
  | "loginError";

export type InternetIdentityContext = {
  identity?: Identity;
  login: () => void;
  clear: () => void;
  loginStatus: Status;
  isInitializing: boolean;
  isLoginIdle: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
  loginError?: Error;
};

const defaultCtx: InternetIdentityContext = {
  identity: undefined,
  login: () => {},
  clear: () => {},
  loginStatus: "idle",
  isInitializing: false,
  isLoginIdle: true,
  isLoggingIn: false,
  isLoginSuccess: false,
  isLoginError: false,
  loginError: undefined,
};

const InternetIdentityReactContext =
  createContext<InternetIdentityContext>(defaultCtx);

export const useInternetIdentity = (): InternetIdentityContext => {
  return useContext(InternetIdentityReactContext);
};

export function InternetIdentityProvider({
  children,
}: PropsWithChildren<{ children: ReactNode; createOptions?: unknown }>) {
  const value = useMemo(() => defaultCtx, []);
  return createElement(InternetIdentityReactContext.Provider, {
    value,
    children,
  });
}
