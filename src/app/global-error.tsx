"use client";

// Үндсэн layout-д алдаа гарсан үед л харагдана. Энд CSS ачаалагдаагүй байж болох тул энгийн загвартай.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="mn">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", textAlign: "center" }}>
        <p role="alert" style={{ fontSize: "1.125rem" }}>
          Мэдээлэл ачаалахад алдаа гарлаа. Дахин оролдоно уу.
        </p>
        <button type="button" onClick={reset} style={{ marginTop: "1.5rem", padding: "0.6rem 1.2rem", cursor: "pointer" }}>
          Дахин оролдох
        </button>
      </body>
    </html>
  );
}
