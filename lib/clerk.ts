import { clerkClient } from "@clerk/nextjs/server";

type UserInfo = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl?: string;
};

export async function getUserInfo(userId: string): Promise<UserInfo | null> {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    // Create optimized image URL with query parameters if available
    let optimizedImageUrl = undefined;
    if (user.imageUrl) {
      const imageUrl = user.imageUrl;
      const params = new URLSearchParams();
      params.set("width", "100");
      params.set("height", "100");
      params.set("quality", "85");
      params.set("fit", "crop");

      optimizedImageUrl = `${imageUrl}?${params.toString()}`;
    }

    // Create a better username fallback that ensures the actual name is used when available
    const username =
      // First try to use the actual username
      user.username ||
      // Then try first name if available
      (user.firstName
        ? user.firstName
        : // Then email prefix if available
        user.emailAddresses && user.emailAddresses.length > 0
        ? user.emailAddresses[0].emailAddress.split("@")[0]
        : // Last resort - use ID with a prefix
          `User-${userId.substring(0, 6)}`);

    return {
      id: userId,
      username: username,
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
      // Create optimized image URL with query parameters if available
      let optimizedImageUrl = undefined;
      if (user.imageUrl) {
        const imageUrl = user.imageUrl;
        const params = new URLSearchParams();
        params.set("width", "100");
        params.set("height", "100");
        params.set("quality", "85");
        params.set("fit", "crop");

        optimizedImageUrl = `${imageUrl}?${params.toString()}`;
      }

      // Create a better username fallback that ensures the actual name is used when available
      const username =
        // First try to use the actual username
        user.username ||
        // Then try first name if available
        (user.firstName
          ? user.firstName
          : // Then email prefix if available
          user.emailAddresses && user.emailAddresses.length > 0
          ? user.emailAddresses[0].emailAddress.split("@")[0]
          : // Last resort - use ID with a prefix
            `User-${user.id.substring(0, 6)}`);

      userMap[user.id] = {
        id: user.id,
        username: username,
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
