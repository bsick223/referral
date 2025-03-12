import { mutation } from "./_generated/server";
import { v } from "convex/values";


export const sendMessage = mutation({
 args: {
   name: v.string(),
   email: v.string(),
   message: v.string(),
 },
 handler: async (ctx, args) => {
   const messageId = await ctx.db.insert("contact", {
     name: args.name,
     email: args.email,
     message: args.message,
     createdAt: Date.now(),
   });
  
   return messageId;
 },
});
