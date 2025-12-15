ALTER TABLE public."users"
ADD COLUMN "signalsSettings" JSONB DEFAULT '{"onboarded": false}';
