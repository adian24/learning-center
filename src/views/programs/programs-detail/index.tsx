"use client";

import SecureImage from "@/components/media/SecureImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock3,
  BookOpenCheck,
  User2,
  DollarSign,
  Users,
  LayoutList,
  CheckCircle,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";

const ProgramsDetailView = ({ programs }: { programs: any }) => {
  const router = useRouter();

  if (!programs) return null;

  const {
    id,
    title,
    description,
    imageUrl,
    duration,
    level,
    categoryName,
    price,
    teacherName,
    enrolledCount,
    chapterCount,
  } = programs;

  return (
    <Fragment>
      <section className="bg-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6 shadow-sm border border-sky-200">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative w-[320px] h-[180px] rounded-xl overflow-hidden shadow-sm bg-gray-100">
                  <SecureImage
                    imageKey={imageUrl}
                    courseId={id}
                    alt={`Thumbnail pelatihan ${title}`}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    sizes="100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="flex-1">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-500 text-transparent bg-clip-text">
                    {title}
                  </h1>

                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck size={16} />
                      <Badge
                        variant="secondary"
                        className="text-xs bg-sky-50 text-sky-700 border-sky-300"
                      >
                        {categoryName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <User2 size={16} />
                      <span>
                        oleh {teacherName ?? "Instruktur Tidak Diketahui"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 size={16} />
                      <span>{duration} menit</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      <span className="font-semibold text-sky-700">
                        Rp {price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {description && (
              <Card className="shadow-sm border border-sky-200">
                <CardContent className="p-6">
                  <div className="bg-sky-50 border-b-2 border-sky-500 px-4 py-2 rounded-t-md">
                    <h3 className="text-lg font-semibold text-sky-700">
                      📖 Deskripsi Pelatihan
                    </h3>
                  </div>
                  <p className="mt-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-sm border border-sky-200">
              <CardContent className="p-6">
                <div className="bg-sky-50 border-b-2 border-sky-500 px-4 py-2 mb-6 rounded-t-md">
                  <h3 className="text-lg font-semibold text-sky-700">
                    🎓 Sertifikasi Kursus
                  </h3>
                </div>
                <p className="text-lg text-sky-700 mb-6 font-semibold">
                  Selesaikan kursus ini & dapatkan sertifikat Anda!
                </p>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-sky-500 mt-1" size={18} />
                    <div>
                      <strong className="text-sky-700">
                        Dapatkan Sertifikat
                      </strong>
                      <p className="text-muted-foreground">
                        Sertifikat penyelesaian kursus untuk membuktikan
                        keahlian Anda.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-sky-500 mt-1" size={18} />
                    <div>
                      <strong className="text-sky-700">
                        Kredensial Digital yang Bisa Dibagikan
                      </strong>
                      <p className="text-muted-foreground">
                        Tampilkan di CV atau media sosial Anda.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-sky-500 mt-1" size={18} />
                    <div>
                      <strong className="text-sky-700">
                        Tingkatkan Karier Anda
                      </strong>
                      <p className="text-muted-foreground">
                        Tambahkan ke profil LinkedIn Anda sebagai bukti
                        kompetensi.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="shadow-lg border border-sky-200">
              <CardContent className="p-6">
                <div className="bg-sky-50 border-b-2 border-sky-500 px-4 py-2 rounded-t-md">
                  <h3 className="text-lg font-semibold text-sky-700">
                    🧩 Sorotan Kursus
                  </h3>
                </div>
                <div className="mt-4 text-sm text-gray-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <LayoutList size={16} />
                    <span>{chapterCount ?? 0} bab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{enrolledCount ?? 0} peserta telah bergabung</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant="outline"
                      className="text-xs bg-teal-50 text-teal-600 border-teal-200"
                    >
                      {level.charAt(0).toUpperCase() +
                        level.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => router.push("/sign-in")}
                    className="w-full rounded-xl px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
                  >
                    Daftar Sekarang
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default ProgramsDetailView;
