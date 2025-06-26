"use client";

import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  DollarSign,
  Building2,
  Award,
  CheckCircle,
} from "lucide-react";

const companies = [
  {
    id: "tsi",
    name: "TSI",
    jobs: [
      {
        title: "Frontend Developer",
        location: "Jakarta",
        description:
          "Sebagai Frontend Developer, Anda akan bertanggung jawab dalam membangun dan memelihara antarmuka pengguna yang responsif dan intuitif menggunakan teknologi web modern seperti React atau Next.js. Anda akan bekerja sama dengan tim desain dan backend untuk menciptakan pengalaman pengguna yang optimal.",
        level: "PEMULA",
        price: 0,
        category: "Teknologi & Pemrograman",
      },
      {
        title: "QA Tester",
        location: "Remote",
        description:
          "Sebagai QA Tester, Anda akan melakukan pengujian manual dan otomatis untuk memastikan kualitas dan stabilitas perangkat lunak. Anda akan membuat dokumentasi pengujian, melacak bug, serta memberikan umpan balik kepada tim developer.",
        level: "MENENGAH",
        price: 10000,
        category: "Sertifikasi Profesional",
      },
    ],
  },
  {
    id: "dms",
    name: "DMS",
    jobs: [
      {
        title: "Project Manager",
        location: "Bandung",
        description:
          "Sebagai Project Manager, Anda akan memimpin proyek dari awal hingga akhir, mengelola sumber daya, waktu, dan anggaran. Anda akan berkolaborasi dengan tim lintas fungsi dan menjadi penghubung antara klien dan tim teknis.",
        level: "LANJUT",
        price: 0,
        category: "Bisnis & Manajemen",
      },
    ],
  },
  {
    id: "jit",
    name: "JIT",
    jobs: [
      {
        title: "Backend Developer",
        location: "Surabaya",
        description:
          "Bertanggung jawab dalam mengembangkan, mengelola, dan mengoptimalkan API serta sistem backend yang mendukung aplikasi. Anda akan bekerja menggunakan Node.js, Express, atau framework sejenis dengan integrasi ke database relasional/non-relasional.",
        level: "PEMULA",
        price: 5000,
        category: "Teknologi & Pemrograman",
      },
    ],
  },
  {
    id: "pts",
    name: "Panji Teknologi Services",
    jobs: [
      {
        title: "IT Support Specialist",
        location: "Yogyakarta",
        description:
          "Sebagai IT Support Specialist, Anda akan membantu menyelesaikan permasalahan teknis sehari-hari, menjaga infrastruktur TI tetap berjalan lancar, serta mendukung kebutuhan sistem internal perusahaan.",
        level: "MENENGAH",
        price: 7000,
        category: "Teknologi & Pemrograman",
      },
    ],
  },
];

export default function CareerDetailView() {
  const { careersId } = useParams() as { careersId: string };
  const router = useRouter();

  const allJobs = companies.flatMap((c) =>
    c.jobs.map((job, index) => ({
      ...job,
      companyId: c.id,
      companyName: c.name,
      careersId: `${c.id}-${index}`,
    }))
  );

  const job = allJobs.find((j) => j.careersId === careersId);

  if (!job) {
    return (
      <div className="py-20 text-center text-gray-600">
        <p>Lowongan tidak ditemukan.</p>
        <Button className="mt-4" onClick={() => router.push("/careers")}>
          Kembali ke Semua Lowongan
        </Button>
      </div>
    );
  }

  return (
    <section className="bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-md border border-sky-200">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-sky-800">
                    {job.title}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {job.companyName} &middot; 📍 {job.location}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge className="bg-sky-100 text-sky-700 border border-sky-300">
                    {job.category}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border border-green-300">
                    Level: {job.level}
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300">
                    Gaji: Rp {job.price.toLocaleString("id-ID")}
                  </Badge>
                </div>

                <div className="text-gray-700 leading-relaxed text-sm">
                  <h3 className="font-semibold mb-2 text-sky-700 text-base">
                    📋 Deskripsi Pekerjaan
                  </h3>
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>

                <div className="pt-4">
                  <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white">
                    Lamar Sekarang
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="shadow-md border border-sky-200">
              <CardContent className="p-6">
                <div className="bg-sky-50 border-b-2 border-sky-500 px-4 py-2 mb-4 rounded-t-md">
                  <h3 className="text-lg font-semibold text-sky-700">
                    📌 Informasi Tambahan
                  </h3>
                </div>

                <div className="text-sm text-gray-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    <span>Perusahaan: {job.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>Lokasi: {job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={16} />
                    <span>Tingkat: {job.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    <span>
                      Gaji:{" "}
                      <strong>Rp {job.price.toLocaleString("id-ID")}</strong>
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {[
                    "Dapatkan pengalaman kerja dan proyek nyata untuk memperkaya portofolio.",
                    "Buka peluang karier lanjutan di perusahaan terkemuka.",
                    "Kesempatan mendapatkan mentoring langsung dari profesional di bidangnya.",
                    "Sertifikat pengalaman kerja untuk memperkuat CV Anda.",
                    "Fleksibilitas dalam waktu dan lokasi kerja (tergantung posisi).",
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="text-sky-500 mt-1" size={18} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
