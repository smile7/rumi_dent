import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'react-email'

export type ContactNotificationRow = { label: string; value: string }

export type ContactNotificationProps = {
  lang: string
  heading: string
  rows: ContactNotificationRow[]
  message: ContactNotificationRow
  footer: string
}

// Email clients ignore CSS variables and stylesheets, so styles are inline literals.
const text = { color: '#1f2328', fontSize: '16px', lineHeight: '24px', margin: '0' }
const label = { ...text, color: '#57606a', fontSize: '13px', lineHeight: '20px' }

/** The clinic's notification for a contact form submission. Inline styles only (no `<Tailwind>`). */
export function ContactNotification({
  lang,
  heading,
  rows,
  message,
  footer,
}: ContactNotificationProps) {
  return (
    <Html lang={lang}>
      <Head />
      <Preview>{heading}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '560px', padding: '24px' }}>
          <Heading as="h1" style={{ ...text, fontSize: '20px', lineHeight: '28px' }}>
            {heading}
          </Heading>
          {rows.map((row) => (
            <Section key={row.label} style={{ marginTop: '16px' }}>
              <Text style={label}>{row.label}</Text>
              <Text style={text}>{row.value}</Text>
            </Section>
          ))}
          <Section style={{ marginTop: '16px' }}>
            <Text style={label}>{message.label}</Text>
            <Text style={{ ...text, whiteSpace: 'pre-wrap' }}>{message.value}</Text>
          </Section>
          <Hr style={{ margin: '24px 0', borderColor: '#d0d7de' }} />
          <Text style={label}>{footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

/** Plain-text version of the same email. */
export function contactNotificationText({
  heading,
  rows,
  message,
  footer,
}: ContactNotificationProps): string {
  return [
    heading,
    '',
    ...rows.map((row) => `${row.label}: ${row.value}`),
    '',
    `${message.label}:`,
    message.value,
    '',
    '--',
    footer,
  ].join('\n')
}
