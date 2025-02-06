import ButtonNvigation from "@/components/button-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/layout";
import { BarChart, BookOpen, GraduationCap, Users } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <Layout>
      {/* Top Navigation */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
              Teacher Dashboard
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tingkat Penyelesaian
              </CardTitle>
              <GraduationCap className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pendapatan
              </CardTitle>
              <BarChart className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp 20.250.000</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Management */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Course Items */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">
                      Web Development Fundamentals
                    </h3>
                    <p className="text-sm text-gray-500">
                      32 students enrolled
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                    Published
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Advanced React Patterns</h3>
                    <p className="text-sm text-gray-500">
                      18 students enrolled
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                    Draft
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ButtonNvigation
                  text="Buat Course Baru"
                  className="w-full text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  url="/teacher/courses/create"
                />
                <ButtonNvigation
                  text="Lihat Analytics"
                  className="w-full text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  url="/teacher/courses/analytics"
                />
                <ButtonNvigation
                  text="Kelola Students"
                  className="w-full text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  url="/teacher/courses/students"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
