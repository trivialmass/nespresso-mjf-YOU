# Deploy to Infomaniak (Apache + PHP + MySQL)

## 1. Build the frontend
```bash
npm run build
```

## 2. Set up MySQL on Infomaniak
In your Infomaniak Manager → Hosting → Databases:
- Create a MySQL database
- Note: host, database name, username, password

## 3. Upload to your server
Upload the **contents of `dist/`** plus the **`php-backend/`** files to your web root:

```
public_html/
├── index.html          ← from dist/
├── assets/             ← from dist/assets/
├── .htaccess           ← from php-backend/
└── api/
    └── save-result.php ← from php-backend/api/
```

## 4. Configure DB credentials
Edit `api/save-result.php` and replace the placeholder values:
```php
$host = 'your-mysql-host.infomaniak.com';
$db   = 'your_db_name';
$user = 'your_db_user';
$pass = 'your_db_password';
```
Or set them as environment variables in your Infomaniak hosting config.

The `results` table is created automatically on the first request.

## 5. Done
Visit your domain — the app runs fully client-side, results are saved to MySQL via `api/save-result.php`.
