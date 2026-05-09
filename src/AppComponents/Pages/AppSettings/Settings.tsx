import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Settings, Newspaper, School, Landmark } from "lucide-react";

import GeneralSettings from "./GeneralSettings";
import ClassSettings from "./ClassSettings";
import FeesSettings from "./FeesSettings";
import FeeRulesSettings from "./FeeRulesSettings ";
function SettingsPage() {
  const [openSheet, setOpenSheet] = useState<any>(null);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* General Card */}
        <Card
          onClick={() => setOpenSheet("general")}
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white"
        >
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 shadow-lg shadow-gray-400">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl">General</CardTitle>
            <CardDescription>
              View and update basic application details
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Classes Card */}
        <Card
          onClick={() => setOpenSheet("classes")}
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white"
        >
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 shadow-lg shadow-gray-400">
              <School className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl">Classes</CardTitle>
            <CardDescription>
              Manage class configurations, including maximum student strength and sections
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Fees Structure Card */}
        <Card
          onClick={() => setOpenSheet("fees")}
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white"
        >
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 shadow-lg shadow-gray-400">
              <Landmark className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl">Fees Structure</CardTitle>
            <CardDescription>
              Define and manage fee amounts and structures for specific classes
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Fee Rules Card */}
        <Card
          onClick={() => setOpenSheet("feeRules")}
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white"
        >
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 shadow-lg shadow-gray-400">
              <Newspaper className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl">Fee Rules</CardTitle>
            <CardDescription>
              Configure late fee charges, concession presets and scholarship presets
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Sheets */}
      {openSheet === "general" && (
        <GeneralSettings openSheet={openSheet} setOpenSheet={setOpenSheet} />
      )}
      {openSheet === "classes" && (
        <ClassSettings openSheet={openSheet} setOpenSheet={setOpenSheet} />
      )}
      {openSheet === "fees" && (
        <FeesSettings openSheet={openSheet} setOpenSheet={setOpenSheet} />
      )}
      {openSheet === "feeRules" && (
        <FeeRulesSettings openSheet={openSheet} setOpenSheet={setOpenSheet} />
      )}
    </div>
  );
}

export default SettingsPage;