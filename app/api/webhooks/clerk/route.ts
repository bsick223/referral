import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret is not configured", {
      status: 500,
    });
  }

  // Get the headers
  const headerPayload = request.headers;
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers", {
      svix_id,
      svix_timestamp,
      svix_signature,
    });
    return new Response("Missing required headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Invalid webhook signature", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id } = evt.data;
    console.log(`Processing user.created event for user ${id}`);

    try {
      // Create a new user profile with default public settings
      const convex = getConvexClient();
      await convex.mutation(api.userProfiles.updatePrivacySettings, {
        userId: id,
        profileVisibility: "public",
        hideFromLeaderboards: false,
        showApplicationsCount: true,
        showReferralsCount: true,
        showCompaniesCount: true,
      });
      console.log(`Successfully created profile for user ${id}`);
    } catch (error) {
      console.error(`Error creating profile for user ${id}:`, error);
      return new Response("Error creating user profile", {
        status: 500,
      });
    }
  } else {
    console.log(`Received unhandled webhook event: ${eventType}`);
  }

  return NextResponse.json({ success: true });
}
