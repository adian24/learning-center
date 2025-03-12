"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "@/components/ui/sortable";
import { Plus } from "lucide-react";

const schema = z.object({
  objectives: z.array(
    z.object({
      text: z.string(),
    })
  ),
});

type Schema = z.infer<typeof schema>;

const LearningObjectives = () => {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      objectives: [],
    },
  });

  function onSubmit(input: Schema) {
    console.log({ input });
  }

  const { fields, append, move, remove } = useFieldArray({
    control: form.control,
    name: "objectives",
  });

  return (
    <Card>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <CardHeader className="w-full flex-col gap-4 space-y-0 sm:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <CardTitle>Inti Pembelajaran</CardTitle>
            <CardDescription>
              Tuliskan poin-poin penting yang akan peserta pelajari dari Course
              ini, sehingga peserta dapat mengetahui apa yang akan mereka
              dapatkan setelah mempelajarinya.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => append({ text: "" })}
          >
            <Plus />
            Tambah Poin
          </Button>
        </CardHeader>
      </div>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-4"
          >
            <Sortable
              value={fields}
              onMove={({ activeIndex, overIndex }) =>
                move(activeIndex, overIndex)
              }
              overlay={
                <div className="flex flex-row items-center w-full gap-2">
                  <div className="h-8 w-full rounded-sm bg-primary/10" />
                  <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
                  <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
                </div>
              }
            >
              <div className="flex w-full flex-col gap-2">
                {fields.map((field, index) => (
                  <SortableItem key={field.id} value={field.id} asChild>
                    <div className="flex flex-row items-center w-full gap-2">
                      <FormField
                        control={form.control}
                        name={`objectives.${index}.text`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input className="h-8" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <SortableDragHandle
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0"
                      >
                        <DragHandleDots2Icon
                          className="size-4"
                          aria-hidden="true"
                        />
                      </SortableDragHandle>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={() => remove(index)}
                      >
                        <TrashIcon
                          className="size-4 text-destructive"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </Sortable>
            <Button size="sm" className="w-fit">
              Tambahkan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LearningObjectives;
