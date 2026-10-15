export const metadata = { title: "Étiquettes Converty" };
export default function Root({ children }) {
  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          color: "#1b1b1b",
        }}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
