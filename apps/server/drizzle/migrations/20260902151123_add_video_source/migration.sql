CREATE TYPE "video_source" AS ENUM('YOUTUBE', 'UPLOAD');--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "source" "video_source" NOT NULL;