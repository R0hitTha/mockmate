"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth-server";
import {
  UpdateMistakeStatusSchema,
  ToggleBookmarkSchema,
  type UpdateMistakeStatusInput,
  type ToggleBookmarkInput,
} from "@/lib/validations/mistakes";
import {
  updateMistakeReviewStatus,
  toggleQuestionBookmark,
} from "@/lib/mistake-service";

export async function updateMistakeStatusAction(input: UpdateMistakeStatusInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to update review status." };
    }

    const validated = UpdateMistakeStatusSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid review data provided.",
      };
    }

    const updated = await updateMistakeReviewStatus(session.user.id, validated.data);

    revalidatePath("/mistakes");
    revalidatePath("/mistakes/review");
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to update mistake review status.",
    };
  }
}

export async function toggleBookmarkAction(input: ToggleBookmarkInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to bookmark questions." };
    }

    const validated = ToggleBookmarkSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid bookmark input.",
      };
    }

    const result = await toggleQuestionBookmark(
      session.user.id,
      validated.data.questionId,
      validated.data.notes
    );

    revalidatePath("/mistakes");
    revalidatePath("/mistakes/review");
    revalidatePath("/bookmarks");

    return { success: true, isBookmarked: result.isBookmarked };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to toggle question bookmark.",
    };
  }
}

