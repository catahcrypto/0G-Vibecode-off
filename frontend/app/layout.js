import "./globals.css";

export const metadata = {
  title: "Clout Battle",
  description: "Battle for clout on 0G",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0f0f12", color: "#e0e0e0" }}>
        {children}
      </body>
    </html>
  );
}
