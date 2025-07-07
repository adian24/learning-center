"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Award,
  Download,
  Eye,
  Search,
  Calendar,
  User,
  BookOpen,
  Building,
  // ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Layout from "@/layout";
import {
  useCertificateManager,
  useCertificateFilters,
} from "@/hooks/use-certificates";

export function CertificatesPage() {
  const {
    certificates,
    isLoading,
    error,
    downloadCertificate,
    viewCertificate,
    // shareCertificate,
    // regenerateCertificate,
    refreshCertificates,
    downloadingId,
    // sharingId,
    // isRegenerating,
    // regeneratingId,
  } = useCertificateManager();

  const {
    searchTerm,
    setSearchTerm,
    selectedLevel,
    setSelectedLevel,
    sortBy,
    setSortBy,
    filteredCertificates,
  } = useCertificateFilters(certificates);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Handle error state
  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load certificates
              </h3>
              <p className="text-gray-600 mb-4">
                {error.message ||
                  "Something went wrong while loading your certificates."}
              </p>
              <Button onClick={refreshCertificates} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Certificates
            </h1>
            <p className="text-gray-600">
              You have earned {certificates.length} certificate
              {certificates.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {certificates.length} Total
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCertificates}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "title")}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Grid */}
        {filteredCertificates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {certificates.length === 0
                  ? "No certificates yet"
                  : "No certificates found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {certificates.length === 0
                  ? "Complete your first course to earn a certificate!"
                  : "Try adjusting your search or filter criteria."}
              </p>
              {certificates.length === 0 && (
                <Button>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates.map((certificate) => (
              <Card
                key={certificate.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-2">
                        {certificate.course.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          className={getLevelColor(certificate.course.level)}
                        >
                          {certificate.course.level}
                        </Badge>
                        {certificate.course.category && (
                          <Badge variant="outline">
                            {certificate.course.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Certificate Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Issued{" "}
                        {new Date(certificate.issueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {certificate.course.teacher.user.name ||
                          "Unknown Instructor"}
                      </span>
                    </div>

                    {certificate.course.teacher.company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{certificate.course.teacher.company.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Certificate Number */}
                  <div className="p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono">
                    ID: {certificate.certificateNumber}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        viewCertificate({
                          certificateId: certificate.id,
                          pdfUrl: certificate.pdfUrl || "",
                        })
                      }
                      disabled={!certificate.pdfUrl}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCertificate(certificate)}
                      disabled={
                        !certificate.pdfUrl || downloadingId === certificate.id
                      }
                      className="flex-1"
                    >
                      {downloadingId === certificate.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      {downloadingId === certificate.id
                        ? "Downloading..."
                        : "Download"}
                    </Button>
                  </div>

                  {/* <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareCertificate(certificate)}
                      disabled={sharingId === certificate.id}
                      className="flex-1 text-blue-600 hover:text-blue-700"
                    >
                      {sharingId === certificate.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      {sharingId === certificate.id ? "Sharing..." : "Share"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => regenerateCertificate(certificate.id)}
                      disabled={
                        isRegenerating && regeneratingId === certificate.id
                      }
                      className="flex-1 text-green-600 hover:text-green-700"
                    >
                      {isRegenerating && regeneratingId === certificate.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      {isRegenerating && regeneratingId === certificate.id
                        ? "Regenerating..."
                        : "Regenerate"}
                    </Button>
                  </div> */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
