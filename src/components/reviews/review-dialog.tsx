"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Star } from "lucide-react";

import { useReviewDialogStore } from "@/stores/review-dialog-store";
import { useCreateReview, useUpdateReview } from "@/hooks/use-course-reviews";
import { StarRating } from "./star-rating";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export function ReviewDialog() {
  const {
    isOpen,
    mode,
    courseId,
    reviewId,
    rating,
    comment,
    closeDialog,
    setRating,
    setComment,
    isSubmitting,
    setSubmitting,
  } = useReviewDialogStore();

  const createReviewMutation = useCreateReview(courseId || "");
  const updateReviewMutation = useUpdateReview(courseId || "", reviewId || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: rating,
      comment: comment,
    },
  });

  const watchedRating = watch("rating");
  const watchedComment = watch("comment");

  // Sync form with store
  useEffect(() => {
    if (isOpen) {
      setValue("rating", rating);
      setValue("comment", comment);
    }
  }, [isOpen, rating, comment, setValue]);

  // Sync store with form
  useEffect(() => {
    if (watchedRating !== rating) {
      setRating(watchedRating);
    }
  }, [watchedRating, rating, setRating]);

  useEffect(() => {
    if (watchedComment !== comment) {
      setComment(watchedComment || "");
    }
  }, [watchedComment, comment, setComment]);

  const handleRatingChange = (newRating: number) => {
    setValue("rating", newRating);
    setRating(newRating);
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!courseId) return;

    try {
      setSubmitting(true);

      if (mode === "create") {
        await createReviewMutation.mutateAsync({
          rating: data.rating,
          comment: data.comment,
        });
        toast.success("Review submitted successfully!");
      } else if (mode === "edit" && reviewId) {
        await updateReviewMutation.mutateAsync({
          rating: data.rating,
          comment: data.comment,
        });
        toast.success("Review updated successfully!");
      }

      closeDialog();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    closeDialog();
  };

  const isLoading = isSubmitting || createReviewMutation.isPending || updateReviewMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {mode === "create" ? "Write a Review" : "Edit Review"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating *</Label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={watchedRating || rating}
                onRatingChange={handleRatingChange}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                ({watchedRating || rating}/5)
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-red-500">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this course..."
              className="min-h-[100px] resize-none"
              {...register("comment")}
            />
            {errors.comment && (
              <p className="text-sm text-red-500">{errors.comment.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Submit Review" : "Update Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}