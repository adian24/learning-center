"use client";

import { useState } from "react";
import Footer from "./landing/footer";
import HeroSection from "./landing/hero-section";
import PartnershipSection from "./landing/partnership-section";
import CareerSection from "./landing/career-section";
import ProgramsSection from "./landing/programs-section";
import SimpleLayout from "@/layout/SimpleLayout.tsx";

export default function LandingPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  return (
    <SimpleLayout>
      <HeroSection
        onSearch={(keyword, category) => {
          setSearchKeyword(keyword);
          setSearchCategory(category);
        }}
      />
      <ProgramsSection keyword={searchKeyword} category={searchCategory} />
      <PartnershipSection />
      <CareerSection />
      <Footer />
    </SimpleLayout>
  );
}
