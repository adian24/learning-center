import ButtonNvigation from "@/components/button-navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, FileText, LayoutGrid, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

const TeacherEmptyCourse = () => {
  const t = useTranslations("teacher_empty_course");

  return (
    <>
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="rounded-full bg-primary/10 p-4">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>

            {/* Text Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{t("title")}</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                {t("description")}
              </p>
            </div>

            {/* Primary Action */}
            <ButtonNvigation
              text={t("button_create")}
              url="/teacher/courses/create"
              className="mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <LayoutGrid className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">
              {t("feature_structure_title")}
            </CardTitle>
            <CardDescription>{t("feature_structure_desc")}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">{t("feature_quiz_title")}</CardTitle>
            <CardDescription>{t("feature_quiz_desc")}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <UsersRound className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">
              {t("feature_students_title")}
            </CardTitle>
            <CardDescription>{t("feature_students_desc")}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("guide_title")}</CardTitle>
          <CardDescription>{t("guide_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium">{t("step_1_title")}</h4>
                <p className="text-sm text-gray-500">{t("step_1_desc")}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium">{t("step_2_title")}</h4>
                <p className="text-sm text-gray-500">{t("step_2_desc")}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium">{t("step_3_title")}</h4>
                <p className="text-sm text-gray-500">{t("step_3_desc")}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                4
              </div>
              <div>
                <h4 className="font-medium">{t("step_4_title")}</h4>
                <p className="text-sm text-gray-500">{t("step_4_desc")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TeacherEmptyCourse;
