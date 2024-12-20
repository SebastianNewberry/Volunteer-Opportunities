import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
  json,
  unique,
  numeric,
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
  customFile: boolean("customImage").default(false),
  userImage: json("customUserImage"),
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
  thumbnail: json("thumbnail"),
  createdAt: timestamp("createdOn", { mode: "date" })
    .notNull()
    .default(sql`NOW()`),
  creator: text("creatorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  images: json("images"),
  email: text("email"),
  address: text("address"),
  phoneNumber: text("phoneNumber"),
  bio: text("bio"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
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
  createdAt: timestamp("createdAt", { mode: "date" })
    .default(sql`NOW()`)
    .notNull(),
  address: text("address"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
});

export const conversationsToUsers = pgTable(
  "conversations_to_users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversationId").references(() => conversations.id, {
      onDelete: "cascade",
    }),
    userId: text("userId").references(() => users.id, {
      onDelete: "cascade",
    }),
    organizationId: text("organizationId").references(() => organizations.id, {
      onDelete: "cascade",
    }),
  },
  (t) => ({
    unq: unique().on(t.conversationId, t.userId),
    unq2: unique().on(t.conversationId, t.organizationId),
  })
);

export const conversations = pgTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  subject: text("subject"),
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
  conversationId: text("conversation_id").references(() => conversations.id, {
    onDelete: "cascade",
  }),
  senderId: text("sender_user_id").references(() => users.id),
  senderOrganizationId: text("sender_organization_id").references(
    () => organizations.id
  ),
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

export const listingsToUsers = pgTable(
  "listing_volunteers",
  {
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    volunteerId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dateSignedUp: timestamp("dateSignedUp", { mode: "date" })
      .notNull()
      .default(sql`NOW()`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.volunteerId, table.listingId] }),
  })
);

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    conversations: many(conversationsToUsers),
    messages: many(messages),
  })
);

export const conversationsToUsersRelations = relations(
  conversationsToUsers,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversationsToUsers.userId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [conversationsToUsers.organizationId],
      references: [organizations.id],
    }),
    conversation: one(conversations, {
      fields: [conversationsToUsers.conversationId],
      references: [conversations.id],
    }),
  })
);

export const listingsToUsersRelations = relations(
  listingsToUsers,
  ({ one }) => ({
    volunteers: one(users, {
      fields: [listingsToUsers.volunteerId],
      references: [users.id],
    }),
    listings: one(listings, {
      fields: [listingsToUsers.listingId],
      references: [listings.id],
    }),
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
    conversationsToUsers: many(conversationsToUsers),
    messages: many(messages),
  })
);

export const skillsRelations = relations(skills, ({ many }) => ({
  listings: many(skillsToListings),
  volunteers: many(skillsToUsers),
}));

export const volunteerRelations = relations(users, ({ many }) => ({
  skills: many(skillsToUsers),
  user_to_user_senderMessages: many(conversationsToUsers),
  organizations: many(organizations),
  listings: many(listingsToUsers),
  messages: many(messages),
  conversationsToUsers: many(conversationsToUsers),
}));

export const listingsRelations = relations(listings, ({ many, one }) => ({
  skills: many(skillsToListings),
  organizations: one(organizations, {
    fields: [listings.organizationId],
    references: [organizations.id],
  }),
  volunteers: many(listingsToUsers),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  senderUser: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  senderOrganization: one(organizations, {
    fields: [messages.senderOrganizationId],
    references: [organizations.id],
  }),
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

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
      fields: [skillsToUsers.volunteerId],
      references: [users.id],
    }),
  })
);

export type User = typeof users.$inferSelect;
export type Organizations = typeof organizations.$inferSelect;
