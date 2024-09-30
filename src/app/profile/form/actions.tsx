"use server";
import { and, eq, inArray, notExists, notInArray } from "drizzle-orm";
import { users, skills, skillsToUsers } from "@/database/schema";
import { database } from "@/database/index";
import { authenticatedAction } from "@/lib/safe-action";
import { unauthenticatedAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";

import { z } from "zod";
import { redirect } from "next/navigation";

// Select Statements for User Profile
// Convert to internal fumctions

export const userData = authenticatedAction
  .createServerAction()
  .handler(async ({ ctx: { user } }) => {
    if (user != undefined) {
      return internalUserData(user.id);
    } else {
      return null;
    }
  });

async function internalUserData(id: string) {
  const data = await database
    .select({ name: users.name, image: users.image, bio: users.bio })
    .from(users)
    .where(eq(users.id, id));

  return data;
}

export const userSkills = authenticatedAction
  .createServerAction()
  .handler(async ({ ctx: { user } }) => {
    if (user != undefined) {
      return internalUserSkills(user.id);
    } else {
      return null;
    }
  });

async function internalUserSkills(id: string) {
  const data = await database
    .select({
      skillId: skillsToUsers.skillId,
      skillName: skills.name,
      url: skills.iconUrl,
    })
    .from(skillsToUsers)
    .innerJoin(skills, eq(skills.id, skillsToUsers.skillId))
    .where(eq(skillsToUsers.volunteerId, id));

  return data;
}

export const getSkills = authenticatedAction
  .createServerAction()
  .handler(async ({ ctx: { user } }) => {
    if (user != undefined) {
      return internalGetSkills(user.id);
    } else {
      return null;
    }
  });

async function internalGetSkills(id: string) {
  const userSkills = database
    .select({
      data: skillsToUsers.skillId,
    })
    .from(skillsToUsers)
    .where(eq(skillsToUsers.volunteerId, id));

  const data = await database
    .select({
      skillId: skills.id,
      skillName: skills.name,
    })
    .from(skills)
    .where(notInArray(skills.id, userSkills));

  return data;
}

// Update and delete Statements for UserProfile
// Will add returns latter not sure what to do with them.

export const deleteUserSkill = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      skill: z.array(z.string()),
    })
  )
  .handler(async ({ ctx: { user }, input: { skill } }) => {
    if (user != undefined) {
      return internalDeleteUserSkill(skill, user.id);
    }
  });

async function internalDeleteUserSkill(deleteUserSkills: string[], id: string) {
  await database
    .delete(skillsToUsers)
    .where(
      and(
        eq(skillsToUsers.volunteerId, id),
        inArray(skillsToUsers.skillId, deleteUserSkills)
      )
    );
}

export const addUserSkill = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      skill: z.array(z.string()),
    })
  )
  .handler(async ({ ctx: { user }, input: { skill } }) => {
    if (user != undefined) {
      return internalAddUserSkill(user.id, skill);
    }
  });

async function internalAddUserSkill(id: string, skills: string[]) {
  await database.insert(skillsToUsers).values(
    skills.map((skill) => {
      return { skillId: skill, volunteerId: id };
    })
  );
}

export const updateUser = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      picture: z.string(),
      username: z.string(),
      bio: z.string(),
    })
  )
  .handler(async ({ ctx: { user }, input: { picture, username, bio } }) => {
    if (user != undefined) {
      return internalUpdateUser(picture, username, bio, user.id);
    }
  });

export async function internalUpdateUser(
  picture: string,
  username: string,
  bio: string,
  id: string
) {
  await database
    .update(users)
    .set({ name: username, image: picture, bio: bio })
    .where(eq(users.id, id));
}

export const revalidatePathAction = () => {
  revalidatePath("/profile/form");
};
