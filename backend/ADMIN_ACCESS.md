# How to Get Admin Access

## Method 1: Using the Script (Easiest)

From the `backend` directory, run:
```bash
npx ts-node scripts/makeAdmin.ts <email-or-username>
```

Example:
```bash
npx ts-node scripts/makeAdmin.ts user@example.com
```

## Method 2: Using MongoDB Compass or MongoDB Shell

1. Connect to your MongoDB database using the connection string from your `.env` file
2. Navigate to the `users` collection
3. Find your user document
4. Update the `role` field from `"user"` to `"admin"`

**MongoDB Shell command:**
```javascript
use sweet-shop
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

**Or by username:**
```javascript
db.users.updateOne(
  { username: "yourusername" },
  { $set: { role: "admin" } }
)
```

## Method 3: Using MongoDB Atlas Web Interface

1. Go to MongoDB Atlas
2. Navigate to your cluster → Collections
3. Find the `users` collection in your database
4. Click on your user document
5. Edit the `role` field to `"admin"`
6. Save

## After Making Yourself Admin

1. **Log out** from the application
2. **Log back in** with your credentials
3. You should now see:
   - An "Admin" badge next to your username
   - "Add New Sweet" button
   - Edit, Delete, and Restock buttons on sweet cards

## Admin Features

Once you have admin access, you can:
- ✅ Add new sweets
- ✅ Edit existing sweets
- ✅ Delete sweets
- ✅ Restock sweets

Regular users can only:
- View sweets
- Search sweets
- Purchase sweets

