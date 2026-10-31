import { z } from 'zod';

/** Credit pack tokens: 32 random letters/digits, carried only in the magic-link URL. */
export const TOKEN_RE = /^[A-Za-z0-9]{32}$/;
export const tokenSchema = z.string().regex(TOKEN_RE, 'Invalid link');

export const PLATFORMS = { ebay: 'eBay', vinted: 'Vinted' } as const;
export type Platform = keyof typeof PLATFORMS;

export const LISTING_LIMITS = {
  notes: 500,
  maxImages: 3,
  /** Reject files bigger than this before resizing (client-side). */
  maxUploadBytes: 5 * 1024 * 1024,
  /** Longest edge after client-side resizing. */
  maxEdgePx: 1024,
  /** Base64 length cap per resized image (~1MB of JPEG). */
  maxBase64Chars: 1_400_000,
  ebayTitle: 80,
  vintedTitle: 60,
} as const;

export const imageSchema = z.object({
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  data: z
    .string()
    .max(LISTING_LIMITS.maxBase64Chars, 'Image too large')
    .regex(/^[A-Za-z0-9+/]+=*$/, 'Invalid image data'),
});
export type ListingImage = z.infer<typeof imageSchema>;

/** What the browser sends to /api/listing-generate. */
export const listingRequestSchema = z.object({
  platform: z.enum(['ebay', 'vinted'], { message: 'Choose eBay or Vinted' }),
  notes: z
    .string()
    .trim()
    .max(LISTING_LIMITS.notes, 'Keep notes to 500 characters')
    .optional()
    .default(''),
  images: z
    .array(imageSchema)
    .min(1, 'Add at least one photo')
    .max(LISTING_LIMITS.maxImages, 'Add up to 3 photos'),
});
export type ListingRequest = z.infer<typeof listingRequestSchema>;

/** Stored in jobs.inputs for one listing generation ("usage" job). */
export const listingJobInputsSchema = listingRequestSchema.extend({
  kind: z.literal('listing'),
  token: tokenSchema,
});
export type ListingJobInputs = z.infer<typeof listingJobInputsSchema>;

/** Stored in jobs.inputs for a pack purchase. topUpToken = "buy 10 more" for an existing link. */
export const listingPurchaseSchema = z.object({
  kind: z.literal('pack').default('pack'),
  topUpToken: tokenSchema.optional(),
});
