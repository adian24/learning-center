"use client";

import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Fragment } from "react";
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

import SecureImage from "@/components/media/SecureImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatVideoDuration } from "@/utils/formatVideoDuration";

type LocalizedText = string | Record<string, string>;

function getLocalized(
  value: LocalizedText,
  locale: string,
  fallback = ""
): string {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    return value[locale] ?? value.en ?? fallback;
  }
  return fallback;
}

const ProgramDetailView = ({ programs }: { programs: any }) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const session = useSession();

  if (!programs) return null;

  const {
    id,
    slug,
    title,
    imageUrl,
    price,
    duration,
    level,
    teacherName,
    enrolledCount,
    chapterCount,
    categoryName,
    description,
  } = programs;

  return (
    <Fragment>
      <section className="bg-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Thumbnail + Info */}
            <Card className="p-6 shadow-sm border border-sky-200">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative w-[320px] h-[180px] rounded-xl overflow-hidden shadow-sm bg-gray-100">
                  <SecureImage
                    imageKey={imageUrl}
                    courseId={id}
                    alt={`Thumbnail ${getLocalized(title, locale)}`}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    sizes="100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="flex-1">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-500 text-transparent bg-clip-text">
                    {getLocalized(title, locale)}
                  </h1>

                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck size={16} />
                      <Badge
                        variant="secondary"
                        className="text-xs bg-sky-50 text-sky-700 border-sky-300"
                      >
                        {getLocalized(categoryName, locale)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <User2 size={16} />
                      <span>
                        {t("landing_program_detail_by")}{" "}
                        {teacherName ??
                          t("landing_program_detail_instructor_unknown")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 size={16} />
                      <span>{formatVideoDuration(duration)}</span>
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

            {/* Description */}
            {description && (
              <Card className="shadow-sm border border-sky-200">
                <CardContent className="p-6">
                  <div className="bg-sky-50 border-b-2 border-sky-500 px-4 py-2 rounded-t-md">
                    <h3 className="text-lg font-semibold text-sky-700">
                      {t("landing_program_detail_description")}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {getLocalized(description, locale)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Certification Info */}
            <Card className="shadow-sm border border-sky-200">
              <CardContent className="p-6">
                <div className="bg-sky-50 border-b-2 border-sky-500 px-4 py-2 mb-6 rounded-t-md">
                  <h3 className="text-lg font-semibold text-sky-700">
                    {t("landing_program_detail_certification_title")}
                  </h3>
                </div>
                <p className="text-lg text-sky-700 mb-6 font-semibold">
                  {t("landing_program_detail_certification_get")}
                </p>
                <div className="space-y-3 text-sm text-gray-700">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="text-sky-500 mt-1" size={18} />
                      <div>
                        <strong className="text-sky-700">
                          {t(
                            `landing_program_detail_certification_item${i}_title`
                          )}
                        </strong>
                        <p className="text-muted-foreground">
                          {t(
                            `landing_program_detail_certification_item${i}_desc`
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="shadow-lg border border-sky-200">
              <CardContent className="p-6">
                <div className="bg-sky-50 border-b-2 border-sky-500 px-4 py-2 rounded-t-md">
                  <h3 className="text-lg font-semibold text-sky-700">
                    {t("landing_program_detail_highlight_title")}
                  </h3>
                </div>
                <div className="mt-4 text-sm text-gray-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <LayoutList size={16} />
                    <span className="capitalize">
                      {chapterCount ?? 0}{" "}
                      {t("landing_program_detail_highlight_chapters")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span className="capitalize">
                      {enrolledCount ?? 0}{" "}
                      {t("landing_program_detail_highlight_enrolled")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant="outline"
                      className="text-xs bg-teal-50 text-teal-600 border-teal-200 uppercase"
                    >
                      {typeof level === "string"
                        ? t(`level_${level.toLowerCase()}`)
                        : getLocalized(level, locale)}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => {
                      const isLoggedIn = session.data;
                      const targetPath = `/courses/${slug}`;
                      localStorage.setItem("routerCache", targetPath);
                      router.push(isLoggedIn ? targetPath : "/sign-in");
                    }}
                    className="w-full rounded-xl px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
                  >
                    {t("landing_program_detail_register")}
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

export default ProgramDetailView;
