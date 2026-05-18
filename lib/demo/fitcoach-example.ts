/** Static FitCoach demo for landing page (not live AI output). */
export const FITCOACH_DEMO = {
  systemName: "FitCoach SaaS Platform",
  futureProofScore: 87,
  generationSeconds: 68,
  summary:
    "A multi-tenant SaaS platform for fitness coaches built with Volatility-Based Decomposition, isolating each likely-to-change axis behind stable interfaces.",
  mermaidDiagram: `graph TD
  CoachPortal[Coach Portal]
  ClientApp[Client App]
  CoreOrchestrator[Core Orchestrator]
  PayAxis[IPaymentProcessor]
  NotifyAxis[INotificationSender]
  VideoAxis[IVideoHost]
  StorageAxis[IStorageBackend]
  CoachPortal --> CoreOrchestrator
  ClientApp --> CoreOrchestrator
  CoreOrchestrator --> PayAxis
  CoreOrchestrator --> NotifyAxis
  CoreOrchestrator --> VideoAxis
  CoreOrchestrator --> StorageAxis`,
  volatilityAxes: [
    { name: "IVideoHost", reason: "Vimeo → Cloudflare Stream or Mux", ship: "VimeoAdapter" },
    { name: "IPaymentProcessor", reason: "Stripe today, SEPA for EU expansion", ship: "StripeAdapter" },
    { name: "INotificationSender", reason: "Email → WhatsApp + in-app push", ship: "SendGridEmailAdapter" },
    { name: "IStorageBackend", reason: "AWS S3 → Cloudflare R2", ship: "S3Adapter" },
  ] as const,
  adapterContract: `interface INotificationSender {
  send(recipient: Recipient, message: NotificationMessage): Promise<DeliveryResult>
}

class SendGridEmailAdapter implements INotificationSender {
  // Swap SendGrid → Twilio SMS without touching CoreOrchestrator
}`,
}
