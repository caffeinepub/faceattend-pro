import type { Identity } from "@icp-sdk/core/agent";
// Internet Identity removed — app uses anonymous actor only.
import { createContext, useContext } from "react";

export type Status = "idle";

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

const defaultContext: InternetIdentityContext = {
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
  createContext<InternetIdentityContext>(defaultContext);

export const useInternetIdentity = (): InternetIdentityContext => {
  return useContext(InternetIdentityReactContext);
};

export function InternetIdentityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InternetIdentityReactContext.Provider value={defaultContext}>
      {children}
    </InternetIdentityReactContext.Provider>
  );
}
