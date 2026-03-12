/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button"; // Shadcn Button
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"; // Shadcn Sheet
import { Input } from "@/components/ui/input"; // Shadcn Input
import { Label } from "@/components/ui/label"; // Shadcn Label
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Shadcn Table
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, PencilLine } from "lucide-react"; // Lucide icons
import { useAppSelector } from "../../AppStore/store";
import { ScholarshipConcessionDialog } from "./ScholarshipConcessionDialog";
import {
  getAcademicSession,
  getLastFourSessions,
  getSchoolId,
} from "../Utilities/ReusableFn";
import moment from "moment";
import { API_BASE_URL } from "../Utilities/Constant";

const Home = () => {
  const sessions = useMemo(() => getLastFourSessions(), []);
  const currentSession = sessions[0]; // most recent one
  const schoolId = getSchoolId();

  const [students, setStudents] = useState<any>([]);
  const [classes, setClasses] = useState([]);

  const [selectedSession, setSelectedSession] = useState(currentSession);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    father_name: "",
    date_of_birth: "",
    gender: "",
    contact_phone: "",
    email: "",
    total_fees: 0,
    fees_paid: 0,
    balance: 0,
    late_fees_charges: 0,
    concession: 0,
    scholarship: 0,
    last_payment_date: "",
    due_date: "",
    enrollment_date: "",
    status: "active",
    standard: "",
    standard_id: "",
    roll_no: 0,
  });
  const [showScholarship, setShowScholarship] = useState(false);
  const [showConcession, setShowConcession] = useState(false);
  const [error, setError] = useState("");

  const formatDates = (student: any) => {
    const dateFields = [
      "date_of_birth",
      "enrollment_date",
      "last_payment_date",
      "due_date",
    ];
    const formatted = { ...student };
    dateFields.forEach((field) => {
      if (student[field]) {
        formatted[field] = moment(student[field]).format("YYYY-MM-DD");
      }
    });

    return formatted;
  };

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/students?school_id=${schoolId}`,
        );
        if (response.data.status === "success") {
          setStudents(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err: any) {
        console.log(err);
        setError("Failed to fetch students. Please try again.");
      }
    };
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
        setError("Failed to fetch classes. Please try again.");
      }
    };
    fetchStudents();
    fetchClasses();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!selectedSession) return students;

    return students.filter((student: any) => {
      const studentSession = getAcademicSession(student.enrollment_date);
      return studentSession === selectedSession;
    });
  }, [students, selectedSession]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // For Select we create a small wrapper/adapter
  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
    setError("");
  };
  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
    setError("");
  };

  // Handle form submission for add/edit
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const payload: any = {
      ...formData,
      school_id: schoolId,
      total_fees: Number(formData.total_fees) || 0,
      fees_paid: Number(formData.fees_paid) || 0,
      balance: Number(formData.balance) || 0,
      late_fees_charges: Number(formData.late_fees_charges) || 0,
      concession: Number(formData.concession) || 0,
      scholarship: Number(formData.scholarship) || 0,
      roll_no: Number(formData.roll_no) || 0,
    };

    // Validate numeric fields
    const numericFields = [
      "total_fees",
      "fees_paid",
      "balance",
      "late_fees_charges",
      "concession",
      "scholarship",
      "roll_no",
    ];
    for (const field of numericFields) {
      if (isNaN(payload[field])) {
        setError(`Invalid value for ${field}. Please enter a valid number.`);
        return;
      }
    }

    try {
      let response: any;
      if (editingStudent) {
        response = await axios.put(
          `${API_BASE_URL}/api/students/${editingStudent.student_id}`,
          payload,
        );
        if (response.data.status === "success") {
          setStudents((prev: any) =>
            prev.map((student: any) =>
              student.student_id === editingStudent.student_id
                ? response.data.data
                : student,
            ),
          );
        }
      } else {
        response = await axios.post(
          `${API_BASE_URL}/api/students`,
          payload,
        );
        if (response.data.status === "success") {
          setStudents((prev: any) => [...prev, response.data.data]);
        }
      }
      if (response.data.status === "success") {
        setIsSheetOpen(false);
        resetForm();
        setError("");
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (editingStudent
            ? "Failed to update student."
            : "Failed to add student.") + " Please try again.",
      );
    }
  };

  // Open sheet for adding a new student
  const handleAddStudent = () => {
    resetForm();
    setEditingStudent(null);
    setError("");
    setIsSheetOpen(true);
  };

  // Open sheet for editing a student
  const handleEditStudent = (student: any) => {
    setFormData({
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      father_name: student.father_name || "",
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "",
      contact_phone: student.contact_phone || "",
      email: student.email || "",
      total_fees: student.total_fees || 0,
      fees_paid: student.fees_paid || 0,
      balance: student.balance || 0,
      late_fees_charges: student.late_fees_charges || 0,
      concession: student.concession || 0,
      scholarship: student.scholarship || 0,
      last_payment_date: student.last_payment_date || "",
      due_date: student.due_date || "",
      enrollment_date: student.enrollment_date || "",
      status: student.status || "active",
      standard: student.standard || "",
      standard_id: "",
      roll_no: student.roll_no || 0,
    });
    setEditingStudent(student);
    setError("");
    setIsSheetOpen(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      father_name: "",
      date_of_birth: "",
      gender: "",
      contact_phone: "",
      email: "",
      total_fees: 0,
      fees_paid: 0,
      balance: 0,
      late_fees_charges: 0,
      concession: 0,
      scholarship: 0,
      last_payment_date: "",
      due_date: "",
      enrollment_date: "",
      status: "active",
      standard: "",
      standard_id: "",
      roll_no: 0,
    });
  };

  // Function to calculate next roll number for a given standard (class name)
  const getNextRollNo = (standard: string) => {
    const studentsInClass = students.filter(
      (s: any) => s.standard === standard,
    );
    if (studentsInClass.length === 0) return 1;

    const rollNumbers = studentsInClass.map((s: any) => s.roll_no);
    const maxRoll = Math.max(...rollNumbers);
    return maxRoll + 1;
  };

  // Handle class selection
  const handleClassChange = (classId: string) => {
    const selectedClass: any = classes.find(
      (c: any) => c.id.toString() === classId,
    );
    if (!selectedClass) return;

    const nextRollNo = getNextRollNo(selectedClass.classname);

    setFormData((prev) => ({
      ...prev,
      standard: selectedClass.classname,
      standard_id: selectedClass.id.toString(),
      roll_no: nextRollNo,
      tutions: parseFloat(selectedClass.tutions),
      admission: parseFloat(selectedClass.admission),
      annual: parseFloat(selectedClass.annual),
      others: parseFloat(selectedClass.others),
      // Optional: calculate total_fees as sum of all fees
      total_fees:
        parseFloat(selectedClass.tutions) * 12 +
        parseFloat(selectedClass.admission) +
        parseFloat(selectedClass.annual) +
        parseFloat(selectedClass.others),
      balance:
        parseFloat(selectedClass.tutions) * 12 +
        parseFloat(selectedClass.admission) +
        parseFloat(selectedClass.annual) +
        parseFloat(selectedClass.others),
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Student Details
        </h1>
      </div>
      <div className="flex gap-2 items-center justify-end mb-4">
        <Select value={selectedSession} onValueChange={setSelectedSession}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session} value={session}>
                Session {session}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleAddStudent}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Student
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-gray-700">ID</TableHead>
              <TableHead className="font-semibold text-gray-700">
                First Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Last Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Father's Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Standard
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Roll No
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Date of Enrollments
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Email
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Total Fees
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Contact
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Gender
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(formatDates).map((student: any) => (
                <TableRow key={student.student_id} className="hover:bg-gray-50">
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>{student.first_name}</TableCell>
                  <TableCell>{student.last_name}</TableCell>
                  <TableCell>{student.father_name}</TableCell>
                  <TableCell>{student.standard || "-"}</TableCell>
                  <TableCell>{student.roll_no || "-"}</TableCell>
                  <TableCell>{student.enrollment_date || "-"}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.total_fees || "0"}</TableCell>
                  <TableCell>{student.contact_phone || "-"}</TableCell>
                  <TableCell>{student.gender || "-"}</TableCell>
                  <TableCell>{student.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStudent(student)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-gray-500">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sheet for Add/Edit Student */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white p-4 w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingStudent ? "Edit Student" : "Add Student"}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="first_name" className="text-gray-700">
                First Name *
              </Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-gray-700">
                Last Name
              </Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter last name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="father_name" className="text-gray-700">
                Father's Name *
              </Label>
              <Input
                id="father_name"
                name="father_name"
                value={formData.father_name}
                onChange={handleInputChange}
                placeholder="Enter father's name"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="date_of_birth" className="text-gray-700">
                Date of Birth
              </Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="gender" className="text-gray-700">
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={handleGenderChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Gender</SelectLabel>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contact_phone" className="text-gray-700">
                Contact Phone
              </Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                type="number"
                value={formData.contact_phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="enrollment_date" className="text-gray-700">
                Date of Enrollment *
              </Label>
              <Input
                id="enrollment_date"
                name="enrollment_date"
                type="date"
                value={formData.enrollment_date}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="standard" className="text-gray-700">
                Standard*
              </Label>

              <Select
                onValueChange={handleClassChange}
                value={formData.standard}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a Standard" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.classname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="roll_no" className="text-gray-700">
                Roll No
              </Label>
              <Input
                id="roll_no"
                name="roll_no"
                value={formData.roll_no}
                onChange={handleInputChange}
                placeholder="Enter roll number"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="total_fees" className="text-gray-700">
                Total Fees
              </Label>
              <Input
                id="total_fees"
                name="total_fees"
                type="number"
                value={formData.total_fees}
                onChange={handleInputChange}
                placeholder="Enter total fees"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fees_paid" className="text-gray-700">
                Fees Paid
              </Label>
              <Input
                id="fees_paid"
                name="fees_paid"
                type="number"
                value={formData.fees_paid}
                onChange={handleInputChange}
                placeholder="Enter fees paid"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="late_fees_charges" className="text-gray-700">
                Late Fees Charges
              </Label>
              <Input
                id="late_fees_charges"
                name="late_fees_charges"
                type="number"
                value={formData.late_fees_charges}
                onChange={handleInputChange}
                placeholder="Enter late fees"
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="concession" className="text-gray-700">
                  Concession
                </Label>
                <PencilLine
                  className="w-4 h-4"
                  onClick={() => setShowConcession(true)}
                />
              </div>

              <Input
                id="concession"
                name="concession"
                type="number"
                value={formData.concession}
                onChange={handleInputChange}
                placeholder="Enter concession"
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="scholarship" className="text-gray-700">
                  Scholarship
                </Label>
                <PencilLine
                  className="w-4 h-4"
                  onClick={() => setShowScholarship(true)}
                />
              </div>

              <Input
                id="scholarship"
                name="scholarship"
                type="number"
                value={formData.scholarship}
                onChange={handleInputChange}
                placeholder="Enter scholarship"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="balance" className="text-gray-700">
                Balance
              </Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                value={formData.balance}
                onChange={handleInputChange}
                placeholder="Enter balance"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="last_payment_date" className="text-gray-700">
                Last Payment Date
              </Label>
              <Input
                id="last_payment_date"
                name="last_payment_date"
                type="date"
                value={formData.last_payment_date}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="due_date" className="text-gray-700">
                Due Date
              </Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-700">
                Status
              </Label>
              <Select
                onValueChange={handleStatusChange}
                value={formData.status}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">InActive</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                onClick={() => setIsSheetOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingStudent ? "Update" : "Add"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {showScholarship == true && (
        <ScholarshipConcessionDialog
          open={showScholarship}
          setOpen={setShowScholarship}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {showConcession == true && (
        <ScholarshipConcessionDialog
          open={showConcession}
          setOpen={setShowConcession}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
};

export default Home;
