"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useDeleteResource, useResource } from "@/hooks/use-resources";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useResourcesStore } from "@/store/use-store-resources";

const DeleteResourceDialog: React.FC = () => {
  const { isDeleteOpen, deletingResourceId, closeDeleteDialog } = useResourcesStore();
  const { data: resource } = useResource(deletingResourceId || undefined);
  const [confirmText, setConfirmText] = useState("");
  const deleteResourceMutation = useDeleteResource();

  const handleDelete = async () => {
    if (!deletingResourceId) return;

    try {
      await deleteResourceMutation.mutateAsync(deletingResourceId);

      toast.success("Resource Berhasil Dihapus", {
        description: `Resource "${resource?.title}" telah berhasil dihapus.`,
      });

      closeDeleteDialog();
      setConfirmText("");
    } catch (error: any) {
      toast.error("Gagal Menghapus Resource", {
        description: error.message || "Terjadi kesalahan saat menghapus resource.",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText("");
      closeDeleteDialog();
    }
  };

  const isLoading = deleteResourceMutation.isPending;
  const isConfirmValid = confirmText === "HAPUS";

  if (!resource) return null;

  return (
    <Dialog open={isDeleteOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Hapus Resource
          </DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Resource dan semua data terkait
            akan dihapus permanen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resource Info */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Judul Resource:</span>
                <p className="text-sm text-gray-700">{resource.title}</p>
              </div>
              {resource.summary && (
                <div>
                  <span className="text-sm font-medium">Ringkasan:</span>
                  <p className="text-sm text-gray-700">{resource.summary}</p>
                </div>
              )}
              <div className="flex gap-4 text-sm">
                {resource.readTime && (
                  <span>
                    <span className="font-medium">Waktu Baca:</span>{" "}
                    {resource.readTime} menit
                  </span>
                )}
                <span>
                  <span className="font-medium">Dibuat:</span>{" "}
                  {new Date(resource.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <p className="font-medium">Data yang akan dihapus:</p>
                <ul className="text-sm space-y-1">
                  <li>" Resource dan semua pengaturannya</li>
                  <li>" Konten dan ringkasan resource</li>
                  <li>" Progress siswa yang terkait dengan resource ini</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Confirmation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Konfirmasi:</span> Ketik "
              <span className="font-mono font-bold">HAPUS</span>" untuk
              melanjutkan penghapusan.
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Ketik HAPUS untuk konfirmasi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Hapus Resource
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteResourceDialog;