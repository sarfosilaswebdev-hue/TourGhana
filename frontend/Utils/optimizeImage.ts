export const optimizeImage = (
  url: string,
  options?: {
    width?: number;
    quality?: number;
  }
) => {
  if (!url.includes("images.unsplash.com")) return url;

  const width = options?.width || 800;
  const quality = options?.quality || 80;

  return `${url}?w=${width}&q=${quality}&auto=format`;
};