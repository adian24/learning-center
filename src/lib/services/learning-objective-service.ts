// src/lib/services/learning-objective-service.ts

import {
  CreateLearningObjectiveParams,
  UpdateLearningObjectiveParams,
} from "../types";
import db from "../db/db";

/**
 * Create a new learning objective for a course
 */
export const createLearningObjective = async (
  data: CreateLearningObjectiveParams
) => {
  return await db.learningObjective.create({
    data,
  });
};

/**
 * Get all learning objectives for a specific course
 */
export const getLearningObjectivesByCourse = async (courseId: string) => {
  return await db.learningObjective.findMany({
    where: {
      courseId,
    },
    orderBy: {
      position: "asc",
    },
  });
};

/**
 * Update a learning objective
 */
export const updateLearningObjective = async (
  id: string,
  data: UpdateLearningObjectiveParams
) => {
  return await db.learningObjective.update({
    where: { id },
    data,
  });
};

/**
 * Delete a learning objective
 */
export const deleteLearningObjective = async (id: string) => {
  return await db.learningObjective.delete({
    where: { id },
  });
};

/**
 * Reorder learning objectives by updating their positions
 */
export const reorderLearningObjectives = async (orderedIds: string[]) => {
  // Create a transaction to update all positions at once
  const updates = orderedIds.map((id, index) =>
    db.learningObjective.update({
      where: { id },
      data: { position: index },
    })
  );

  return await db.$transaction(updates);
};
