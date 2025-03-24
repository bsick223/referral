import { clerkClient } from "@clerk/nextjs/server";

type UserInfo = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
};

export async function getUserInfo(userId: string): Promise<UserInfo | null> {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    // Create optimized image URL with query parameters
    const imageUrl = user.imageUrl;
    const params = new URLSearchParams();
    params.set("width", "100");
    params.set("height", "100");
    params.set("quality", "85");
    params.set("fit", "crop");

    const optimizedImageUrl = `${imageUrl}?${params.toString()}`;

    return {
      id: userId,
      username: user.username || `user${userId.substring(0, 4)}`,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: optimizedImageUrl,
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

export async function getBatchUserInfo(
  userIds: string[]
): Promise<Record<string, UserInfo>> {
  try {
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({
      userId: userIds,
    });

    const userMap: Record<string, UserInfo> = {};

    users.data.forEach((user) => {
      // Create optimized image URL with query parameters
      const imageUrl = user.imageUrl;
      const params = new URLSearchParams();
      params.set("width", "100");
      params.set("height", "100");
      params.set("quality", "85");
      params.set("fit", "crop");

      const optimizedImageUrl = `${imageUrl}?${params.toString()}`;

      userMap[user.id] = {
        id: user.id,
        username: user.username || `user${user.id.substring(0, 4)}`,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: optimizedImageUrl,
      };
    });

    return userMap;
  } catch (error) {
    console.error("Error fetching batch user info:", error);
    return {};
  }
}
