import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Chapter } from '@/lib/types';
import {
  FileText,
  GraduationCap,
  MoreVertical,
  Pencil,
  Trash,
  VideoIcon
} from 'lucide-react';
import Link from 'next/link';

interface TableChapterProps {
  chapters: Chapter[] | undefined;
}

const TableChapter = ({ chapters }: TableChapterProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-24">Akses</TableHead>
            <TableHead className="w-32">Sumberdaya</TableHead>
            <TableHead className="w-32">Quis</TableHead>
            <TableHead className="w-20">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chapters?.map((chapter) => (
            <TableRow key={chapter.id}>
              <TableCell className="font-medium">{chapter.position}</TableCell>
              <TableCell>
                <Link
                  href={`/teacher/courses/${chapter.course?.id}/chapters/${chapter.id}`}
                  className="font-medium hover:text-blue-600 hover:underline transition-colors"
                >
                  {chapter.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={chapter.isPublished ? 'default' : 'secondary'}>
                  {chapter.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={chapter.isFree ? 'default' : 'secondary'}>
                  {chapter.isFree ? 'Free' : 'Paid'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {chapter?.resources?.length}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {chapter?.quizzes?.length}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                    // onClick={() => onEdit?.(chapter.id)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                    // onClick={() => router.push(`/teacher/courses/${params.courseId}/chapters/${chapter.id}`)}
                    >
                      <VideoIcon className="h-4 w-4 mr-2" />
                      Manage
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      // onClick={() => onDelete?.(chapter.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableChapter;
