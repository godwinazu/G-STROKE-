type DigitalDownload = { name: string; url: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
}

export async function sendDigitalDeliveryEmail({
  email,
  reference,
  downloads,
}: {
  email: string;
  reference: string;
  downloads: DigitalDownload[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error('Digital delivery email is not configured');

  const links = downloads.map(({ name, url }) =>
    `<li style="margin:0 0 16px"><a href="${escapeHtml(url)}" style="color:#111113">Download ${escapeHtml(name)}</a></li>`
  ).join('');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `digital-delivery-${reference}`,
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Your Godwin Azu digital artwork is ready',
      html: `<div style="font-family:Arial,sans-serif;color:#111113;line-height:1.6"><p>Thank you for collecting work from the studio.</p><p>Your secure download links are available for 24 hours:</p><ul>${links}</ul><p>Order reference: ${escapeHtml(reference)}</p></div>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Digital delivery email failed with status ${response.status}`);
  }
}