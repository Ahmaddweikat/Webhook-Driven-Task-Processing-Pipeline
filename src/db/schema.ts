import {
  pgTable,
  uuid,
  text,
  jsonb,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pipelines = pgTable("pipelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  sourceUrl: text("source_url").notNull().unique(),
  actionType: text("action_type").notNull(),
  actionConfig: jsonb("action_config").notNull().default({}),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pipelineRuns = pgTable("pipeline_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  inputPayload: jsonb("input_payload").notNull().default({}),
  outputPayload: jsonb("output_payload"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  triggeredAt: timestamp("triggered_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const deliveryAttempts = pgTable("delivery_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineRunId: uuid("pipeline_run_id")
    .notNull()
    .references(() => pipelineRuns.id, { onDelete: "cascade" }),
  subscriberId: uuid("subscriber_id")
    .notNull()
    .references(() => subscribers.id, { onDelete: "cascade" }),
  attemptNumber: integer("attempt_number").notNull().default(1),
  httpStatus: integer("http_status"),
  errorMessage: text("error_message"),
  status: text("status").notNull().default("pending"),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});
