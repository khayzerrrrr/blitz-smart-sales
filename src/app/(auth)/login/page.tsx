export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
      <h1 className="text-center text-2xl font-bold text-foreground">
        Blitz<span className="text-orange-500">CRM</span>
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Silakan login untuk melanjutkan
      </p>
      <div className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none"
        />
        <button className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors">
          Masuk
        </button>
      </div>
    </div>
  )
}
