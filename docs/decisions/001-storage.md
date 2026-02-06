# ADR 001: Use Convex Storage for Photos

## Status

Accepted

## Context

Need to store photos uploaded by wedding guests. Evaluated several options:

| Option | Pros | Cons |
|--------|------|------|
| Convex Storage | Built-in, zero config, native integration | Tied to Convex |
| Uploadthing | Easy setup, good DX | Extra service, 2GB free |
| Vercel Blob | Simple if on Vercel | 1GB free, Vercel lock-in |
| Cloudflare R2 | No egress fees, 10GB free | More setup |
| AWS S3 | Most flexible | Complex, egress costs |
| Google Drive | Free 15GB | API limits, auth complexity |

## Decision

Use **Convex File Storage** because:

1. Already using Convex for backend - zero additional setup
2. Native integration with mutations and queries
3. Upload URLs work well with client-side uploads
4. Free tier (1GB) sufficient for one wedding
5. Can migrate to R2/S3 later if needed

## Upload Flow

```typescript
// 1. Generate upload URL (requires Convex mutation)
const uploadUrl = await generateUploadUrl();

// 2. Upload file directly to Convex storage
const result = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": image.type },
  body: imageBlob,
});
const { storageId } = await result.json();

// 3. Create photo record with storageId
await createPhoto({ storageId, eventId, guestId });
```

## Consequences

- Storage costs included in Convex pricing
- If we outgrow free tier, will need to evaluate R2 or S3
- Upload URLs are temporary - cannot pre-generate for offline use
