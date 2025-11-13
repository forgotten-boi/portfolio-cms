-- Create default tenant
INSERT INTO "Tenants" ("Id", "Name", "Subdomain", "IsActive", "CreatedAt", "UpdatedAt")
VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Default Tenant',
    'default',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

SELECT 'Default tenant created successfully' AS status;
