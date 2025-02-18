import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  ownerName: text("owner_name").notNull(),
  location: text("location").notNull(),
  minOrderAmount: integer("min_order_amount").notNull(),
  photos: text("photos").array(),
  email: text("email").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  whatsappNumber: text("whatsapp_number"),
  workingDays: jsonb("working_days").notNull(),
  openingTime: text("opening_time").notNull(),
  closingTime: text("closing_time").notNull(),
  documents: jsonb("documents").notNull(),
  isOnline: boolean("is_online").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  phoneNumber: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export interface Documents {
  gst: string;
  fssai: string;
  idProof: string;
  addressProof: string;
}

export interface WorkingDays {
  [key: string]: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}
