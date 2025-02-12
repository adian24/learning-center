import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, LinkIcon, Upload } from "lucide-react";
import React from "react";

const FormResourcesSettingChapter = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Resources</CardTitle>
        <CardDescription>Add additional learning materials</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resource Type Selection */}
        <div className="grid grid-cols-3 gap-4">
          <Button variant="outline">
            <LinkIcon />
            <span>Add Link</span>
          </Button>
          <Button variant="outline">
            <FileText />
            <span>Add PDF</span>
          </Button>
          <Button variant="outline">
            <Upload />
            <span>Upload File</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormResourcesSettingChapter;
