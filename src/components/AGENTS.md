# components/ - Shared UI Components

This directory contains reusable UI components shared across the application.

## Structure

```
components/
├── ui/                 # shadcn/ui primitives (button, card, input, etc.)
├── layouts/            # Layout components (sidebar, header, etc.)
└── [component].tsx     # App-specific shared components
```

## Rules

### shadcn/ui Components Live in `ui/`

Don't modify shadcn components directly. Instead, compose them:

```tsx
// ✅ Good: Compose shadcn components
// components/submit-button.tsx
import { Button } from '@/components/ui/button'

export function SubmitButton({ loading, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading ? <Spinner /> : props.children}
    </Button>
  )
}
```

### Keep Components Generic

Shared components should not contain feature-specific logic:

```tsx
// ✅ Good: Generic, reusable
export function DataCard({ title, value, trend }) {
  return (...)
}

// ❌ Bad: Feature-specific
export function ProjectStatsCard({ projectId }) {
  const stats = useProjectStats(projectId)  // Feature-specific hook
  return (...)
}
```

### Composition Over Props

Prefer composition via children/slots over many props:

```tsx
// ✅ Good: Composable
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Avoid: Prop explosion
<Card 
  title="Title" 
  subtitle="Sub" 
  content="..." 
  footer="..." 
  showBorder
  variant="outlined"
/>
```

### No Feature Imports

Components CANNOT import from `@/features/*` or `@/app/*`:

```tsx
// ❌ Forbidden
import { useAuth } from '@/features/auth/hooks/use-auth'

// ✅ Allowed
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
```

## Styling

- Use Tailwind CSS for styling
- Use `cn()` utility for conditional classes
- Follow shadcn/ui patterns for variants (cva)

```tsx
import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return (
    <div 
      className={cn('rounded-lg border bg-card p-4', className)} 
      {...props} 
    />
  )
}
```
