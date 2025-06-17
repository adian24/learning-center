import { AlertCircle, NotepadText, Plus, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useResources } from "@/hooks/use-resources";
import { Alert, AlertDescription } from "../ui/alert";
import { useResourcesStore } from "@/store/use-store-resources";
import DrawerCreateResource from "./DrawerCreateResource";

interface TeacherResourceManagerProps {
  chapterId: string;
}

const TeacherResourceManager: React.FC<TeacherResourceManagerProps> = ({
  chapterId,
}) => {
  const { openCreateDialog, openEditDialog, openDeleteDialog } =
    useResourcesStore();

  const {
    data: resources,
    isLoading,
    isPending,
    refetch,
    error,
  } = useResources({ chapterId });

  const resourceCount = resources?.resources.length || 0;

  if (isPending) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Memuat resource...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gagal memuat daftar resource. Silakan coba lagi.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resource Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <NotepadText className="h-5 w-5" />
              <CardTitle>Resource Management</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{resourceCount} Resource</Badge>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCcw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                className="gap-2"
                onClick={() => openCreateDialog(chapterId)}
              >
                <Plus className="h-4 w-4" />
                Buat Resource Baru
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {resources?.resources.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <NotepadText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Belum Ada Resource</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mulai dengan membuat resource pertama untuk chapter ini.
                  </p>
                  <Button
                    className="gap-2"
                    onClick={() => openCreateDialog(chapterId)}
                  >
                    <Plus className="h-4 w-4" />
                    Buat Resource Baru
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {resources?.resources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{resource.title}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openEditDialog(resource.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openDeleteDialog(resource.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DrawerCreateResource />
    </div>
  );
};

export default TeacherResourceManager;
