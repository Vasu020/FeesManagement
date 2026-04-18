import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// ── All available classes in the school ──────────────────────────────────────
const ALL_CLASSES = [
  "Nursery", "LKG", "UKG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8",
  "Class 9", "Class 10", "Class 11", "Class 12",
];

// ── Reusable class-picker component ──────────────────────────────────────────
function ClassPicker({
  selected,
  onChange,
}: {
  selected: string[];   // [] means "All Classes"
  onChange: (val: string[]) => void;
}) {
  const isAll = selected.length === 0;

  const toggle = (cls: string) => {
    if (selected.includes(cls)) {
      onChange(selected.filter((c) => c !== cls));
    } else {
      onChange([...selected, cls]);
    }
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
            className="w-full justify-between font-normal text-sm"
          >
            <span className={isAll ? "text-muted-foreground" : ""}>{label}</span>
            <GraduationCap className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 space-y-2" align="start">
          {/* All Classes toggle */}
          <div
            className="flex items-center gap-2 pb-2 border-b cursor-pointer"
            onClick={() => onChange([])}
          >
            <Checkbox checked={isAll} onCheckedChange={() => onChange([])} />
            <span className="text-sm font-medium">All Classes (default)</span>
          </div>
          {/* Individual class checkboxes */}
          <div className="grid grid-cols-2 gap-1 max-h-55 overflow-y-auto">
            {ALL_CLASSES.map((cls) => (
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
          </div>
          {/* Quick-clear */}
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

      {/* Badge preview for selected classes */}
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

// ── Preset row display ────────────────────────────────────────────────────────
function PresetRow({
  item,
  onDelete,
}: {
  item: { id: number; name: string; type: string; value: string; classes: string[] };
  onDelete: () => void;
}) {
  const classLabel =
    item.classes.length === 0
      ? "All Classes"
      : item.classes.length <= 2
      ? item.classes.join(", ")
      : `${item.classes.slice(0, 2).join(", ")} +${item.classes.length - 2}`;

  return (
    <div className="flex items-center justify-between border rounded px-3 py-2 text-sm">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{item.name}</span>
        <span className="text-xs text-muted-foreground">{classLabel}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {item.type === "flat" ? `₹${item.value}` : `${item.value}%`}
        </span>
        <Trash2
          className="h-4 w-4 text-red-500 cursor-pointer"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}

// ── Blank preset factory ──────────────────────────────────────────────────────
const blankPreset = () => ({ name: "", type: "flat", value: "", classes: [] as string[] });

// ── Main component ────────────────────────────────────────────────────────────
function FeeRulesSettings({ openSheet, setOpenSheet }: any) {

  // Late Fee
  const [lateFee, setLateFee] = useState({ dueDay: "", graceDays: "", amount: "" });

  // Concessions
  const [concessions, setConcessions] = useState<any[]>([]);
  const [newConcession, setNewConcession] = useState(blankPreset());

  // Scholarships
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [newScholarship, setNewScholarship] = useState(blankPreset());

  const addConcession = () => {
    if (!newConcession.name || !newConcession.value) return;
    setConcessions([...concessions, { ...newConcession, id: Date.now() }]);
    setNewConcession(blankPreset());
  };

  const addScholarship = () => {
    if (!newScholarship.name || !newScholarship.value) return;
    setScholarships([...scholarships, { ...newScholarship, id: Date.now() }]);
    setNewScholarship(blankPreset());
  };

  // ── Shared preset form (used for both Concessions & Scholarships) ───────────
  const PresetForm = ({
    preset,
    setPreset,
    onAdd,
    namePlaceholder,
  }: {
    preset: ReturnType<typeof blankPreset>;
    setPreset: (v: ReturnType<typeof blankPreset>) => void;
    onAdd: () => void;
    namePlaceholder: string;
  }) => (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-1">
        <Label>Preset Name</Label>
        <Input
          placeholder={namePlaceholder}
          value={preset.name}
          onChange={(e) => setPreset({ ...preset, name: e.target.value })}
        />
      </div>

      {/* Type + Value */}
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <Label>Type</Label>
          <Select
            value={preset.type}
            onValueChange={(v) => setPreset({ ...preset, type: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Flat (₹)</SelectItem>
              <SelectItem value="percent">Percent (%)</SelectItem>
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

      {/* ── Applicable Classes (hybrid) ── */}
      <ClassPicker
        selected={preset.classes}
        onChange={(classes) => setPreset({ ...preset, classes })}
      />

      <Button className="w-full" onClick={onAdd}>+ Add Preset</Button>
    </div>
  );

  return (
    <Sheet open={!!openSheet} onOpenChange={() => setOpenSheet(null)}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Fee Rules</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="latefee" className="p-5 mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="latefee" className="flex-1">Late Fee</TabsTrigger>
            <TabsTrigger value="concessions" className="flex-1">Concessions</TabsTrigger>
            <TabsTrigger value="scholarships" className="flex-1">Scholarships</TabsTrigger>
          </TabsList>

          {/* ── Late Fee Tab ── */}
          <TabsContent value="latefee" className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label>Due Day of Month</Label>
              <Input
                type="number" placeholder="e.g. 10"
                value={lateFee.dueDay}
                onChange={(e) => setLateFee({ ...lateFee, dueDay: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Grace Days</Label>
              <Input
                type="number" placeholder="e.g. 5"
                value={lateFee.graceDays}
                onChange={(e) => setLateFee({ ...lateFee, graceDays: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Late Fee Amount (₹ per month)</Label>
              <Input
                type="number" placeholder="e.g. 200"
                value={lateFee.amount}
                onChange={(e) => setLateFee({ ...lateFee, amount: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Fee is due on day {lateFee.dueDay || "?"}, with {lateFee.graceDays || "?"} grace days.
              After that ₹{lateFee.amount || "?"} is charged per month late.
            </p>
            <Button className="w-full">Save Late Fee Rule</Button>
          </TabsContent>

          {/* ── Concessions Tab ── */}
          <TabsContent value="concessions" className="space-y-4 mt-4">
            <PresetForm
              preset={newConcession}
              setPreset={setNewConcession}
              onAdd={addConcession}
              namePlaceholder="e.g. Sibling Discount"
            />
            <div className="space-y-2 mt-2">
              {concessions.map((c) => (
                <PresetRow
                  key={c.id}
                  item={c}
                  onDelete={() => setConcessions(concessions.filter((x) => x.id !== c.id))}
                />
              ))}
              {concessions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No presets yet</p>
              )}
            </div>
          </TabsContent>

          {/* ── Scholarships Tab ── */}
          <TabsContent value="scholarships" className="space-y-4 mt-4">
            <PresetForm
              preset={newScholarship}
              setPreset={setNewScholarship}
              onAdd={addScholarship}
              namePlaceholder="e.g. Merit Scholarship"
            />
            <div className="space-y-2 mt-2">
              {scholarships.map((s) => (
                <PresetRow
                  key={s.id}
                  item={s}
                  onDelete={() => setScholarships(scholarships.filter((x) => x.id !== s.id))}
                />
              ))}
              {scholarships.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No presets yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export default FeeRulesSettings;