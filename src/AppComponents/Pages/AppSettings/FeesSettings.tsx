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
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import axios from "axios";

import { Input } from "@/components/ui/input"; // Shadcn Input
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/AppComponents/Utilities/Constant";
import { getSchoolId } from "@/AppComponents/Utilities/ReusableFn";

const FeesSettings = ({ openSheet, setOpenSheet }: any) => {
  const schoolId = getSchoolId();
  const [fees, setFees] = useState([]);
  const [error, setError] = useState("");
  const [openFeesSheet, setOpenFeesSheet] = useState<any>(null);
  const [add, setAdd] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>({
    classname: "",
    annual: "0.0",
    admission: "0.0",
    tutions: "0.0",
    others: "0.0",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setEditItem((prev: any) => ({ ...prev, [name]: value }));
    setError("");
  };

  useEffect(() => {
    fetchfees();
  }, []);

  const fetchfees = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/classes?school_id=${schoolId}`,
      );
      if (response.data.status === "success") {
        setFees(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      console.log(err);
      setError("Failed to fetch students. Please try again.");
    }
  };

  const handleUpdate = async (
    classId: any,
    { classname, tutions, admission, annual, others }: any,
  ) => {
    try {
      const payload: any = {};
      if (tutions !== undefined && tutions !== null) payload.tutions = tutions;
      if (admission !== undefined && admission !== null)
        payload.admission = admission;
      if (annual !== undefined && annual !== null) payload.annual = annual;
      if (others !== undefined && others !== null) payload.others = others;
      if (classname !== undefined && classname !== null)
        payload.classname = classname;

      if (Object.keys(payload).length === 0) {
        throw new Error("At least one fee field must be provided");
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/classes/${classId}`,
        payload,
      );

      await fetchfees();

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Fee details updated successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update fee details",
      };
    }
  };

  return (
    <div>
      {" "}
      <div>
        <Sheet
          open={openSheet === "fees"}
          onOpenChange={(open) => !open && setOpenSheet(null)}
        >
          <SheetContent className="w-full sm:max-w-2xl bg-white p-4  overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Fees Structure</SheetTitle>
              <SheetDescription>Edit fees for each class</SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">
                      Class Name
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Annual Fee (₹)
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Admission Fee (₹)
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Tuition Fee (₹)
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Others(₹)
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees?.map((fee: any) => (
                    <TableRow key={fee?.id}>
                      <TableCell>{fee?.classname}</TableCell>
                      <TableCell>{fee?.annual}</TableCell>
                      <TableCell>{fee?.admission}</TableCell>
                      <TableCell>{fee?.tutions}</TableCell>
                      <TableCell>{fee?.others}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setOpenFeesSheet(true);
                            setEditItem(fee);
                          }}
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
          open={openFeesSheet}
          onOpenChange={(open) => !open && setOpenFeesSheet(null)}
        >
          <SheetContent className="bg-white p-4 w-full max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{`Edit Fees Structure`}</SheetTitle>
              <SheetDescription>
                Edit class details, sections, and student counts
              </SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // ← THIS IS CRITICAL: Stops page reload
                  if (add) {
                    // handleAdd(addEditItem);
                  } else {
                    handleUpdate(editItem?.id, editItem);
                  }
                }}
                className="space-y-4 mt-4"
              >
                <div>
                  <Label htmlFor="classname" className="text-gray-700">
                    Class Name
                  </Label>
                  <Input
                    id="classname"
                    name="classname"
                    value={editItem.classname}
                    onChange={handleInputChange}
                    placeholder="Enter Class Name"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="annual" className="text-gray-700">
                    Annual Fees (₹)
                  </Label>
                  <Input
                    id="annual"
                    name="annual"
                    value={editItem.annual}
                    onChange={handleInputChange}
                    placeholder="Enter Annual Fees"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="admission" className="text-gray-700">
                    Admission Fees (₹)
                  </Label>
                  <Input
                    id="admission"
                    name="admission"
                    value={editItem.admission}
                    onChange={handleInputChange}
                    placeholder="Enter Admission Fees"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tutions" className="text-gray-700">
                    Tutions Fees (₹)
                  </Label>
                  <Input
                    id="tutions"
                    name="tutions"
                    value={editItem.tutions}
                    onChange={handleInputChange}
                    placeholder="Enter tutions fees"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="others" className="text-gray-700">
                    Others Fees (₹)
                  </Label>
                  <Input
                    id="others"
                    name="others"
                    value={editItem.others}
                    onChange={handleInputChange}
                    placeholder="Enter others Fees"
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
                    onClick={() => setOpenFeesSheet(false)}
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

export default FeesSettings;
