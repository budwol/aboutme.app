import {
  WnaImageElementProps,
  WnaImageElementState,
} from "@components/images/WnaImageElement/WnaImageElementTypes";

export function shouldRender(
  state: WnaImageElementState,
  props: Readonly<WnaImageElementProps>,
  nextProps: Readonly<WnaImageElementProps>,
): boolean {
  return (
    nextProps.imageUrl !== props.imageUrl ||
    nextProps.style !== props.style ||
    state.cachedImageBase64Url === "" ||
    state.loadedImageUrl !== props.imageUrl ||
    nextProps.grayScale !== props.grayScale ||
    nextProps.contentFit !== props.contentFit
  );
}
