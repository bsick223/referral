/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as achievements from "../achievements.js";
import type * as admin from "../admin.js";
import type * as applicationStatuses from "../applicationStatuses.js";
import type * as applications from "../applications.js";
import type * as companies from "../companies.js";
import type * as contact from "../contact.js";
import type * as images from "../images.js";
import type * as messages from "../messages.js";
import type * as migrations from "../migrations.js";
import type * as referrals from "../referrals.js";
import type * as reviews from "../reviews.js";
import type * as seedMessages from "../seedMessages.js";
import type * as titles from "../titles.js";
import type * as transcript from "../transcript.js";
import type * as userActivity from "../userActivity.js";
import type * as userProfiles from "../userProfiles.js";
import type * as users from "../users.js";
import type * as videos from "../videos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  admin: typeof admin;
  applicationStatuses: typeof applicationStatuses;
  applications: typeof applications;
  companies: typeof companies;
  contact: typeof contact;
  images: typeof images;
  messages: typeof messages;
  migrations: typeof migrations;
  referrals: typeof referrals;
  reviews: typeof reviews;
  seedMessages: typeof seedMessages;
  titles: typeof titles;
  transcript: typeof transcript;
  userActivity: typeof userActivity;
  userProfiles: typeof userProfiles;
  users: typeof users;
  videos: typeof videos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
