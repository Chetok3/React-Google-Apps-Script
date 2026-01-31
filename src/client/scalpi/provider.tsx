import { HeroUIProvider, ToastProvider } from '@heroui/react';

// eslint-disable-next-line import/prefer-default-export
export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider /*navigate={navigate} useHref={useHref}*/>
      <ToastProvider />
      {children}
    </HeroUIProvider>
  );
}
