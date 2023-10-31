import React from "react";
import { useFormik } from "formik";
import {
  CheckCheckIcon,
  CheckIcon,
  KeySquareIcon,
  Loader2Icon,
  ShieldAlertIcon,
  UserCog2,
  UserIcon,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

import { useState } from "react";
import { toFormikValidationSchema } from "zod-formik-adapter";

import MultiStep from "~/features/multi-step";

import { createUserSchema } from "~/server/validations/user.validation";
import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import { Container } from "~/ui/containers";
import InputError from "~/ui/forms/input-error";
import PasswordField from "~/ui/forms/password-field";
import TextField from "~/ui/forms/text-field";
import withLabel from "~/ui/forms/with-label";
import { delay } from "~/utils/util";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { useRouter } from "next/router";
import Header from "~/features/header";

export default function LoginPage() {
  return (
    <>
      <BlurBackground />

      <div className=" flex min-h-screen w-full flex-col items-center justify-center bg-secondary transition-colors duration-1000 ">
        <div className="absolute top-0 flex w-full items-start justify-center">
          <Header />
        </div>
        <div className="flex w-full items-center justify-center">
          <div className="flex w-11/12 md:w-3/5">
            <CreateAccountForm />
          </div>
        </div>
      </div>
    </>
  );
}

const TextFieldWithLable = withLabel(TextField);

const icons = [
  <UserIcon key={1} className="stroke-inherit" />,
  <KeySquareIcon key={2} className="stroke-inherit" />,
  <Loader2Icon key={4} className="stroke-inherit" />,
  <ShieldAlertIcon key={4} className="stroke-red-500" />,
  <CheckCheckIcon key={4} className="stroke-inherit" />,
];
function CreateAccountForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },

    validationSchema: toFormikValidationSchema(createUserSchema),
    validateOnBlur: true,
    onSubmit: async (values: typeof createUserSchema._type) => {},
  });

  const [step, setStep] = useState(0);
  function Enter(e) {
    if (e.keyCode == 13) {
      goTo(step + 1);
    }
  }
  async function goTo(stepNumber: number) {
    if (formik.isValid && stepNumber >= 2) {
      setStep(2);
      setIsLoading(true);
      await delay(1000);

      await signIn("credentials", {
        username: formik.values.username,
        password: formik.values.password,
        callbackUrl: `${window.location.origin}/`,
        redirect: false,
      })
        .then(async (result) => {
          if (result.ok) {
            setStep(4);
            await delay(1000);
            router.reload();
          } else setStep(3);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else if (stepNumber < 2) setStep(stepNumber);
  }
  return (
    <form
      className="h-[452px] w-full rounded-3xl bg-secbuttn px-5 py-10"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <h2 className="w-full py-5 text-center text-accent">ورود</h2>
      <MultiStep
        loadingStep={2}
        isLoading={isLoading}
        onStepClick={(stepNumber) => {
          goTo(stepNumber);
        }}
        onPrevious={() => {
          goTo(step - 1);
        }}
        onNext={() => {
          goTo(step + 1);
        }}
        currentStep={step}
        icons={icons}
        steps={[
          <>
            <div
              key={0}
              className="relative flex w-full flex-col items-center justify-center gap-5 "
            >
              <TextFieldWithLable
                label={"نام کاربری"}
                name="username"
                id="username"
                {...formik.getFieldProps("username")}
                onKeyDown={(e) => Enter(e)}
              />

              <InputError message={formik.errors.username} />

              <Button
                className="rounded-full border border-primary px-5"
                onClick={() => {
                  goTo(step + 1);
                }}
              >
                بعدی
              </Button>
            </div>
          </>,
          <>
            <div
              key={1}
              className="relative flex w-full flex-col items-center justify-center gap-5 "
            >
              <PasswordField
                label={"رمز عبور"}
                name="password"
                id="password"
                type="password"
                {...formik.getFieldProps("password")}
                onKeyDown={(e) => Enter(e)}
              />

              <InputError message={formik.errors.password} />
              <Button
                className="rounded-full border border-primary px-5"
                onClick={() => {
                  goTo(step + 1);
                }}
              >
                بعدی
              </Button>
            </div>
          </>,
          <span key={2} className="pb-10">
            در حال برسی
          </span>,
          <div
            key={3}
            className="flex flex-col items-center justify-center gap-4"
          >
            <span className="text-red-500">
              رمز عبور یا نام کاربری اشتباه است
            </span>
            <Button
              className="rounded-full border border-primary px-5"
              onClick={() => {
                setStep(0);
              }}
            >
              بازگشت
            </Button>
          </div>,
          <>خوش آمدید</>,
        ]}
      />
    </form>
  );
}
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: `/`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
