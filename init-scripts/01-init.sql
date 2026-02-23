-- =============================================================================
-- Portfolio CMS - Database Initialization Script
-- Runs automatically via docker-entrypoint-initdb.d when PostgreSQL starts
-- DO NOT modify the __EFMigrationsHistory entries; they prevent EF from
-- re-running these migrations when the API starts.
-- =============================================================================

-- ----------------------------------------
-- Schema: Tables (mirrors EF Core migrations)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "Tenants" (
    "Id"         uuid                        NOT NULL,
    "Name"       character varying(200)      NOT NULL,
    "Subdomain"  character varying(100)      NOT NULL,
    "IsActive"   boolean                     NOT NULL DEFAULT true,
    "CreatedAt"  timestamp with time zone    NOT NULL DEFAULT NOW(),
    "UpdatedAt"  timestamp with time zone,
    CONSTRAINT "PK_Tenants" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_Tenants_Subdomain" ON "Tenants" ("Subdomain");

CREATE TABLE IF NOT EXISTS "Users" (
    "Id"               uuid                        NOT NULL,
    "TenantId"         uuid                        NOT NULL,
    "Email"            character varying(255)      NOT NULL,
    "PasswordHash"     text,
    "FirstName"        character varying(100),
    "LastName"         character varying(100),
    "ProfileImageUrl"  text,
    "Role"             text                        NOT NULL,
    "AuthProvider"     text                        NOT NULL,
    "ExternalId"       text,
    "IsActive"         boolean                     NOT NULL DEFAULT true,
    "CreatedAt"        timestamp with time zone    NOT NULL DEFAULT NOW(),
    "UpdatedAt"        timestamp with time zone,
    "LastLoginAt"      timestamp with time zone,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Users_Tenants_TenantId" FOREIGN KEY ("TenantId")
        REFERENCES "Tenants" ("Id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email_TenantId" ON "Users" ("Email", "TenantId");
CREATE INDEX IF NOT EXISTS "IX_Users_TenantId" ON "Users" ("TenantId");

CREATE TABLE IF NOT EXISTS "Blogs" (
    "Id"               uuid                        NOT NULL,
    "TenantId"         uuid                        NOT NULL,
    "AuthorId"         uuid                        NOT NULL,
    "Title"            character varying(500)      NOT NULL,
    "Slug"             character varying(500)      NOT NULL,
    "Content"          text                        NOT NULL,
    "Summary"          text,
    "HeaderImageUrl"   text,
    "IsPublished"      boolean                     NOT NULL DEFAULT false,
    "PublishedAt"      timestamp with time zone,
    "CreatedAt"        timestamp with time zone    NOT NULL DEFAULT NOW(),
    "UpdatedAt"        timestamp with time zone,
    "ViewCount"        integer                     NOT NULL DEFAULT 0,
    "Tags"             text                        NOT NULL DEFAULT '[]',
    CONSTRAINT "PK_Blogs" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Blogs_Tenants_TenantId" FOREIGN KEY ("TenantId")
        REFERENCES "Tenants" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Blogs_Users_AuthorId" FOREIGN KEY ("AuthorId")
        REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "IX_Blogs_TenantId" ON "Blogs" ("TenantId");
CREATE INDEX IF NOT EXISTS "IX_Blogs_AuthorId" ON "Blogs" ("AuthorId");
CREATE INDEX IF NOT EXISTS "IX_Blogs_Slug" ON "Blogs" ("Slug");

CREATE TABLE IF NOT EXISTS "Portfolios" (
    "Id"                   uuid                        NOT NULL,
    "TenantId"             uuid                        NOT NULL,
    "UserId"               uuid                        NOT NULL,
    "Title"                character varying(200)      NOT NULL,
    "Subtitle"             text,
    "Bio"                  text,
    "ProfileImageUrl"      text,
    "ResumeUrl"            text,
    "LinkedInUrl"          text,
    "GitHubUrl"            text,
    "WebsiteUrl"           text,
    "Template"             text                        NOT NULL DEFAULT 'Default',
    "FeaturedBlogsEnabled" boolean                     NOT NULL DEFAULT false,
    "MaxFeaturedBlogs"     integer                     NOT NULL DEFAULT 3,
    "WorkExperiences"      text                        NOT NULL DEFAULT '[]',
    "Educations"           text                        NOT NULL DEFAULT '[]',
    "Skills"               text                        NOT NULL DEFAULT '[]',
    "Projects"             text                        NOT NULL DEFAULT '[]',
    "Certifications"       text                        NOT NULL DEFAULT '[]',
    "Slug"                 character varying(200),
    "IsPublished"          boolean                     NOT NULL DEFAULT false,
    "PublishedAt"          timestamp with time zone,
    "CreatedAt"            timestamp with time zone    NOT NULL DEFAULT NOW(),
    "UpdatedAt"            timestamp with time zone,
    CONSTRAINT "PK_Portfolios" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Portfolios_Tenants_TenantId" FOREIGN KEY ("TenantId")
        REFERENCES "Tenants" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Portfolios_Users_UserId" FOREIGN KEY ("UserId")
        REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_Portfolios_TenantId" ON "Portfolios" ("TenantId");
CREATE INDEX IF NOT EXISTS "IX_Portfolios_UserId" ON "Portfolios" ("UserId");

CREATE TABLE IF NOT EXISTS "Roles" (
    "Id"          uuid                        NOT NULL,
    "Name"        character varying(50)       NOT NULL,
    "Description" character varying(500)      NOT NULL DEFAULT '',
    "CreatedAt"   timestamp with time zone    NOT NULL DEFAULT NOW(),
    "UpdatedAt"   timestamp with time zone,
    CONSTRAINT "PK_Roles" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_Roles_Name" ON "Roles" ("Name");

CREATE TABLE IF NOT EXISTS "UserRoleAssignments" (
    "UserId"     uuid                        NOT NULL,
    "RoleId"     uuid                        NOT NULL,
    "AssignedAt" timestamp with time zone    NOT NULL DEFAULT NOW(),
    "AssignedBy" uuid,
    CONSTRAINT "PK_UserRoleAssignments" PRIMARY KEY ("UserId", "RoleId"),
    CONSTRAINT "FK_UserRoleAssignments_Users_UserId"  FOREIGN KEY ("UserId")
        REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_UserRoleAssignments_Roles_RoleId" FOREIGN KEY ("RoleId")
        REFERENCES "Roles" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_UserRoleAssignments_RoleId" ON "UserRoleAssignments" ("RoleId");

-- EF Core migrations history (prevents re-running migrations)
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId"    character varying(150) NOT NULL,
    "ProductVersion" character varying(32)  NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion") VALUES
    ('20251113130336_InitialCreate',                        '10.0.0'),
    ('20251113150533_AddRolesAndUserRoleAssignments',        '10.0.0'),
    ('20251113172110_AddPortfolioSlugAndPublishFields',      '10.0.0')
ON CONFLICT DO NOTHING;

-- ----------------------------------------
-- Seed Data
-- ----------------------------------------

-- Default tenant (ID matches JwtAuthService & RegisterUserCommandHandler fallback)
INSERT INTO "Tenants" ("Id", "Name", "Subdomain", "IsActive", "CreatedAt", "UpdatedAt")
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Default Tenant',
    'default',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Roles
INSERT INTO "Roles" ("Id", "Name", "Description", "CreatedAt")
VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'Admin',  'Administrator with full access',     NOW()),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Member', 'Regular member with standard access', NOW()),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'Guest',  'Guest user with limited access',      NOW())
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------
-- Test users for E2E and manual testing
-- Tenant: default (00000000-0000-0000-0000-000000000001)
-- -----------------------------------------------------------------------
--
--  Role    | Email                    | Password      | TenantId
--  --------|--------------------------|---------------|----------------------------
--  Admin   | admin@portfolio.local    | Admin@123!    | 00000000-0000-0000-0000-000000000001
--  Member  | member@portfolio.local   | Member@123!   | 00000000-0000-0000-0000-000000000001
--  Guest   | guest@portfolio.local    | Guest@123!    | 00000000-0000-0000-0000-000000000001
--
-- Hashes generated with BCrypt.Net cost=11
-- -----------------------------------------------------------------------

INSERT INTO "Users" ("Id", "TenantId", "Email", "PasswordHash", "FirstName", "LastName",
                     "Role", "AuthProvider", "IsActive", "CreatedAt", "UpdatedAt")
VALUES
    (
        'a1000000-0000-0000-0000-000000000001'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'admin@portfolio.local',
        '$2a$11$dOCbTcqbG8jf0HQLyZliD.dXPlq/HDKUZR6DxS1lwSU2d5Vbm7i1m',
        'Admin', 'User',
        'Admin', 'Email',
        true, NOW(), NOW()
    ),
    (
        'a2000000-0000-0000-0000-000000000002'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'member@portfolio.local',
        '$2a$11$GU2dYpR9ARF6Sbyicxz7eOzFzjgQBSyQbhKtpsNU0Nv29HcoI5HDK',
        'Member', 'User',
        'User', 'Email',
        true, NOW(), NOW()
    ),
    (
        'a3000000-0000-0000-0000-000000000003'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'guest@portfolio.local',
        '$2a$11$W64nPR8YLjkNvSMm/n/et.PHRa5S4o3.3xRzQunxzcsYDVv4a8TKG',
        'Guest', 'User',
        'User', 'Email',
        true, NOW(), NOW()
    )
ON CONFLICT DO NOTHING;

-- Role assignments
INSERT INTO "UserRoleAssignments" ("UserId", "RoleId", "AssignedAt")
VALUES
    ('a1000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, NOW()),
    ('a2000000-0000-0000-0000-000000000002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, NOW()),
    ('a3000000-0000-0000-0000-000000000003'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, NOW())
ON CONFLICT DO NOTHING;

SELECT 'Portfolio CMS database initialized successfully' AS status;
