import { AppData } from "@/app-data";
import { testAppData } from "@/app-data/testAppData";
import {
  useWnaAppData,
  useWnaAppLifecycle,
  WnaAppContextProvider,
} from "@components/WnaAppContext";
import React, { PropsWithChildren, useEffect } from "react";
import TestRenderer, { act } from "react-test-renderer";

type RenderWithAppContextOptions = {
  appData?: AppData;
  isAppInitialized?: boolean;
};

function AppContextSeed({
  appData,
  children,
  isAppInitialized = true,
}: PropsWithChildren<RenderWithAppContextOptions>) {
  const { setAppData } = useWnaAppData();
  const { setIsAppInitialized } = useWnaAppLifecycle();

  useEffect(() => {
    setAppData(appData ?? testAppData);
    setIsAppInitialized(isAppInitialized);
  }, [appData, isAppInitialized, setAppData, setIsAppInitialized]);

  return <>{children}</>;
}

export async function renderWithAppContext(
  element: React.ReactElement,
  options: RenderWithAppContextOptions = {},
) {
  let tree: ReturnType<typeof TestRenderer.create> | undefined;

  await act(async () => {
    tree = TestRenderer.create(
      <WnaAppContextProvider>
        <AppContextSeed {...options}>{element}</AppContextSeed>
      </WnaAppContextProvider>,
    );
  });

  return tree!;
}
