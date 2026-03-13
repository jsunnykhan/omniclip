# Admin Initialization & Recovery

OmniClip relies on a strict role hierarchy for administration:
- **`super_admin`**: The absolute owner. Can view all data, invite/upgrade ordinary users into administrators, and generate promo codes.
- **`admin`**: Staff accounts who help manage the platform. Can view users, revoke device limits, and manage promo codes, but cannot promote other admins.
- **`user`**: Standard clients.

By default, the `super_admin` is hard-coded as **`jsuunykhan2@gmail.com`**.

## How to Initialize

During the initial server setup, the latest database migrations (`cargo sqlx migrate run`) will automatically inject the `super_admin` into the database if the email doesn't already exist. A temporary dummy password is provided.

`cargo sqlx prepare` should be run to generate the latest schema file.

For security, **log into the admin dashboard immediately and reset the password using standard email flows.**

## Emergency Recovery

If you get locked out of the dashboard, accidentally delete your `super_admin`, or the role breaks, you can use raw SQL query execution directly on the PostgreSQL database to force a recovery.

### Local / Docker Recovery
If you're running the standard OmniClip `docker-compose.yml`, access the PostgreSQL instance:

```bash
docker exec -it omniclip-db psql -U YOUR_DB_USER -d omniclip
```

If you are using a managed database (like Supabase, AWS RDS, Neon, etc.), open the SQL Editor console provided by your host.

### Recovery Scripts

**1. If `jsuunykhan2@gmail.com` exists but the role broke or downgraded:**
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'jsuunykhan2@gmail.com';
```

**2. If `jsuunykhan2@gmail.com` was completely deleted:**
```sql
-- Re-inserts the master account with role super_admin. The hashed password is "tanpura123@@"
INSERT INTO users (email, password_hash, role)
VALUES ('jsuunykhan2@gmail.com', '$2b$12$K899k1P5P0eUo3A.z09ZlOE5h6lP3i6W1B.eN4A0sTkF0bE87n9vS', 'super_admin');
```

After executing either script, your `super_admin` dashboard access is instantly restored.
