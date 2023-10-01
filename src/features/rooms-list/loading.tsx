export function RoomsListSkeleton() {
  return (
    <div className="grid w-full gap-5 md:grid-cols-3 ">
      {[...Array(32).keys()].map((i) => {
        return (
          <>
            <div
              key={i}
              className="flex h-52 animate-pulse  flex-col   rounded-xl bg-primary/20 opacity-30"
              style={{
                animationDelay: `${i * 5}`,
                animationDuration: "1s",
              }}
            >
              <div className="flex w-full">
                <div className="mx-auto w-full max-w-sm rounded-md  p-4">
                  <div className="flex animate-pulse gap-5">
                    <div className="h-10 w-10 rounded-full bg-secondary"></div>
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-2 rounded bg-secondary"></div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1 h-2 rounded bg-secondary"></div>
                          <div className="col-span-2 h-2 rounded bg-secondary"></div>
                        </div>
                        <div className="h-2 rounded bg-secondary"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mx-auto w-full max-w-sm rounded-md  p-4">
                  <div className="flex animate-pulse gap-5">
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-2 rounded "></div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1 h-2 rounded bg-secondary"></div>
                          <div className="col-span-2 h-2 rounded bg-secondary"></div>
                        </div>
                        <div className="h-2 rounded bg-secondary"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full">
                <div className="mx-auto w-full max-w-sm rounded-md  p-4">
                  <div className="flex animate-pulse gap-5">
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-2 rounded bg-secondary"></div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2 h-2 rounded bg-secondary"></div>
                          <div className="col-span-1 h-2 rounded bg-secondary"></div>
                        </div>
                        <div className="h-2 rounded bg-secondary"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mx-auto w-full max-w-sm rounded-md  p-4">
                  <div className="flex animate-pulse gap-5">
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-2 rounded bg-secondary"></div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2 h-2 rounded bg-secondary"></div>
                          <div className="col-span-1 h-2 rounded bg-secondary"></div>
                        </div>
                        <div className="h-2 rounded bg-secondary"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })}
    </div>
  );
}
