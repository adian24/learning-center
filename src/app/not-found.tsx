import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 text */}
        <h1 className="text-9xl font-extrabold text-primary tracking-widest">
          404
        </h1>

        {/* SVG illustration */}
        <div className="relative w-full h-40 my-8">
          <svg
            className="w-full h-full"
            viewBox="0 0 800 300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M169.8 50.7c25.1-10.3 52.5-12.3 78.9-6 26.3 6.3 50.2 20.7 68.5 40.6 13.3 14.5 24.4 32 25.4 51.7 1 19.6-9.2 38.3-22.5 52.8-13.3 14.5-29.8 25.9-46.3 37.3-22.2 15.2-45.1 31.3-72.1 34.1-26.9 2.8-55.3-7.5-72.9-26.3-15.1-16.1-22.6-37.5-28.2-58.4-5.7-21.2-10.2-42.9-7.8-64.8 2.4-21.8 11.8-43.4 28.2-58.3 16.4-15 39.1-22.4 58.8-14.5"
              fill="#f1f5f9"
              transform="translate(230 30)"
            />
            <path
              d="M150 150l80-30 60 20c20 6.7 40 13.3 50 30 10 16.7 10 43.3 0 60-10 16.7-30 23.3-50 30-33.3 11.1-66.7 22.2-100 10-33.3-12.2-66.7-47.8-70-80-3.3-32.2 23.3-60.8 50-70"
              fill="#e2e8f0"
              transform="translate(230 30)"
            />
            <ellipse cx="400" cy="270" rx="180" ry="15" fill="#cbd5e1" />
            <path
              fill="none"
              stroke="#475569"
              strokeLinecap="round"
              strokeWidth="5"
              d="M290 225c10-50 70-50 80 0M430 225c10-50 70-50 80 0"
            />
            <path
              fill="#475569"
              d="M354.5 223.1c7.4.6 14.9.2 22.3-.2 3.7-.2 7.3-.5 11-.7 3.7-.2 7.3-.5 11-.7.9-.1 1.3-1.4.4-1.5-7.4-.6-14.9-.2-22.3.2-3.7.2-7.3.5-11 .7-3.7.2-7.3.5-11 .7-.9.1-1.4 1.3-.4 1.5z"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">
            Oops! Page Not Found
          </h2>
          <p className="text-slate-600">
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-md text-primary bg-white border-primary hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
