/** Largest file the admin accepts per kind (checked in the browser before sending, and by the server) */
export const UPLOAD_LIMITS = { image: 25 * 1024 * 1024, video: 60 * 1024 * 1024, pdf: 10 * 1024 * 1024 } as const;

export const tooLargeMessage = (kind: keyof typeof UPLOAD_LIMITS) => `Fichier trop lourd : ${Math.round(UPLOAD_LIMITS[kind] / 1024 / 1024)} Mo au maximum.`;
