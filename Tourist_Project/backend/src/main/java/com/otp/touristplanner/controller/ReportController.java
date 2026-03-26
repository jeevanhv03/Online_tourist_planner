package com.otp.touristplanner.controller;

import com.otp.touristplanner.dto.BookingResponse;
import com.otp.touristplanner.entity.Booking;
import com.otp.touristplanner.repository.BookingRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for generating reports (Excel/summary).
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/bookings/excel")
    public ResponseEntity<byte[]> generateBookingsExcel() throws Exception {
        List<Booking> bookings = bookingRepository.findAll();

        try (XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Bookings Report");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = { "Booking ID", "Customer", "Package", "Vehicle",
                    "Start Date", "End Date", "Passengers", "Amount", "Status" };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 1;
            for (Booking b : bookings) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(b.getBookingId());
                row.createCell(1).setCellValue(b.getUser().getUsername());
                row.createCell(2).setCellValue(b.getTourPackage().getDestinationName());
                row.createCell(3).setCellValue(b.getVehicle().getVehicleType());
                row.createCell(4).setCellValue(b.getTravelStartDate().toString());
                row.createCell(5).setCellValue(b.getTravelEndDate().toString());
                row.createCell(6).setCellValue(b.getPassengerCount());
                row.createCell(7).setCellValue(b.getTotalAmount());
                row.createCell(8).setCellValue(b.getBookingStatus().name());
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++)
                sheet.autoSizeColumn(i);

            workbook.write(out);
            byte[] bytes = out.toByteArray();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings_report.xlsx")
                    .contentType(MediaType
                            .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(bytes);
        }
    }

    @GetMapping("/bookings/pdf")
    public ResponseEntity<byte[]> generateBookingsPdf() throws Exception {
        List<Booking> bookings = bookingRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        com.itextpdf.text.Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        fontTitle.setSize(18);
        Paragraph title = new Paragraph("Bookings Report", fontTitle);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100f);
        table.setSpacingBefore(10);

        String[] headers = { "ID", "Customer", "Package", "Vehicle", "Start Date", "End Date", "Status" };
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        for (Booking b : bookings) {
            table.addCell(String.valueOf(b.getBookingId()));
            table.addCell(b.getUser() != null ? b.getUser().getUsername() : "");
            table.addCell(b.getTourPackage() != null ? b.getTourPackage().getDestinationName() : "");
            table.addCell(b.getVehicle() != null ? b.getVehicle().getVehicleType() : "");
            table.addCell(b.getTravelStartDate() != null ? b.getTravelStartDate().toString() : "");
            table.addCell(b.getTravelEndDate() != null ? b.getTravelEndDate().toString() : "");
            table.addCell(b.getBookingStatus() != null ? b.getBookingStatus().name() : "");
        }

        document.add(table);
        document.close();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(out.toByteArray());
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getReportSummary() {
        List<Booking> bookings = bookingRepository.findAll();
        long totalBookings = bookings.size();
        long confirmedBookings = bookings.stream()
                .filter(b -> b.getBookingStatus() == Booking.BookingStatus.CONFIRMED).count();
        double totalRevenue = bookings.stream()
                .filter(b -> b.getPaymentStatus() == Booking.PaymentStatus.PAID)
                .mapToDouble(Booking::getTotalAmount).sum();

        return ResponseEntity.ok(java.util.Map.of(
                "totalBookings", totalBookings,
                "confirmedBookings", confirmedBookings,
                "cancelledBookings", totalBookings - confirmedBookings,
                "totalRevenue", totalRevenue,
                "bookings", bookings.stream().map(BookingResponse::fromBooking).collect(Collectors.toList())));
    }
}
