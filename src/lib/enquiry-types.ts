/** Enquiry types used by the modal, the API and the admin dashboard. Client-safe. */

export const ENQUIRY_TYPES = ["pickup", "quote", "project", "conference", "event", "service", "subscribe"] as const;
export type EnquiryKind = (typeof ENQUIRY_TYPES)[number];

export function isEnquiryKind(v: unknown): v is EnquiryKind {
  return typeof v === "string" && (ENQUIRY_TYPES as readonly string[]).includes(v);
}

export const ENQUIRY_COPY: Record<
  EnquiryKind,
  { title: string; intro: string; submit: string; success: string; emailSubject: string; messageLabel: string; messageRequired: boolean }
> = {
  pickup: {
    title: "Schedule a pickup",
    intro: "Tell us where and when — we'll call to confirm the exact time.",
    submit: "Book pickup",
    success: "Your pickup request is in. Our team will call you to confirm the time.",
    emailSubject: "Pickup Request",
    messageLabel: "Anything else we should know? (gate access, floor, parking…)",
    messageRequired: false,
  },
  quote: {
    title: "Request a quote",
    intro: "Share what you need disposed of and we'll send a quote.",
    submit: "Request quote",
    success: "Thanks — we'll get back to you with a quote within one working day.",
    emailSubject: "Quote Request",
    messageLabel: "What do you need? (equipment, quantities, location)",
    messageRequired: true,
  },
  project: {
    title: "Discuss a project",
    intro: "Planning a partnership, programme or large disposal? Let's talk.",
    submit: "Send",
    success: "Thanks — our team will be in touch to discuss your project.",
    emailSubject: "Project Enquiry",
    messageLabel: "Tell us about the project",
    messageRequired: true,
  },
  conference: {
    title: "Contact the conferences team",
    intro: "Invite us to speak, exhibit or partner at your conference.",
    submit: "Send",
    success: "Thanks — we'll get back to you about your conference.",
    emailSubject: "Conference Enquiry",
    messageLabel: "Conference details (name, dates, what you'd like from us)",
    messageRequired: true,
  },
  event: {
    title: "Ask about events",
    intro: "Join an event, or plan a collection drive or awareness session with us.",
    submit: "Send",
    success: "Thanks — we'll get back to you about the event.",
    emailSubject: "Event Enquiry",
    messageLabel: "How can we help?",
    messageRequired: true,
  },
  service: {
    title: "Talk to our team",
    intro: "Questions about a service? We're happy to help.",
    submit: "Send",
    success: "Thanks — a member of our team will reply shortly.",
    emailSubject: "Service Enquiry",
    messageLabel: "Your question",
    messageRequired: true,
  },
  subscribe: {
    title: "Subscribe to updates",
    intro: "News on collection drives, events and responsible e-waste — no spam.",
    submit: "Subscribe",
    success: "You're subscribed. Thank you!",
    emailSubject: "New Subscriber",
    messageLabel: "",
    messageRequired: false,
  },
};
