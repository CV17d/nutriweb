import Hero from "../components/Hero";
import About from "../components/About";
import Methodology from "../components/Methodology";
import Pricing from "../components/Pricing";
import Location from "../components/Location";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import WhatsAppFAB from "../components/WhatsAppFAB";
import { query } from "../lib/db";

// Revalidar en segundo plano cada 60 segundos para renderizado instantáneo
export const revalidate = 60;

async function getSiteData() {
  try {
    const [settingsRes, plansRes, casesRes] = await Promise.all([
      query('SELECT key, value FROM web_settings'),
      query('SELECT * FROM plans WHERE is_active = true ORDER BY price ASC'),
      query('SELECT * FROM success_cases WHERE is_active = true ORDER BY created_at DESC')
    ]);

    const settings = settingsRes.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, any>);

    return {
      settings,
      plans: plansRes.rows,
      cases: casesRes.rows
    };
  } catch (error) {
    console.error("Error loading site data:", error);
    return { settings: {}, plans: [], cases: [] };
  }
}

export default async function Home() {
  const { settings, plans, cases } = await getSiteData();

  return (
    <main className="flex flex-col items-center justify-start w-full relative">
      <Hero data={settings.hero} />
      <About data={settings.about} />
      <Methodology data={settings.methodology} />
      <Pricing plans={plans} />
      <Location />
      <Testimonials cases={cases} />
      <Footer />
      <WhatsAppFAB />
    </main>
  );
}
