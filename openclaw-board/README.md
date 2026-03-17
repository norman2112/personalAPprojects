# OPENCLAW // Board

CLI-style personal kanban board powered by AgilePlace MCP.

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` with your values:

```
AGILEPLACE_API_TOKEN=your_token
AGILEPLACE_BOARD_ID=2431674904
AGILEPLACE_HOST=ngarrett.leankit.com
```

## Run locally

```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add env vars in Vercel dashboard:
   - `AGILEPLACE_API_TOKEN`
   - `AGILEPLACE_BOARD_ID`
   - `AGILEPLACE_HOST`
4. Deploy

## Features

- Live data from AgilePlace API (30s auto-refresh)
- CLI aesthetic — green on black, boot sequence, monospace
- Card headers displayed as category labels
- Click cards for detail panel, ESC to close
- API token stays server-side (Next.js API route)
- Mobile-friendly (unlike AgilePlace itself)
