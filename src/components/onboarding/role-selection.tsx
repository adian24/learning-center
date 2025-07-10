"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectionProps {
  onRoleSelect: (role: "STUDENT" | "TEACHER") => void;
  isSubmitting?: boolean;
}

const roleOptions = [
  {
    value: "STUDENT" as const,
    title: "Peserta",
    description: "Belajar dari instruktur ahli dan tingkatkan kemampuan Anda",
    icon: BookOpen,
    gradient: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    features: [
      "Akses ke kursus",
      "Pelacakan kemajuan",
      "Sertifikat",
      "Pembelajaran interaktif",
    ],
  },
  {
    value: "TEACHER" as const,
    title: "Pengajar",
    description: "Bagikan pengetahuan Anda dan buat kursus yang menarik",
    icon: Users,
    gradient: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    features: [
      "Buat kursus",
      "Manajemen siswa",
      "Dashboard analitik",
      "Pelacakan pendapatan",
    ],
  },
];

export function RoleSelection({
  onRoleSelect,
  isSubmitting = false,
}: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<
    "STUDENT" | "TEACHER" | null
  >(null);

  return (
    <div className="flex justify-center items-center">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Selamat datang! Mari kita mulai
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Pilih peran Anda untuk mempersonalisasi pengalaman Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.value}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden",
                  selectedRole === role.value
                    ? `${role.bgColor} ${role.borderColor} shadow-xl ring-2 ring-offset-2 ring-current scale-[1.02]`
                    : "hover:shadow-lg border-border"
                )}
                onClick={() => setSelectedRole(role.value)}
              >
                {/* Gradient overlay when selected */}
                {selectedRole === role.value && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-5`}
                  />
                )}

                <CardHeader className="text-center pb-4 relative z-10">
                  <div
                    className={cn(
                      "mx-auto mb-4 p-4 rounded-full w-fit transition-all duration-300",
                      selectedRole === role.value ? role.iconBg : "bg-muted/50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-8 w-8 transition-all duration-300",
                        selectedRole === role.value
                          ? role.iconColor
                          : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <CardTitle
                    className={cn(
                      "text-2xl font-black transition-colors duration-300",
                      selectedRole === role.value ? role.iconColor : ""
                    )}
                  >
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-2">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full flex-shrink-0 transition-colors duration-300",
                            selectedRole === role.value
                              ? role.iconColor
                              : "bg-muted-foreground"
                          )}
                        />
                        <span className="text-xs text-muted-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            disabled={!selectedRole || isSubmitting}
            onClick={() => selectedRole && onRoleSelect(selectedRole)}
            className="w-full max-w-md"
          >
            {isSubmitting && selectedRole === "STUDENT" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Membuat profil...
              </>
            ) : (
              <>
                Lanjutkan sebagai{" "}
                {selectedRole
                  ? roleOptions.find((r) => r.value === selectedRole)?.title
                  : "..."}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
