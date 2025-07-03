import { AvatarImage } from "@/components/media/SecureImage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/use-course";
import { Building2, Globe, MapPin, ShieldCheck } from "lucide-react";

interface InstructorSectionProps {
  courseId: string;
}

const InstructorSection = ({ courseId }: InstructorSectionProps) => {
  const { data, isLoading } = useCourse(courseId);
  const course = data?.course;
  const teacher = course?.teacher;
  const company = teacher?.company;

  if (isLoading) {
    return <InstructorSectionSkeleton />;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Instruktur Course</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-2">
                {teacher?.profileUrl ? (
                  <AvatarImage
                    imageKey={teacher?.profileUrl ?? ""}
                    userName={teacher?.user?.name ?? ""}
                  />
                ) : (
                  <AvatarFallback>
                    {teacher?.user?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <h3 className="font-semibold text-center">
                {teacher?.user?.name}
              </h3>

              {/* Company Information */}
              {company && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    {company.logoUrl ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          imageKey={company.logoUrl}
                          userName={company.name}
                          size={25}
                        />
                      </Avatar>
                    ) : (
                      <AvatarFallback className="h-8 w-8">
                        {company.name.charAt(0)}
                      </AvatarFallback>
                    )}
                    <div>
                      <div className="gap-1 flex text-sm font-medium ">
                        <span className="truncate max-w-32">
                          {company.name}
                        </span>
                        {company.isVerified && (
                          <ShieldCheck className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      {company.industry && (
                        <p className="text-xs text-muted-foreground">
                          {company.industry}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Additional company details */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-xs text-muted-foreground">
                    {company.location && (
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="md:w-3/4">
              <h4 className="font-medium text-sm mb-2">
                About {teacher?.user?.name}
              </h4>
              <p className="text-gray-700 mb-4 text-xs">
                {teacher?.bio ?? "No bio available"}
              </p>

              {/* Company description if available */}
              {company?.description && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">
                    About {company.name}
                  </h4>
                  <p className="text-gray-600 text-xs line-clamp-4">
                    {company.description}
                  </p>
                </div>
              )}

              {/* Expertise */}
              {teacher?.expertise && teacher.expertise.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Areas of Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {teacher.expertise.map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InstructorSectionSkeleton = () => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Instruktur Course</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full mb-2" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20 mt-2" />
              <Skeleton className="h-8 w-8 rounded-full mt-3" />
            </div>
            <div className="md:w-3/4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorSection;
