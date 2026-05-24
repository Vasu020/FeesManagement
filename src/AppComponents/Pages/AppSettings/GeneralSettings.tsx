import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/AppComponents/Utilities/Constant";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const GeneralSettings = ({ openSheet, setOpenSheet }: any) => {
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [theme, setTheme] = useState("Light");
  const [sessionStartMonth, setSessionStartMonth] = useState("4"); // April default (1-indexed)

// On component mount, load saved settings
useEffect(() => {
  const fetchSettings = async () => {
    const res = await fetch(`${API_BASE_URL}/api/settings`);
    const data = await res.json();
    if (data.success) {
      setDateFormat(data.data.date_format ?? "DD/MM/YYYY");
      setTheme(data.data.theme ?? "Light");
      setSessionStartMonth(data.data.session_start_month ?? "4");
    }
  };
  fetchSettings();
}, []);

// On Save — bulk update
const saveGeneralSettings = async () => {
  await fetch(`${API_BASE_URL}/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date_format: dateFormat,
      theme,
      session_start_month: sessionStartMonth,
    }),
  });
  setOpenSheet(null);
};

  return (
    <div>
      <Sheet
        open={openSheet === "general"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
      >
        <SheetContent className="flex flex-col h-full overflow-hidden">
          <SheetHeader>
            <SheetTitle>General Settings</SheetTitle>
            <SheetDescription>
              Configure your application preferences
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
             {/* Session Start Month */}
            <div className="space-y-2">
              <Label htmlFor="session-start-month">Session Start Month</Label>
              <Select value={sessionStartMonth} onValueChange={setSessionStartMonth}>
                <SelectTrigger id="session-start-month">
                  <SelectValue placeholder="Select session start month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={String(index + 1)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="date-format">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="Dark">Dark</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                </SelectContent>
              </Select>
            </div>           
          </div>
          <SheetFooter>
            <Button onClick={saveGeneralSettings}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GeneralSettings;
