"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, Play } from "lucide-react";
import React, { useState } from "react";

const ContentTabs = ({ courseMock }: any) => {
  const [activeTab, setActiveTab] = useState("courseModules");

  return (
    <Tabs
      defaultValue="courseModules"
      className="mb-8"
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="courseModules">Course Modules</TabsTrigger>
        <TabsTrigger value="courseDescription">Course Description</TabsTrigger>
        <TabsTrigger value="aboutCertificates">About Certificates</TabsTrigger>
      </TabsList>

      <TabsContent value="courseModules" className="space-y-4 mt-6">
        <Accordion type="single" collapsible className="w-full">
          {courseMock.chapters.map((chapter: any, index: number) => (
            <AccordionItem key={chapter.id} value={`chapter-${chapter.id}`}>
              <AccordionTrigger className="hover:bg-gray-50 px-4 py-3 rounded-lg">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">{chapter.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{chapter.duration} min</span>
                        {chapter.isFree && (
                          <Badge variant="outline" className="text-green-600">
                            Free
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3">
                <p className="text-gray-600 mb-4">{chapter.description}</p>
                <Button
                  disabled={!chapter.isFree}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {chapter.isFree ? "Watch Preview" : "Enroll to Watch"}
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Button className="w-full bg-green-600 hover:bg-green-700 mt-4">
          Start Course Now
        </Button>
      </TabsContent>

      <TabsContent value="courseDescription" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>About This Course</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              This five-phase course on HACCP Food Safety System for Restaurants
              and other Catering Services is designed for food business owners,
              operators, and managers who want to implement a food safety system
              in their catering establishments. The course guides you through
              the entire process, from understanding food hazards to the
              implementation of a safe food system in your catering
              establishment.
            </p>
            <p className="text-gray-700 mb-4">
              You will learn about the catering industry, its sectors, and the
              various food hazards that could affect your food business. You
              will also be introduced to the HACCP food safety system, its
              history, and its benefits. The course also covers prerequisite
              programs and their role in the HACCP implementation.
            </p>
            <p className="text-gray-700">
              By the end of this course, you will be able to plan and implement
              a HACCP-based food safety system in your catering business,
              identify food hazards, establish critical control points, and
              develop a monitoring system.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="aboutCertificates" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Certification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/3">
                <img
                  src="/api/placeholder/300/200"
                  alt="Certificate sample"
                  className="rounded-lg border"
                />
              </div>
              <div className="md:w-2/3 space-y-4">
                <h3 className="text-lg font-medium">
                  Complete This CPD Accredited Course & Get Your Certificate!
                </h3>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mt-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Earn a Certificate</p>
                    <p className="text-sm text-gray-600">
                      A CPD accredited course completion certificate to showcase
                      your skills.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mt-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Shareable Digital Credential</p>
                    <p className="text-sm text-gray-600">
                      You will receive a digital certificate that you can share
                      on your resume and social media.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mt-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Advance in Your Career</p>
                    <p className="text-sm text-gray-600">
                      Add this skill to your LinkedIn profile to show off your
                      capabilities.
                    </p>
                  </div>
                </div>

                <Button className="bg-green-600 hover:bg-green-700">
                  Start Learning
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ContentTabs;
