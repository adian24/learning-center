"use client";

import { useKeenSlider } from "keen-slider/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import tsiLogo from "@/assets/companies-logo/tsi.png";
import dmsLogo from "@/assets/companies-logo/dms.png";
import jitLogo from "@/assets/companies-logo/jit.png";
import ptsLogo from "@/assets/companies-logo/pts.png";
import PartnerShimmer from "./shimmer/partner-shimmer";
import { useEffect } from "react";

const partners = [
  { name: "TSI", logo: tsiLogo },
  { name: "DMS", logo: dmsLogo },
  { name: "JIT", logo: jitLogo },
  { name: "PTS", logo: ptsLogo },
];

export default function PartnershipSection() {
  const router = useRouter();
  const isLoading = false;

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "free-snap",
    slides: {
      perView: 4,
      spacing: 0,
    },
    breakpoints: {
      "(max-width: 1024px)": {
        slides: {
          perView: 3,
          spacing: 10,
        },
      },
      "(max-width: 640px)": {
        slides: {
          perView: 1,
          spacing: 0,
        },
      },
    },
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let clearNextTimeout = false;

    function nextTimeout() {
      clearTimeout(timeout);
      if (clearNextTimeout) return;
      timeout = setTimeout(() => {
        slider.current?.next();
      }, 2500);
    }

    if (slider.current) {
      slider.current.on("created", nextTimeout);
      slider.current.on("dragStarted", () => {
        clearTimeout(timeout);
        clearNextTimeout = true;
      });
      slider.current.on("animationEnded", () => {
        clearNextTimeout = false;
        nextTimeout();
      });
      slider.current.on("updated", nextTimeout);
    }

    return () => clearTimeout(timeout);
  }, [slider]);

  return (
    <section className="bg-gray-50 py-20 px-6">
      <h2 className="text-3xl font-semibold mb-12 text-center text-sky-700">
        🌟 Perusahaan Mitra Kami
      </h2>
      <div
        ref={sliderRef}
        className="keen-slider grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10 w-full mx-auto"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <PartnerShimmer key={i} />)
          : partners.map((partner, idx) => (
              <div key={idx} className="keen-slider__slide flex justify-center">
                <div
                  onClick={() => {
                    const isLoggedIn =
                      typeof window !== "undefined" &&
                      !!localStorage.getItem("token");
                    router.push(
                      isLoggedIn
                        ? `/career/${partner.name.toLowerCase()}`
                        : "/sign-in"
                    );
                  }}
                  className="cursor-pointer group p-6 transition-all w-[200px] flex flex-col items-center"
                >
                  <div className="relative w-[180px] h-[60px]">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="shadow-inner shadow-transparent object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-700 group-hover:text-sky-600">
                    {partner.name}
                  </p>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
