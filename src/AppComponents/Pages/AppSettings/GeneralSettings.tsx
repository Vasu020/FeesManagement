import React, { useState } from "react";
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

const GeneralSettings = ({openSheet, setOpenSheet}:any) => {
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [theme, setTheme] = useState("Light");
  // State for controlling Sheet visibility

  const handleDateFormatChange = (value: any) => setDateFormat(value);
  const handleThemeChange = (value: any) => setTheme(value);
  const saveGeneralSettings = () => setOpenSheet(null);

  return (
    <div>
      <Sheet
        open={openSheet === "general"}
        onOpenChange={(open) => !open && setOpenSheet(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>General Settings</SheetTitle>
            <SheetDescription>
              Configure your application preferences
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select value={dateFormat} onValueChange={handleDateFormatChange}>
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
              <Select value={theme} onValueChange={handleThemeChange}>
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
