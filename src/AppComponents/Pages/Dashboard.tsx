/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  //  ChartConfig,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DollarSign, UserRoundCheck, UserRoundX, Users } from "lucide-react";
import { API_BASE_URL } from "../Utilities/Constant";

const Dashboard = () => {
  const [data, setData] = useState([]);

  const activeInactive = [
    { year: "2022", active: 10, inactive: 3 },
    { year: "2023", active: 21, inactive: 8 },
    { year: "2024", active: 105, inactive: 11 },
    { year: "2025", active: 90, inactive: 21 },
    { year: "2026", active: 113, inactive: 29 },
  ];

  const studentStrength = [
    { class: "1st", students: 0 },
    { class: "2nd", students: 0 },
    { class: "3rd", students: 0 },
    { class: "4th", students: 0 },
    { class: "5th", students: 0 },
    { class: "6th", students: 0 },
    { class: "7th", students: 3 },
    { class: "8th", students: 4 },
    { class: "9th", students: 4 },
    { class: "10th", students: 6 },
    { class: "11th", students: 6 },
    { class: "12th", students: 2 },
  ];

  const totalStudents = 25;
  const activeStudents = 18; // enrolled + no overdue balance / status active
  const inactiveStudents = 7; // either status inactive or overdue balance significantly

  const chartConfig = {
    active: {
      label: "Active",
      color: "hsl(var(--chart-1))",
    },
    inactive: {
      label: "Inactive",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/students`)
      .then((res) => res.json())
      .then((students) => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
        const counts: any = years.map((year) => ({
          year: year.toString(),
          admissions: students.data.filter(
            (s: any) => new Date(s.enrollment_date).getFullYear() === year
          ).length,
        }));
        setData(counts);
      })
      .catch((error) => console.error("Error fetching students:", error));
  }, []);

  return (
    <>
      <div className="flex flex-col gap-2 py-4">
        <div className="grid gap-2 md:grid-cols-3">
          {/* Total Students */}
          <Card className="border-l-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>

          {/* Active Students */}
          <Card className="border-l-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Students
              </CardTitle>
              <UserRoundCheck className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {activeStudents}
              </div>
            </CardContent>
          </Card>

          {/* Inactive Students */}
          <Card className="border-l-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inactive Students
              </CardTitle>
              <UserRoundX className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {inactiveStudents}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <Card className="border-l-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue (2026)
              </CardTitle>
              <DollarSign />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">204500</div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {/* Card 1 - Bar chart */}
        <Card className="flex flex-col h-80">
          <CardHeader>
            <CardTitle>Admissions in Last Five Consecutive Years</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="admissions" fill="#7b7bf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card 2 - Line chart */}
        <Card className="flex flex-col h-80">
          <CardHeader>
            <CardTitle>Active vs Inactive Students</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="h-full w-[-webkit-fill-available]"
            >
              <ResponsiveContainer>
                <LineChart
                  data={activeInactive}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickCount={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#7b7bf6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="inactive"
                    stroke="#ee6161"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        {/* Card 3 - Bar chart */}

        <Card className="flex flex-col h-80">
          <CardHeader>
            <CardTitle>Class-wise Student Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-full w-[-webkit-fill-available]"
            >
              <ResponsiveContainer>
                <BarChart
                  data={studentStrength}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="class"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => `${value}`}
                      />
                    }
                  />
                  <Bar
                    dataKey="students"
                    fill="var(--color-students)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
