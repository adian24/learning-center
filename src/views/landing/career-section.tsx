"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import CareersShimmer from "./shimmer/careers-shimmer";

const companies = [
  {
    id: "tsi",
    name: "TSI",
    jobs: [
      {
        title: "Frontend Developer",
        location: "Jakarta",
        description: "Mengembangkan dan memelihara fitur antarmuka pengguna.",
      },
      {
        title: "QA Tester",
        location: "Remote",
        description: "Menjamin kualitas perangkat lunak melalui pengujian.",
      },
    ],
  },
  {
    id: "dms",
    name: "DMS",
    jobs: [
      {
        title: "Project Manager",
        location: "Bandung",
        description: "Memimpin proyek dan mengoordinasi tim.",
      },
    ],
  },
  {
    id: "jit",
    name: "JIT",
    jobs: [
      {
        title: "Backend Developer",
        location: "Surabaya",
        description: "Membangun dan memelihara API backend.",
      },
    ],
  },
  {
    id: "pts",
    name: "Panji Teknologi Services",
    jobs: [
      {
        title: "IT Support Specialist",
        location: "Yogyakarta",
        description: "Memberikan dukungan teknis dan menjaga infrastruktur TI.",
      },
    ],
  },
];

export default function CareersPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const allJobs = companies.flatMap((company) =>
    company.jobs.map((job, idx) => ({
      ...job,
      companyId: company.id,
      companyName: company.name,
      careersId: `${company.id}-${idx}`,
    }))
  );

  const filteredJobs =
    selectedTab === "all"
      ? allJobs
      : allJobs.filter((job) => job.companyId === selectedTab);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold mb-12 text-center text-sky-700">
          Semua Lowongan Kerja
        </h2>

        <div className="flex justify-center mb-8">
          <Tabs
            defaultValue="all"
            value={selectedTab}
            onValueChange={setSelectedTab}
          >
            <TabsList className="bg-sky-50 p-1 rounded-full shadow-sm flex flex-wrap gap-2 justify-center">
              <TabsTrigger
                value="all"
                className={clsx(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition",
                  "data-[state=active]:bg-sky-600 data-[state=active]:text-white"
                )}
              >
                Semua Perusahaan
              </TabsTrigger>
              {companies.map((company) => (
                <TabsTrigger
                  key={company.id}
                  value={company.id}
                  className={clsx(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition",
                    "data-[state=active]:bg-sky-600 data-[state=active]:text-white"
                  )}
                >
                  {company.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <CareersShimmer key={idx} />
              ))
            : filteredJobs.map((job, idx) => (
                <Card
                  key={idx}
                  onClick={() => router.push(`/careers/${job.careersId}`)}
                  className="cursor-pointer bg-white rounded-2xl border border-sky-100 shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <h3 className="text-base text-sky-600 font-semibold mb-1">
                      {job.companyName}
                    </h3>
                    <h5 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-sky-700">
                      {job.title}
                    </h5>
                    <p className="text-sm text-gray-500 mb-1">
                      📍 {job.location}
                    </p>
                    <p className="text-sm text-gray-600 leading-snug">
                      {job.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="flex justify-center mt-10">
          <Button
            onClick={() => router.push("/careers")}
            className="px-5 py-2 rounded-full bg-sky-100 text-sky-700 text-sm hover:bg-sky-200 transition border border-sky-200"
          >
            Lihat Semua Lowongan
          </Button>
        </div>
      </div>
    </section>
  );
}
