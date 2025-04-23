"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  useLearningObjectives,
  useCreateLearningObjective,
  useReorderLearningObjectives,
  useDeleteLearningObjective,
} from "@/hooks/use-learning-objectives";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "@/components/ui/sortable";
import { Plus } from "lucide-react";

// Extend the schema to include the id field for tracking existing objectives
const schema = z.object({
  objectives: z.array(
    z.object({
      text: z.string(),
      id: z.string(), // Optional for new objectives
    })
  ),
});

type Schema = z.infer<typeof schema>;

interface LearningObjectivesProps {
  courseId: string;
}

const LearningObjectives = ({ courseId }: LearningObjectivesProps) => {
  const [initialObjectives, setInitialObjectives] = useState<
    Array<{ id: string; text: string }>
  >([]);

  // Fetch existing learning objectives
  const { data: existingObjectives, isLoading } =
    useLearningObjectives(courseId);

  // Mutations for creating and reordering
  const createMutation = useCreateLearningObjective();
  const reorderMutation = useReorderLearningObjectives(courseId);
  const deleteMutation = useDeleteLearningObjective(courseId);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      objectives: [],
    },
  });

  // Watch for changes in the objectives array
  const watchedObjectives = form.watch("objectives");

  // Initialize form with existing data when it loads
  useEffect(() => {
    if (existingObjectives) {
      // Map to expected format with text and id
      const formattedObjectives = existingObjectives.map(
        (obj: { id: string; text: string }) => ({
          text: obj.text,
          id: obj.id,
        })
      );

      // Store initial state for comparison
      setInitialObjectives(formattedObjectives);

      // Set form values
      form.reset({ objectives: formattedObjectives });
    }
  }, [existingObjectives, form]);

  const { fields, append, move, remove } = useFieldArray({
    control: form.control,
    name: "objectives",
  });

  // Check if there are any changes compared to initial state
  const hasChanges = () => {
    // If there are more or fewer objectives, there are changes
    if (watchedObjectives.length !== initialObjectives.length) {
      return true;
    }

    // Check for new objectives (without IDs)
    const hasNewObjectives = watchedObjectives.some(
      (obj) => !obj.id && obj.text.trim() !== ""
    );

    if (hasNewObjectives) {
      return true;
    }

    // Check if ordering has changed or texts have been modified
    for (let i = 0; i < initialObjectives.length; i++) {
      // Find the objective in the current array that matches the ID
      const original = initialObjectives[i];
      const current = watchedObjectives.find((obj) => obj.id === original.id);

      // If we can't find it or its text has changed, there are changes
      if (!current || current.text !== original.text) {
        return true;
      }

      // If its position has changed, there are changes
      const currentIndex = watchedObjectives.findIndex(
        (obj) => obj.id === original.id
      );
      if (currentIndex !== i) {
        return true;
      }
    }

    return false;
  };

  // Submit form data to API
  async function onSubmit(data: Schema) {
    // Handle reordering of existing objectives
    const existingObjectivesInForm = data.objectives.filter((obj) => obj.id);

    console.log("DATA OBJ : ", data);

    if (existingObjectivesInForm.length > 0) {
      // Extract IDs in their current order
      const orderedIds = existingObjectivesInForm
        .map((obj) => obj.id)
        .filter((id): id is string => !!id);

      // Only reorder if something has changed
      if (orderedIds.length > 0) {
        await reorderMutation.mutateAsync({
          courseId,
          orderedIds,
        });
      }
    }

    // Handle new objectives (ones without IDs)
    const newObjectives = data.objectives.filter(
      (obj) => !obj.id && obj.text.trim()
    );

    if (newObjectives.length > 0) {
      // Format for API (just need text field)
      const objectivesToSubmit = newObjectives.map((obj) => ({
        text: obj.text,
      }));

      // Submit only new objectives
      await createMutation.mutateAsync({
        courseId,
        objectives: objectivesToSubmit,
      });
    }

    // Add a new empty objective field after successful submission
    if (newObjectives.length > 0) {
      append({ text: "", id: "" });
    }
  }

  if (isLoading) {
    return <div>Loading learning objectives...</div>;
  }

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
            onClick={() => append({ text: "", id: "" })}
          >
            <Plus />
            Tambah Poin
          </Button>
        </CardHeader>
      </div>
      <CardContent>
        <Sortable
          value={fields}
          onMove={({ activeIndex, overIndex }) => move(activeIndex, overIndex)}
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
                    render={({ field: textField }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input className="h-8" {...textField} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Hidden field to store the id for existing objectives */}
                  <FormField
                    control={form.control}
                    name={`objectives.${index}.id`}
                    render={({ field: idField }) => (
                      <input type="hidden" {...idField} />
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
                    onClick={() => {
                      const objective = watchedObjectives[index];

                      if (objective.id) {
                        deleteMutation.mutate({ objectiveId: objective.id });
                      } else {
                        remove(index);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <TrashIcon
                        className="size-4 text-destructive"
                        aria-hidden="true"
                      />
                    )}
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </SortableItem>
            ))}
          </div>
        </Sortable>

        {/* Only show the button when there are changes */}
        {hasChanges() && (
          <Button
            size="sm"
            className="w-fit mt-4"
            onClick={form.handleSubmit(onSubmit)}
            disabled={
              createMutation.isPending ||
              reorderMutation.isPending ||
              deleteMutation.isPending
            }
          >
            {createMutation.isPending ||
            reorderMutation.isPending ||
            deleteMutation.isPending
              ? "Menyimpan..."
              : "Tambahkan"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningObjectives;
