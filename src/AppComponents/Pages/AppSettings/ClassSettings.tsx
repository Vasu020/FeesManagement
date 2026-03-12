import React, { useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input"; // Shadcn Input
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { getSchoolId } from "@/AppComponents/Utilities/ReusableFn";
import { API_BASE_URL } from "@/AppComponents/Utilities/Constant";

const ClassSettings = ({ openSheet, setOpenSheet }: any) => {
  const schoolId = getSchoolId();

  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  const [openClassSheet, setOpenClassSheet] = useState<any>(null);
  const [add, setAdd] = useState<any>(null);
  const [addEditItem, setAddEditItem] = useState<any>({
    classname: "",
    sections: 0,
    students: 0,
  });

  const fetchClasses = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/classes?school_id=${schoolId}`,
      );
      if (response.data.status === "success") {
        setClasses(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      console.log(err);
      setError("Failed to fetch students. Please try again.");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openAddEdit = (add: boolean, item: any) => {
    setOpenClassSheet(true);
    setAdd(add);
    setAddEditItem(
      add
        ? {
            classname: "",
            sections: "",
            students: "",
          }
        : item,
    );
  };

  const createClass = async ({
    classname,
    students,
    sections,
    tuitions = 0,
    admission = 0,
    annual = 0,
    others = 0,
  }: any) => {
    if (!classname || students === undefined || sections === undefined) {
      throw new Error("classname, students, and sections are required");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/classes`, {
        school_id: schoolId,
        classname,
        students,
        sections,
        tuitions,
        admission,
        annual,
        others,
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Class created successfully",
      };
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || "Failed to create class",
          status: error.response.status,
        };
      }

      return {
        success: false,
        message: error.message || "Network error",
      };
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setAddEditItem((prev: any) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleUpdate = async (
    classId: any,
    { classname, students, sections }: any,
  ) => {
    try {
      // Only include fields that are provided (not undefined or null)
      const payload: any = {};
      if (students !== undefined && students !== null)
        payload.students = students;
      if (sections !== undefined && sections !== null)
        payload.sections = sections;
      if (classname !== undefined && classname !== null)
        payload.classname = classname;

      if (Object.keys(payload).length === 0) {
        throw new Error(
          "At least one field (students or sections) must be provided",
        );
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/classes/${classId}`,
        payload,
      );

      await fetchClasses();
      setOpenSheet(null);

      return {
        success: true,
        data: response.data.data,
        message:
          response.data.message || "Students and sections updated successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update students and sections",
      };
    }
  };
  return (
    <div>
      {" "}
      <div>
        <Sheet
          open={openSheet === "classes"}
          onOpenChange={(open) => !open && setOpenSheet(null)}
        >
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{`Manage Classes`}</SheetTitle>
              <SheetDescription>
                {`Edit class details, sections, and student counts`}
              </SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <div>
                <Button
                  onClick={() => openAddEdit(true, addEditItem)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Class
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls: any) => (
                    <TableRow key={cls.id}>
                      <TableCell>{cls.classname}</TableCell>
                      <TableCell>{cls.sections} </TableCell>
                      <TableCell>{cls.students} </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAddEdit(false, cls)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div>
        <Sheet
          open={openClassSheet}
          onOpenChange={(open) => !open && setOpenClassSheet(null)}
        >
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{add ? `Add Class` : `Update Class`}</SheetTitle>
              <SheetDescription>
                Edit class details, sections, and student counts
              </SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // ← THIS IS CRITICAL: Stops page reload
                  if (add) {
                    createClass(addEditItem);
                  } else {
                    handleUpdate(addEditItem?.id, addEditItem);
                  }
                }}
                className="space-y-4 mt-4"
              >
                <div>
                  <Label htmlFor="classname" className="text-gray-700">
                    Class
                  </Label>
                  <Input
                    id="classname"
                    name="classname"
                    disabled={!add}
                    value={addEditItem.classname}
                    onChange={handleInputChange}
                    placeholder="Enter Class"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sections" className="text-gray-700">
                    Sections
                  </Label>
                  <Input
                    id="sections"
                    name="sections"
                    type="number"
                    value={addEditItem.sections}
                    onChange={handleInputChange}
                    placeholder="Enter sections"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="students" className="text-gray-700">
                    Students
                  </Label>
                  <Input
                    id="students"
                    name="students"
                    type="number"
                    value={addEditItem.students}
                    onChange={handleInputChange}
                    placeholder="Enter students"
                    className="mt-1"
                    required
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <SheetFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenSheet(false)}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {add ? "Add" : "Update"}
                  </Button>
                </SheetFooter>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ClassSettings;
