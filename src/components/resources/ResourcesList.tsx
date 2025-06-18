import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Card, CardContent } from "../ui/card";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  FileText,
  NotebookPen,
  Trash2,
} from "lucide-react";
import { Badge } from "../ui/badge";
import HTMLContent from "./HTMLContent";
import { Button } from "../ui/button";
import { Resource } from "@/lib/types/resource";
import { useResourcesStore } from "@/store/use-store-resources";

const ResourcesList = ({ resource }: { resource: Resource }) => {
  const { openEditDialog, openDeleteDialog } = useResourcesStore();

  return (
    <AccordionItem key={resource.id} value={resource.id} className="border-0">
      <Card className="overflow-hidden pt-4">
        <CardContent className="px-6 py-2 w-full">
          <div className="flex items-start justify-between w-full">
            <div className="flex-1 text-left space-y-3">
              {/* Title and Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <NotebookPen className="h-5 w-5 text-primary" />
                  {resource.title}
                </h3>
                {resource.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {resource.summary}
                  </p>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {resource.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{resource.readTime} menit baca</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Dibuat{" "}
                    {new Date(resource.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Tags/Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Resource
                  </Badge>
                  {resource.readTime && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        resource.readTime <= 5
                          ? "border-green-200 text-green-700"
                          : resource.readTime <= 10
                          ? "border-yellow-200 text-yellow-700"
                          : "border-red-200 text-red-700"
                      }`}
                    >
                      {resource.readTime <= 5
                        ? "Bacaan Cepat"
                        : resource.readTime <= 10
                        ? "Bacaan Sedang"
                        : "Bacaan Panjang"}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(resource.id);
                    }}
                    className="h-8 px-3"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(resource.id);
                    }}
                    className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <AccordionTrigger className="text-sm underline">
            Lihat artikel selengkapnya
          </AccordionTrigger>
        </CardContent>

        <AccordionContent className="pb-0">
          <CardContent className="px-6 pb-6 pt-0">
            <div className="border-t pt-6">
              <div className="prose prose-sm max-w-none">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-primary">
                  <FileText className="h-4 w-4" />
                  Konten Resource
                </h4>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {resource.content && (
                      <HTMLContent content={resource.content} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
};

export default ResourcesList;
