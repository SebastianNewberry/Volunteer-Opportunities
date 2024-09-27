import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
  json,
} from "drizzle-orm/pg-core";

import { AdapterAccount } from "next-auth/adapters";
import { relations, sql } from "drizzle-orm";

export const accountTypeEnum = pgEnum("type", ["email", "google", "github"]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  bio: text("bio").notNull().default(""),
  createdAt: timestamp("createdAt", { mode: "date" })
    .default(sql`NOW()`)
    .notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const organizations = pgTable("organizations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdOn", { mode: "date" })
    .notNull()
    .default(sql`NOW()`),
  creator: text("creatorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const skills = pgTable("skills", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  iconUrl: text("iconUrl").notNull(),
});

export const listings = pgTable("listings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  organizationId: text("organization")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
});

export const conversations = pgTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  senderId: text("senderId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Sender of the message
  recipientId: text("recipientId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Recipient of the message
});

//generated by ChatGPT, prompt: How would I create a messenger that allows users to send pictures back and forth? Is there a way I can store messages inside of a postgres table using drizzle to allow text or pictures or is there another way I can do this? Should I store html inside of my table?

export const messages = pgTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: json("content"), // Text content of the message (nullable if sending an image)
  messageType: integer("messageType").notNull(), // 0 for text, 1 for images
  createdAt: timestamp("createdAt", { mode: "date" })
    .notNull()
    .default(sql`NOW()`), // Timestamp
  conversationId: text("id").references(() => conversations.id),
});

export const skillsToListings = pgTable(
  "listings_skills",
  {
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    listingId: text("listingId")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.listingId, table.skillId] }),
  })
);

export const skillsToUsers = pgTable(
  "volunteer_skills",
  {
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    volunteerId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.volunteerId, table.skillId] }),
  })
);

export const organizationsRelations = relations(
  organizations,
  ({ many, one }) => ({
    listings: many(listings),
    users: one(users, {
      fields: [organizations.creator],
      references: [users.id],
    }),
  })
);

export const skillsRelations = relations(skills, ({ many }) => ({
  listings: many(skillsToListings),
  volunteers: many(skillsToUsers),
}));

export const volunteerRelations = relations(users, ({ many }) => ({
  skills: many(skillsToUsers),
  senderMessages: many(conversations, { relationName: "sender" }),
  receiverMessages: many(conversations, { relationName: "receiver" }),
  organizations: many(organizations),
}));

export const listingsRelations = relations(listings, ({ many, one }) => ({
  skills: many(skillsToListings),
  organizations: one(organizations, {
    fields: [listings.organizationId],
    references: [organizations.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    sender: one(users, {
      fields: [conversations.senderId],
      references: [users.id],
      relationName: "sender",
    }),
    recipient: one(users, {
      fields: [conversations.recipientId],
      references: [users.id],
      relationName: "receiver",
    }),
    messages: many(messages),
  })
);

export const skillsToListingsRelations = relations(
  skillsToListings,
  ({ one }) => ({
    skills: one(skills, {
      fields: [skillsToListings.skillId],
      references: [skills.id],
    }),
    listings: one(listings, {
      fields: [skillsToListings.listingId],
      references: [listings.id],
    }),
  })
);

export const skillsToVolunteersRelations = relations(
  skillsToUsers,
  ({ one }) => ({
    skills: one(skills, {
      fields: [skillsToUsers.skillId],
      references: [skills.id],
    }),
    volunteers: one(users, {
      fields: [skillsToUsers.skillId],
      references: [users.id],
    }),
  })
);

export type User = typeof users.$inferSelect;
