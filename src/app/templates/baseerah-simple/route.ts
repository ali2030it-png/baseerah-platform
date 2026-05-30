import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = [
    ["رقم الطالب", "اسم الطالب", "درجة الطالب"],
    ["1001", "مثال: الطالب الأول", 85],
    ["1002", "مثال: الطالب الثاني", 72],
    ["1003", "مثال: الطالب الثالث", 96],
  ];

  const guide = [
    ["دليل استخدام قالب بصيرة"],
    [""],
    ["1", "اختر بيانات الاختبار في منصة بصيرة قبل رفع الملف: المادة، الصف، الفصل، نوع الاختبار، الدرجة العظمى، ومسمى الاختبار."],
    ["2", "أدخل رقم الطالب، اسم الطالب، ودرجة الطالب فقط."],
    ["3", "لا تغيّر عناوين الصف الأول."],
    ["4", "يمكن ترك رقم الطالب فارغًا عند عدم توفره، لكن اسم الطالب ودرجة الطالب مطلوبان."],
  ];

  const workbook = XLSX.utils.book_new();

  workbook.Workbook = {
    Views: [{ RTL: true }],
  };

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!rtl"] = true;
  sheet["!cols"] = [
    { wch: 18 },
    { wch: 38 },
    { wch: 18 },
  ];

  const guideSheet = XLSX.utils.aoa_to_sheet(guide);
  guideSheet["!rtl"] = true;
  guideSheet["!cols"] = [
    { wch: 12 },
    { wch: 100 },
  ];

  XLSX.utils.book_append_sheet(workbook, sheet, "قالب بصيرة");
  XLSX.utils.book_append_sheet(workbook, guideSheet, "دليل الاستخدام");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="baseerah-arabic-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
