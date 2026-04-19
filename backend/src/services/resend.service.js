const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || 'WAULT <no-reply@wault.app>';

function renderTemplate({ introLines, buttonLabel, buttonUrl, outroLines }) {
  const introHtml = introLines
    .map((line) => `<p style="margin:0 0 16px;color:#111827;line-height:1.6;">${line}</p>`)
    .join('');
  const outroHtml = outroLines
    .map((line) => `<p style="margin:0 0 12px;color:#4B5563;line-height:1.6;">${line}</p>`)
    .join('');

  return `
    <div style="background:#F9FAFB;padding:32px 16px;font-family:Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#6B46C1;padding:24px 32px;color:#FFFFFF;font-size:24px;font-weight:700;">WAULT</div>
        <div style="padding:32px;">
          ${introHtml}
          <div style="margin:28px 0;">
            <a href="${buttonUrl}" style="background:#6B46C1;color:#FFFFFF;padding:14px 28px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600;">${buttonLabel}</a>
          </div>
          ${outroHtml}
        </div>
      </div>
    </div>
  `;
}

async function sendBeneficiaryInvite({ to, name, ownerName, verifyUrl }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${ownerName} has added you as a trusted contact on WAULT`,
    html: renderTemplate({
      introLines: [
        `Hello ${name},`,
        `${ownerName} has added you as a trusted beneficiary on WAULT - a secure digital legacy platform.`,
        'Click below to verify your email and accept this role:',
      ],
      buttonLabel: 'Verify My Email',
      buttonUrl: verifyUrl,
      outroLines: [
        `If you don't know ${ownerName}, you can ignore this email.`,
      ],
    }),
  });
}

async function sendInactivityWarning({ to, name, daysInactive, warningDays, pingUrl }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'WAULT Security Check - Action Required',
    html: renderTemplate({
      introLines: [
        `Hello ${name},`,
        `You haven't logged into WAULT for ${Math.floor(daysInactive)} days.`,
        `If you do not respond within ${warningDays} days, your trusted contacts will receive access to your vault.`,
      ],
      buttonLabel: "I'm Here - Cancel Alert",
      buttonUrl: pingUrl,
      outroLines: [
        'If you no longer use WAULT, you may ignore this message.',
      ],
    }),
  });
}

async function sendTriggerNotification({ to, beneficiaryName, ownerName, accessUrl }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `You have received access to ${ownerName}'s WAULT`,
    html: renderTemplate({
      introLines: [
        `Hello ${beneficiaryName},`,
        `${ownerName} designated you as a trusted beneficiary. Due to extended inactivity, you now have access to their secure vault.`,
      ],
      buttonLabel: 'Access Vault',
      buttonUrl: accessUrl,
      outroLines: [
        'This link expires in 72 hours. Contact support if you need assistance.',
      ],
    }),
  });
}

async function sendAccessGranted({ to, name, ownerName }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Access granted - ${ownerName}'s digital assets`,
    html: renderTemplate({
      introLines: [
        `Hello ${name},`,
        `Access to ${ownerName}'s digital assets was successfully provided through WAULT.`,
        'You can now review the vault items that were assigned to you.',
      ],
      buttonLabel: 'Open WAULT',
      buttonUrl: process.env.FRONTEND_URL,
      outroLines: [
        'All access is logged for audit purposes.',
      ],
    }),
  });
}

module.exports = {
  sendBeneficiaryInvite,
  sendInactivityWarning,
  sendTriggerNotification,
  sendAccessGranted,
};
