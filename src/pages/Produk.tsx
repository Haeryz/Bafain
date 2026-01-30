import PageLayout from "@/components/PageLayout"

export function Produk() {
  return (
    <PageLayout>
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="font-['Sora'] text-3xl font-semibold text-slate-900">
            Produk
          </h1>
          <p className="mt-4 text-sm text-slate-600">
            Detail produk akan segera dilengkapi. Pantau halaman Start untuk
            informasi terbaru tentang Solar Dryer Bafain.
          </p>
        </div>
      </section>
    </PageLayout>
  )
}

export default Produk
