/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "andres-nutricion-web",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Nextjs("Web", {
      domain: {
        name: "andresburbanonutricionista.com",
        redirects: ["www.andresburbanonutricionista.com"],
      },
      server: {
        install: ["pg"],
      },
      transform: {
        server: {
          logging: {
            retention: "1 week",
          },
          transform: {
            logGroup: {
              retentionInDays: 7,
            },
          },
        },
        imageOptimizer: {
          logging: {
            retention: "1 week",
          },
          transform: {
            logGroup: {
              retentionInDays: 7,
            },
          },
        },
      },
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        NEXT_PUBLIC_PAYPHONE_TOKEN: process.env.NEXT_PUBLIC_PAYPHONE_TOKEN!,
        PAYPHONE_SECRET_KEY: process.env.PAYPHONE_SECRET_KEY!,
        GOOGLE_CALENDAR_CLIENT_EMAIL: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL!,
        GOOGLE_CALENDAR_PRIVATE_KEY: process.env.GOOGLE_CALENDAR_PRIVATE_KEY!,
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
        RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY!,
        RESEND_API_KEY: process.env.RESEND_API_KEY!,
        CRON_SECRET: process.env.CRON_SECRET!,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
        JWT_SECRET: process.env.JWT_SECRET!,
      },
    });
  },
});