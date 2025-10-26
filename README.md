This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

UI library: [shadcn](https://ui.shadcn.com/docs/installation/next)

CSS Styling: [tailwindcss](https://tailwindcss.com/)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Create a new env
- Copy past env variables from .env.local

### MySQL in AWS (crypto DB)
- Create `MYSQL_...` env variables suitable for the env DB: Create simple MySQL DB in [AWS](/Users/serhiilyzun/Documents/Sturtaps/Crypto/cryptoindex/.env.local)
- Use DBeaver to dumb and restore in a new one(restore data without userId records)
- - In the dumb before restore:
- - - -- Comment out or remove these types of lines:
      -- SET @@GLOBAL.GTID_PURGED=...
- Add new DB to the DBeaver

### Prisma (Auth db)
- Create a new [DB](https://console.prisma.io/cmcq1krs6016gym0vuxrxzvbf/cmcq1s3sp026z2s0v6cpfkw7i/cmcq1s3sp02702s0vqilnezkn/dashboard)
- Create a new Resend [Api key](https://resend.com/api-keys)
- Set up DB: run `yarn prisma:env`
- To check in DBeaver: run `yarn prisma:tunnel`

### Vercel (Env vars)
- Add env variables to the [env](https://vercel.com/boxiors-projects/indexopia/settings/environment-variables)

### Cron jobs (Populate DB + System indices)
- [QStash](https://console.upstash.com/qstash/schedules?teamid=0)

