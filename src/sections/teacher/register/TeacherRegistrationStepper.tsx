"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MultiSelect } from "@/components/ui/multi-select";
import { EXPERTISE_CATEGORIES } from "@/lib/constants";
import { useTeacherRegistrationStore } from "@/store/use-teacher-registration-store";
import { ProfileImageUpload } from "@/components/forms/ProfileImageUpload";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/use-companies";
import { useSecureImages } from "@/hooks/use-secure-media";

const step1Schema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  expertise: z
    .array(z.string())
    .min(1, "Select at least one area of expertise"),
  profileUrl: z.string().nullable().optional(),
});

type Step1FormValues = z.infer<typeof step1Schema>;

// Company type
interface Company {
  id: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  website?: string | null;
  industry?: string | null;
  isVerified: boolean;
}

interface TeacherRegistrationStepperProps {
  onStep1Submit: (values: Step1FormValues) => void;
  onFinalSubmit: () => void;
  onBackToRoleSelection?: () => void;
  isSubmitting: boolean;
}

export default function TeacherRegistrationStepper({
  onStep1Submit,
  onFinalSubmit,
  onBackToRoleSelection,
  isSubmitting,
}: TeacherRegistrationStepperProps) {
  const {
    currentStep,
    teacherData,
    selectedCompany,
    nextStep,
    prevStep,
    setSelectedCompany,
  } = useTeacherRegistrationStore();

  const [companySearchOpen, setCompanySearchOpen] = useState(false);

  // Step 1 form with profileUrl
  const step1Form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      bio: teacherData.bio,
      expertise: teacherData.expertise,
      profileUrl: teacherData.profileUrl || null,
    },
  });

  // Fetch companies for step 2
  const { data, isLoading: isLoadingCompanies } = useCompanies();
  const companies = data?.companies || [];

  // Load secure images for company logos
  const companyImageKeys = useMemo(
    () =>
      companies
        .filter((company) => company.logoUrl)
        .map((company) => ({ key: company.logoUrl! })),
    [companies]
  );

  const { imageUrls: logoUrls } = useSecureImages(
    companyImageKeys,
    companies.length > 0
  );

  // Handle company selection
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCompanySearchOpen(false);
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Teacher Registration</h1>
          <Badge variant="outline">{currentStep} of 3</Badge>
        </div>
        <Progress value={progressPercentage} className="w-full" />

        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "flex items-center gap-2",
                step <= currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  step < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : step === currentStep
                    ? "border-primary text-primary"
                    : "border-muted-foreground"
                )}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              <span className="text-sm font-medium">
                {step === 1 && "Profile"}
                {step === 2 && "Company"}
                {step === 3 && "Preview"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Create Your Teacher Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...step1Form}>
                <form
                  onSubmit={step1Form.handleSubmit(onStep1Submit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Section - Profile Photo */}
                    <div className="space-y-6">
                      <FormField
                        control={step1Form.control}
                        name="profileUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Photo</FormLabel>
                            <FormControl>
                              <ProfileImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                size="lg"
                              />
                            </FormControl>
                            <FormDescription>
                              Upload a professional profile photo (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Right Section - Bio & Expertise */}
                    <div className="space-y-6">
                      {/* Bio Field */}
                      <FormField
                        control={step1Form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about yourself, your experience, and what makes you a great teacher..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Share your background, teaching philosophy, and
                              expertise (minimum 50 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Expertise Field */}
                      <FormField
                        control={step1Form.control}
                        name="expertise"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Areas of Expertise</FormLabel>
                            <FormControl>
                              <MultiSelect
                                value={field.value}
                                onChange={field.onChange}
                                options={EXPERTISE_CATEGORIES}
                                placeholder="Select your areas of expertise..."
                              />
                            </FormControl>
                            <FormDescription>
                              Choose the subjects and skills you can teach
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    {onBackToRoleSelection && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onBackToRoleSelection}
                        className="min-w-[120px]"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Role Selection
                      </Button>
                    )}
                    {!onBackToRoleSelection && <div />}
                    <Button type="submit" className="min-w-[120px]">
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </>
        )}

        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Select Company (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                You can associate your teacher profile with a company. This is
                optional and can be skipped.
              </p>

              {/* Company Search */}
              <div className="space-y-4">
                <Popover
                  open={companySearchOpen}
                  onOpenChange={setCompanySearchOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={companySearchOpen}
                      className="w-full justify-between"
                      disabled={isLoadingCompanies}
                    >
                      {selectedCompany ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage
                              src={
                                selectedCompany.logoUrl
                                  ? logoUrls[selectedCompany.logoUrl] ||
                                    undefined
                                  : undefined
                              }
                              alt={selectedCompany.name}
                            />
                            <AvatarFallback>
                              {selectedCompany.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {selectedCompany.name}
                          {selectedCompany.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                      ) : (
                        "Search companies..."
                      )}
                      {isLoadingCompanies ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search companies..." />
                      <CommandList>
                        <CommandEmpty>No companies found.</CommandEmpty>
                        <CommandGroup>
                          {companies.map((company) => (
                            <CommandItem
                              key={company.id}
                              onSelect={() => handleCompanySelect(company)}
                              className="flex items-center gap-2 p-2"
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={
                                    company.logoUrl
                                      ? logoUrls[company.logoUrl] || undefined
                                      : undefined
                                  }
                                  alt={company.name}
                                />
                                <AvatarFallback>
                                  {company.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {company.name}
                                  </span>
                                  {company.isVerified && (
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                                {company.location && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    {company.location}
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Selected Company Display */}
                {selectedCompany && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={
                            selectedCompany.logoUrl
                              ? logoUrls[selectedCompany.logoUrl] || undefined
                              : undefined
                          }
                          alt={selectedCompany.name}
                        />
                        <AvatarFallback>
                          {selectedCompany.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {selectedCompany.name}
                          </h3>
                          {selectedCompany.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        {selectedCompany.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {selectedCompany.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {selectedCompany.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {selectedCompany.location}
                            </div>
                          )}
                          {selectedCompany.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <a
                                href={selectedCompany.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                Website
                              </a>
                            </div>
                          )}
                          {selectedCompany.industry && (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {selectedCompany.industry}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCompany(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="min-w-[120px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="min-w-[120px]"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Profile Summary</h3>

                {/* Profile Image Preview */}
                {teacherData.profileUrl && (
                  <div className="flex items-center justify-center gap-4">
                    <ProfileImageUpload
                      value={teacherData.profileUrl}
                      onChange={() => {}} // Read-only in preview
                      disabled={true}
                      size="md"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Bio: </span>
                    <span className="text-muted-foreground">
                      {teacherData.bio}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Expertise: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacherData.expertise.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Company Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Association</h3>
                {selectedCompany ? (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={
                            selectedCompany.logoUrl
                              ? logoUrls[selectedCompany.logoUrl] || undefined
                              : undefined
                          }
                          alt={selectedCompany.name}
                        />
                        <AvatarFallback>
                          {selectedCompany.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {selectedCompany.name}
                          </span>
                          {selectedCompany.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        {selectedCompany.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {selectedCompany.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No company selected (you can add this later)
                  </p>
                )}
              </div>

              {/* Final Actions */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={onFinalSubmit}
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Complete Registration
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </>
  );
}
