-- Add missing columns to organizations table

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "affiliatedProfiles" text[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "allSubsidiaries" text[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "alternativeDomains" text[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "alternativeNames" text[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "averageEmployeeTenure" double precision;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "averageTenureByLevel" jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "averageTenureByRole" jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "directSubsidiaries" text[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "employeeChurnRate" jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "employeeCountByMonth" jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "employeeGrowthRate" jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "employeeCountByMonthByLevel" jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "employeeCountByMonthByRole" jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "gicsSector" text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "grossAdditionsByMonth" jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "grossDeparturesByMonth" jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "ultimateParent" text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "immediateParent" text;
