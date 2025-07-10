
/**
 * Utility function to print a specific element with receipt-style design
 * @param elementId The ID of the element to print
 */
export function printElement(elementId: string) {
  // Get the element to print
  const elementToPrint = document.getElementById(elementId)

  if (!elementToPrint) {
    console.error(`Element with ID ${elementId} not found`)
    return
  }

  // Create a new window for printing
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    alert("Please allow pop-ups to print this document")
    return
  }

  // Add modern card-style print styles matching the confirmation page
  printWindow.document.write(`
    <html>
      <head>
        <title>Al-mutamir - Booking Confirmation</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #F8F8F6;
            padding: 20px;
            line-height: 1.6;
            color: #014034;
          }
          
          .booking-card {
            background: #014034;
            max-width: 400px;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          
          .card-content {
            padding: 24px;
            color: #FFFFFF;
          }
          
          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
          }
          
          .card-title {
            font-size: 18px;
            font-weight: 600;
            color: #FFFFFF;
          }
          
          .service-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background: #007F5F;
            border-radius: 12px;
            margin-bottom: 24px;
          }
          
          .service-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .logo-circle {
            width: 40px;
            height: 40px;
            background: #E3B23C;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            color: #014034;
          }
          
          .service-details h3 {
            font-size: 18px;
            font-weight: bold;
            color: #FFFFFF;
            margin-bottom: 4px;
          }
          
          .service-details p {
            font-size: 14px;
            color: #F8F8F6;
            opacity: 0.75;
          }
          
          .status-badge {
            background: rgba(227, 178, 60, 0.2);
            color: #E3B23C;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .package-section {
            text-align: center;
            margin-bottom: 24px;
          }
          
          .package-main {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          
          .package-icon {
            width: 32px;
            height: 32px;
            margin-right: 12px;
            color: #E3B23C;
          }
          
          .package-title {
            font-size: 32px;
            font-weight: bold;
            color: #FFFFFF;
            margin-bottom: 4px;
          }
          
          .package-subtitle {
            font-size: 14px;
            color: #F8F8F6;
            opacity: 0.75;
          }
          
          .journey-line {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 16px 0;
          }
          
          .line {
            width: 64px;
            height: 2px;
            background: #E3B23C;
          }
          
          .plane-icon {
            width: 16px;
            height: 16px;
            margin: 0 16px;
            color: #E3B23C;
          }
          
          .journey-text {
            font-size: 12px;
            color: #F8F8F6;
            margin-top: 8px;
          }
          
          .details-grid {
            margin-bottom: 24px;
          }
          
          .detail-label {
            font-size: 14px;
            color: #F8F8F6;
            opacity: 0.75;
            margin-bottom: 4px;
          }
          
          .detail-value {
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 16px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
          }
          
          .detail-col {
            flex: 1;
          }
          
          .detail-col:not(:last-child) {
            margin-right: 16px;
          }
          
          .detail-value.accent {
            color: #E3B23C;
          }
          
          .detail-value.small {
            font-size: 12px;
          }
          
          .barcode-section {
            display: flex;
            justify-content: center;
            margin-bottom: 24px;
          }
          
          .barcode {
            background: white;
            padding: 12px;
            border-radius: 8px;
            display: flex;
            gap: 2px;
          }
          
          .barcode-line {
            width: 2px;
            background: black;
          }
          
          .barcode-line.tall {
            height: 40px;
          }
          
          .barcode-line.short {
            height: 20px;
          }
          
          .footer-section {
            text-align: center;
            padding-top: 24px;
            border-top: 1px solid rgba(248, 248, 246, 0.2);
          }
          
          .footer-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 16px;
          }
          
          .footer-logo-icon {
            width: 28px;
            height: 28px;
            background: #E3B23C;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            color: #014034;
          }
          
          .footer-text {
            font-size: 12px;
            color: #F8F8F6;
            opacity: 0.75;
          }
          
          .print-controls {
            text-align: center;
            margin-top: 30px;
          }
          
          .print-btn {
            background: #007F5F;
            color: white;
            border: none;
            padding: 12px 24px;
            margin: 0 8px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
          }
          
          .print-btn:hover {
            background: #014034;
          }
          
          .print-btn.secondary {
            background: transparent;
            border: 1px solid #007F5F;
            color: #007F5F;
          }
          
          .print-btn.secondary:hover {
            background: #007F5F;
            color: white;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .print-controls {
              display: none;
            }
            
            .booking-card {
              box-shadow: none;
              max-width: none;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="booking-card">
          <div class="card-content">
            <div class="card-header">
              <h2 class="card-title">BOOKING CONFIRMATION</h2>
            </div>
            
            <div class="service-info">
              <div class="service-left">
                <div class="logo-circle">AM</div>
                <div class="service-details">
                  <h3>AL-MUTAMIR</h3>
                  <p>Hajj Services</p>
                </div>
              </div>
              <div class="status-badge">
                <span>⏱</span>
                PENDING CONFIRMATION
              </div>
            </div>
            
            <div class="package-section">
              <div class="package-main">
                <div class="package-icon">📦</div>
                <div>
                  <div class="package-title">HAJJ</div>
                  <div class="package-subtitle">Pilgrimage Package</div>
                </div>
              </div>
              
              <div class="journey-line">
                <div class="line"></div>
                <div class="plane-icon">✈</div>
                <div class="line"></div>
              </div>
              
              <div class="journey-text">Sacred Journey to Mecca</div>
            </div>
            
            ${elementToPrint.outerHTML}
            
            <div class="barcode-section">
              <div class="barcode">
                ${generateBarcode()}
              </div>
            </div>
          </div>
        </div>
        
        <div class="print-controls">
          <button class="print-btn" onclick="window.print()">DOWNLOAD</button>
          <button class="print-btn secondary" onclick="window.close()">CLOSE</button>
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
}

/**
 * Utility function to download booking details as a receipt-style PDF
 * @param bookingRef Booking reference number
 * @param details Object containing booking details
 */
export async function downloadBookingDetails(bookingRef: string, details: any) {
  try {
    // Try HTML-to-PDF conversion with updated receipt design
    return await downloadBookingReceiptHTML(bookingRef, details)
  } catch (error) {
    console.error('Error generating PDF:', error)
    // Fallback to text download if PDF generation fails
    downloadBookingDetailsAsText(bookingRef, details)
  }
}

/**
 * Generate modern card-style HTML for booking details matching the confirmation page
 */
function generateBookingReceiptHTML(bookingRef: string, details: any): string {
  const bookingDate = new Date().toLocaleDateString()
  const packageType = details.packageType || 'hajj'
  const isHajj = packageType.toLowerCase() === 'hajj'
  const pilgrims = details.pilgrims || [{ firstName: 'Guest', lastName: 'User', email: 'guest@example.com' }]
  const primaryPilgrim = pilgrims[0]
  const isGroupBooking = details.isGroupBooking || false
  const totalPilgrims = pilgrims.length

  // Generate HTML for selected services
  const services = details.services || {}
  const selectedServicesHTML = Object.entries(services)
    .filter(([, value]: [string, any]) => value.selected)
    .map(([key, value]: [string, any]) => `<li>${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.tier}</li>`)
    .join('')

  // Generate HTML for all pilgrims if it's a group booking
  const pilgrimDetailsHTML = pilgrims
    .map((pilgrim: any, index: number) => `
    <div class="detail-row" style="border-top: 1px solid rgba(248, 248, 246, 0.1); padding-top: 16px; margin-bottom: 0;">
      <div class="detail-col">
        <div class="detail-label">Pilgrim ${index + 1} Name</div>
        <div class="detail-value" style="margin-bottom: 8px;">${pilgrim.firstName} ${pilgrim.lastName}</div>
        <div class="detail-label">Email</div>
        <div class="detail-value small">${pilgrim.email}</div>
      </div>
      <div class="detail-col">
         <div class="detail-label">Passport</div>
         <div class="detail-value small" style="margin-bottom: 8px;">${pilgrim.passport || 'N/A'}</div>
         <div class="detail-label">Phone</div>
         <div class="detail-value small">${pilgrim.phone || 'N/A'}</div>
      </div>
    </div>
  `).join('');

  return `
    <html>
      <head>
        <title>Al-mutamir Booking Confirmation</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #F8F8F6;
            padding: 20px;
            line-height: 1.6;
            color: #014034;
          }
          
          .booking-card {
            background: #014034;
            max-width: 400px;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          
          .card-content {
            padding: 24px;
            color: #FFFFFF;
          }
          
          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
          }
          
          .card-title {
            font-size: 18px;
            font-weight: 600;
            color: #FFFFFF;
          }
          
          .service-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background: #007F5F;
            border-radius: 12px;
            margin-bottom: 24px;
          }
          
          .service-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .logo-circle {
            width: 40px;
            height: 40px;
            background: #E3B23C;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            color: #014034;
          }
          
          .service-details h3 {
            font-size: 18px;
            font-weight: bold;
            color: #FFFFFF;
            margin-bottom: 4px;
          }
          
          .service-details p {
            font-size: 14px;
            color: #F8F8F6;
            opacity: 0.75;
          }
          
          .status-badge {
            background: rgba(227, 178, 60, 0.2);
            color: #E3B23C;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .package-section {
            text-align: center;
            margin-bottom: 24px;
          }
          
          .package-main {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          
          .package-icon {
            width: 32px;
            height: 32px;
            margin-right: 12px;
            color: #E3B23C;
            font-size: 24px;
          }
          
          .package-title {
            font-size: 32px;
            font-weight: bold;
            color: #FFFFFF;
            margin-bottom: 4px;
          }
          
          .package-subtitle {
            font-size: 14px;
            color: #F8F8F6;
            opacity: 0.75;
          }
          
          .journey-line {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 16px 0;
          }
          
          .line {
            width: 64px;
            height: 2px;
            background: #E3B23C;
          }
          
          .plane-icon {
            width: 16px;
            height: 16px;
            margin: 0 16px;
            color: #E3B23C;
            font-size: 16px;
          }
          
          .journey-text {
            font-size: 12px;
            color: #F8F8F6;
            margin-top: 8px;
          }
          
          .details-section {
            margin-bottom: 24px;
          }
          
          .detail-label {
            font-size: 14px;
            color: #F8F8F6;
            opacity: 0.75;
            margin-bottom: 4px;
          }
          
          .detail-value {
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 16px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
          }
          
          .detail-col {
            flex: 1;
          }
          
          .detail-col:not(:last-child) {
            margin-right: 16px;
          }
          
          .detail-value.accent {
            color: #E3B23C;
          }
          
          .detail-value.small {
            font-size: 12px;
            font-weight: normal;
          }

          .service-list {
            list-style-position: inside;
            padding-left: 4px;
            font-weight: normal;
            font-size: 14px;
            color: #F8F8F6;
            opacity: 0.9;
            margin-bottom: 16px;
          }
          
          .barcode-section {
            display: flex;
            justify-content: center;
            margin-bottom: 24px;
          }
          
          .barcode {
            background: white;
            padding: 12px;
            border-radius: 8px;
            display: flex;
            gap: 2px;
          }
          
          .barcode-line {
            width: 2px;
            background: black;
          }
          
          .barcode-line.tall {
            height: 40px;
          }
          
          .barcode-line.short {
            height: 20px;
          }
          
          .footer-section {
            text-align: center;
            padding-top: 24px;
            border-top: 1px solid rgba(248, 248, 246, 0.2);
          }
          
          .footer-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 16px;
          }
          
          .footer-logo-icon {
            width: 28px;
            height: 28px;
            background: #E3B23C;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            color: #014034;
          }
          
          .footer-text {
            font-size: 12px;
            color: #F8F8F6;
            opacity: 0.75;
          }
          
          .print-controls {
            text-align: center;
            margin-top: 30px;
          }
          
          .print-btn {
            background: #007F5F;
            color: white;
            border: none;
            padding: 12px 24px;
            margin: 0 8px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
          }
          
          .print-btn:hover {
            background: #014034;
          }
          
          .print-btn.secondary {
            background: transparent;
            border: 1px solid #007F5F;
            color: #007F5F;
          }
          
          .print-btn.secondary:hover {
            background: #007F5F;
            color: white;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .print-controls {
              display: none;
            }
            
            .booking-card {
              box-shadow: none;
              max-width: none;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="booking-card">
          <div class="card-content">
            <div class="card-header">
              <h2 class="card-title">BOOKING CONFIRMATION</h2>
            </div>
            
            <div class="service-info">
              <div class="service-left">
                <div class="logo-circle">AM</div>
                <div class="service-details">
                  <h3>AL-MUTAMIR</h3>
                  <p>${isHajj ? 'Hajj' : 'Umrah'} Services</p>
                </div>
              </div>
              <div class="status-badge">
                <span>⏱</span>
                CONFIRMED
              </div>
            </div>
            
            <div class="package-section">
              <div class="package-main">
                <div class="package-icon">📦</div>
                <div>
                  <div class="package-title">${isHajj ? 'HAJJ' : 'UMRAH'}</div>
                  <div class="package-subtitle">${details.selectedPackage || (isHajj ? 'Pilgrimage Package' : 'Lesser Pilgrimage')}</div>
                </div>
              </div>
              
              <div class="journey-line">
                <div class="line"></div>
                <div class="plane-icon">✈</div>
                <div class="line"></div>
              </div>
              
              <div class="journey-text">Sacred Journey to Mecca</div>
            </div>
            
            <div class="details-section">
                ${isGroupBooking ? `
                    <div class="detail-label" style="margin-bottom: 12px;">Group Booking Pilgrims</div>
                    ${pilgrimDetailsHTML}
                ` : `
                    <div class="detail-label">Pilgrim Name</div>
                    <div class="detail-value">${primaryPilgrim?.firstName || 'Guest'} ${primaryPilgrim?.lastName || 'User'}</div>
                    <div class="detail-label">Email</div>
                    <div class="detail-value small">${primaryPilgrim?.email || 'guest@example.com'}</div>
                `}

              <div class="detail-row">
                <div class="detail-col">
                  <div class="detail-label">Booking Ref.</div>
                  <div class="detail-value">${bookingRef}</div>
                </div>
                <div class="detail-col">
                  <div class="detail-label">Package Type</div>
                  <div class="detail-value">${packageType.charAt(0).toUpperCase() + packageType.slice(1)}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-col">
                  <div class="detail-label">Status</div>
                  <div class="detail-value accent">Confirmed</div>
                </div>
                <div class="detail-col">
                  <div class="detail-label">${isGroupBooking ? 'Group Size' : 'Pilgrims'}</div>
                  <div class="detail-value">${totalPilgrims} ${totalPilgrims === 1 ? 'Person' : 'People'}</div>
                </div>
              </div>

               <div class="detail-row">
                  <div class="detail-col">
                    <div class="detail-label">Departure City</div>
                    <div class="detail-value">${details.departureCity || 'N/A'}</div>
                  </div>
                  <div class="detail-col">
                    <div class="detail-label">Departure Date</div>
                    <div class="detail-value">${details.departureDate || 'N/A'}</div>
                  </div>
                </div>

              ${selectedServicesHTML ? `
                <div class="detail-label" style="margin-bottom: 8px;">Selected Services</div>
                <ul class="service-list">
                  ${selectedServicesHTML}
                </ul>` : ''}
              
              <div class="detail-row">
                <div class="detail-col">
                  <div class="detail-label">Booking Date</div>
                  <div class="detail-value">${bookingDate}</div>
                </div>
              </div>
            </div>
            
            <div class="barcode-section">
              <div class="barcode">
                ${generateBarcode()}
              </div>
            </div>
            
            <div class="footer-section">
              <div class="footer-logo">
                <div class="footer-logo-icon">AM</div>
                <span style="font-weight: 600;">Al-Mutamir</span>
              </div>
              <div class="footer-text">
                © ${new Date().getFullYear()} Al-mutamir. All rights reserved.<br>
                support@almutamir.com
              </div>
            </div>
          </div>
        </div>
        
        <div class="print-controls">
          <button class="print-btn" onclick="window.print()">DOWNLOAD</button>
          <button class="print-btn secondary" onclick="window.close()">CLOSE</button>
        </div>
      </body>
    </html>
  `
}

/**
 * Download booking details as HTML receipt
 */
async function downloadBookingReceiptHTML(bookingRef: string, details: any) {
  // Create HTML content for PDF
  const htmlContent = generateBookingReceiptHTML(bookingRef, details)
  
  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Please allow pop-ups to download PDF')
  }
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  // Trigger print dialog (user can save as PDF)
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

/**
 * Generate a booking reference for display
 */
function generateBookingRef(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase()
}

/**
 * Generate barcode-style lines for display
 */
function generateBarcode(): string {
  let barcodeHTML = ''
  for (let i = 0; i < 30; i++) {
    const isLong = Math.random() > 0.5
    barcodeHTML += `<div class="barcode-line ${isLong ? 'tall' : 'short'}"></div>`
  }
  return barcodeHTML
}

/**
 * Fallback function to download booking details as a text file
 */
function downloadBookingDetailsAsText(bookingRef: string, details: any) {
  // Format the booking details as text
  const bookingDate = new Date().toLocaleDateString()
  const packageType = details.packageType || 'hajj'
  const isHajj = packageType.toLowerCase() === 'hajj'
  const pilgrims = details.pilgrims || [{ firstName: 'Guest', lastName: 'User', email: 'guest@example.com' }]
  const primaryPilgrim = pilgrims[0]
  const isGroupBooking = details.isGroupBooking || false

  let bookingDetails = `
AL-MUTAMIR BOOKING CONFIRMATION
============================
Booking Reference: ${bookingRef}
Date: ${bookingDate}

PACKAGE INFORMATION
-------------------
Package Type: ${isHajj ? 'Hajj' : 'Umrah'}
`

  if (details.selectedPackage) {
    bookingDetails += `Selected Package: ${details.selectedPackage}\n`
  }

  bookingDetails += `Booking Type: ${isGroupBooking ? 'Group Booking' : 'Individual Booking'}
Number of Pilgrims: ${pilgrims.length}
Departure City: ${details.departureCity || 'Not specified'}
Departure Date: ${details.departureDate || 'Not specified'}

SELECTED SERVICES
-----------------
`

  const services = details.services || {}
  Object.entries(services).forEach(([key, value]: [string, any]) => {
    if (value.selected) {
      bookingDetails += `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.tier}\n`
    }
  })

  bookingDetails += `

PILGRIM INFORMATION
------------------
`

  pilgrims.forEach((pilgrim: any, index: number) => {
    if (isGroupBooking) {
      bookingDetails += `Pilgrim ${index + 1}:\n`
    }
    bookingDetails += `Name: ${pilgrim.firstName} ${pilgrim.lastName}
Email: ${pilgrim.email}
Phone: ${pilgrim.phone}
Country: ${pilgrim.country}
City: ${pilgrim.city}
Passport: ${pilgrim.passport}

`
  })

  bookingDetails += `
This is a summary of your selected package. Final pricing will be determined based on current rates and availability.
An Al-mutamir representative will contact you shortly to finalize your booking.

Thank you for choosing Al-mutamir for your sacred journey.
`

  // Create a Blob with the text content
  const blob = new Blob([bookingDetails], { type: 'text/plain' })

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob)

  // Create a temporary anchor element
  const a = document.createElement('a')
  a.href = url
  a.download = `Al-mutamir-Booking-${bookingRef}.txt`

  // Trigger the download
  document.body.appendChild(a)
  a.click()

  // Clean up
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
