import java.sql.*;

public class CheckOrphans {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/tourist_planner_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "Bhaskar@123";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Checking for orphaned bookings...");
            String bookingQuery = "SELECT b.booking_id, b.user_id FROM bookings b LEFT JOIN users u ON b.user_id = u.id WHERE u.id IS NULL";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(bookingQuery)) {
                while (rs.next()) {
                    System.out.println("Orphaned Booking ID: " + rs.getLong("booking_id") + " (User ID: "
                            + rs.getLong("user_id") + ")");
                }
            }

            System.out.println("\nChecking for orphaned reviews...");
            String reviewQuery = "SELECT r.review_id, r.user_id FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE u.id IS NULL";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(reviewQuery)) {
                while (rs.next()) {
                    System.out.println("Orphaned Review ID: " + rs.getLong("review_id") + " (User ID: "
                            + rs.getLong("user_id") + ")");
                }
            }

            System.out.println("\nChecking for orphaned bookings (Package)...");
            String bookingPkgQuery = "SELECT b.booking_id, b.package_id FROM bookings b LEFT JOIN travel_packages p ON b.package_id = p.package_id WHERE p.package_id IS NULL";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(bookingPkgQuery)) {
                while (rs.next()) {
                    System.out.println("Orphaned Booking ID: " + rs.getLong("booking_id") + " (Package ID: "
                            + rs.getLong("package_id") + ")");
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
