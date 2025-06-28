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
import Layout from "@/layout";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MultiSelect } from "@/components/ui/multi-select";
import { EXPERTISE_CATEGORIES } from "@/lib/constants";
import { useTeacherRegistrationStore } from "@/store/use-teacher-registration-store";
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
  Users,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/use-companies";
import { useSecureImages } from "@/hooks/use-secure-media";

// Form schemas
const step1Schema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  expertise: z
    .array(z.string())
    .min(1, "Select at least one area of expertise"),
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

export default function TeacherRegistration() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    currentStep,
    teacherData,
    selectedCompany,
    isSubmitting,
    teacherProfileId,
    nextStep,
    prevStep,
    setTeacherData,
    setSelectedCompany,
    setIsSubmitting,
    resetStore,
  } = useTeacherRegistrationStore();

  const [companySearchOpen, setCompanySearchOpen] = useState(false);

  // Step 1 form
  const step1Form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      bio: teacherData.bio,
      expertise: teacherData.expertise,
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

  // Final submission mutation
  const finalSubmitMutation = useMutation({
    mutationFn: async () => {
      if (!teacherProfileId) {
        // Scenario 2: Create profile at step 3
        const response = await fetch("/api/teacher", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...teacherData,
            ...(selectedCompany && { companyId: selectedCompany.id }),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create teacher profile");
        }

        return response.json();
      } else {
        // Update with company if selected
        if (selectedCompany) {
          const response = await fetch(`/api/teacher/${teacherProfileId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              companyId: selectedCompany.id,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update teacher profile");
          }

          return response.json();
        }

        // No profile exists, this shouldn't happen in scenario 2
        throw new Error("No teacher data found");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Registration completed successfully!");
      resetStore();
      router.push("/teacher/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  // Handle step 1 submission
  const onStep1Submit = (values: Step1FormValues) => {
    setTeacherData(values);
    nextStep();
  };

  // Handle company selection
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCompanySearchOpen(false);
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await finalSubmitMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8">
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
                    <FormField
                      control={step1Form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about yourself, your experience, and what makes you a great teacher..."
                              className="min-h-[100px]"
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

                    <div className="flex justify-end">
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
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search companies..." />
                        <CommandEmpty>No companies found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {companies?.map((company: Company) => {
                              return (
                                <CommandItem
                                  key={company.id}
                                  value={company.name}
                                  onSelect={() => handleCompanySelect(company)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage
                                        src={
                                          company.logoUrl
                                            ? logoUrls[company.logoUrl] ||
                                              undefined
                                            : undefined
                                        }
                                        alt={company.name}
                                      />
                                      <AvatarFallback>
                                        {company.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                          {company.name}
                                        </span>
                                        {company.isVerified && (
                                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                                        )}
                                      </div>
                                      {company.industry && (
                                        <p className="text-sm text-muted-foreground">
                                          {company.industry}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Selected Company Details */}
                  {selectedCompany && (
                    <Card className="p-4">
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
                          <AvatarFallback className="text-lg">
                            {selectedCompany.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {selectedCompany.name}
                            </h3>
                            {selectedCompany.isVerified && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800"
                              >
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          {selectedCompany.description && (
                            <p className="text-muted-foreground">
                              {selectedCompany.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {selectedCompany.industry && (
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {selectedCompany.industry}
                              </div>
                            )}
                            {selectedCompany.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {selectedCompany.location}
                              </div>
                            )}
                            {selectedCompany.website && (
                              <div className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
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
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCompany(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={nextStep}>
                    Skip / Next <ArrowRight className="w-4 h-4 ml-2" />
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
                  Review & Complete Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Teacher Profile Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Teacher Profile</h3>
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Bio
                        </label>
                        <p className="mt-1">{teacherData.bio}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Expertise
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {teacherData.expertise.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Company Preview */}
                {selectedCompany && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Associated Company
                      </h3>
                      <Card className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
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
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">
                                {selectedCompany.name}
                              </h4>
                              {selectedCompany.isVerified && (
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-800"
                                >
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
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {selectedCompany.industry && (
                                <span>
                                  Industry: {selectedCompany.industry}
                                </span>
                              )}
                              {selectedCompany.location && (
                                <span>
                                  Location: {selectedCompany.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="min-w-[150px]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Complete Registration
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
