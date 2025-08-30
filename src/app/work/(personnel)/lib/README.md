This folder contains the new, non-invasive v2 implementation for Personnel Performance state and worker.

- React Context store: `PersonnelContext.tsx`
- Web Worker (Comlink): `../workers/data.worker.ts`

Wire-up:
- Wrap relevant UI with `<PersonnelProvider>` and call `usePersonnel()` to set filters and apply.

