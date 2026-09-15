import { FC, ReactNode, useEffect } from "react";

export type WnaWebBaseScreenProps = {
  children?: ReactNode;
  title?: string;
};

const WnaWebBaseScreen: FC<WnaWebBaseScreenProps> = ({ children, title }) => {
  useEffect(() => {
    if (!title) return;

    document.title = title;
  }, [title]);

  return <>{children}</>;
};

export default WnaWebBaseScreen;
