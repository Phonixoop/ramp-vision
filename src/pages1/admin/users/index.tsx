import React, { useState } from "react";
import AdminMainLayout from "~/pages/admin/layout";

import { Container, ContainerBottomBorder } from "~/ui/containers";

// import { UserForm } from "~/pages/admin/users/form";
// import UsersList from "~/pages/admin/users/users-list";
// import { User } from "~/types";
import { UserProvider, useUser } from "~/context/user.context";
import { PERMISSIONS } from "~/constants";
import { UserForm } from "~/pages/admin/users/form";
import UsersList from "~/pages/admin/users/users-list";

export default function UsersPage() {
  return (
    <AdminMainLayout>
      <Container className="flex flex-col-reverse items-stretch gap-10 py-10  2xl:flex-row ">
        <UserProvider>
          <div className="sticky top-5 h-fit rounded-lg p-5 2xl:w-4/12">
            <UserForm />
          </div>
          <div className=" h-fit max-h-[42rem] w-full overflow-hidden overflow-y-auto rounded-lg  border border-accent/30 bg-secondary  2xl:w-7/12 2xl:p-5">
            <UsersList />
          </div>
        </UserProvider>
      </Container>
    </AdminMainLayout>
  );
}
