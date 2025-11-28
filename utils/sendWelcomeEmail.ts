// utils/sendWelcomeEmail.ts
export async function sendWelcomeEmail(to: string, name: string) {
  await fetch("/api/send-confirmation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      subject: "Welcome to Almutamir!",
      text: `Dear ${name},\n\nWelcome to Almutamir! We're excited to have you on board.`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Almutamir</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #007F5F 0%, #3E7C59 100%);
            min-height: 100vh;
            padding: 20px;
            line-height: 1.6;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #F8F8F6;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: #F8F8F6;
            padding: 40px 40px 30px;
            text-align: center;
            border-bottom: 1px solid #e0e0de;
        }
        
        .logo {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 30px;
        }
        
        .logo-icon {
            width: 32px;
            height: 32px;
            background: #007F5F;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo-text {
            font-size: 20px;
            font-weight: 600;
            color: #014034;
        }
        
        .welcome-banner {
            background: linear-gradient(135deg, #007F5F15, #3E7C5915);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
            border: 1px solid #007F5F30;
        }
        
        .banner-decoration {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, #E3B23C30, #007F5F20);
            border-radius: 50%;
            opacity: 0.3;
        }
        
        .welcome-flags {
            display: flex;
            justify-content: center;
            gap: 3px;
            margin-bottom: 15px;
        }
        
        .flag {
            width: 0;
            height: 0;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-top: 20px solid #007F5F;
            position: relative;
        }
        
        .flag:nth-child(2) { border-top-color: #3E7C59; }
        .flag:nth-child(3) { border-top-color: #E3B23C; }
        .flag:nth-child(4) { border-top-color: #007F5F; }
        .flag:nth-child(5) { border-top-color: #014034; }
        
        .welcome-text {
            font-size: 24px;
            font-weight: 700;
            color: #014034;
            margin-bottom: 8px;
        }
        
        .app-name {
            color: #007F5F;
            font-size: 18px;
            font-weight: 600;
        }
        
        .illustration {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #007F5F20, #3E7C5920);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border: 2px solid #007F5F30;
        }
        
        .illustration::before {
            content: '🕋';
            font-size: 48px;
        }
        
        .content {
            padding: 40px;
            color: #014034;
            background: #F8F8F6;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #014034;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            margin-bottom: 20px;
            color: #3E7C59;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #007F5F, #3E7C59);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 127, 95, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 127, 95, 0.4);
            background: linear-gradient(135deg, #3E7C59, #014034);
        }
        
        .footer {
            background: #F8F8F6;
            padding: 30px 40px;
            border-top: 1px solid #e0e0de;
            font-size: 14px;
            color: #3E7C59;
        }
        
        .support-link {
            color: #007F5F;
            text-decoration: none;
        }
        
        .support-link:hover {
            text-decoration: underline;
            color: #014034;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-top: 20px;
        }
        
        .social-icon {
            width: 36px;
            height: 36px;
            background: #007F5F20;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: all 0.3s ease;
            color: #007F5F;
            border: 1px solid #007F5F30;
        }
        
        .social-icon:hover {
            background: #007F5F;
            color: white;
            transform: translateY(-2px);
        }
        
        .copyright {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0de;
            color: #3E7C59;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 30px 20px;
            }
            
            .welcome-text {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <div class="logo-icon">🌙</div>
                <div class="logo-text">Almutamir</div>
              
            </div>
            
            <div class="welcome-banner">
                <div class="banner-decoration"></div>
                <div class="welcome-flags">
                    <div class="flag"></div>
                    <div class="flag"></div>
                    <div class="flag"></div>
                    <div class="flag"></div>
                    <div class="flag"></div>
                </div>
                <div class="welcome-text">Marhaban!</div>
            </div>
            
            <div class="illustration"></div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">Hi ${name},</div>
            <div class="app-name">Welcome to Almutamir app!</div>
            
            <p class="message">
                The Journey of a lifetime as it is called. The journey of Hajj and Umrah is a sacred pilgrimage that holds immense significance in the hearts of Muslims around the world. It is a journey of faith, devotion, and spiritual renewal, where pilgrims seek to draw closer to Allah and fulfill one of the Five Pillars of Islam.
            </p>
            
            <p class="message">
                At Almutamir, we understand this and had this in mind while designing our platform. We are your trusted companion, offering comprehensive services, guidance, and support to help you perform your pilgrimage with peace of mind and devotion.
            </p>
            
            <p class="message">
                From booking accommodations to providing step-by-step guidance, we're here to ensure your journey is blessed and memorable.
            </p>
            
            <p class="message">
                Thank you for allowing us to be part of your spiritual journey. May Allah accept your pilgrimage.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>If you did not create this account, please contact us at <a href="mailto:support@almutamir.com" class="support-link">support@almutamir.com</a></p>
            
            <p style="margin-top: 15px;">
                For any questions about your pilgrimage or our services, please contact us at: <a href="mailto:support@almutamir.com" class="support-link">support@almutamir.com</a>
            </p>
            
            <p style="margin-top: 15px;">
                Barakallahu feek! (May Allah bless you),<br>
                The Almutamir Team
            </p>
            
            <div class="social-links">
                <a href="#" class="social-icon">f</a>
                <a href="#" class="social-icon">@</a>
                <a href="#" class="social-icon">in</a>
            </div>
            
            <div class="copyright">
                © ${new Date().getFullYear()} Almutamir
            </div>
        </div>
    </div>
</body>
</html>`,
    }),
  })
}