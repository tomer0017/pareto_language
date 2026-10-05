/** Which mission videos exist — computed at build time by `apps/web/videoManifest.ts`
 *  (the shape is `VideoManifest` in features/videos/videoConvention.ts). */
declare module 'virtual:ready-video-manifest' {
  const manifest: Record<'en' | 'es' | 'fr', number[]>;
  export default manifest;
}
