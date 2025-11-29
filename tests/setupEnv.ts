// Setup environment variables that must exist before modules are imported
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
