"use client";

const SUPPORT_WHATSAPP_NUMBER = "966553090125";
const SUPPORT_MESSAGE = "السلام عليكم، أحتاج إلى دعم فني في منصة بصيرة.";

export default function SupportWhatsAppButton() {
  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    SUPPORT_MESSAGE
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="التواصل مع الدعم الفني عبر واتساب"
      title="الدعم الفني عبر واتساب"
      className="fixed bottom-5 left-5 z-[9999] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl ring-4 ring-white transition hover:scale-105 hover:bg-[#1ebe5d] print:hidden"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-8 w-8"
        fill="currentColor"
      >
        <path d="M16.04 3C9.42 3 4.03 8.35 4.03 14.93c0 2.1.55 4.15 1.6 5.96L4 27l6.28-1.63a12.08 12.08 0 0 0 5.76 1.46h.01c6.62 0 12.01-5.35 12.01-11.93C28.06 8.35 22.67 3 16.04 3Zm0 21.8h-.01c-1.78 0-3.52-.48-5.04-1.39l-.36-.21-3.73.97.99-3.62-.24-.37a9.84 9.84 0 0 1-1.5-5.25c0-5.46 4.44-9.9 9.9-9.9 2.65 0 5.14 1.03 7.01 2.89a9.82 9.82 0 0 1 2.91 6.98c0 5.46-4.45 9.9-9.93 9.9Zm5.43-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.18 5.06 4.46.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>

      <span className="sr-only">الدعم الفني عبر واتساب</span>
    </a>
  );
}
