// components/scholarship-dialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const scholarshipReasons = [
  "Merit Based (Academic Excellence)",
  "Merit-cum-Means",
  "Economically Weaker Section (EWS)",
  "Single Parent / Orphan",
  "Sports Excellence",
  "Sibling Concession (if applicable)",
  "Staff Ward",
  "Special Need / Disability",
  "Other",
];

export function ScholarshipConcessionDialog({
  open,
  setOpen,
  formData,
  setFormData,
}: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Scholarship Application:", formData);
    // → here you would call your API / submit form
    setOpen(false);
    // Optional: reset form
    setFormData({ name: "", class: "", rollNo: "", reason: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {<Button variant="outline">Apply for Scholarship</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scholarship Details</DialogTitle>
          <DialogDescription>
            Please fill in the details to apply for a scholarship.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="first_name">Student Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData,  first_name: e.target.value })
              }
              placeholder="Full name as per school record"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="standard">Standard</Label>
              <Input
                id="standard"
                value={formData.standard}
                onChange={(e) =>
                  setFormData({ ...formData, standard: e.target.value })
                }
                placeholder="e.g. 10-A"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="roll_no">Roll No</Label>
              <Input
                id="roll_no"
                value={formData.roll_no}
                onChange={(e) =>
                  setFormData({ ...formData, roll_no: e.target.value })
                }
                placeholder="e.g. 42"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">Reason / Category</Label>
            <Select
              value={formData.reason}
              onValueChange={(value) =>
                setFormData({ ...formData, reason: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scholarship category" />
              </SelectTrigger>
              <SelectContent>
                {scholarshipReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit">Submit Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
