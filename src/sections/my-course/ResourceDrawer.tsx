import TipTapReader from "@/components/resources/TipTapReader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useStudentResource } from "@/hooks/use-resources";
import { Clock10, FileText, X } from "lucide-react";
import React from "react";

interface ResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string | null;
}

const ResourceDrawer = ({
  isOpen,
  onClose,
  resourceId,
}: ResourceDrawerProps) => {
  const { data: resourceData, isLoading } = useStudentResource(
    resourceId || ""
  );

  console.log("resourceData : ", resourceData);

  if (isLoading) {
    <div>Loading...</div>;
  }

  const handleClose = () => {
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="h-screen max-w-xl ml-auto w-full p-4">
        <DrawerTitle className="text-2xl font-bold px-6"></DrawerTitle>

        {/* header */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{resourceData?.title}</h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {resourceData?.summary}
          </p>

          <div className="pt-4 flex items-center gap-1">
            <Clock10 className="h-3 w-3" />
            <p className="text-sm text-muted-foreground">
              {resourceData?.readTime} menit
            </p>
            {resourceData?.readTime && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  resourceData.readTime <= 5
                    ? "border-green-200 text-green-700"
                    : resourceData.readTime <= 10
                    ? "border-yellow-200 text-yellow-700"
                    : "border-red-200 text-red-700"
                }`}
              >
                {resourceData.readTime <= 5
                  ? "Bacaan Cepat"
                  : resourceData.readTime <= 10
                  ? "Bacaan Sedang"
                  : "Bacaan Panjang"}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="prose prose-sm max-w-none">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-primary">
                  <FileText className="h-4 w-4" />
                  Konten Materi
                </h4>
                <div className="bg-muted/30 rounded-lg p-4">
                  {resourceData?.content && (
                    <TipTapReader content={resourceData.content} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ResourceDrawer;
