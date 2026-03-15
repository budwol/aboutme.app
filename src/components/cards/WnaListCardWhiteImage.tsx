import WnaHeroImage from "@components/images/WnaHeroImage";
import WnaText from "@components/text/WnaText";
import { appLayoutConstants } from "@constants/layoutConstants";
import AppStyle from "@services/wnaStyleService";
import Colors from "@constants/theme/colors";
import { FontFamilies } from "@constants/theme/fontFamilies";
import { FC, memo, ReactNode } from "react";
import { View } from "react-native";
import WnaBadge from "../misc/WnaBadge";

export type WnaListCardWhiteImageProps = {
  appColors: Colors;
  appStyle: AppStyle;

  imageUrl: string;
  imageTitle: string;

  location?: string;
  dateLabel?: string;
  distanceKm?: string;
  weather?: string;
  hasImages?: boolean;
  hasRoute?: boolean;

  children?: ReactNode;
  imageGrayScale?: boolean;

  showChildren?: boolean;
  blur?: boolean;
};

const WnaListCardWhiteImageComponent: FC<WnaListCardWhiteImageProps> = ({
  appColors,
  appStyle,
  imageUrl,
  imageTitle,
  location,
  dateLabel,
  distanceKm,
  weather,
  children,
  imageGrayScale,
  hasImages,
  hasRoute,
  showChildren,
}) => (
  <View
    style={{
      backgroundColor: appColors.white,
      borderRadius: appLayoutConstants.globalCornerRadius,
      overflow: "hidden",
    }}
  >
    <View
      style={{
        height: appLayoutConstants.globalHeroImageHeight,
      }}
    >
      <WnaHeroImage
        appColors={appColors}
        imageUrl={imageUrl}
        imageTitle={imageTitle}
        showGradient={true}
        grayScale={imageGrayScale}
        borderRadius={0}
      />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          padding: 16,
        }}
      >
        {location ? (
          <View
            style={{
              backgroundColor: appColors.staticCoolgray3,
            }}
          >
            <WnaText
              appColors={appColors}
              appStyle={appStyle}
              fontFamily={FontFamilies.UI}
              fontColor={appColors.staticWhite}
              style={{
                opacity: 0.85,
              }}
              text={location}
            />
          </View>
        ) : null}

        <View style={{ zIndex: 9999999 }}>
          <WnaText
            appColors={appColors}
            appStyle={appStyle}
            fontFamily={FontFamilies.UI}
            fontColor={appColors.staticWhite}
            style={{
              fontSize: 22,
              fontWeight: "600",
            }}
            text={imageTitle || "Tagebucheintrag"}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginTop: 6,
          }}
        >
          {dateLabel ? (
            <WnaBadge
              text={dateLabel}
              icon={"calendar"}
              appColors={appColors}
              appStyle={appStyle}
            />
          ) : null}

          {distanceKm ? (
            <WnaBadge
              text={distanceKm}
              icon={"walk"}
              appColors={appColors}
              appStyle={appStyle}
            />
          ) : null}

          {weather ? (
            <WnaBadge
              text={weather}
              appColors={appColors}
              appStyle={appStyle}
            />
          ) : null}

          {hasImages === true ? (
            <WnaBadge
              appColors={appColors}
              appStyle={appStyle}
              icon={"folder-multiple-image"}
            />
          ) : null}

          {hasRoute === true ? (
            <WnaBadge
              appColors={appColors}
              appStyle={appStyle}
              icon={"map-outline"}
            />
          ) : null}
        </View>
      </View>
    </View>

    {children && showChildren !== false ? (
      <View style={{ padding: 16 }}>{children}</View>
    ) : null}
  </View>
);

const WnaListCardWhiteImage = memo(WnaListCardWhiteImageComponent);

WnaListCardWhiteImage.displayName = "WnaListCardWhiteImage";

export default WnaListCardWhiteImage;
