/** Root layout for the embedded Studio (T03.1): English UI, none of the site styles or providers. */
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
