import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createNote = mutation({
  args: { audioStorageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("notes", {
      createdAt: Date.now(),
      status: "Uploaded",
      audioStorageId: args.audioStorageId,
    });
    return noteId;
  },
});

export const listNotes = query(async (ctx) => {
  const notes = await ctx.db
    .query("notes")
    .withIndex("by_createdAt")
    .order("desc")
    .take(50);

  return notes.map((n) => ({
    ...n,
    displayTitle: n.summary?.title ?? "Untitled",
  }));
});

export const getNote = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    if (!note) return null;

    const audioUrl = await ctx.storage.getUrl(note.audioStorageId);
    const spokenUrl = note.spokenAudioStorageId
      ? await ctx.storage.getUrl(note.spokenAudioStorageId)
      : null;

    return { ...note, audioUrl, spokenUrl };
  },
});
