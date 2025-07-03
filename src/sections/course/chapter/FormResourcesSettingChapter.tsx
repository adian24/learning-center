import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, LinkIcon, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

const FormResourcesSettingChapter = () => {
  const t = useTranslations("chapters");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("resources_title")}</CardTitle>
        <CardDescription>{t("resources_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resource Type Selection */}
        <div className="grid grid-cols-3 gap-4">
          <Button variant="outline">
            <LinkIcon />
            <span>{t("resources_add_link")}</span>
          </Button>
          <Button variant="outline">
            <FileText />
            <span>{t("resources_add_pdf")}</span>
          </Button>
          <Button variant="outline">
            <Upload />
            <span>{t("resources_add_file")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormResourcesSettingChapter;
