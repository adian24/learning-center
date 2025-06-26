import { Metadata } from "next";
import CareerDetailView from "@/views/careers/career-detail";
import SimpleLayout from "@/layout/SimpleLayout.tsx";

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

export async function generateMetadata({
  params,
}: {
  params: { careersId: string };
}): Promise<Metadata> {
  const allJobs = companies.flatMap((c) =>
    c.jobs.map((job, index) => ({
      ...job,
      companyId: c.id,
      companyName: c.name,
      careersId: `${c.id}-${index}`,
    }))
  );

  const job = allJobs.find((j) => j.careersId === params.careersId);

  if (!job) {
    return {
      title: "Lowongan Tidak Ditemukan | E-Learning",
      description: "Halaman lowongan pekerjaan tidak tersedia.",
    };
  }

  return {
    title: `${job.title} di ${job.companyName} | E-Learning`,
    description: `${job.title} - ${job.location}. ${job.description.slice(
      0,
      150
    )}...`,
    keywords: [
      job.title,
      job.companyName,
      job.location,
      "lowongan kerja",
      "karier",
      "e-learning",
    ],
  };
}

export default function Page() {
  return (
    <SimpleLayout>
      <CareerDetailView />
    </SimpleLayout>
  );
}
