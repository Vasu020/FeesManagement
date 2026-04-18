import React, { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  PencilLine,
  Plus,
  Trash2,
  IndianRupee,
  GraduationCap,
  ReceiptText,
  LayoutList,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/AppComponents/Utilities/Constant";
import { getSchoolId } from "@/AppComponents/Utilities/ReusableFn";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OtherCategory {
  id: string;
  name: string;
  amount: string;
}

interface EditItem {
  id?: any;
  classname: string;
  annual: string;
  admission: string;
  tutions: string;
  others: string;
  otherCategories: OtherCategory[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const sumCategories = (cats: OtherCategory[]): string =>
  cats.reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0).toFixed(2);

const blankItem = (): EditItem => ({
  classname: "",
  annual: "0.00",
  admission: "0.00",
  tutions: "0.00",
  others: "0.00",
  otherCategories: [],
});

const fmt = (val: any) =>
  parseFloat(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ─── Fee Card ─────────────────────────────────────────────────────────────────

const feeTotal = (fee: any) =>
  [fee.annual, fee.admission, fee.tutions, fee.others].reduce(
    (a: number, v: any) => a + (parseFloat(v) || 0),
    0,
  );

const FeeCard = ({ fee, onEdit }: { fee: any; onEdit: (fee: any) => void }) => {
  const rows = [
    { label: "Annual Fee", value: fee.annual },
    { label: "Admission Fee", value: fee.admission },
    { label: "Tuition Fee", value: fee.tutions },
    { label: "Others", value: fee.others },
  ];

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 overflow-hidden">
      {/* Card header — class name + edit button + grand total */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shadow-md shadow-gray-900">
            <ReceiptText size={20} className="text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {fee.classname}
          </p>
        </div>

        {/* Grand total badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-0.5">
              Grand Total
            </p>
            <p className="flex justify-start text-base font-bold text-slate-800">
              ₹{fmt(feeTotal(fee))}
            </p>
          </div>
          <button
            onClick={() => onEdit(fee)}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg ml-2"
          >
            <PencilLine size={11} /> Edit
          </button>
        </div>
      </div>

      {/* Fee rows */}
      <div className="px-5 py-3 divide-y divide-slate-50">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-2">
            <span className="text-xs text-slate-500">{r.label}</span>
            <span className="text-xs font-semibold text-slate-700">
              ₹{fmt(r.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Sub-category tags */}
      {Array.isArray(fee.otherCategories) && fee.otherCategories.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {fee.otherCategories.map((c: any, i: number) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
            >
              {c.name} <span className="text-slate-300">·</span> ₹
              {fmt(c.amount)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Other Categories Editor ──────────────────────────────────────────────────

const OtherCategoriesEditor = ({
  categories,
  onChange,
}: {
  categories: OtherCategory[];
  onChange: (cats: OtherCategory[]) => void;
}) => {
  const total = sumCategories(categories);

  const add = () =>
    onChange([...categories, { id: uid(), name: "", amount: "" }]);
  const remove = (id: string) =>
    onChange(categories.filter((c) => c.id !== id));
  const update = (id: string, field: "name" | "amount", val: string) =>
    onChange(categories.map((c) => (c.id === id ? { ...c, [field]: val } : c)));

  return (
    <div className="space-y-3">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center">
            <LayoutList size={11} className="text-black-600" />
          </div>
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            Others Breakdown
          </span>
        </div>
        <button
          type="button"
          onClick={add}
          className="flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={11} /> Add Category
        </button>
      </div>

      {/* Empty state */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-8">
          <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Sparkles size={16} className="text-slate-300" />
          </div>
          <p className="text-xs text-slate-400 text-center max-w-[160px] leading-relaxed">
            No categories yet — add types like <em>Sports Fee</em> or{" "}
            <em>Lab Fee</em>.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100"
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <input
                type="text"
                placeholder="Category name"
                value={cat.name}
                onChange={(e) => update(cat.id, "name", e.target.value)}
                className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all"
              />
              <ChevronRight size={12} className="text-slate-300" />
              <div className="relative w-28 ">
                <IndianRupee
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={cat.amount}
                  onChange={(e) => update(cat.id, "amount", e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(cat.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Computed total pill */}
      {categories.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-md shadow-gray-200 border border-black-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Others Total
          </span>
          <span className="text-base font-bold text-black-600">
            ₹ {fmt(total)}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Labeled Fee Input ────────────────────────────────────────────────────────

const FeeInput = ({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
}) => (
  <div className="space-y-1.5">
    <Label
      htmlFor={id}
      className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
    >
      {label}
    </Label>
    <div className="relative">
      <IndianRupee
        size={12}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        id={id}
        name={id}
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder="0.00"
        className={`w-full h-10 border border-slate-200 rounded-xl pl-8 pr-10 text-sm transition-all focus:outline-none focus:ring-2
          ${
            disabled
              ? "bg-slate-50 text-slate-400 cursor-not-allowed"
              : "bg-white text-slate-800 focus:ring-blue-500/25 focus:border-blue-400"
          }`}
      />
      {disabled && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
          auto
        </span>
      )}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const FeesSettings = ({ openSheet, setOpenSheet }: any) => {
  const schoolId = getSchoolId();
  const [fees, setFees] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [openFeesSheet, setOpenFeesSheet] = useState(false);
  const [editItem, setEditItem] = useState<EditItem>(blankItem());

  const fetchfees = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/classes?school_id=${schoolId}`,
      );
      if (res.data.status === "success") setFees(res.data.data);
      else setError(res.data.message);
    } catch {
      setError("Failed to fetch fees.");
    }
  };

  useEffect(() => {
    fetchfees();
  }, []);

  const openEditSheet = (fee: any) => {
    const cats: OtherCategory[] = Array.isArray(fee.otherCategories)
      ? fee.otherCategories.map((c: any) => ({ ...c, id: c.id ?? uid() }))
      : [];
    setEditItem({
      id: fee.id,
      classname: fee.classname ?? "",
      annual: fee.annual ?? "0.00",
      admission: fee.admission ?? "0.00",
      tutions: fee.tutions ?? "0.00",
      others: sumCategories(cats) || fee.others || "0.00",
      otherCategories: cats,
    });
    setError("");
    setOpenFeesSheet(true);
  };

  const handleCategoryChange = (cats: OtherCategory[]) =>
    setEditItem((p) => ({
      ...p,
      otherCategories: cats,
      others: sumCategories(cats),
    }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "others") return;
    setEditItem((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const {
        id,
        classname,
        tutions,
        admission,
        annual,
        others,
        otherCategories,
      } = editItem;
      await axios.put(`${API_BASE_URL}/api/classes/${id}`, {
        classname,
        tutions,
        admission,
        annual,
        others,
        otherCategories: otherCategories.map(({ name, amount }) => ({
          name,
          amount,
        })),
      });
      await fetchfees();
      setOpenFeesSheet(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to update.",
      );
    } finally {
      setSaving(false);
    }
  };

  const grandTotal = (item: EditItem) =>
    [item.annual, item.admission, item.tutions, item.others].reduce(
      (a, v) => a + (parseFloat(v) || 0),
      0,
    );

  return (
    <div>
      {/* ── Class Fees List ──────────────────────────────────────────────── */}
      <Sheet
        open={openSheet === "fees"}
        onOpenChange={(o) => !o && setOpenSheet(null)}
      >
        <SheetContent className="w-200 sm:max-w-2xl bg-slate-50 p-0 overflow-y-auto border-l border-slate-200">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-md shadow-gray-900">
                <IndianRupee size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Fees Structure
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage fee categories for each class
                </p>
              </div>
            </div>
          </div>

          {/* Summary strip */}
          <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-6">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Total Classes
              </p>
              <p className="text-2xl font-bold text-slate-800">{fees.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Avg. Total Fee
              </p>
              <p className="text-2xl font-bold text-slate-800">
                ₹
                {fmt(
                  fees.length
                    ? fees.reduce(
                        (a, f) =>
                          a +
                          [f.annual, f.admission, f.tutions, f.others].reduce(
                            (s, v) => s + (parseFloat(v) || 0),
                            0,
                          ),
                        0,
                      ) / fees.length
                    : 0,
                )}
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="p-5 grid grid-cols-1 gap-3">
            {fees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                <GraduationCap size={36} className="opacity-20" />
                <p className="text-sm">No classes found.</p>
              </div>
            ) : (
              fees.map((fee) => (
                <FeeCard key={fee.id} fee={fee} onEdit={openEditSheet} />
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Edit Sheet ───────────────────────────────────────────────────── */}
      <Sheet
        open={openFeesSheet}
        onOpenChange={(o) => !o && setOpenFeesSheet(false)}
      >
        <SheetContent className="bg-slate-50 p-0 w-full max-w-md overflow-hidden flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="bg-white border-b border-slate-100 px-6 py-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-black/40">
                <PencilLine size={15} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Edit Fee Structure
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editItem.classname || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {/* Class name */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Class Info
                  </span>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="classname"
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  >
                    Class Name
                  </Label>
                  <input
                    id="classname"
                    name="classname"
                    type="text"
                    value={editItem.classname}
                    onChange={handleInputChange}
                    placeholder="e.g. Class 10 – A"
                    required
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Core fees */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Core Fees
                  </span>
                </div>
                <FeeInput
                  id="annual"
                  label="Annual Fee"
                  value={editItem.annual}
                  onChange={handleInputChange}
                  required
                />
                <FeeInput
                  id="admission"
                  label="Admission Fee"
                  value={editItem.admission}
                  onChange={handleInputChange}
                  required
                />
                <FeeInput
                  id="tutions"
                  label="Tuition Fee"
                  value={editItem.tutions}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Others + custom categories */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
                <OtherCategoriesEditor
                  categories={editItem.otherCategories}
                  onChange={handleCategoryChange}
                />
                <FeeInput
                  id="others"
                  label="Others Fee (auto-calculated)"
                  value={fmt(editItem.others)}
                  disabled
                />
              </div>

              {/* Grand total */}
              <div className="rounded-2xl bg-white p-4 flex items-center justify-between shadow-lg shadow-gray-200 border border-gray-100">
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Grand Total
                  </p>
                  <p className="flex justify-start text-2xl font-bold text-gray-900 mt-0.5">
                    ₹{fmt(grandTotal(editItem))}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <IndianRupee size={22} className="text-gray-700" />
                </div>
              </div>

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
                onClick={() => setOpenFeesSheet(false)}
                className="cursor-pointer h-9 px-4 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-9 px-5 text-sm cursor-pointer font-semibold text-white bg-black px-4 py-2 rounded-xl shadow-lg hover:bg-black/80 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shadow-gray-900"
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
                    Saving…
                  </>
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

export default FeesSettings;
