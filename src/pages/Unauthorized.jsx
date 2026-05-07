export default function Unauthorized() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="max-w-xl rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Unauthorized</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">You are not authorized to view this page</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your account does not have permission to access this section. Please contact your administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}
