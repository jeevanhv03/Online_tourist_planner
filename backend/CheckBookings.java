import java.sql.*;

public class CheckBookings {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/tourist_planner_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "Bhaskar@123";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to database.");

            // Check users
            System.out.println("\nUsers:");
            try (Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery("SELECT id, username, email FROM users")) {
                while (rs.next()) {
                    System.out.printf("ID: %d, Username: %s, Email: %s%n", rs.getLong("id"), rs.getString("username"),
                            rs.getString("email"));
                }
            }

            // Check bookings
            System.out.println("\nBookings:");
            try (Statement stmt = conn.createStatement();
                    ResultSet rs = stmt
                            .executeQuery("SELECT booking_id, user_id, package_id, vehicle_id FROM bookings")) {
                while (rs.next()) {
                    System.out.printf("ID: %d, UserID: %d, PackageID: %d, VehicleID: %d%n",
                            rs.getLong("booking_id"),
                            rs.getObject("user_id"),
                            rs.getObject("package_id"),
                            rs.getObject("vehicle_id"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
