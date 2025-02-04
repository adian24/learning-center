"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/layout";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { MultiSelect } from "@/components/ui/multi-select";
import { EXPERTISE_CATEGORIES } from "@/lib/constants";

const formSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  expertise: z
    .array(z.string())
    .min(1, "Select at least one area of expertise"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TeacherRegistration() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: "",
      expertise: [], // Initialize as empty array
    },
  });

  const { mutate: registerTeacher, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Registration successful!");
      router.push("/teacher/dashboard");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(data: FormValues) {
    registerTeacher(data);
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Menjadi Teacher</h1>
          <p className="text-muted-foreground mt-2">
            Bagikan pengalaman dan keahlian Anda dengan membuat Kelas
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tentang Anda</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px]"
                      placeholder="Ceritakan kepada kami tentang pengalaman mengajar Anda, kualifikasi, dan apa yang Anda inginkan..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ini akan ditampilkan di profil Teacher Anda.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bidang Keahlian</FormLabel>
                  <FormControl>
                    <MultiSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={EXPERTISE_CATEGORIES}
                      placeholder="Pilih bidang keahlian Anda..."
                    />
                  </FormControl>
                  <FormDescription>
                    Pilih dari kategori yang ada atau tambahkan bidang keahlian
                    Anda sendiri.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
