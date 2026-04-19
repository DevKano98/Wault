export default function PageWrapper({ children, className = '' }) {
  return (
    <div className="app-shell">
      <main className={`mx-auto max-w-md px-4 pb-28 pt-6 ${className}`}>{children}</main>
    </div>
  );
}
