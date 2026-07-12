-- Account utenti (idempotent)
INSERT INTO "users" ("name", "email", "password", "role", "createdAt", "updatedAt")
VALUES
  ('Super Admin', 'superadmin@nagma.it', '$2b$10$LOoHPksbhevRWrEGp41AIe61GX9wJlXKuipS3OIaNA9PvGBuYjy/G', 'SUPER_ADMIN'::"Role", NOW(), NOW()),
  ('Miriam', 'miriam@nagma.it', '$2b$10$cKLfCAQQzvSEH0/mZoeAHepLeTx5N9kH8uk.84U7Zz5mRwPTkfN1C', 'ADMIN'::"Role", NOW(), NOW()),
  ('Giuseppe', 'giuseppe@nagma.it', '$2b$10$cKLfCAQQzvSEH0/mZoeAHepLeTx5N9kH8uk.84U7Zz5mRwPTkfN1C', 'ADMIN'::"Role", NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;
