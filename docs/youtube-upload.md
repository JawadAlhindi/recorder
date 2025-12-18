# YouTube Upload Feature

Upload your screen recordings directly to YouTube with one click.

## How It Works

1. **Record** your screen as usual
2. **Click "Upload to YouTube"** in the recording complete modal
3. **Sign in** with your Google account (first time only)
4. **Fill in** video title, description, and privacy setting
5. **Upload** - your video goes directly to YouTube

## Setup Guide

To enable YouTube uploads, you need to configure Google Cloud credentials. This is a one-time setup that takes about 10 minutes.

> **Note:** You do NOT need Google verification to test the feature. Verification is only required for public release. During development, you can use the app with "test users" without any verification.

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it (e.g., "Record App") → **Create**
4. Wait for the project to be created, then select it

### Step 2: Enable YouTube Data API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for **YouTube Data API v3**
3. Click on it → **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** → **Create**
3. Fill in the required fields:

   **App Information:**
   - App name: `Record`
   - User support email: your email
   - App logo: (optional, skip)

   **Developer contact information:**
   - Email: your email

4. Click **Save and Continue**

5. **Scopes page:**
   - Click **Add or Remove Scopes**
   - In the filter box, search for `youtube.upload`
   - Check the box for `.../auth/youtube.upload`
   - Click **Update** at the bottom
   - You'll see "Scope not verified" warning - **this is OK for testing**
   - Click **Save and Continue**

6. **Test users page (IMPORTANT):**
   - Click **Add Users**
   - Enter your Gmail address (the one you'll use to upload)
   - Click **Add**
   - Click **Save and Continue**

7. Click **Back to Dashboard**

> **Why test users?** While your app is in "Testing" mode, only emails listed as test users can sign in. This lets you develop without Google verification.

### Step 4: Create OAuth Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Record Web Client`
5. **Authorized JavaScript origins** - Click **Add URI** for each:
   - `http://localhost:5173` (for development)
   - `https://record.addy.ie/` (for production, if applicable)
6. Leave "Authorized redirect URIs" empty (not needed for this flow)
7. Click **Create**
8. A popup shows your Client ID - **Copy it**

### Step 5: Add to Your Project

1. In your project root, create a `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

2. Restart your dev server:

```bash
# Stop the server (Ctrl+C) then:
yarn dev
```

### Step 6: Test the Upload

1. Open `http://localhost:5173`
2. Record something
3. Click **Upload to YouTube**
4. Sign in with the Google account you added as a test user
5. Grant permission when prompted
6. Fill in video details and upload!

## Troubleshooting

### "Sign-in popup was closed" error
- Make sure your email is added as a **Test user** in OAuth consent screen
- Make sure you added the `youtube.upload` scope

### "Access denied" error
- Check that YouTube Data API v3 is enabled
- Verify your email is in the test users list

### Popup doesn't appear
- Check if popups are blocked in your browser
- Look for a blocked popup icon in the address bar

### "Invalid origin" error
- Make sure `http://localhost:5173` is in Authorized JavaScript origins
- Check for typos (no trailing slash)

## User Experience

### First-Time Upload

1. Click **Upload to YouTube**
2. Google sign-in popup appears
3. Authorize the app to upload videos
4. Video converts to MP4 automatically
5. Enter video details (title, description, privacy)
6. Click **Upload**
7. View your video on YouTube

### Returning Users

Token is saved in localStorage, so users don't need to sign in again until it expires (1 hour).

## Privacy Settings

- **Private** - Only you can view
- **Unlisted** - Anyone with the link can view (default)
- **Public** - Visible to everyone

## Technical Details

### Architecture

```
src/
  services/
    youtube/
      types.ts      # TypeScript interfaces
      auth.ts       # Google OAuth (GIS)
      upload.ts     # YouTube resumable upload API
    preference/
      youtube.ts    # Token storage
  contexts/
    youtube.tsx     # Auth state context
  components/
    RecordingModal/
      YouTubeMetadataForm.tsx
      UploadProgress.tsx
      UploadComplete.tsx
```

### OAuth Flow

Uses Google Identity Services (GIS) with implicit grant flow:
- Scope: `https://www.googleapis.com/auth/youtube.upload`
- Tokens stored in localStorage with expiration tracking
- Auto-clears expired tokens

### Upload Process

1. Convert WebM → MP4 using FFmpeg.wasm (YouTube prefers MP4)
2. Initialize resumable upload session
3. Upload file with progress tracking via XHR
4. Display success with links to video and YouTube Studio

### Error Handling

- **Auth failed**: Prompts user to try again
- **Upload failed**: Shows error with "Download Instead" fallback
- **Token expired**: Automatically prompts re-authentication

## Going to Production (Optional)

While in "Testing" mode, only emails you add as test users can sign in. For public release:

### Option 1: Keep it Simple (Recommended for small teams)
- Stay in "Testing" mode
- Add team members as test users (up to 100)
- No verification needed

### Option 2: Full Public Release
1. Go to OAuth consent screen → **Publish App**
2. Submit for Google verification
3. Verification requirements for `youtube.upload` scope:
   - Privacy policy URL
   - Terms of service URL
   - Video demonstration of the app
   - Security assessment (for sensitive scopes)
4. Timeline: Can take days to weeks

> **Tip:** Start with Option 1 for development and early users. Only pursue verification when you need more than 100 users.

## Limitations

- **Browser:** Chrome/Chromium only (same as the main app)
- **Video length:** Depends on user's YouTube account (15 min default, longer if verified)
- **YouTube channel:** Users must have a YouTube channel to upload
- **File format:** Converts to MP4 before upload (handled automatically)
