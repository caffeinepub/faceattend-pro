// Stub — Internet Identity is not used in this app.
// All backend calls use an anonymous actor.
export type Status = "idle";

export type InternetIdentityContext = {
  identity: undefined;
  login: () => void;
  clear: () => void;
  loginStatus: Status;
  isInitializing: boolean;
  isLoginIdle: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
  loginError: undefined;
};

const noop = () => {};

const stubContext: InternetIdentityContext = {
  identity: undefined,
  login: noop,
  clear: noop,
  loginStatus: "idle",
  isInitializing: false,
  isLoginIdle: true,
  isLoggingIn: false,
  isLoginSuccess: false,
  isLoginError: false,
  loginError: undefined,
};

export function useInternetIdentity(): InternetIdentityContext {
  return stubContext;
}

import { type ReactNode, createElement } from "react";

export function InternetIdentityProvider({
  children,
}: {
  children: ReactNode;
}) {
  return createElement("div", { style: { display: "contents" } }, children);
}
