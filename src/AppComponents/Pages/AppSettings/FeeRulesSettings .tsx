import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GraduationCap, Pencil, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  classesApi,
  settingsApi,
  type ClassData,
} from "@/AppComponents/Utilities/apis/api";
import { getSchoolId } from "@/AppComponents/Utilities/ReusableFn";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { getFeeRules } from "../StudentDirectory/utils/helpers";
import {
  feeRulesApi,
  type FeeRule,
  type FeeRuleResponse,
} from "@/AppComponents/Utilities/apis/api";



// ── API helpers ───────────────────────────────────────────────────────────────



const postFeeRule = <T = FeeRule>(
  body: Record<string, unknown>,
): Promise<FeeRuleResponse<T>> => feeRulesApi.create<T>(body);


const updateFeeRule = <T = FeeRule>(
  id: number,
  body: Record<string, unknown>,
): Promise<FeeRuleResponse<T>> => feeRulesApi.update<T>(id, body);

// ── Types ─────────────────────────────────────────────────────────────────────

interface Preset {
  id: number;
  preset_name: string;
  value_type: "flat" | "percentage";
  value: number;
  applicable_classes: string[] | null;
}

interface LateFeeRule {
  id?: number;
  due_day_of_month: string;
  grace_days: string;
  late_fee_amount: string;
}

const blankPreset = () => ({
  name: "",
  type: "flat" as "flat" | "percentage",
  value: "",
  classes: [] as string[],
});

// ── ClassPicker ───────────────────────────────────────────────────────────────

function ClassPicker({
  selected,
  onChange,
  classes,
  classesLoading,
  classesError,
}: {
  selected: string[];
  onChange: (val: string[]) => void;
  classes: string[];
  classesLoading: boolean;
  classesError: string;
}) {
  const isAll = selected.length === 0;

  const toggle = (cls: string) => {
    if (selected.includes(cls)) onChange(selected.filter((c) => c !== cls));
    else onChange([...selected, cls]);
  };

  const label = isAll
    ? "All Classes"
    : selected.length === 1
      ? selected[0]
      : `${selected.length} classes selected`;

  return (
    <div className="space-y-1">
      <Label>Applicable Classes</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full cursor-pointer justify-between font-normal text-sm"
          >
            <span className={isAll ? "text-muted-foreground" : ""}>
              {label}
            </span>
            <GraduationCap className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 space-y-2" align="start">
          <div
            className="flex items-center gap-2 pb-2 border-b cursor-pointer"
            onClick={() => onChange([])}
          >
            <Checkbox checked={isAll} onCheckedChange={() => onChange([])} />
            <span className="text-sm font-medium">All Classes (default)</span>
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-55 overflow-y-auto">
            {classes.map((cls) => (
              <div
                key={cls}
                className="flex items-center gap-2 cursor-pointer py-0.5"
                onClick={() => toggle(cls)}
              >
                <Checkbox
                  checked={selected.includes(cls)}
                  onCheckedChange={() => toggle(cls)}
                />
                <span className="text-sm">{cls}</span>
              </div>
            ))}
            {!classesLoading && !classesError && classes.length === 0 && (
              <p className="col-span-2 text-xs text-muted-foreground py-2">
                No classes have been added for this school.
              </p>
            )}
          </div>
          {classesLoading && (
            <p className="text-xs text-muted-foreground">Loading classes…</p>
          )}
          {classesError && (
            <p className="text-xs text-destructive">{classesError}</p>
          )}
          {!isAll && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 text-xs text-muted-foreground"
              onClick={() => onChange([])}
            >
              Reset to All Classes
            </Button>
          )}
        </PopoverContent>
      </Popover>

      {!isAll && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selected.map((cls) => (
            <Badge
              key={cls}
              variant="secondary"
              className="text-xs cursor-pointer"
              onClick={() => toggle(cls)}
            >
              {cls} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PresetRow ─────────────────────────────────────────────────────────────────

function PresetRow({ item, onEdit }: { item: Preset; onEdit: () => void }) {
  const classes = item.applicable_classes ?? [];
  const isAllClasses = classes.length === 0;
  const isFlat = item.value_type === "flat";

  return (
    <div className="group relative rounded-xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow duration-200 px-4 py-3">
      {/* Top row: name + edit button */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm text-foreground leading-tight">
          {item.preset_name}
        </span>
        <button
          onClick={onEdit}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded-md hover:bg-muted"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Bottom row: classes + value badge */}
      <div className="flex items-center justify-between mt-2">
        {/* Class chips */}
        <div className="flex flex-wrap gap-1">
          {isAllClasses ? (
            <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
              <GraduationCap className="h-3 w-3" /> All Classes
            </span>
          ) : (
            <>
              {classes.slice(0, 3).map((cls) => (
                <span
                  key={cls}
                  className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5"
                >
                  {cls}
                </span>
              ))}
              {classes.length > 3 && (
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  +{classes.length - 3}
                </span>
              )}
            </>
          )}
        </div>

        {/* Value badge */}
        <span
          className={
            isFlat
              ? "inline-flex items-center rounded-lg px-3 py-1 text-sm font-bold tracking-tight bg-emerald-50 text-emerald-700"
              : "inline-flex items-center rounded-lg px-3 py-1 text-sm font-bold tracking-tight bg-blue-50 text-blue-700"
          }
        >
          {isFlat ? `₹${item.value}` : `${item.value}%`}
        </span>
      </div>
    </div>
  );
}

// ── PresetForm ────────────────────────────────────────────────────────────────

function PresetForm({
  preset,
  setPreset,
  classes,
  classesLoading,
  classesError,
  onSubmit,
  namePlaceholder,
  isEditing,
  loading,
  onCancelEdit,
}: {
  preset: ReturnType<typeof blankPreset>;
  setPreset: (v: ReturnType<typeof blankPreset>) => void;
  classes: string[];
  classesLoading: boolean;
  classesError: string;
  onSubmit: () => void;
  namePlaceholder: string;
  isEditing: boolean;
  loading: boolean;
  onCancelEdit: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Preset Name</Label>
        <Input
          placeholder={namePlaceholder}
          value={preset.name}
          onChange={(e) => setPreset({ ...preset, name: e.target.value })}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <Label>Type</Label>
          <Select
            value={preset.type}
            onValueChange={(v: "flat" | "percentage") =>
              setPreset({ ...preset, type: v })
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Flat (₹)</SelectItem>
              <SelectItem value="percentage">Percent (%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1">
          <Label>Value</Label>
          <Input
            type="number"
            placeholder="e.g. 500"
            value={preset.value}
            onChange={(e) => setPreset({ ...preset, value: e.target.value })}
          />
        </div>
      </div>

      <ClassPicker
        selected={preset.classes}
        onChange={(classes) => setPreset({ ...preset, classes })}
        classes={classes}
        classesLoading={classesLoading}
        classesError={classesError}
      />

      <div className="flex gap-2">
        {isEditing && (
          <Button variant="outline" className="flex-1" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
        <Button
          className="flex-1 cursor-pointer shadow-lg hover:bg-black/80 shadow-gray-900"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            "Update Preset"
          ) : (
            "+ Add Preset"
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

function FeeRulesSettings({ openSheet, setOpenSheet }: any) {
  const schoolId = getSchoolId();

  // ── Late Fee state ──
  const [lateFee, setLateFee] = useState<LateFeeRule>({
    due_day_of_month: "",
    grace_days: "",
    late_fee_amount: "",
  });
  const [lateFeeLoading, setLateFeeLoading] = useState(false);

  // ── Concessions state ──
  const [concessions, setConcessions] = useState<Preset[]>([]);
  const [newConcession, setNewConcession] = useState(blankPreset());
  const [editingConcession, setEditingConcession] = useState<Preset | null>(
    null,
  );
  const [concessionLoading, setConcessionLoading] = useState(false);

  // ── Scholarships state ──
  const [scholarships, setScholarships] = useState<Preset[]>([]);
  const [newScholarship, setNewScholarship] = useState(blankPreset());
  const [editingScholarship, setEditingScholarship] = useState<Preset | null>(
    null,
  );
  const [scholarshipLoading, setScholarshipLoading] = useState(false);
  const [singleDiscountOnly, setSingleDiscountOnly] = useState(false);
  const [discountSettingLoading, setDiscountSettingLoading] = useState(false);
  const [discountSettingReady, setDiscountSettingReady] = useState(false);
  const [discountSettingError, setDiscountSettingError] = useState("");
  const [classes, setClasses] = useState<string[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState("");

  // ── GET: load all rules — fires only once when sheet opens ───────────────
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!openSheet || hasFetched.current) return;
    hasFetched.current = true;

    const loadRules = async () => {
      setClasses([]);
      setClassesLoading(true);
      setClassesError("");

      try {
        const [lateRes, concRes, scholRes] = await Promise.all([
          getFeeRules<LateFeeRule & { id: number }>("late_fee"),
          getFeeRules<Preset>("concession"),
          getFeeRules<Preset>("scholarship"),
        ]);

        if (lateRes.data?.length) {
          const r = lateRes.data[0];
          setLateFee({
            id: r.id,
            due_day_of_month: String(r.due_day_of_month ?? ""),
            grace_days: String(r.grace_days ?? ""),
            late_fee_amount: String(r.late_fee_amount ?? ""),
          } as any);
        }

        setConcessions(concRes.data ?? []);
        setScholarships(scholRes.data ?? []);
      } catch (err) {
        console.error("Failed to load fee rules:", err);
      }

      try {
        if (schoolId == null) {
          throw new Error("The current school could not be identified.");
        }
        const response = await classesApi.getAll(schoolId);
        if (response.status !== "success") {
          throw new Error(response.message || "The classes request failed.");
        }
        setClasses(
          Array.from(
            new Set(
              response.data
                .map((classItem: ClassData) => classItem.classname.trim())
                .filter(Boolean),
            ),
          ),
        );
      } catch (err) {
        console.error("Failed to load current school's classes:", err);
        setClassesError("Unable to load classes for this school.");
      } finally {
        setClassesLoading(false);
      }

      try {
        const settings = await settingsApi.getAll();
        if (!settings.success) {
          throw new Error("The settings request was not successful.");
        }
        setSingleDiscountOnly(
          ["true", "1"].includes(
            String(settings.data?.single_discount_only).toLowerCase(),
          ),
        );
        setDiscountSettingReady(true);
        setDiscountSettingError("");
      } catch (err) {
        console.error("Failed to load discount settings:", err);
        setDiscountSettingReady(false);
        setDiscountSettingError("Unable to load discount settings.");
      }
    };

    loadRules();
  }, [openSheet, schoolId]);

  const updateSingleDiscountSetting = async (enabled: boolean) => {
    setDiscountSettingLoading(true);
    setDiscountSettingError("");
    try {
      const response = await settingsApi.update({
        single_discount_only: String(enabled),
      });
      if (!response.success) {
        throw new Error(response.message || "The settings update failed.");
      }
      setSingleDiscountOnly(enabled);
    } catch (err) {
      console.error("Failed to update discount settings:", err);
      setDiscountSettingError("Unable to save this setting. Please try again.");
    } finally {
      setDiscountSettingLoading(false);
    }
  };

  // Reset fetch guard when sheet closes so it re-fetches next open
  useEffect(() => {
    if (!openSheet) hasFetched.current = false;
  }, [openSheet]);

  // ── POST / PUT: Late Fee ──────────────────────────────────────────────────
  const saveLateFee = async () => {
    setLateFeeLoading(true);
    try {
      const body = {
        rule_type: "late_fee",
        due_day_of_month: Number(lateFee.due_day_of_month),
        grace_days: Number(lateFee.grace_days),
        late_fee_amount: Number(lateFee.late_fee_amount),
      };

      if ((lateFee as any).id) {
        await updateFeeRule<LateFeeRule & { id: number }>(
          (lateFee as any).id,
          body,
        );
      } else {
        const res = await postFeeRule<LateFeeRule & { id: number }>(body);
        setLateFee((prev) => ({ ...prev, id: res.data.id }) as any);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLateFeeLoading(false);
    }
  };

  // ── POST: Add Concession ──────────────────────────────────────────────────
  const addConcession = async () => {
    if (!newConcession.name || !newConcession.value) return;
    setConcessionLoading(true);
    try {
      const res = await postFeeRule<Preset>({
        rule_type: "concession",
        preset_name: newConcession.name,
        value_type: newConcession.type,
        value: Number(newConcession.value),
        applicable_classes: newConcession.classes.length
          ? newConcession.classes
          : null,
      });
      setConcessions((prev) => [res.data, ...prev]);
      setNewConcession(blankPreset());
    } catch (err) {
      console.error(err);
    } finally {
      setConcessionLoading(false);
    }
  };

  // ── PUT: Update Concession ────────────────────────────────────────────────
  const updateConcession = async () => {
    if (!editingConcession || !newConcession.name || !newConcession.value)
      return;
    setConcessionLoading(true);
    try {
      const res = await updateFeeRule<Preset>(editingConcession.id, {
        preset_name: newConcession.name,
        value_type: newConcession.type,
        value: Number(newConcession.value),
        applicable_classes: newConcession.classes.length
          ? newConcession.classes
          : null,
      });
      setConcessions((prev) =>
        prev.map((c) => (c.id === editingConcession.id ? res.data : c)),
      );
      setEditingConcession(null);
      setNewConcession(blankPreset());
    } catch (err) {
      console.error(err);
    } finally {
      setConcessionLoading(false);
    }
  };

  const startEditConcession = (item: Preset) => {
    setEditingConcession(item);
    setNewConcession({
      name: item.preset_name,
      type: item.value_type,
      value: String(item.value),
      classes: item.applicable_classes ?? [],
    });
  };

  // ── POST: Add Scholarship ─────────────────────────────────────────────────
  const addScholarship = async () => {
    if (!newScholarship.name || !newScholarship.value) return;
    setScholarshipLoading(true);
    try {
      const res = await postFeeRule<Preset>({
        rule_type: "scholarship",
        preset_name: newScholarship.name,
        value_type: newScholarship.type,
        value: Number(newScholarship.value),
        applicable_classes: newScholarship.classes.length
          ? newScholarship.classes
          : null,
      });
      setScholarships((prev) => [res.data, ...prev]);
      setNewScholarship(blankPreset());
    } catch (err) {
      console.error(err);
    } finally {
      setScholarshipLoading(false);
    }
  };

  // ── PUT: Update Scholarship ───────────────────────────────────────────────
  const updateScholarship = async () => {
    if (!editingScholarship || !newScholarship.name || !newScholarship.value)
      return;
    setScholarshipLoading(true);
    try {
      const res = await updateFeeRule<Preset>(editingScholarship.id, {
        preset_name: newScholarship.name,
        value_type: newScholarship.type,
        value: Number(newScholarship.value),
        applicable_classes: newScholarship.classes.length
          ? newScholarship.classes
          : null,
      });
      setScholarships((prev) =>
        prev.map((s) => (s.id === editingScholarship.id ? res.data : s)),
      );
      setEditingScholarship(null);
      setNewScholarship(blankPreset());
    } catch (err) {
      console.error(err);
    } finally {
      setScholarshipLoading(false);
    }
  };

  const startEditScholarship = (item: Preset) => {
    setEditingScholarship(item);
    setNewScholarship({
      name: item.preset_name,
      type: item.value_type,
      value: String(item.value),
      classes: item.applicable_classes ?? [],
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Sheet open={!!openSheet} onOpenChange={() => setOpenSheet(null)}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Fee Rules</SheetTitle>
        </SheetHeader>

        <div className="mx-5 mt-5 flex items-start gap-3 rounded-lg border p-4">
          <button
            type="button"
            role="switch"
            aria-checked={singleDiscountOnly}
            aria-label="Allow only one discount per student"
            disabled={!discountSettingReady || discountSettingLoading}
            onClick={() =>
              updateSingleDiscountSetting(!singleDiscountOnly)
            }
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
              singleDiscountOnly ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-background shadow transition-transform ${
                singleDiscountOnly ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <div className="space-y-1">
            <Label>
              Allow only one discount per student
            </Label>
            <p className="text-xs text-muted-foreground">
              When enabled, applying a scholarship clears the concession, and
              applying a concession clears the scholarship.
            </p>
            {discountSettingLoading && (
              <p className="text-xs text-muted-foreground">Saving setting…</p>
            )}
            {!discountSettingReady && !discountSettingError && (
              <p className="text-xs text-muted-foreground">
                Loading setting…
              </p>
            )}
            {discountSettingError && (
              <p className="text-xs text-destructive">
                {discountSettingError}
              </p>
            )}
          </div>
        </div>

        <Tabs defaultValue="latefee" className="p-5 mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="latefee" className="flex-1 cursor-pointer ">
              Late Fee
            </TabsTrigger>
            <TabsTrigger value="concessions" className="flex-1 cursor-pointer ">
              Concessions
            </TabsTrigger>
            <TabsTrigger
              value="scholarships"
              className="flex-1 cursor-pointer "
            >
              Scholarships
            </TabsTrigger>
          </TabsList>

          {/* ── Late Fee Tab ── */}
          <TabsContent value="latefee" className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label>Due Day of Month</Label>
              <Input
                type="number"
                placeholder="e.g. 10"
                value={lateFee.due_day_of_month}
                onChange={(e) =>
                  setLateFee({ ...lateFee, due_day_of_month: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Grace Days</Label>
              <Input
                type="number"
                placeholder="e.g. 5"
                value={lateFee.grace_days}
                onChange={(e) =>
                  setLateFee({ ...lateFee, grace_days: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Late Fee Amount (₹ per month)</Label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={lateFee.late_fee_amount}
                onChange={(e) =>
                  setLateFee({ ...lateFee, late_fee_amount: e.target.value })
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Fee is due on day {lateFee.due_day_of_month || "?"}, with{" "}
              {lateFee.grace_days || "?"} grace days. After that ₹
              {lateFee.late_fee_amount || "?"} is charged per month late.
            </p>
            <Button
              className="w-full cursor-pointer shadow-lg hover:bg-black/80 shadow-gray-900"
              onClick={saveLateFee}
              disabled={lateFeeLoading}
            >
              {lateFeeLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (lateFee as any).id ? (
                "Update Late Fee Rule"
              ) : (
                "Save Late Fee Rule"
              )}
            </Button>
          </TabsContent>

          {/* ── Concessions Tab ── */}
          <TabsContent value="concessions" className="space-y-4 mt-4">
            <PresetForm
              preset={newConcession}
              setPreset={setNewConcession}
              classes={classes}
              classesLoading={classesLoading}
              classesError={classesError}
              onSubmit={editingConcession ? updateConcession : addConcession}
              namePlaceholder="e.g. Sibling Discount"
              isEditing={!!editingConcession}
              loading={concessionLoading}
              onCancelEdit={() => {
                setEditingConcession(null);
                setNewConcession(blankPreset());
              }}
            />
            <div className="space-y-2 mt-2">
              {concessions.map((c) => (
                <PresetRow
                  key={c.id}
                  item={c}
                  onEdit={() => startEditConcession(c)}
                />
              ))}
              {concessions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No presets yet
                </p>
              )}
            </div>
          </TabsContent>

          {/* ── Scholarships Tab ── */}
          <TabsContent value="scholarships" className="space-y-4 mt-4">
            <PresetForm
              preset={newScholarship}
              setPreset={setNewScholarship}
              classes={classes}
              classesLoading={classesLoading}
              classesError={classesError}
              onSubmit={editingScholarship ? updateScholarship : addScholarship}
              namePlaceholder="e.g. Merit Scholarship"
              isEditing={!!editingScholarship}
              loading={scholarshipLoading}
              onCancelEdit={() => {
                setEditingScholarship(null);
                setNewScholarship(blankPreset());
              }}
            />
            <div className="space-y-2 mt-2">
              {scholarships.map((s) => (
                <PresetRow
                  key={s.id}
                  item={s}
                  onEdit={() => startEditScholarship(s)}
                />
              ))}
              {scholarships.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No presets yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export default FeeRulesSettings;
