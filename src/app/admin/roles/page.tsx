"use client";

import React, { useState } from "react";
import { Role } from "@prisma/client";
import { Container } from "~/ui/containers";
import { RolesList, RoleForm } from "./components";

export default function RolesPage() {
  const [role, setRole] = useState<Role>();
  return (
    <Container className="flex flex-col-reverse items-stretch gap-10  py-10 2xl:flex-row ">
      <div className="sticky top-5 h-fit rounded-lg border border-accent/30 bg-secondary p-5 2xl:w-6/12">
        <RoleForm
          selectedRole={role}
          onClear={() => {
            setRole(undefined);
          }}
        />
      </div>
      <RolesList
        onChange={(role) => {
          setRole(role);
        }}
      />
    </Container>
  );
}
