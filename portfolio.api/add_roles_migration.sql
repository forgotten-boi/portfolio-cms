-- Create Roles table
CREATE TABLE "Roles" (
    "Id" uuid NOT NULL,
    "Name" character varying(50) NOT NULL,
    "Description" character varying(500) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_Roles" PRIMARY KEY ("Id")
);

-- Create UserRoleAssignments table
CREATE TABLE "UserRoleAssignments" (
    "UserId" uuid NOT NULL,
    "RoleId" uuid NOT NULL,
    "AssignedAt" timestamp with time zone NOT NULL,
    "AssignedBy" uuid,
    CONSTRAINT "PK_UserRoleAssignments" PRIMARY KEY ("UserId", "RoleId"),
    CONSTRAINT "FK_UserRoleAssignments_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_UserRoleAssignments_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO "Roles" ("Id", "Name", "Description", "CreatedAt", "UpdatedAt")
VALUES 
    ('11111111-1111-1111-1111-111111111111'::uuid, 'Admin', 'Administrator role with full access', NOW(), NULL),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Member', 'Regular member with standard access', NOW(), NULL),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'Guest', 'Guest user with limited access', NOW(), NULL);

-- Create indexes
CREATE UNIQUE INDEX "IX_Roles_Name" ON "Roles" ("Name");
CREATE INDEX "IX_UserRoleAssignments_RoleId" ON "UserRoleAssignments" ("RoleId");

-- Assign Admin role to admin test user
INSERT INTO "UserRoleAssignments" ("UserId", "RoleId", "AssignedAt", "AssignedBy")
VALUES ('a1000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, NOW(), NULL)
ON CONFLICT DO NOTHING;

-- Insert migration history record
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20251113150533_AddRolesAndUserRoleAssignments', '10.0.0');

SELECT 'Roles and UserRoleAssignments migration applied successfully' AS status;
