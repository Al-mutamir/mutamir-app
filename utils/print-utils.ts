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

  // Add receipt-style print styles
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
            font-family: 'Courier New', monospace;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.4;
          }
          
          .receipt {
            background: white;
            max-width: 400px;
            margin: 0 auto;
            padding: 30px 25px;
            border-radius: 15px 15px 0 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            position: relative;
          }
          
          .receipt::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 20px;
            background: linear-gradient(45deg, transparent 0%, transparent 40%, white 40%, white 60%, transparent 60%);
            background-size: 20px 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 2px dashed #e0e0e0;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c5530;
            letter-spacing: 2px;
            margin-bottom: 5px;
          }
          
          .tagline {
            font-size: 12px;
            color: #666;
            font-style: italic;
            margin-bottom: 15px;
          }
          
          .order-info {
            font-size: 11px;
            color: #333;
          }
          
          .order-info div {
            margin-bottom: 3px;
          }
          
          .items-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 1px dashed #ccc;
            font-size: 12px;
            font-weight: bold;
            color: #333;
          }
          
          .item {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px dotted #eee;
          }
          
          .item:last-child {
            border-bottom: none;
          }
          
          .item-name {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          
          .item-details {
            font-size: 11px;
            color: #666;
            margin-bottom: 8px;
          }
          
          .item-price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
          }
          
          .price {
            font-weight: bold;
            color: #2c5530;
          }
          
          .totals {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px dashed #e0e0e0;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;
          }
          
          .final-total {
            font-size: 16px;
            font-weight: bold;
            color: #d63384;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
          }
          
          .payment-section {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 2px dashed #e0e0e0;
          }
          
          .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          
          .payment-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          
          .payment-method {
            font-size: 11px;
          }
          
          .address {
            font-size: 11px;
            text-align: right;
            color: #666;
          }
          
          .footer {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 2px dashed #e0e0e0;
            text-align: center;
          }
          
          .thank-you {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          
          .qr-placeholder {
            width: 80px;
            height: 80px;
            background: #f0f0f0;
            border: 2px dashed #ccc;
            margin: 15px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #999;
            text-align: center;
          }
          
          .footer-text {
            font-size: 10px;
            color: #666;
            margin-top: 15px;
          }
          
          .print-controls {
            text-align: center;
            margin-top: 30px;
          }
          
          .print-btn {
            background: #2c5530;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 0 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
          }
          
          .print-btn:hover {
            background: #1e3a21;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .print-controls {
              display: none;
            }
            
            .receipt {
              box-shadow: none;
              max-width: none;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="company-name">AL-MUTAMIR</div>
            <div class="tagline">Your Sacred Journey, Your Way</div>
            <div class="order-info">
              <div>Booking ID: <strong>${generateBookingRef()}</strong></div>
              <div>Date: <strong>${new Date().toLocaleDateString()}</strong></div>
            </div>
          </div>
          
          ${elementToPrint.outerHTML}
          
          <div class="footer">
            <div class="thank-you">Thank you for choosing Al-mutamir!</div>
            <div class="qr-placeholder">
              QR Code<br>
              (Booking Ref)
            </div>
            <div class="footer-text">
              © ${new Date().getFullYear()} Al-mutamir. All rights reserved.<br>
              support@almutamir.com
            </div>
          </div>
        </div>
        
        <div class="print-controls">
          <button class="print-btn" onclick="window.print()">Print</button>
          <button class="print-btn" onclick="window.close()">Close</button>
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
    // Try HTML-to-PDF conversion with receipt design
    return await downloadBookingReceiptHTML(bookingRef, details)
  } catch (error) {
    console.error('Error generating PDF:', error)
    // Fallback to text download if PDF generation fails
    downloadBookingDetailsAsText(bookingRef, details)
  }
}

/**
 * Generate receipt-style HTML for booking details
 */
function generateBookingReceiptHTML(bookingRef: string, details: any): string {
  const bookingDate = new Date().toLocaleDateString()
  
  // Generate package items
  let itemsHTML = ''
  
  // Main package item
  if (details.packageDetails || details.selectedPackage) {
    const packageName = details.packageDetails?.name || details.selectedPackage || 'Pilgrimage Package'
    const packagePrice = details.totalPrice || details.packageDetails?.price || 0
    
    itemsHTML += `
      <div class="item">
        <div class="item-name">${packageName}</div>
        <div class="item-details">
          ${details.packageType === "hajj" ? "Hajj" : "Umrah"} Package<br>
          ${details.isGroupBooking ? `Group Booking (${details.pilgrims?.length || 1} pilgrims)` : 'Individual Booking'}<br>
          Departure: ${details.departureCity || "TBD"} - ${details.departureDate || "TBD"}
        </div>
        <div class="item-price-row">
          <span>QTY: ${details.pilgrims?.length || 1}</span>
          <span class="price">$${packagePrice.toFixed(2)}</span>
        </div>
      </div>
    `
  }
  
  // Add services as items
  const services = details.services || {}
  Object.entries(services).forEach(([key, value]: [string, any]) => {
    if (value.selected) {
      itemsHTML += `
        <div class="item">
          <div class="item-name">${key.charAt(0).toUpperCase() + key.slice(1)} Service</div>
          <div class="item-details">${value.tier} tier service</div>
          <div class="item-price-row">
            <span>QTY: 1</span>
            <span class="price">Included</span>
          </div>
        </div>
      `
    }
  })
  
  // Calculate totals
  const subtotal = details.totalPrice || 0
  const serviceCharge = Math.round(subtotal * 0.05) // 5% service charge
  const tax = Math.round(subtotal * 0.08) // 8% tax
  const total = subtotal + serviceCharge + tax
  
  // Generate pilgrim info for address section
  const primaryPilgrim = details.pilgrims?.[0] || {}
  const addressHTML = `
    ${primaryPilgrim.firstName || ''} ${primaryPilgrim.lastName || ''}<br>
    ${primaryPilgrim.city || ''}, ${primaryPilgrim.country || ''}<br>
    ${primaryPilgrim.email || ''}<br>
    ${primaryPilgrim.phone || ''}
  `
  
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
            font-family: 'Courier New', monospace;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.4;
          }
          
          .receipt {
            background: white;
            max-width: 400px;
            margin: 0 auto;
            padding: 30px 25px;
            border-radius: 15px 15px 0 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            position: relative;
          }
          
          .receipt::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 20px;
            background: linear-gradient(45deg, transparent 0%, transparent 40%, white 40%, white 60%, transparent 60%);
            background-size: 20px 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 2px dashed #e0e0e0;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c5530;
            letter-spacing: 2px;
            margin-bottom: 5px;
          }
          
          .tagline {
            font-size: 12px;
            color: #666;
            font-style: italic;
            margin-bottom: 15px;
          }
          
          .order-info {
            font-size: 11px;
            color: #333;
          }
          
          .order-info div {
            margin-bottom: 3px;
          }
          
          .items-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 1px dashed #ccc;
            font-size: 12px;
            font-weight: bold;
            color: #333;
          }
          
          .item {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px dotted #eee;
          }
          
          .item:last-child {
            border-bottom: none;
          }
          
          .item-name {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          
          .item-details {
            font-size: 11px;
            color: #666;
            margin-bottom: 8px;
          }
          
          .item-price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
          }
          
          .price {
            font-weight: bold;
            color: #2c5530;
          }
          
          .totals {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px dashed #e0e0e0;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;
          }
          
          .final-total {
            font-size: 16px;
            font-weight: bold;
            color: #d63384;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
          }
          
          .payment-section {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 2px dashed #e0e0e0;
          }
          
          .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          
          .payment-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          
          .payment-method {
            font-size: 11px;
          }
          
          .address {
            font-size: 11px;
            text-align: right;
            color: #666;
          }
          
          .footer {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 2px dashed #e0e0e0;
            text-align: center;
          }
          
          .thank-you {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          
          .qr-placeholder {
            width: 80px;
            height: 80px;
            background: #f0f0f0;
            border: 2px dashed #ccc;
            margin: 15px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #999;
            text-align: center;
          }
          
          .footer-text {
            font-size: 10px;
            color: #666;
            margin-top: 15px;
          }
          
          .print-controls {
            text-align: center;
            margin-top: 30px;
          }
          
          .print-btn {
            background: #2c5530;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 0 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
          }
          
          .print-btn:hover {
            background: #1e3a21;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .print-controls {
              display: none;
            }
            
            .receipt {
              box-shadow: none;
              max-width: none;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="company-name">AL-MUTAMIR</div>
            <div class="tagline">Your Sacred Journey, Your Way</div>
            <div class="order-info">
              <div>Booking ID: <strong>#${bookingRef.substring(0, 8).toUpperCase()}</strong></div>
              <div>Date: <strong>${bookingDate}</strong></div>
            </div>
          </div>
          
          <div class="items-header">
            <span>Package Details</span>
            <span>Price</span>
          </div>
          
          ${itemsHTML}
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span class="price">$${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Service:</span>
              <span class="price">$${serviceCharge.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span class="price">$${tax.toFixed(2)}</span>
            </div>
            <div class="total-row final-total">
              <span>TOTAL:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="payment-section">
            <div class="section-title">Payment Method</div>
            <div class="payment-info">
              <div class="payment-method">
                <strong>Paystack</strong><br>
                Status: ${details.paymentStatus || 'Pending'}
              </div>
              <div class="address">
                <div class="section-title" style="text-align: right; margin-bottom: 5px;">Pilgrim Info</div>
                ${addressHTML}
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="thank-you">Thank you for choosing Al-mutamir!</div>
            <div style="font-size: 11px; margin: 10px 0;">Scan QR Code to track your booking</div>
            <div class="qr-placeholder">
              QR Code<br>
              #${bookingRef.substring(0, 8).toUpperCase()}
            </div>
            <div class="footer-text">
              © ${new Date().getFullYear()} Al-mutamir. All rights reserved.<br>
              support@almutamir.com
            </div>
          </div>
        </div>
        
        <div class="print-controls">
          <button class="print-btn" onclick="window.print()">Save as PDF</button>
          <button class="print-btn" onclick="window.close()">Close</button>
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
 * Fallback function to download booking details as a text file
 */
function downloadBookingDetailsAsText(bookingRef: string, details: any) {
  // Format the booking details as text
  const bookingDate = new Date().toLocaleDateString()

  let bookingDetails = `
AL-MUTAMIR BOOKING CONFIRMATION
============================
Booking Reference: ${bookingRef}
Date: ${bookingDate}

`

  // Add package information
  bookingDetails += `PACKAGE INFORMATION
-------------------
Package Type: ${details.packageType === "hajj" ? "Hajj" : "Umrah"}
`

  if (details.selectedPackage) {
    bookingDetails += `Selected Package: ${details.selectedPackage}\n`
  }

  bookingDetails += `Booking Type: ${details.isGroupBooking ? "Group Booking" : "Individual Booking"}
Number of Pilgrims: ${details.pilgrims?.length || 1}
Departure City: ${details.departureCity || "Not specified"}
Departure Date: ${details.departureDate || "Not specified"}

`

  // Add services information
  bookingDetails += `SELECTED SERVICES
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

  // Add pilgrim information
  ;(details.pilgrims || []).forEach((pilgrim: any, index: number) => {
    if (details.isGroupBooking) {
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
  const blob = new Blob([bookingDetails], { type: "text/plain" })

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob)

  // Create a temporary anchor element
  const a = document.createElement("a")
  a.href = url
  a.download = `Al-mutamir-Booking-${bookingRef}.txt`

  // Trigger the download
  document.body.appendChild(a)
  a.click()

  // Clean up
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}