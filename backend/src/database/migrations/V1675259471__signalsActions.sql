DROP TABLE IF EXISTS "signalsContents";

CREATE TABLE public."signalsContents" (
    "id" uuid NOT NULL,
    "platform" text NOT NULL,
    "url" text NOT NULL,
    "post" jsonb NOT NULL,
    "tenantId" uuid NOT NULL,
    "postedAt" timestamptz NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT "signalsContents_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."signalsContents" ADD CONSTRAINT "signalsContents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE TYPE public."signalsActionTypes_type" AS ENUM ('thumbs-up', 'thumbs-down', 'bookmark');

CREATE TABLE public."signalsActions" (
    "id" uuid NOT NULL,
    "type" public."signalsActionTypes_type" NOT NULL,
    "timestamp" timestamptz NOT NULL,
    "contentId" uuid NOT NULL,
    "tenantId" uuid NOT NULL,
    "actionById" uuid NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT "signalsActions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."signalsActions" ADD CONSTRAINT "signalsActions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public."signalsActions" ADD CONSTRAINT "signalsActions_actionBy_fkey" FOREIGN KEY ("actionById") REFERENCES public.users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public."signalsActions" ADD CONSTRAINT "signalsActions_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES public."signalsContents"(id) ON DELETE CASCADE ON UPDATE NO ACTION;
