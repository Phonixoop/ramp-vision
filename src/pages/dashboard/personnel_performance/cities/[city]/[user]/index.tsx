import { createServerSideHelpers } from "@trpc/react-query/server";
import moment from "jalali-moment";
import { useRouter } from "next/router";

import SuperJSON from "superjson";

import { appRouter } from "~/server/api/root";

export default function UserPage() {
  const router = useRouter();

  //   return (
  //     <CityPage>
  //       <ul>
  //         <li>{user.name}</li>
  //         <li>{user.performance}</li>
  //         <li>{user.sabt}</li>
  //       </ul>
  //     </CityPage>
  //   );
}

export async function getStaticProps(ctx) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx,
    transformer: SuperJSON,
  });

  const city = ctx.params?.city;

  if (typeof city !== "string") throw new Error("no slug");

  await helpers.personnelPerformance.getAll.prefetch({
    filter: {
      CityName: [city.toString()],
      Start_Date: [
        moment().locale("fa").subtract(1, "days").format("YYYY/MM/DD"),
      ],
    },
    periodType: "روزانه",
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      city,
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
