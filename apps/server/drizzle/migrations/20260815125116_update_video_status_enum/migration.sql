ALTER TABLE "videos" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "video_status";--> statement-breakpoint
CREATE TYPE "video_status" AS ENUM('PENDING', 'PROCESSING', 'READY', 'FAILED');--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "status" SET DATA TYPE "video_status" USING "status"::"video_status";--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"video_status";