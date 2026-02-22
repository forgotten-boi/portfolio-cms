-- Insert test tenant
-- Default tenant (matches JwtAuthService default fallback ID)
INSERT INTO "Tenants" ("Id", "Name", "Subdomain", "IsActive", "CreatedAt", "UpdatedAt")
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Default Tenant',
    'default',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Insert default roles
INSERT INTO "Roles" ("Id", "Name", "Description", "CreatedAt", "UpdatedAt")
VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'Admin', 'Administrator role with full access', NOW(), NULL),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Member', 'Regular member with standard access', NOW(), NULL),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'Guest', 'Guest user with limited access', NOW(), NULL)
ON CONFLICT DO NOTHING;

-- Admin user  (password: Admin@123!)
INSERT INTO "Users" ("Id", "TenantId", "Email", "PasswordHash", "FirstName", "LastName", "Role", "AuthProvider", "IsActive", "CreatedAt", "UpdatedAt")
VALUES (
    'a1000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@portfolio.local',
    '$2a$11$dOCbTcqbG8jf0HQLyZliD.dXPlq/HDKUZR6DxS1lwSU2d5Vbm7i1m',
    'Admin',
    'User',
    'Admin',
    'Email',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Member user  (password: Member@123!)
INSERT INTO "Users" ("Id", "TenantId", "Email", "PasswordHash", "FirstName", "LastName", "Role", "AuthProvider", "IsActive", "CreatedAt", "UpdatedAt")
VALUES (
    'a2000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'member@portfolio.local',
    '$2a$11$GU2dYpR9ARF6Sbyicxz7eOzFzjgQBSyQbhKtpsNU0Nv29HcoI5HDK',
    'Member',
    'User',
    'User',
    'Email',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Guest user  (password: Guest@123!)
INSERT INTO "Users" ("Id", "TenantId", "Email", "PasswordHash", "FirstName", "LastName", "Role", "AuthProvider", "IsActive", "CreatedAt", "UpdatedAt")
VALUES (
    'a3000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'guest@portfolio.local',
    '$2a$11$W64nPR8YLjkNvSMm/n/et.PHRa5S4o3.3xRzQunxzcsYDVv4a8TKG',
    'Guest',
    'User',
    'User',
    'Email',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Assign roles via UserRoleAssignments
INSERT INTO "UserRoleAssignments" ("UserId", "RoleId", "AssignedAt")
VALUES
    ('a1000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, NOW()),
    ('a2000000-0000-0000-0000-000000000002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, NOW()),
    ('a3000000-0000-0000-0000-000000000003'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, NOW())
ON CONFLICT DO NOTHING;

SELECT 'Database seeded successfully' AS status;
