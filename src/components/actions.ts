"use server";

import { signOut, signIn } from "@/auth";
import { database } from "@/database";
import { authenticatedAction } from "@/lib/safe-action";
import { organizations } from "@/database/schema";
import { eq } from "drizzle-orm";

export const signOutAction = async () => {
  await signOut({ redirect: true, redirectTo: "/" });
};

export const signInAction = async (arg: string) => {
  await signIn(arg);
};

export const getOneUserOrganization = authenticatedAction
  .createServerAction()
  .handler(async ({ ctx: { user } }) => {
    try {
      const userHasOrganization = await database.query.organizations.findMany({
        where: eq(organizations.creator, user.id),
      });

      return userHasOrganization.length > 0;
    } catch (err) {
      console.log(err);
    }
  });
