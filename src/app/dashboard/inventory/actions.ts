"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteFoundItem(foundId: number) {
  try {
    const supabase = await createClient();

    // Delete associated claims first
    const { error: claimError } = await supabase
      .from("claim")
      .delete()
      .eq("found_id", foundId);

    if (claimError) {
      console.error("Error deleting claims:", claimError);
      return { success: false, error: claimError.message };
    }

    // Delete associated matches
    const { error: matchError } = await supabase
      .from("match")
      .delete()
      .eq("found_id", foundId);

    if (matchError) {
      console.error("Error deleting matches:", matchError);
      return { success: false, error: matchError.message };
    }

    // Delete the found item
    const { error } = await supabase
      .from("founditem")
      .delete()
      .eq("found_id", foundId);

    if (error) {
      console.error("Error deleting found item:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting found item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface UpdateFoundItemData {
  foundId: number;
  item_name: string;
  description: string;
  category: string;
  found_location: string;
  image_url: string;
}

export async function updateFoundItem(data: UpdateFoundItemData) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("founditem")
      .update({
        item_name: data.item_name,
        description: data.description,
        category: data.category,
        found_location: data.found_location,
        image_url: data.image_url,
      })
      .eq("found_id", data.foundId);

    if (error) {
      console.error("Error updating found item:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating found item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
