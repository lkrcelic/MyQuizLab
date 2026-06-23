CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"prompt" text NOT NULL,
	"answer" text NOT NULL,
	"explanation" text NOT NULL,
	"options" jsonb,
	"accepted_answers" jsonb,
	"example" text,
	"tags" jsonb,
	"rating" text,
	"rated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"categories" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;