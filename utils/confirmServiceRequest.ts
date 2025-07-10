      // Send confirmation email
      const emailRes = await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: mainPilgrim.email,
          subject: "Your Al-mutamir Booking Confirmation",
          text: `Dear ${mainPilgrim.firstName},\n\nYour booking has been received. We will contact you soon.\n\nThank you for choosing Al-mutamir!`,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Al-mutamir Booking Confirmation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: white;
            padding: 40px 40px 20px;
            text-align: center;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 30px;
        }
        
        .logo-icon {
            width: 32px;
            height: 32px;
            background: #c8e823;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #1a1a1a;
        }
        
        .logo-text {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .illustration {
            width: 120px;
            height: 120px;
            background: #f8f9fa;
            border-radius: 60px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
        }
        
        .subheading {
            font-size: 18px;
            color: #c8e823;
            font-weight: 500;
            margin-bottom: 20px;
        }
        
        .content {
            padding: 30px 40px;
            line-height: 1.6;
        }
        
        .message {
            font-size: 16px;
            color: #4a4a4a;
            margin-bottom: 20px;
        }
        
        .highlight-box {
            background: #f0f9d4;
            border: 1px solid #c8e823;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .highlight-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
        }
        
        .highlight-text {
            font-size: 14px;
            color: #4a4a4a;
        }
        
        .action-button {
            display: inline-block;
            background: #c8e823;
            color: #1a1a1a;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        
        .action-button:hover {
            background: #b5d31f;
            transform: translateY(-1px);
        }
        
        .details-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .details-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 12px;
        }
        
        .details-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .details-label {
            color: #6b7280;
        }
        
        .details-value {
            color: #1a1a1a;
            font-weight: 500;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .contact-info {
            font-size: 14px;
            color: #4F46E5;
            text-decoration: none;
        }
        
        .signature {
            margin-top: 20px;
            font-size: 14px;
            color: #6b7280;
        }
        
        .social-links {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        .social-link {
            width: 32px;
            height: 32px;
            background: #4F46E5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: white;
            font-size: 14px;
        }
        
        .copyright {
            margin-top: 20px;
            font-size: 12px;
            color: #9ca3af;
        }
        
        /* Responsive design */
        @media (max-width: 640px) {
            body {
                padding: 20px 10px;
            }
            
            .header,
            .content,
            .footer {
                padding: 20px;
            }
            
            .greeting {
                font-size: 20px;
            }
            
            .subheading {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="greeting">Hi ${mainPilgrim.firstName},</div>
            <div class="subheading">Your Spiritual Journey Begins!</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="message">
                We are delighted to confirm your booking for your spiritual journey. Your pilgrimage details have been received and are being processed by our team.
            </div>
            
            <div class="highlight-box">
                <div class="highlight-title">What happens next?</div>
                <div class="highlight-text">
                    Our team will review your booking and contact you within 24-48 hours to confirm all details and arrange payment. 
                    SWe'll also send you a comprehensive guide to help you prepare for your journey.
                </div>
            </div>
            
            <div class="details-section">
                <div class="details-title">Your Booking Summary</div>
                <div class="details-item">
                    <span class="details-label">Package Type:</span>
                    <span class="details-value">${packageType}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Departure Date:</span>
                    <span class="details-value">${departureDate}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Return Date:</span>
                    <span class="details-value">${returnDate}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Departure City:</span>
                    <span class="details-value">${departureCity}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Number of Pilgrims:</span>
                    <span class="details-value">${pilgrims.length}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Preferred Itinerary:</span>
                    <span class="details-value">${preferredItinerary.length > 0 ? preferredItinerary.join(", ") : "Not specified"}</span> 
                </div>
                <div class="details-item">
                    <span class="details-label">Services Selected:</span>
                    <span class="details-value">
                        ${Object.entries(selectedServices)
                          .filter(([_, service]) => service.selected)
                          .map(([key, service]) => `${key.charAt(0).toUpperCase() + key.slice(1)} (${service.tier})`)
                          .join(", ") || "None"}
                    </span> 
                  </div>
            </div>
            
            <div class="message">
                At Al-mutamir, we understand the spiritual significance of your journey. Our experienced team is dedicated to ensuring your pilgrimage is meaningful, comfortable, and memorable.
            </div>
            
            <div class="message">
                If you have any questions or need to make changes to your booking, please don't hesitate to contact us. We're here to help make your pilgrimage experience exceptional.
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                If you need assistance, please contact us at:
            </div>
            <a href="mailto:support@al-mutamir.com" class="contact-info">support@almutamir.com</a>
            
            <div class="signature">
                <div style="margin-top: 20px; font-weight: 500; color: #1a1a1a;">
                    Warm regards,<br>
                    The Al-mutamir Team
                </div>
            </div>
            
            <div class="copyright">
                © ${new Date().getFullYear()} Al-mutamir. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html></p>`,
        }),
      })
