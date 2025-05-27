// lib/validations/course.ts
import * as z from "zod";

export const courseFormSchema = z.object({
  title: z
    .string({
      required_error: "Judul course harus diisi",
      invalid_type_error: "Judul course harus berupa teks",
    })
    .min(1, {
      message: "Judul course harus diisi",
    })
    .min(3, {
      message: "Judul course minimal 3 karakter",
    })
    .max(100, {
      message: "Judul course maksimal 100 karakter",
    })
    .trim(),
  description: z
    .string({
      required_error: "Deskripsi course harus diisi",
      invalid_type_error: "Deskripsi course harus berupa teks",
    })
    .min(1, {
      message: "Deskripsi course harus diisi",
    })
    .min(10, {
      message: "Deskripsi course minimal 10 karakter",
    })
    .max(1000, {
      message: "Deskripsi course maksimal 1000 karakter",
    })
    .trim(),
  imageUrl: z
    .string({
      required_error: "Gambar course harus diupload",
    })
    .min(1, {
      message: "Gambar course harus diupload",
    })
    .refine(
      (url) => {
        // Allow S3 keys (for new uploads) or full URLs (for existing courses)
        return url.includes("thumbnails/") || url.startsWith("http");
      },
      {
        message: "Format gambar tidak valid",
      }
    ),
  price: z
    .number({
      required_error: "Harga course harus diisi",
      invalid_type_error: "Harga harus berupa angka",
    })
    .min(0, {
      message: "Harga tidak boleh negatif",
    })
    .max(99999999, {
      message: "Harga terlalu besar",
    }),
  categoryId: z
    .string({
      required_error: "Kategori harus dipilih",
      invalid_type_error: "Kategori tidak valid",
    })
    .min(1, {
      message: "Silakan pilih kategori",
    })
    .uuid({
      message: "ID kategori tidak valid",
    }),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
    required_error: "Level course harus dipilih",
    invalid_type_error: "Level tidak valid",
  }),
  isPublished: z
    .boolean({
      required_error: "Status publikasi harus dipilih",
      invalid_type_error: "Status publikasi tidak valid",
    })
    .default(false),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

// Validation schema for course creation (stricter)
export const courseCreateSchema = courseFormSchema.extend({
  imageUrl: z
    .string({
      required_error: "Gambar course harus diupload",
    })
    .min(1, {
      message: "Gambar course harus diupload",
    })
    .refine((url) => url.includes("thumbnails/"), {
      message: "Silakan upload gambar course terlebih dahulu",
    }),
});

// Validation schema for course updates (more lenient)
export const courseUpdateSchema = courseFormSchema.partial();

export type CourseCreateValues = z.infer<typeof courseCreateSchema>;
export type CourseUpdateValues = z.infer<typeof courseUpdateSchema>;
