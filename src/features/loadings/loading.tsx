export function Loading({ children, isLoading, LoadingComponent }) {
  if (isLoading) return <LoadingComponent />;
  return <>{children}</>;
}
