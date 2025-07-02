/**
 * Send a notification to a webhook URL
 * @param webhookUrl The webhook URL to send the notification to
 * @param data The data to send to the webhook
 * @returns Promise that resolves when the webhook is sent
 */
export async function sendWebhook(webhookUrl, data) {
  try {
    // For development purposes, just log the data and return success
    // In production, you would uncomment the fetch call below
    console.log("Webhook data:", data)
    return true

    /* Uncomment for production use
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`)
    }

    return true
    */
  } catch (error) {
    console.error("Error sending webhook:", error)
    return false
  }
}

/**
 * Send a Discord webhook notification
 * @param payload The payload to send to Discord
 * @returns Promise that resolves when the webhook is sent
 */
export function sendDiscordWebhook(payload) {
  // Discord webhook format
  const discordPayload = {
    username: "Mutamir Notifications",
    avatar_url: "https://your-logo-url.com/logo.png",
    embeds: [
      {
        title: payload.title || "Notification",
        description: payload.description || "",
        color: payload.color || 0x00ff00, // Default green
        fields: payload.fields || [],
        timestamp: new Date().toISOString(),
        footer: {
          text: "Mutamir Admin Panel",
        },
      },
    ],
  }

  return sendWebhook(payload.webhookUrl, discordPayload)
}
