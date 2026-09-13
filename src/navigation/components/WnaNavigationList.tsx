import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { AppLayout } from "@constants/layoutConstants";
import AppStyle from "@/theme/appStyle";
import React, {
  CSSProperties,
  Fragment,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

export interface WnaMenuItem {
  route?: string;
  text: string;
  iconName?: keyof typeof iconMap;
  type: "nav" | "secondary";
}

export type WnaNavigationListProps = {
  appStyle: AppStyle;
  appLayout: AppLayout;
  items: WnaMenuItem[];
  renderItem: (item: WnaMenuItem) => ReactNode;
  overrideGap?: number;
  overridePaddingTop?: number;
  style?: CSSProperties;
};

export default function WnaNavigationList(props: WnaNavigationListProps) {
  const {
    appLayout,
    appStyle,
    items,
    overrideGap,
    overridePaddingTop,
    renderItem,
    style,
  } = props;

  const listStyle: CSSProperties = useMemo(
    () => ({
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      paddingTop: overridePaddingTop ?? appLayout.contentListPaddingTop,
      paddingBottom: appLayout.contentPaddingBottom,
      ...style,
    }),
    [
      appLayout.contentListPaddingTop,
      appLayout.contentPaddingBottom,
      overridePaddingTop,
      style,
    ],
  );

  const separatorHeight = overrideGap ?? appLayout.globalListGap;

  const renderMenuItem = useCallback(
    ({ item }: { item: WnaMenuItem }) =>
      React.createElement(
        "div",
        { style: appStyle.containerCenterMaxWidth as CSSProperties },
        renderItem(item),
      ),
    [appStyle.containerCenterMaxWidth, renderItem],
  );

  const renderSeparator = useCallback(
    () =>
      React.createElement("div", {
        style: { ...styles.separator, height: separatorHeight },
      }),
    [separatorHeight],
  );

  return React.createElement(
    "div",
    { style: listStyle },
    items.map((item, index) => (
      <Fragment key={item.route ?? `${item.text}-${index}`}>
        {renderMenuItem({ item })}
        {index < items.length - 1 ? renderSeparator() : null}
      </Fragment>
    )),
  );
}

const styles: Record<string, CSSProperties> = {
  separator: {
    width: "100%",
  },
};
