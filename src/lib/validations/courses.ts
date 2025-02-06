// lib/validations/course.ts
import * as z from "zod";

export const courseFormSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Judul course harus diisi",
    })
    .min(3, {
      message: "Judul course minimal 3 karakter",
    })
    .max(100, {
      message: "Judul course maksimal 100 karakter",
    }),
  description: z
    .string()
    .min(1, {
      message: "Deskripsi course harus diisi",
    })
    .min(10, {
      message: "Deskripsi course minimal 10 karakter",
    })
    .max(1000, {
      message: "Deskripsi course maksimal 1000 karakter",
    }),
  imageUrl: z
    .string()
    .min(1, {
      message: "Gambar course harus diupload",
    })
    .url({
      message: "URL gambar tidak valid",
    }),
  price: z.coerce
    .number({
      required_error: "Harga course harus diisi",
      invalid_type_error: "Harga harus berupa angka",
    })
    .min(0, {
      message: "Harga tidak boleh negatif",
    }),
  categoryId: z
    .string({
      required_error: "Kategori harus dipilih",
      invalid_type_error: "Kategori tidak valid",
    })
    .min(1, {
      message: "Silakan pilih kategori",
    }),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
    required_error: "Level course harus dipilih",
    invalid_type_error: "Level tidak valid",
  }),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
