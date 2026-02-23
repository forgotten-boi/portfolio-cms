-- Fix AuthProvider for all local users (should be 'Email' not 'Local')
UPDATE "Users" 
SET "AuthProvider" = 'Email'
WHERE "AuthProvider" = 'Local';
