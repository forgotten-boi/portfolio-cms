-- Add new columns to Portfolios table
ALTER TABLE "Portfolios" 
  ADD COLUMN "IsPublished" boolean NOT NULL DEFAULT false,
  ADD COLUMN "PublishedAt" timestamp with time zone,
  ADD COLUMN "Slug" text NOT NULL DEFAULT '',
  ADD COLUMN "TemplateId" integer NOT NULL DEFAULT 1;

-- Create index on Slug for faster lookups
CREATE INDEX "IX_Portfolios_Slug" ON "Portfolios" ("Slug");

-- Update migration history
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20251113172110_AddPortfolioSlugAndPublishFields', '10.0.0');
