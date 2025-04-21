"use client";

import Image from "next/image";
import bcaLogo from "@/assets/banks/bca.png";
import bniLogo from "@/assets/banks/bni.png";
import briLogo from "@/assets/banks/bri.png";
import mandiriLogo from "@/assets/banks/mandiri.png";
import permataLogo from "@/assets/banks/permata.png";

interface BankIconProps {
  bank: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BankIcon({ bank, size = "md", className = "" }: BankIconProps) {
  const getBankLogo = () => {
    switch (bank.toLowerCase()) {
      case "bca":
        return bcaLogo;
      case "bni":
        return bniLogo;
      case "bri":
        return briLogo;
      case "mandiri":
        return mandiriLogo;
      case "permata":
        return permataLogo;
      default:
        return null;
    }
  };

  const logo = getBankLogo();

  if (!logo) return null;

  const sizeMap = {
    sm: "h-6 w-10",
    md: "h-8 w-14",
    lg: "h-12 w-20",
  };

  const sizeClass = sizeMap[size];

  return (
    <div
      className={`relative ${sizeClass} ${className} flex items-center justify-center`}
    >
      <Image src={logo} alt={`${bank} logo`} fill className="object-contain" />
    </div>
  );
}

export function BankIconsList() {
  return (
    <div className="flex items-center space-x-2 flex-wrap">
      <BankIcon bank="bca" size="sm" />
      <BankIcon bank="bni" size="sm" />
      <BankIcon bank="mandiri" size="sm" />
      <BankIcon bank="bri" size="sm" />
      <BankIcon bank="permata" size="sm" />
    </div>
  );
}
