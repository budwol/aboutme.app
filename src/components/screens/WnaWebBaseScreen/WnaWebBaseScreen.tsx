import { useIsFocused } from "@react-navigation/native";
import { Stack } from "expo-router";
import { FC, ReactNode, useEffect } from "react";

export type WnaWebBaseScreenProps = {
  children?: ReactNode;
  title?: string;
};

const WnaWebBaseScreen: FC<WnaWebBaseScreenProps> = ({ children, title }) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!title || !isFocused) return;

    document.title = title;
  }, [isFocused, title]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title }} />
      {children}
    </>
  );
};

export default WnaWebBaseScreen;
