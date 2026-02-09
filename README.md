# 💒 WeWitnessed

A wedding guest photo sharing app. Guests capture moments, couples receive memories.

## ✨ About

WeWitnessed lets wedding guests upload photos from their phones to a shared gallery. No accounts required for guests—just scan a QR code, enter your name, and start capturing moments.

## 📋 Features

| Feature | Status |
|---------|--------|
| Event creation (name, date, custom slug, secret) | Done |
| QR code + share dialog | Done |
| Camera capture (front/back, zoom, flash) | Done |
| Guest identity (device tracking, name prompt) | Done |
| Photo upload to Convex storage | Done |
| Gallery view (grid/list, lightbox, download) | Done |
| Couple auth via URL secret | Done |
| Per-photo visibility toggle (couple) | Done |
| Photo deletion (couple + guest own) | Done |
| PWA (installable) | Done |
| Dark/light/system theme | Done |
| Offline queue | Designed, not built |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Backend | [Convex](https://convex.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Icons | [Lucide](https://lucide.dev/) |
| Language | TypeScript |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev/) account (free tier works)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/wewitnessed.git
cd wewitnessed

# Install dependencies
npm install

# Set up Convex
npx convex dev
```

### Development

Run both Next.js and Convex in development mode:

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```text
wewitnessed/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # Shared UI components
│   ├── features/      # Feature modules (camera, events, guests, photos)
│   ├── hooks/         # Shared hooks
│   ├── lib/           # Configuration & integrations
│   └── utils/         # Pure utility functions
├── convex/            # Convex backend (schema, functions, model/)
└── docs/
    ├── prd/           # Product requirements
    ├── decisions/     # Architecture Decision Records
    └── user-flows.md  # User flow diagrams
```

See `AGENTS.md` files in each directory for detailed conventions.

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx convex dev` | Start Convex dev server |

## 📄 License

Private project. Not open source (yet).
