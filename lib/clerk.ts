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

    return {
      id: userId,
      username: user.username || `user${userId.substring(0, 4)}`,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
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
      userMap[user.id] = {
        id: user.id,
        username: user.username || `user${user.id.substring(0, 4)}`,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      };
    });

    return userMap;
  } catch (error) {
    console.error("Error fetching batch user info:", error);
    return {};
  }
}
