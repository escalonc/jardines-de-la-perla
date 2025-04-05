"use client";

import { createContext, useContext } from "react";

type RoleContextType = {
  role: Roles;
};

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Roles;
}) {
  return (
    <RoleContext.Provider value={{ role }}>{children}</RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
