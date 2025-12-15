DROP TABLE IF EXISTS "signalsContents";

DROP TYPE "signalsContents_actions_type";

create table "signalsContents";
(
    id uuid not null primary key,
    "sourceId" text not null,
    "vectorId" text not null,
    status varchar(255) default NULL::character varying,
    title text not null,
    username text not null,
    url text not null,
    text text,
    timestamp timestamp with time zone not null,
    platform text not null,
    keywords text [],
    "similarityScore" double precision,
    "userAttributes" jsonb,
    "postAttributes" jsonb,
    "importHash" varchar(255),
    "createdAt" timestamp with time zone not null,
    "updatedAt" timestamp with time zone not null,
    "deletedAt" timestamp with time zone,
    "tenantId" uuid not null references tenants on update cascade,
    "createdById" uuid references users on update cascade on delete
    set null,
        "updatedById" uuid references users on update cascade on delete
    set null,
        "exactKeywords" text []
);

alter table "signalsContents" owner to postgres;

create index discord on "signalsContents" ("vectorId", status);

create index members_email_tenant_id on "signalsContents" (id)
where ("deletedAt" IS NULL);

create index members_joined_at_tenant_id on "signalsContents" (id)
where ("deletedAt" IS NULL);

create index members_username on "signalsContents" using gin (id);

create index slack on "signalsContents" (id);

create index twitter on "signalsContents" (id);

create unique index signals_contents_import_hash_tenant_id on "signalsContents" ("importHash", "tenantId")
where ("deletedAt" IS NULL);

create index signals_contents_platform_tenant_id_timestamp on "signalsContents" (platform, "tenantId", timestamp)
where ("deletedAt" IS NULL);

create index signals_contents_status_tenant_id_timestamp on "signalsContents" (status, "tenantId", timestamp)
where ("deletedAt" IS NULL);

create index signals_contents_tenant_id_timestamp on "signalsContents" ("tenantId", timestamp)
where ("deletedAt" IS NULL);