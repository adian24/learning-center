"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, HandCoins, LibraryBig, Rocket } from "lucide-react";
import { CourseFormValues } from "@/lib/validations/courses";
import { UseFormReturn } from "react-hook-form";
import { useCategories } from "@/hooks/use-categories";
import { Switch } from "@/components/ui/switch";

interface DetailInfoFomsProps {
  form: UseFormReturn<CourseFormValues>;
  isSubmitting: boolean;
}

const DetailInfoFoms = ({ form, isSubmitting }: DetailInfoFomsProps) => {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800">
        <CardHeader>
          <div className="flex flex-row justify-between">
            <div>
              <CardTitle className="text-xl text-white">
                Preview Course
              </CardTitle>
              <CardDescription className="text-white">
                Lihat bagaimana Student meninjau Course Anda
              </CardDescription>
            </div>
            <Button variant="outline">Pratinjau</Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-row justify-between">
            <CardTitle className="text-xl">Course Level</CardTitle>
            <Rocket />
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-row justify-between">
            <CardTitle className="text-xl">Course Kategori</CardTitle>
            <LibraryBig />
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Kategori</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-row justify-between">
            <CardTitle className="text-xl">Harga Course</CardTitle>
            <HandCoins />
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (IDR)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 49.99"
                    disabled={isSubmitting}
                  // startContent="Rp"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-row justify-between">
            <CardTitle className="text-xl">Publikasi Course</CardTitle>
            <Eye />
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Publikasi</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailInfoFoms;
