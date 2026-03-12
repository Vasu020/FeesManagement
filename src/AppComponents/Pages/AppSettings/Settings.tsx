import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Settings, School, DollarSign, UserRoundCog } from "lucide-react";

import GeneralSettings from "./GeneralSettings";
import ClassSettings from "./ClassSettings";
import FeesSettings from "./FeesSettings";

function SettingsPage() {
  // State for controlling Sheet visibility
  const [openSheet, setOpenSheet] = useState<any>(null);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* General Card */}
        <Card
          onClick={() => setOpenSheet("general")}
          className="cursor-pointer hover:bg-gray-50"
        >
          <CardHeader>
            <Settings className="h-6 w-6 text-muted-foreground mb-2" />
            <CardTitle>General</CardTitle>
            <CardDescription>
             {`View and update basic application details`}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Classes Card */}
        <Card
          onClick={() => setOpenSheet("classes")}
          className="cursor-pointer hover:bg-gray-50"
        >
          <CardHeader>
            <School className="h-6 w-6 text-muted-foreground mb-2" />
            <CardTitle>{`Classes`}</CardTitle>
            <CardDescription>
             {`Manage class configurations, including maximum student strength, number of sections,`}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Fees Structure Card */}
        <Card
          onClick={() => setOpenSheet("fees")}
          className="cursor-pointer hover:bg-gray-50"
        >
          <CardHeader>
            <DollarSign className="h-6 w-6 text-muted-foreground mb-2" />
            <CardTitle>Fees Structure</CardTitle>
            <CardDescription>
              {`Define and manage fee amounts and structures for specific classes`}
            </CardDescription>
          </CardHeader>
        </Card>

         {/* Users Card */}
        <Card
          onClick={() => setOpenSheet("users")}
          className="cursor-pointer hover:bg-gray-50"
        >
          <CardHeader>
            <UserRoundCog className="h-6 w-6 text-muted-foreground mb-2" />
            <CardTitle>{`Users`}</CardTitle>
            <CardDescription>
             {`Add, edit, and manage user accounts along with their roles and permissions`}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* General Settings Sheet */}
      {openSheet === "general" && (
        <GeneralSettings openSheet={openSheet} setOpenSheet={setOpenSheet} />
      )}

      {/* Classes Sheet with DataTable */}
      {openSheet === "classes" && (
        <ClassSettings openSheet={openSheet} setOpenSheet={setOpenSheet} />
      )}

      {/* Fees Structure Sheet with DataTable */}
      {openSheet === "fees" && (
        <FeesSettings openSheet={openSheet} setOpenSheet={setOpenSheet} />
      )}
    </div>
  );
}

export default SettingsPage;
