export const metadata = {
  title: 'Buddy LLM - Advanced AI Pipeline',
  description: '6-Layer Autonomous AI Architecture',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
