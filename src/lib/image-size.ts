export const IMAGE_SIZES = [512, 768, 1024] as const;
export const DEFAULT_IMAGE_SIZE = IMAGE_SIZES[0];

export function isImageSize(value: number): boolean {
    return IMAGE_SIZES.some((size) => size === value);
}
