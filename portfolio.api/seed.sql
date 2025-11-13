-- Insert test tenant
INSERT INTO "Tenants" ("Id", "Name", "Subdomain", "IsActive", "CreatedAt", "UpdatedAt")
VALUES (
    'a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d'::uuid,
    'Test Tenant',
    'test',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Insert test user with bcrypt hashed password (password: Test123!)
-- Hash generated from: echo -n 'Test123!' | bcrypt - (example hash)
INSERT INTO "Users" ("Id", "TenantId", "Email", "PasswordHash", "FirstName", "LastName", "Role", "AuthProvider", "IsActive", "CreatedAt", "UpdatedAt")
VALUES (
    'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e'::uuid,
    'a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d'::uuid,
    'test@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jXX.H6',
    'Test',
    'User',
    'Admin',
    'Local',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

SELECT 'Database seeded successfully' AS status;
