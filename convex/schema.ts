import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    createdAt: v.number(),

    status: v.union(
      v.literal("Uploaded"),
      v.literal("Processing"),
      v.literal("Ready"),
      v.literal("Failed")
    ),

    audioStorageId: v.id("_storage"),
    spokenAudioStorageId: v.optional(v.id("_storage")),

    transcript: v.optional(v.string()),

    summary: v.optional(
  v.object({
    title: v.string(),
    keyPoints: v.array(v.string()),
    actionItems: v.array(v.string()),
    namesOrCompanies: v.array(v.string()),
    tags: v.array(v.string()),

    // NEW
    confidence: v.union(v.literal("high"), v.literal("low")),
    needsMoreAudio: v.boolean(),
    reason: v.optional(v.string()),
  })
),

    error: v.optional(v.string()),
  }).index("by_createdAt", ["createdAt"]),
});
