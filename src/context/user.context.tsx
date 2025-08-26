import { User } from "@prisma/client";
import { ReactNode, createContext, useContext, useMemo, useState } from "react";

import { api } from "~/trpc/react";

type TUserContext = {
  user: User;
  setUser: (user: User) => void;

  selectedRowUser: User | undefined;
  setSelectedRowUser: (user: User) => unknown;
};

type UserProviderProps = {
  children: ReactNode;
};
const UserContext = createContext({} as TUserContext);

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User>();

  const [selectedRowUser, setSelectedRowUser] = useState<User | undefined>(
    undefined,
  );

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        selectedRowUser,
        setSelectedRowUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
