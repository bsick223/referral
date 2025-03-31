import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a default message template if none exists for the user
export const ensureDefaultTemplate = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Validate user ID
    if (!args.userId) {
      console.error("No userId provided to ensureDefaultTemplate");
      return false;
    }

    // Check if user already has messages
    const existingMessages = await ctx.db
      .query("messages")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    console.log(
      `Found ${existingMessages.length} existing messages for user ${args.userId}`
    );

    // If no messages exist, create default ones
    if (existingMessages.length === 0) {
      const defaultMessages = [
        {
          title: "Informational Interview (long-term)",
          content:
            "Hi, my name is [Name]. And I'm an engineering student at [University] studying CS with a specialty in backend. I'm reaching out because I saw that you [something interesting about their career path]. I'd love to connect with you here on LinkedIn.",
          tags: ["Informational Interview"],
        },
        {
          title: "Informational Interview pt 2",
          content:
            "Hello! It's great to be connected with you. As I mentioned before, I'm a software engineering student, and in my research of professionals doing great work in the field, I found your profile, because [something unique about their career]. Would you be available for a coffee or zoom chat. (Offer 3-5 windows of time over multiple days in a location convenient for them). I would look forward to speaking with you and would greatly appreciate your time and consideration.",
          tags: ["Informational Interview"],
        },
        {
          title: "Startups",
          content:
            "I read your website... / I used your product... / I read about you in [Article]... / I've been interested in this area for a number of years... / Your product connects to a project I worked on in class... Mention why your competent. Ask for an internship",
          tags: ["Startups"],
        },
        {
          title: "Recruiter/Hiring Manager",
          content:
            "Hi [Name], I'm very interested in the SWE position Job ID: [ID] at [Company]. I have open source experience with [Technology]. My resume: [Resume Link] Would you be willing to help my resume get noticed by the right person? Thank you.",
          tags: ["Recruiter/Hiring Manager"],
        },
        {
          title: "Asking for a referral for the internship final",
          content:
            "I hope you're doing well! I recently noticed that the [Position Title] internship is now open, and I wanted to reach out to see if you'd still be open to providing a referral. I truly appreciate your willingness to support me in this process, and I'm excited about the possibility of contributing to [Company Name]. Thank you again for your generosity and guidance. It means a lot to me, and I'd be more than happy to provide any additional information or materials you might need.",
          tags: ["Referral"],
        },
        {
          title: "Directly asking for a referral",
          content:
            "Hi [Their Name], I hope you're doing well! I came across your profile and saw you work at [Company Name]. I'm really interested in applying and I was wondering if you'd be open to providing a referral. Here is my resume [link]. I'd really appreciate your help! Thanks so much, [Name]",
          tags: ["Referral"],
        },
      ];

      console.log(
        `Creating ${defaultMessages.length} default templates for user ${args.userId}`
      );

      try {
        for (const message of defaultMessages) {
          await ctx.db.insert("messages", {
            userId: args.userId,
            title: message.title,
            content: message.content,
            isDefault: true,
            tags: message.tags,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
        console.log("Default templates created successfully");
      } catch (error) {
        console.error("Error creating default templates:", error);
        return false;
      }
    }

    return true;
  },
});
