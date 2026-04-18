import React, { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Plus,
  PencilLine,
  GraduationCap,
  Users,
  LayoutGrid,
  BookOpen,
  Search,
  X,
} from "lucide-react";
import axios from "axios";
import { getSchoolId } from "@/AppComponents/Utilities/ReusableFn";
import { API_BASE_URL } from "@/AppComponents/Utilities/Constant";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClassItem {
  id?: any;
  classname: string;
  sections: number | string;
  students: number | string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const blank = (): ClassItem => ({ classname: "", sections: "", students: "" });

// ─── Stat Pill ────────────────────────────────────────────────────────────────

const StatPill = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number | string;
}) => (
  <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 min-w-0">
    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
      <Icon size={15} className="text-slate-500" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none">
        {label}
      </p>
      <p className="text-lg font-bold text-slate-800 mt-0.5 leading-none">
        {value}
      </p>
    </div>
  </div>
);

// ─── Class Card ───────────────────────────────────────────────────────────────

const ClassCard = ({
  cls,
  onEdit,
  index,
}: {
  cls: any;
  onEdit: (cls: any) => void;
  index: number;
}) => (
  <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 overflow-hidden">
    {/* Top bar */}
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shadow-md shadow-gray-900 shrink-0">
          <BookOpen size={18} className="text-white" />
        </div>
        <p className="text-sm font-bold text-slate-800">{cls.classname}</p>
      </div>
      <button
        onClick={() => onEdit(cls)}
        className="opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg"
      >
        <PencilLine size={12} />
        Edit
      </button>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 divide-x divide-slate-50">
      <div className="flex items-center gap-2.5 px-5 py-3.5">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <LayoutGrid size={13} className="text-slate-500" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none">
            Sections
          </p>
          <p className="text-base font-bold text-slate-700 mt-0.5 leading-none">
            {cls.sections ?? "—"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 px-5 py-3.5">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <Users size={13} className="text-slate-500" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none">
            Students
          </p>
          <p className="text-base font-bold text-slate-700 mt-0.5 leading-none">
            {cls.students ?? "—"}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ─── Text Input ───────────────────────────────────────────────────────────────

const FormInput = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  icon: Icon,
}: {
  id: string;
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: any;
}) => (
  <div className="space-y-1.5">
    <Label
      htmlFor={id}
      className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
    >
      {label}
    </Label>
    <div className="relative">
      {Icon && (
        <Icon
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full h-10 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400
          ${Icon ? "pl-8 pr-3" : "px-3"}
          ${
            disabled
              ? "bg-slate-50 text-slate-400 cursor-not-allowed"
              : "bg-white text-slate-800 placeholder:text-slate-300"
          }`}
      />
      {disabled && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
          locked
        </span>
      )}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ClassSettings = ({ openSheet, setOpenSheet }: any) => {
  const schoolId = getSchoolId();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [openClassSheet, setOpenClassSheet] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const [formItem, setFormItem] = useState<ClassItem>(blank());

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchClasses = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/classes?school_id=${schoolId}`,
      );
      if (res.data.status === "success") setClasses(res.data.data);
      else setError(res.data.message);
    } catch {
      setError("Failed to fetch classes. Please try again.");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ── Open sheet ─────────────────────────────────────────────────────────────

  const openAddEdit = (add: boolean, item?: any) => {
    setIsAdd(add);
    setFormItem(add ? blank() : { ...item });
    setError("");
    setOpenClassSheet(true);
  };

  // ── Input change ───────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormItem((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // ── Create ─────────────────────────────────────────────────────────────────

  const createClass = async () => {
    setSaving(true);
    try {
      const { classname, students, sections } = formItem;
      if (!classname || students === undefined || sections === undefined)
        throw new Error("All fields are required.");
      await axios.post(`${API_BASE_URL}/api/classes`, {
        school_id: schoolId,
        classname,
        students,
        sections,
        tuitions: 0,
        admission: 0,
        annual: 0,
        others: 0,
      });
      await fetchClasses();
      setOpenClassSheet(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to create class.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────────

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const { id, classname, students, sections } = formItem;
      await axios.put(`${API_BASE_URL}/api/classes/${id}`, {
        classname,
        students,
        sections,
      });
      await fetchClasses();
      setOpenClassSheet(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to update class.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = classes.filter((c) =>
    c.classname?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalStudents = classes.reduce(
    (a, c) => a + (parseInt(c.students) || 0),
    0,
  );
  const totalSections = classes.reduce(
    (a, c) => a + (parseInt(c.sections) || 0),
    0,
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Class List Sheet ─────────────────────────────────────────────── */}
      <Sheet
        open={openSheet === "classes"}
        onOpenChange={(o) => !o && setOpenSheet(null)}
      >
        <SheetContent className="w-full sm:max-w-2xl bg-slate-50 p-0 overflow-y-auto border-l border-slate-200">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-md shadow-gray-900">
                  <GraduationCap size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Manage Classes
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add, edit and manage class structure
                  </p>
                </div>
              </div>
              <button
                onClick={() => openAddEdit(true)}
                className="flex items-center gap-1.5 text-sm cursor-pointer font-semibold text-white bg-black px-4 py-2 hover:bg-black/80 rounded-xl shadow-md shadow-md shadow-gray-900 transition-all duration-200"
              >
                <Plus size={15} />
                Add Class
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="px-6 py-4 grid grid-cols-3 gap-3">
            <StatPill icon={BookOpen} label="Classes" value={classes.length} />
            <StatPill
              icon={LayoutGrid}
              label="Sections"
              value={totalSections}
            />
            <StatPill icon={Users} label="Students" value={totalStudents} />
          </div>

          {/* Search */}
          <div className="px-6 pb-3">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search classes…"
                className="w-full h-9 bg-white border border-slate-200 rounded-xl pl-8 pr-8 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Cards */}
          <div className="px-6 pb-6 grid grid-cols-1 gap-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                <GraduationCap size={36} className="opacity-20" />
                <p className="text-sm">
                  {search
                    ? "No classes match your search."
                    : "No classes found."}
                </p>
              </div>
            ) : (
              filtered.map((cls, i) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  index={i}
                  onEdit={(c) => openAddEdit(false, c)}
                />
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Add / Edit Sheet ─────────────────────────────────────────────── */}
      <Sheet
        open={openClassSheet}
        onOpenChange={(o) => !o && setOpenClassSheet(false)}
      >
        <SheetContent className="bg-slate-50 p-0 w-full max-w-sm overflow-hidden flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="bg-white border-b border-slate-100 px-6 py-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-md shadow-gray-900">
                {isAdd ? (
                  <Plus size={18} className="text-white" />
                ) : (
                  <PencilLine size={18} className="text-white" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  {isAdd ? "Add New Class" : "Edit Class"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAdd
                    ? "Fill in the details below"
                    : formItem.classname || "Update class details"}
                </p>
              </div>
            </div>
          </div>

          {/* Form body */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              isAdd ? createClass() : handleUpdate();
            }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {/* Fields card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
                <FormInput
                  id="classname"
                  label="Class Name"
                  value={formItem.classname}
                  onChange={handleInputChange}
                  placeholder="e.g. Class 10"
                  required
                  disabled={!isAdd}
                  icon={BookOpen}
                />
                <FormInput
                  id="sections"
                  label="Number of Sections"
                  type="number"
                  value={formItem.sections}
                  onChange={handleInputChange}
                  placeholder="e.g. 3"
                  icon={LayoutGrid}
                />
                <FormInput
                  id="students"
                  label="Number of Students"
                  type="number"
                  value={formItem.students}
                  onChange={handleInputChange}
                  placeholder="e.g. 120"
                  required
                  icon={Users}
                />
              </div>

              {/* Info note when editing */}
              {!isAdd && (
                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[9px] font-bold">i</span>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Class name is locked after creation. Only sections and
                    student count can be updated.
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-slate-100 px-5 py-4 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setOpenClassSheet(false)}
                className="h-9 px-4 cursor-pointer text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 text-sm cursor-pointer font-semibold text-white bg-black px-4 py-2 hover:bg-black/80 rounded-xl transition-all duration-200 hover:shadow-sm shadow-md shadow-gray-900"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    {isAdd ? "Creating…" : "Saving…"}
                  </>
                ) : isAdd ? (
                  "Create Class"
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClassSettings;
