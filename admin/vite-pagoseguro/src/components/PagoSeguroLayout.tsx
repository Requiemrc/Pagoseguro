export default function PagoSeguroLayout({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center">
      <div className="w-full max-w-3xl px-4 py-6">
        <h1 className="text-xl font-semibold text-[#0F3D91] mb-6">
          {title}
        </h1>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
