export default function SkeletonLoader({ className = 'h-24 w-full' }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}
