# Backend JWT Integration with Clerk

## Issue Summary

The frontend is correctly sending Clerk JWTs to the backend, but the backend is returning `403 Forbidden` for authenticated endpoints like `PATCH /api/v1/athletes/me/profile`.

**What we verified on the frontend:**
- JWT token is being retrieved from Clerk successfully
- Authorization header is being sent: `Authorization: Bearer eyJhbG...`
- Request reaches the backend with the header intact

**Backend response:**
```json
{"detail": "Forbidden"}
```

## Required Backend Configuration

### 1. Clerk Environment Variables

The backend needs these environment variables:

```bash
# Option A: Use Clerk's JWKS endpoint (recommended)
CLERK_ISSUER=https://<your-clerk-domain>.clerk.accounts.dev

# Option B: Use the secret key directly
CLERK_SECRET_KEY=sk_test_...
```

You can find these values in the [Clerk Dashboard](https://dashboard.clerk.com) → API Keys.

### 2. JWT Validation

The backend must validate the JWT using Clerk's public keys. Here's how to do it in common frameworks:

#### FastAPI (Python)

```python
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

CLERK_ISSUER = os.getenv("CLERK_ISSUER")  # e.g., "https://your-app.clerk.accounts.dev"
JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"

security = HTTPBearer()

# Cache the JWKS keys
_jwks_cache = None

async def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            response = await client.get(JWKS_URL)
            _jwks_cache = response.json()
    return _jwks_cache

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    token = credentials.credentials

    try:
        jwks = await get_jwks()

        # Decode and validate the JWT
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            options={"verify_aud": False}  # Clerk doesn't use audience by default
        )

        return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )

# Usage in endpoint
@app.patch("/api/v1/athletes/me/profile")
async def update_profile(
    data: UpdateProfileInput,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]  # Clerk user ID
    # ... update profile
```

#### Express (Node.js)

```javascript
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Middleware to require authentication
app.use('/api/v1', ClerkExpressRequireAuth());

// Or manually verify
import { verifyToken } from '@clerk/clerk-sdk-node';

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await verifyToken(token, {
      issuer: process.env.CLERK_ISSUER,
    });
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Invalid token' });
  }
}
```

### 3. Common Issues & Solutions

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| `403 Forbidden` | Token validation failing silently | Return `401` with error details for debugging |
| `401 Invalid token` | Wrong JWKS URL or issuer | Verify `CLERK_ISSUER` matches your Clerk domain |
| `401 Token expired` | Clock skew or expired token | Add leeway for clock skew (e.g., 60 seconds) |
| `403 Forbidden` after valid token | Authorization check failing | Check role/permission logic in endpoint |

### 4. Debugging Tips

1. **Log the incoming token** (first 20 chars) to verify it's arriving
2. **Log validation errors** - don't just return generic 403
3. **Decode the JWT** at [jwt.io](https://jwt.io) to inspect claims
4. **Check the `sub` claim** - this is the Clerk user ID

### 5. Expected JWT Claims

Clerk JWTs include these claims:

```json
{
  "sub": "user_2abc123...",           // Clerk user ID
  "iss": "https://your-app.clerk.accounts.dev",
  "iat": 1234567890,
  "exp": 1234567890,
  "azp": "your-client-id",
  "metadata": {                        // Custom claims (if configured)
    "role": "athlete"
  }
}
```

### 6. Testing the Integration

Once configured, test with curl:

```bash
# Get a token from the frontend console:
# await window.Clerk.session.getToken()

TOKEN="eyJhbG..."

curl -X GET http://localhost:8765/api/v1/athletes/me/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## Frontend Configuration

The frontend is already configured to:
1. Retrieve JWTs from Clerk via `getToken()`
2. Send them as `Authorization: Bearer <token>` headers
3. Proxy requests through Next.js to avoid CORS issues

No frontend changes are needed.

## Resources

- [Clerk Backend SDK Documentation](https://clerk.com/docs/references/backend/overview)
- [Clerk JWT Verification](https://clerk.com/docs/backend-requests/handling/manual-jwt)
- [FastAPI + Clerk Example](https://clerk.com/docs/references/python/overview)
