import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  json,
} from "drizzle-orm/pg-core";

// Users Table
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer(),
});

// Session Chat Table
export const SessionChatTable = pgTable("chatsessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar({ length: 255 }).notNull(),       
  createdBy: varchar({ length: 255 }).notNull(),     
  notes: text().notNull(),                            
  selectedDoctor: varchar({ length: 255 }).notNull(),  
  conversation: json(),                               
  report: json(),                                    
  voiceId: varchar({ length: 255 }),                    
  createdOn: timestamp({ withTimezone: true }).defaultNow().notNull(), 
});
