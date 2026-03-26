package com.otp.touristplanner.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;
import com.otp.touristplanner.entity.Booking;
import com.otp.touristplanner.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

        @Autowired
        private BookingRepository bookingRepository;

        @Transactional(readOnly = true)
        public byte[] generateBookingInvoice(Long bookingId) throws Exception {
                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new Exception("Booking not found"));

                Document document = new Document();
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                PdfWriter.getInstance(document, out);
                document.open();

                // Fonts
                Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.DARK_GRAY);
                Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.GRAY);
                Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
                Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
                Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY);

                // Header Table
                PdfPTable headerTable = new PdfPTable(2);
                headerTable.setWidthPercentage(100);

                PdfPCell logoCell = new PdfPCell();
                logoCell.setBorder(Rectangle.NO_BORDER);
                logoCell.addElement(new Phrase("🌍 TOURIST PLANNER", titleFont));
                logoCell.addElement(new Phrase("Authorized Franchise: FR-7782-IND", footerFont));
                logoCell.addElement(new Phrase("GST NO: 22AAAAA0000A1Z5", footerFont));
                headerTable.addCell(logoCell);

                PdfPCell invoiceLabelCell = new PdfPCell(new Phrase("INVOICE", subTitleFont));
                invoiceLabelCell.setBorder(Rectangle.NO_BORDER);
                invoiceLabelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                headerTable.addCell(invoiceLabelCell);

                document.add(headerTable);
                document.add(new Paragraph("\n"));
                document.add(new LineSeparator());
                document.add(new Paragraph("\n"));

                // Info Table
                PdfPTable infoTable = new PdfPTable(2);
                infoTable.setWidthPercentage(100);

                // BILLED TO Section
                PdfPCell billedTo = new PdfPCell();
                billedTo.setBorder(Rectangle.NO_BORDER);
                billedTo.addElement(new Phrase("BILLED TO:", subTitleFont));

                String userName = "Guest";
                String userEmail = "N/A";
                String userPhone = "N/A";

                if (booking.getUser() != null) {
                        userName = booking.getUser().getFullName() != null ? booking.getUser().getFullName()
                                        : booking.getUser().getUsername();
                        userEmail = booking.getUser().getEmail() != null ? booking.getUser().getEmail() : "N/A";
                        userPhone = booking.getUser().getPhone() != null ? booking.getUser().getPhone() : "N/A";
                }

                billedTo.addElement(new Phrase(userName, boldFont));
                billedTo.addElement(new Phrase(userEmail, normalFont));
                billedTo.addElement(new Phrase(userPhone, normalFont));
                infoTable.addCell(billedTo);

                PdfPCell invoiceInfo = new PdfPCell();
                invoiceInfo.setBorder(Rectangle.NO_BORDER);
                invoiceInfo.setHorizontalAlignment(Element.ALIGN_RIGHT);
                invoiceInfo.addElement(new Phrase("INVOICE DETAILS:", subTitleFont));
                invoiceInfo.addElement(new Phrase("Booking ID: #BK-" + booking.getBookingId(), normalFont));

                String bookingDateStr = "N/A";
                if (booking.getBookingDate() != null) {
                        bookingDateStr = booking.getBookingDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
                }
                invoiceInfo.addElement(new Phrase("Date: " + bookingDateStr, normalFont));
                invoiceInfo.addElement(new Phrase(
                                "Status: " + (booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "PAID"),
                                boldFont));
                infoTable.addCell(invoiceInfo);

                document.add(infoTable);
                document.add(new Paragraph("\n\n"));

                // Items Table
                PdfPTable itemsTable = new PdfPTable(4);
                itemsTable.setWidthPercentage(100);

                // Table Header
                String[] headers = { "Description", "Travel Dates", "Travelers", "Amount" };
                for (String header : headers) {
                        PdfPCell hCell = new PdfPCell(new Phrase(header, boldFont));
                        hCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                        hCell.setPadding(8);
                        itemsTable.addCell(hCell);
                }

                // Add Row
                String destName = "Travel";
                if (booking.getTourPackage() != null && booking.getTourPackage().getDestinationName() != null) {
                        destName = booking.getTourPackage().getDestinationName();
                }

                String travelDates = "TBD";
                if (booking.getTravelStartDate() != null && booking.getTravelEndDate() != null) {
                        travelDates = booking.getTravelStartDate() + " to " + booking.getTravelEndDate();
                }

                itemsTable.addCell(new PdfPCell(new Phrase(destName + " Package", normalFont)));
                itemsTable.addCell(new PdfPCell(new Phrase(travelDates, normalFont)));
                itemsTable.addCell(new PdfPCell(new Phrase(
                                booking.getPassengerCount() != null ? booking.getPassengerCount().toString() : "0",
                                normalFont)));
                itemsTable.addCell(new PdfPCell(
                                new Phrase("₹" + (booking.getTotalAmount() != null ? booking.getTotalAmount() : "0.00"),
                                                boldFont)));

                document.add(itemsTable);
                document.add(new Paragraph("\n"));

                // Payment and Totals Row
                PdfPTable paymentTotalTable = new PdfPTable(2);
                paymentTotalTable.setWidthPercentage(100);

                // Payment Information
                PdfPCell paymentInfoCell = new PdfPCell();
                paymentInfoCell.setBorder(Rectangle.NO_BORDER);
                paymentInfoCell.addElement(new Phrase("PAYMENT INFORMATION:", subTitleFont));

                String method = booking.getPaymentMethod() != null ? booking.getPaymentMethod()
                                : "Credit Card (Pre-auth)";
                String card = booking.getCardLast4() != null ? "**** **** **** " + booking.getCardLast4()
                                : "**** **** **** 1234";

                paymentInfoCell.addElement(new Phrase("Method: " + method, normalFont));
                paymentInfoCell.addElement(new Phrase("Card: " + card, normalFont));
                paymentInfoCell.addElement(
                                new Phrase("Transaction ID: TXN-" + booking.getBookingId() + "AB7", normalFont));
                paymentTotalTable.addCell(paymentInfoCell);

                // Totals Table
                PdfPCell totalContainerCell = new PdfPCell();
                totalContainerCell.setBorder(Rectangle.NO_BORDER);

                PdfPTable totalsTable = new PdfPTable(2);
                totalsTable.setWidthPercentage(100);
                totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

                String totalAmt = booking.getTotalAmount() != null ? booking.getTotalAmount().toString() : "0.00";

                totalsTable.addCell(new PdfPCell(new Phrase("Subtotal:", normalFont)));
                totalsTable.addCell(new PdfPCell(new Phrase("₹" + totalAmt, normalFont)));

                totalsTable.addCell(new PdfPCell(new Phrase("Tax (0%):", normalFont)));
                totalsTable.addCell(new PdfPCell(new Phrase("₹0.00", normalFont)));

                PdfPCell totalLabelCell = new PdfPCell(new Phrase("Grand Total:", boldFont));
                totalLabelCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                totalsTable.addCell(totalLabelCell);

                PdfPCell totalValueCell = new PdfPCell(new Phrase("₹" + totalAmt, boldFont));
                totalValueCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                totalsTable.addCell(totalValueCell);

                totalContainerCell.addElement(totalsTable);
                paymentTotalTable.addCell(totalContainerCell);

                document.add(paymentTotalTable);
                document.add(new Paragraph("\n\n\n"));

                // Footer
                Paragraph footer = new Paragraph(
                                "Franchise Office: Sector 15, Gurgaon, Haryana, India - 122001\n" +
                                                "Thank you for choosing Tourist Planner! We hope you have an amazing journey.\nFor any queries, contact support@touristplanner.com",
                                footerFont);
                footer.setAlignment(Element.ALIGN_CENTER);
                document.add(footer);

                document.close();
                return out.toByteArray();
        }
}
