import { CheckoutDownloads } from '@/components/sections/checkout-downloads';

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const { reference } = await searchParams;
  return (
    <main className="container-shell min-h-[65vh] py-20">
      <CheckoutDownloads reference={reference || ''} />
    </main>
  );
}