import { z } from "zod";

// ─── Reusable sub-schemas ─────────────────────────────────────────────────────

const colorSchema = z.object({
  name: z.string().min(1, "Color name is required").max(100),
  hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Hex must be a valid color e.g. #A3B4C5"),
  sortOrder: z.number().int().min(0).default(0),
});

const sizeSchema = z.object({
  size: z.string().min(1, "Size is required").max(50),
  sortOrder: z.number().int().min(0).default(0),
});

const imageSchema = z.object({
  url: z.string().url("Image must be a valid URL"),
  alt: z.string().max(255).default(""),
  sortOrder: z.number().int().min(0).default(0),
});

const detailSchema = z.object({
  value: z.string().min(1, "Detail value is required").max(500),
  sortOrder: z.number().int().min(0).default(0),
});

const careSchema = z.object({
  value: z.string().min(1, "Care instruction is required").max(255),
  sortOrder: z.number().int().min(0).default(0),
});

const variantSchema = z.object({
  size: z.string().min(1, "Variant size is required"),
  colorName: z.string().min(1, "Variant color name is required"),
  sku: z.string().max(100).optional().nullable(),
  priceCents: z.number().int().positive("Variant price must be a positive integer"),
  discountedPriceCents: z.number().int().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// ─── Create Product ───────────────────────────────────────────────────────────

export const createProductSchema = z
  .object({
    // Core fields
    name:                 z.string().min(1, "Name is required").max(255),
    description:          z.string().min(1, "Description is required"),
    fabric:               z.string().min(1, "Fabric is required").max(255),
    inStock:              z.boolean().default(true),
    priceCents:           z.number().int().positive("Price must be a positive integer"),
    discountedPriceCents: z.number().int().positive().optional().nullable(),
    primaryImageUrl:      z.string().url("Primary image must be a valid URL"),
    categoryId:           z.string().uuid("Category ID must be a valid UUID").optional().nullable(),
    stock:                z.number().int().min(0).optional().nullable(),

    // Relations
    colors:   z.array(colorSchema).default([]),
    sizes:    z.array(sizeSchema).default([]),
    images:   z.array(imageSchema).default([]),
    details:  z.array(detailSchema).default([]),
    care:     z.array(careSchema).default([]),
    variants: z.array(variantSchema).default([]),
  })
  .refine(
    (data) => {
      // If discounted price exists it must be less than full price
      if (data.discountedPriceCents != null) {
        return data.discountedPriceCents < data.priceCents;
      }
      return true;
    },
    {
      message: "Discounted price must be less than the full price",
      path: ["discountedPriceCents"],
    }
  )
  .refine(
    (data) => {
      // Variant color names must reference a declared color
      if (data.variants.length && data.colors.length) {
        const declaredColors = new Set(data.colors.map((c) => c.name));
        return data.variants.every((v) => declaredColors.has(v.colorName));
      }
      return true;
    },
    {
      message: "All variant colorNames must match a declared product color",
      path: ["variants"],
    }
  )
  .refine(
    (data) => {
      // Variant sizes must reference a declared size
      if (data.variants.length && data.sizes.length) {
        const declaredSizes = new Set(data.sizes.map((s) => s.size));
        return data.variants.every((v) => declaredSizes.has(v.size));
      }
      return true;
    },
    {
      message: "All variant sizes must match a declared product size",
      path: ["variants"],
    }
  )
  .refine(
    (data) => {
      // No duplicate color names
      const names = data.colors.map((c) => c.name);
      return names.length === new Set(names).size;
    },
    { message: "Color names must be unique", path: ["colors"] }
  )
  .refine(
    (data) => {
      // No duplicate color hex values
      const hexes = data.colors.map((c) => c.hex);
      return hexes.length === new Set(hexes).size;
    },
    { message: "Color hex values must be unique", path: ["colors"] }
  )
  .refine(
    (data) => {
      // No duplicate sizes
      const sizes = data.sizes.map((s) => s.size);
      return sizes.length === new Set(sizes).size;
    },
    { message: "Size values must be unique", path: ["sizes"] }
  )
  .refine(
    (data) => {
      // No duplicate variant combinations
      const keys = data.variants.map((v) => `${v.size}::${v.colorName}`);
      return keys.length === new Set(keys).size;
    },
    { message: "Variant size+color combinations must be unique", path: ["variants"] }
  );

// ─── Update Product ───────────────────────────────────────────────────────────
// All fields optional — only include what you want to change.
// Relations (colors, sizes, images, details, care, variants) use full-replace
// semantics when provided: existing records are deleted and re-created.

export const updateProductSchema = z
  .object({
    name:                 z.string().min(1).max(255).optional(),
    description:          z.string().min(1).optional(),
    fabric:               z.string().min(1).max(255).optional(),
    inStock:              z.boolean().optional(),
    priceCents:           z.number().int().positive().optional(),
    discountedPriceCents: z.number().int().positive().optional().nullable(),
    primaryImageUrl:      z.string().url().optional(),
    categoryId:           z.string().uuid().optional().nullable(),
    stock:                z.number().int().min(0).optional().nullable(),

    colors:   z.array(colorSchema).optional(),
    sizes:    z.array(sizeSchema).optional(),
    images:   z.array(imageSchema).optional(),
    details:  z.array(detailSchema).optional(),
    care:     z.array(careSchema).optional(),
    variants: z.array(variantSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.discountedPriceCents != null && data.priceCents != null) {
        return data.discountedPriceCents < data.priceCents;
      }
      return true;
    },
    {
      message: "Discounted price must be less than the full price",
      path: ["discountedPriceCents"],
    }
  );

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;