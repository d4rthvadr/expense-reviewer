-- Since johndoe is already the superuser, we don't need to create it
-- We also don't need to create the mydb database as it's created by the POSTGRES_DB environment variable

-- Grant all privileges on all tables (current and future)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO johndoe;
GRANT ALL PRIVILEGES ON SCHEMA public TO johndoe;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO johndoe;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO johndoe;