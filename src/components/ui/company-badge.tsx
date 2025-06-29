import { Building2, ShieldCheck } from "lucide-react";
import { AvatarImage } from "../media/SecureImage";
import { Avatar, AvatarFallback } from "./avatar";

export const CompanyBadge = ({
  company,
  showLogo = true,
  size = "sm",
}: {
  company: any;
  showLogo?: boolean;
  size?: "sm" | "lg";
}) => {
  return (
    <div className="flex items-center gap-2">
      {showLogo && company.logoUrl && (
        <Avatar
          className={`h-${size === "sm" ? "4" : "6"} w-${
            size === "sm" ? "4" : "6"
          }`}
        >
          <AvatarImage imageKey={company.logoUrl} userName={company.name} />
          <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex items-center gap-1">
        <Building2 className="h-3 w-3" />
        <span className="text-sm">{company.name}</span>
        {company.isVerified && (
          <ShieldCheck className="h-3 w-3 text-blue-500" />
        )}
      </div>
    </div>
  );
};
