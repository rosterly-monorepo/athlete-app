import Image from "next/image";

type BrandAsset = "logo" | "icon";

interface BrandImageProps {
  asset?: BrandAsset;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Renders a brand image that automatically swaps between light and dark variants
 * based on the current theme.
 *
 * File naming convention: `logo-light.png` / `icon-light.png` = dark colored (for light backgrounds),
 * `logo-dark.png` / `icon-dark.png` = light colored (for dark backgrounds).
 */
export function BrandImage({
  asset = "logo",
  className,
  width = 400,
  height = 100,
  priority = false,
}: BrandImageProps) {
  return (
    <>
      <Image
        src={`/branding/${asset}-light.png`}
        alt="Rosterly"
        width={width}
        height={height}
        className={`${className ?? ""} dark:hidden`}
        priority={priority}
      />
      <Image
        src={`/branding/${asset}-dark.png`}
        alt="Rosterly"
        width={width}
        height={height}
        className={`hidden ${className ?? ""} dark:block`}
        priority={priority}
      />
    </>
  );
}
