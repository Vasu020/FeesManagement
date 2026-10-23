// utils/printFeesReceipt.ts
import jsPDF from "jspdf";
import { calcBalance } from "../Pages/StudentDirectory/utils/helpers";

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  father_name: string;
  enrollment_date: string;
  total_fees: number;
  fees_paid: number;
  balance: number;
  late_fees_charges: number;
  concession: number;
  scholarship: number;
  late_fees_paid?: number;
  late_fees_balance?: number;
  due_date?: string;
  last_payment_date?: string;
  standard?: string;
  roll_no?: number;
  email?: string;
  contact_phone?: string;
}

export function printFeesReceipt(student: Student) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const margin = 56;
  let y = 0;

  const fmt = (n: number) =>
    `Rs. ${(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const fmtDate = (d?: string) => {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt.getTime())
      ? d
      : dt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
  };

  const gray = (v: number): [number, number, number] => [v, v, v];

  // ── Header ────────────────────────────────────────────────
  y = 52;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...gray(15));
  doc.text("FEES RECEIPT", margin, y);

  // Thin rule under title
  y += 10;
  doc.setDrawColor(...gray(15));
  doc.setLineWidth(1.2);
  doc.line(margin, y, W - margin, y);

  // School / receipt meta — right aligned
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...gray(100));
  doc.text(
    `Receipt No: STU-${student.student_id}-${Date.now().toString().slice(-5)}`,
    W - margin,
    38,
    { align: "right" },
  );
  doc.text(
    `Date: ${fmtDate(new Date().toISOString().split("T")[0])}`,
    W - margin,
    50,
    { align: "right" },
  );

  y += 24;

  // ── Student details grid ──────────────────────────────────
  const drawField = (label: string, value: string, x: number, cy: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...gray(130));
    doc.text(label, x, cy);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...gray(20));
    doc.text(value || "—", x, cy + 13);
  };

  const col2 = W / 2 + 4;
  const detailRows = [
    [
      ["STUDENT NAME", `${student.first_name} ${student.last_name}`],
      ["FATHER'S NAME", student.father_name || "—"],
    ],
    [
      ["ROLL NUMBER", student.roll_no ? String(student.roll_no) : "—"],
      ["CLASS / STANDARD", student.standard || "—"],
    ],
    [
      ["ENROLLMENT DATE", fmtDate(student.enrollment_date)],
      ["FEE DUE DATE", fmtDate(student.due_date)],
    ],
    ...(student.email?.trim() || student.contact_phone?.trim()
      ? [
          [
            ...(student.email?.trim()
              ? [["EMAIL", student.email.trim()]]
              : []),
            ...(student.contact_phone?.trim()
              ? [["PHONE", student.contact_phone.trim()]]
              : []),
          ],
        ]
      : []),
    [["LAST PAYMENT DATE", fmtDate(student.last_payment_date)]],
  ];

  detailRows.forEach((row) => {
    const [left, right] = row;
    drawField(left[0], left[1], margin, y);
    if (right) drawField(right[0], right[1], col2, y);
    y += 34;
  });
  y += 4;

  // Divider
  doc.setDrawColor(...gray(210));
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);
  y += 20;

  // ── Fee Summary heading ───────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...gray(80));
  doc.text("FEE SUMMARY", margin, y);
  y += 18;

  // ── Fee rows ──────────────────────────────────────────────
  const drawRow = (
    label: string,
    value: string,
    opts: {
      bold?: boolean;
      shade?: boolean; // light gray bg
      topRule?: boolean;
      bottomRule?: boolean;
    } = {},
  ) => {
    const rowH = 28;
    const rx = margin - 6;
    const rw = W - margin * 2 + 12;

    if (opts.shade) {
      doc.setFillColor(...gray(246));
      doc.rect(rx, y - 17, rw, rowH, "F");
    }
    if (opts.topRule) {
      doc.setDrawColor(...gray(210));
      doc.setLineWidth(0.4);
      doc.line(rx, y - 17, rx + rw, y - 17);
    }
    if (opts.bottomRule) {
      doc.setDrawColor(...gray(210));
      doc.setLineWidth(0.4);
      doc.line(rx, y + 11, rx + rw, y + 11);
    }

    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.bold ? 11 : 10.5);
    doc.setTextColor(...gray(opts.bold ? 15 : 50));
    doc.text(label, margin, y);

    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setTextColor(...gray(opts.bold ? 15 : 50));
    doc.text(value, W - margin, y, { align: "right" });

    y += rowH;
  };

  drawRow("Total Fees", fmt(student.total_fees));

  if ((student.concession || 0) > 0)
    drawRow("Concession", `- ${fmt(student.concession)}`);

  if ((student.scholarship || 0) > 0)
    drawRow("Scholarship", `- ${fmt(student.scholarship)}`);

  const lateFeesCharged = Math.max(Number(student.late_fees_charges) || 0, 0);
  const lateFeesPaid = Math.max(Number(student.late_fees_paid) || 0, 0);
  const lateFeesPending = Math.max(
    Number(
      student.late_fees_balance ?? lateFeesCharged - lateFeesPaid,
    ) || 0,
    0,
  );

  const computedBalance = calcBalance(student);
  const isPaid = computedBalance === 0;
  drawRow("Amount Paid", fmt(student.fees_paid), { topRule: true });

  drawRow("Balance Due", fmt(computedBalance), {
    bold: true,
    shade: true,
    topRule: true,
    bottomRule: true,
  });

  if (lateFeesCharged > 0)
    drawRow("Late Fees", fmt(lateFeesCharged), { topRule: true });
  if (lateFeesPaid > 0)
    drawRow("Late Fees Paid", fmt(lateFeesPaid));

  y += 8;

  // Payment status line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...gray(100));
  doc.text(
    isPaid && lateFeesPending > 0
      ? "✓  Regular fee balance clear. Late fees remain pending separately."
      : isPaid
        ? "✓  Payment complete — no regular fee balance outstanding."
      : "Payment is pending. Please clear the balance by the due date.",
    margin,
    y,
  );

  y += 40;

  // ── Footer rule + note ────────────────────────────────────
  doc.setDrawColor(...gray(210));
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);
  y += 16;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...gray(150));
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    W / 2,
    y,
    { align: "center" },
  );
  doc.text(
    `Generated on ${new Date().toLocaleString("en-IN")}`,
    W / 2,
    y + 13,
    { align: "center" },
  );

  doc.save(
    `receipt_${student.first_name}_${student.last_name}_${student.student_id}.pdf`,
  );
}
