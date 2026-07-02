import './globals.css'

export const metadata = { title: 'MI PERU Uploader' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
