# ESIM


# 🌍 Worldwide eSIM Comparator

A developer-built, filterable comparison platform for **global eSIM plans** — find the best price, data allowance, validity, and coverage for any country or region.  
Supports **real-time scraping** from multiple providers, affiliate tracking, and user alerts for price drops.

---

## 🚀 Features

- **Global coverage** – compare eSIM plans for 200+ countries & regions
- **Powerful filters** – price, price/GB, data allowance, validity, speed caps, hotspot support
- **Multi-country search** – find the best deal for your travel route
- **Live updates** – automated scrapers for top eSIM providers
- **Price alerts** – email notifications for new deals or price drops
- **Affiliate ready** – outbound click tracking with UTM parameters
- **SEO optimized** – country pages, provider pages, and comparison pages

---

## 🛠 Tech Stack

**Frontend**
- [Next.js 14 (App Router)](https://nextjs.org/) – SSR/ISR for SEO and performance
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) – clean, responsive UI

**Backend**
- Node.js + TypeScript
- API routes (Next.js) or standalone Fastify service
- [Prisma ORM](https://www.prisma.io/) + PostgreSQL
- [BullMQ](https://docs.bullmq.io/) + Redis for scheduled scraping jobs
- [Playwright](https://playwright.dev/) + [Cheerio](https://cheerio.js.org/) for scraping

**Infrastructure**
- [Vercel](https://vercel.com/) (frontend)
- [Railway](https://railway.app/), [Fly.io](https://fly.io/) or [Render](https://render.com/) (backend/DB/Redis)
- [Plausible Analytics](https://plausible.io/) – privacy-friendly stats

---

## 📂 Project Structure

**Directory Layout**
- `apps/frontend` – Next.js UI
- `apps/api` – API or scraping service
- `packages/lib` – shared utilities and types

**Conventions**
- Use `kebab-case` for file and directory names.
- Apps only depend on packages; avoid cross-app imports.
- Expose each package's public API from `src/index.ts`.

