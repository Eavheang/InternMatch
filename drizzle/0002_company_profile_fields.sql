ALTER TABLE "companies" ADD COLUMN "headquarters" text;
ALTER TABLE "companies" ADD COLUMN "other_locations" text;
ALTER TABLE "companies" ADD COLUMN "company_culture" text;
ALTER TABLE "companies" ADD COLUMN "contact_phone" text;
ALTER TABLE "companies" ADD COLUMN "has_internship_program" boolean DEFAULT false;

