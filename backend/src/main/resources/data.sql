INSERT INTO roles (id, name, description)
SELECT '550e8400-e29b-41d4-a716-446655440001', 'ADMIN', 'Administrator with full system access'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');

INSERT INTO roles (id, name, description)
SELECT '550e8400-e29b-41d4-a716-446655440002', 'REGULAR', 'Regular user with standard permissions'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'REGULAR');
