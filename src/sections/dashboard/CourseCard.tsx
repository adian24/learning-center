import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl?: string | null;
  category?: string | null;
  progress: number;
  chaptersCount: number;
  completedChapters: number;
}

const CourseCard = ({
  id,
  title,
  imageUrl,
  category,
  progress,
  chaptersCount,
  completedChapters,
}: CourseCardProps) => {
  return (
    <Link href={`/courses/${id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-32 w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="bg-gray-200 h-full w-full flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          {category && (
            <span className="absolute top-2 left-2 bg-white/80 text-xs px-2 py-1 rounded">
              {category}
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium truncate">{title}</h3>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>
                {completedChapters}/{chaptersCount} chapters
              </span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;
