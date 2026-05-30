import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const studentResultsRows = [
    [
      "رقم الطالب",
      "اسم الطالب",
      "س1",
      "س2",
      "س3",
      "س4",
      "س5",
      "س6",
      "س7",
      "س8",
      "س9",
      "س10",
    ],
    [
      "1001",
      "مثال: الطالب الأول",
      1,
      1,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      0,
    ],
    [
      "1002",
      "مثال: الطالب الثاني",
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      1,
      0,
      0,
    ],
    [
      "1003",
      "مثال: الطالب الثالث",
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
    ],
  ];

  const questionMapRows = [
    [
      "رقم السؤال",
      "المجال",
      "ناتج التعلم",
      "الدرجة العظمى",
      "ملاحظات",
    ],
    [
      "س1",
      "القراءة والفهم",
      "يحدد الفكرة الرئيسة في النص المقروء.",
      1,
      "مثال قابل للتعديل",
    ],
    [
      "س2",
      "القراءة والفهم",
      "يستنتج المعنى الضمني من السياق.",
      1,
      "مثال قابل للتعديل",
    ],
    [
      "س3",
      "التراكيب اللغوية",
      "يميز الأسلوب اللغوي المناسب في الجملة.",
      1,
      "مثال قابل للتعديل",
    ],
    [
      "س4",
      "الكتابة",
      "يوظف علامات الترقيم توظيفًا صحيحًا.",
      1,
      "مثال قابل للتعديل",
    ],
    [
      "س5",
      "القراءة والفهم",
      "يربط بين المعلومات الواردة في النص.",
      1,
      "مثال قابل للتعديل",
    ],
    [
      "س6",
      "التراكيب اللغوية",
      "يطبق القاعدة اللغوية في سياق جديد.",
      1,
      "مثال قابل للتعديل",
    ],
    [
      "س7",
      "الكتابة",
      "ينظم الأفكار في فقرة قصيرة.",
      1,
      "مثال قابل للتعديل",
    ],
    [
      "س8",
      "القراءة والفهم",
      "يقارن بين فكرتين في النص.",
      1,
      "مثال قابل للتعديل",
    ],
    [
      "س9",
      "التراكيب اللغوية",
      "يحدد الخطأ اللغوي في الجملة.",
      1,
      "مثال قابل للتعديل",
    ],
    [
      "س10",
      "الكتابة",
      "ينتج جملة صحيحة المعنى والتركيب.",
      1,
      "مثال قابل للتعديل",
    ],
  ];

  const guideRows = [
    ["دليل استخدام قالب بصيرة لتحليل نافس"],
    [""],
    ["1", "استخدم ورقة (نتائج الطلاب) لإدخال رقم الطالب، اسم الطالب، ودرجة كل سؤال."],
    ["2", "استخدم ورقة (خريطة الأسئلة ونواتج التعلم) لربط كل سؤال بناتج التعلم المستهدف."],
    ["3", "لا تغيّر عناوين الصف الأول في أي ورقة."],
    ["4", "يمكن تعديل المجالات ونواتج التعلم بما يتناسب مع تدريب نافس في المادة والصف."],
    ["5", "الدرجة العظمى الافتراضية لكل سؤال هي 1، ويمكن تعديلها إذا كان السؤال بدرجات متعددة."],
    ["6", "تحلل بصيرة النتائج لاحقًا حسب ناتج التعلم، ثم تحدد جوانب القوة وفرص التحسين وخطة الدعم."],
  ];

  const workbook = XLSX.utils.book_new();

  workbook.Workbook = {
    Views: [{ RTL: true }],
  };

  const studentResultsSheet = XLSX.utils.aoa_to_sheet(studentResultsRows);
  studentResultsSheet["!rtl"] = true;
  studentResultsSheet["!cols"] = [
    { wch: 18 },
    { wch: 34 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];

  const questionMapSheet = XLSX.utils.aoa_to_sheet(questionMapRows);
  questionMapSheet["!rtl"] = true;
  questionMapSheet["!cols"] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 58 },
    { wch: 16 },
    { wch: 28 },
  ];

  const guideSheet = XLSX.utils.aoa_to_sheet(guideRows);
  guideSheet["!rtl"] = true;
  guideSheet["!cols"] = [
    { wch: 10 },
    { wch: 110 },
  ];

  XLSX.utils.book_append_sheet(workbook, studentResultsSheet, "نتائج الطلاب");
  XLSX.utils.book_append_sheet(workbook, questionMapSheet, "خريطة نواتج التعلم");
  XLSX.utils.book_append_sheet(workbook, guideSheet, "دليل الاستخدام");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="baseerah-nafs-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
