# Firestore Security Rules Setup

## Current Issue
The app is showing "Missing or insufficient permissions" because Firestore security rules are blocking access.

## Recommended Security Rules

### Option 1: Development Rules (Permissive)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read prompts and users (public data)
    match /prompts/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /users/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.id;
    }
    
    // All other collections require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Option 2: Production Rules (More Secure)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Prompts: Anyone can read, only authenticated users can write
    match /prompts/{promptId} {
      allow read: if true;
      allow create: if request.auth != null 
        && request.auth.uid != null
        && request.resource.data.authorUsername is string;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
    
    // Users: Anyone can read profiles, only owner can write
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Comments: Authenticated users only
    match /comments/{commentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Option 3: Super Permissive (Testing Only)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## How to Apply Rules

1. Go to [Firebase Console](https://console.firebase.google.com/project/gem-prompt)
2. Click "Firestore Database" in the left sidebar
3. Click the "Rules" tab
4. Replace the existing rules with one of the options above
5. Click "Publish"

## Recommended Approach

1. **Start with Option 1** (Development Rules) to get the app working
2. **Test all functionality** (sign in, view prompts, seed database)
3. **Switch to Option 2** (Production Rules) when ready for production
4. **Never use Option 3** in production (security risk)

## Testing the Rules

After applying rules, test in browser console:
```javascript
debug.testConnection()
debug.seedAll()
```