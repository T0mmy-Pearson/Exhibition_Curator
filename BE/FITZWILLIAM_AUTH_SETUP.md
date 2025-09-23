# Fitzwilliam Museum API Authentication Setup

## Overview
The Fitzwilliam Museum API requires authentication for all requests. Here's how to set it up:

## Option 1: Finding Your API Token/Bearer Token

After logging into the Fitzwilliam Museum API portal at https://data.fitzmuseum.cam.ac.uk/api/login:

1. **Check Your Browser's Developer Tools:**
   - Open Developer Tools (F12)
   - Go to the Application/Storage tab
   - Look under "Cookies" for any authentication tokens
   - Look under "Local Storage" or "Session Storage" for tokens

2. **Check Network Requests:**
   - In Developer Tools, go to Network tab
   - Make a request on the website (search for something)
   - Look at the request headers for "Authorization" header
   - Copy the Bearer token value

3. **Look for Account/Profile Section:**
   - Check if there's a "Profile", "Account", or "Developer" section in the interface
   - Look for "API Keys", "Access Tokens", or "Developer Tools"

## Option 2: Programmatic Authentication

If you can't find a direct API key, use your login credentials:

1. Set your credentials in the `.env` file:
```bash
FITZWILLIAM_USERNAME=your-email@example.com
FITZWILLIAM_PASSWORD=your-password
```

2. Our service will automatically login and get a session token

## Option 3: Session Cookie Method

1. After logging in through the browser, check for session cookies
2. Copy the session cookie value
3. Use it as the API key in the `.env` file

## Testing Your Setup

Run this test to check if your authentication works:

```bash
# Test 1: Check if you can access the API
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     "https://data.fitzmuseum.cam.ac.uk/api/v1/objects?size=1"

# Test 2: Use your credentials with our service
npm run test-fitzwilliam
```

## Environment Variables

Add these to your `.env` file:

```bash
# Option 1: Direct API Key/Token
FITZWILLIAM_MUSEUM_API_KEY=your-api-key-or-bearer-token

# Option 2: Login Credentials (if no direct API key)
FITZWILLIAM_USERNAME=your-email@example.com
FITZWILLIAM_PASSWORD=your-password
```

## Common Authentication Header Formats

The API might expect the token in different formats:
- `Authorization: Bearer YOUR_TOKEN`
- `Authorization: YOUR_TOKEN`
- `X-Auth-Token: YOUR_TOKEN`
- Session cookies

Our service tries multiple formats automatically.

## Rate Limits

- **Standard**: 60 requests per minute
- **Whitelisted**: 300 requests per minute

## Troubleshooting

If you get authentication errors:

1. Check if your token/credentials are correct
2. Make sure the token hasn't expired
3. Try refreshing your login session
4. Contact the museum if you need whitelisting: tickets@museums.cam.ac.uk

## Next Steps

Once you have your credentials:

1. Update the `.env` file with your authentication details
2. Test the API endpoints:
   - `GET /api/artworks/fitzwilliam/search`
   - `GET /api/artworks/fitzwilliam/{uuid}`
3. The Fitzwilliam search will be included in the general search when you use:
   - `GET /api/artworks/search?source=fitzwilliam`
   - `GET /api/artworks/search?source=all` (includes Fitzwilliam + Met Museum)