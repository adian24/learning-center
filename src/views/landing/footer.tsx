"use client";

import Link from "next/link";

export default function ElegantFooter() {
  return (
    <footer className="relative bg-white text-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl font-bold text-sky-700">
              Learning Center
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-600 mb-6">
            Learning Center adalah platform e-learning modern yang menyediakan
            pelatihan online untuk pengembangan karier, sertifikasi profesional,
            dan keterampilan masa depan.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-gray-900 border-b-2 border-sky-500 inline-block">
            Kategori Pelatihan
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link href="#">» Bisnis & Manajemen</Link>
            </li>
            <li>
              <Link href="#">» Desain & Kreatif</Link>
            </li>
            <li>
              <Link href="#">» Pengembangan Pribadi</Link>
            </li>
            <li>
              <Link href="#">» Sertifikasi Profesional</Link>
            </li>
            <li>
              <Link href="#">» Teknologi & Pemrograman</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-gray-900 border-b-2 border-sky-500 inline-block">
            Bantuan
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link href="#">» Pusat Bantuan</Link>
            </li>
            <li>
              <Link href="#">» FAQ</Link>
            </li>
            <li>
              <Link href="#">» Hubungi Kami</Link>
            </li>
            <li>
              <Link href="#">» Panduan Pengguna</Link>
            </li>
            <li>
              <Link href="#">» Laporan Masalah</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-gray-900 border-b-2 border-sky-500 inline-block">
            Tautan Cepat
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link href="#">» Semua Kelas</Link>
            </li>
            <li>
              <Link href="#">» Tentang Kami</Link>
            </li>
            <li>
              <Link href="#">» Partner</Link>
            </li>
            <li>
              <Link href="#">» Kebijakan Privasi</Link>
            </li>
            <li>
              <Link href="#">» Syarat & Ketentuan</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-28 bg-contain bg-no-repeat bg-bottom bg-[url('/footer-silhouette.svg')] opacity-10"></div>

      <div className="text-center pt-6 text-xs text-gray-500 border-t border-gray-200">
        © {new Date().getFullYear()} Learning Center. Semua hak dilindungi
        undang-undang.
      </div>
    </footer>
  );
}
