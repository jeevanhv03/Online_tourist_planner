package com.otp.touristplanner.config;

import com.otp.touristplanner.entity.Role;
import com.otp.touristplanner.entity.TourPackage;
import com.otp.touristplanner.entity.User;
import com.otp.touristplanner.entity.Vehicle;
import com.otp.touristplanner.repository.PackageRepository;
import com.otp.touristplanner.repository.RoleRepository;
import com.otp.touristplanner.repository.UserRepository;
import com.otp.touristplanner.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Data initializer to seed roles, admin user, sample vehicles and packages on
 * startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

        @Autowired
        private RoleRepository roleRepository;
        @Autowired
        private UserRepository userRepository;
        @Autowired
        private VehicleRepository vehicleRepository;
        @Autowired
        private PackageRepository packageRepository;
        @Autowired
        private PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                initRoles();
                initAdminUser();
                // initSampleVehicles();
                // initSamplePackages();
        }

        private void initRoles() {
                if (roleRepository.count() < 2) {
                        ensureRole(Role.ERole.ROLE_USER);
                        ensureRole(Role.ERole.ROLE_ADMIN);
                }
        }

        private void ensureRole(Role.ERole roleName) {
                if (!roleRepository.findByName(roleName).isPresent()) {
                        roleRepository.saveAndFlush(new Role(null, roleName));
                        System.out.println("➕ Added role: " + roleName);
                }
        }

        private void initAdminUser() {
                Role adminRole = roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                                .orElseGet(() -> roleRepository.saveAndFlush(new Role(null, Role.ERole.ROLE_ADMIN)));
                Role userRoleSet = roleRepository.findByName(Role.ERole.ROLE_USER)
                                .orElseGet(() -> roleRepository.saveAndFlush(new Role(null, Role.ERole.ROLE_USER)));

                User admin = userRepository.findByUsername("admin").orElse(new User());

                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                roles.add(userRoleSet);

                admin.setUsername("admin");
                admin.setEmail("admin@touristplanner.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setPhone("9999999999");
                admin.setActive(true);
                admin.setEmailVerified(true);
                admin.setRoles(roles);

                userRepository.save(admin);
                System.out.println("✅ Admin user ensured: admin / admin123");

                if (!userRepository.existsByUsername("user1")) {
                        Role userRole = roleRepository.findByName(Role.ERole.ROLE_USER).orElseThrow();
                        Set<Role> uRoles = new HashSet<>();
                        uRoles.add(userRole);
                        User user = User.builder()
                                        .username("user1")
                                        .email("user1@touristplanner.com")
                                        .password(passwordEncoder.encode("user123"))
                                        .phone("8888888888")
                                        .active(true)
                                        .emailVerified(true)
                                        .roles(uRoles)
                                        .build();
                        userRepository.save(user);
                        System.out.println("✅ Test user created: user1 / user123");
                }
        }

        private void initSampleVehicles() {
                if (vehicleRepository.count() == 0) {
                        vehicleRepository.save(Vehicle.builder().vehicleType("Sedan").capacity(4)
                                        .mileage(15.0).chargePerKm(12.0).miscCharges(200.0)
                                        .status(Vehicle.VehicleStatus.AVAILABLE)
                                        .build());
                        vehicleRepository.save(Vehicle.builder().vehicleType("SUV").capacity(7)
                                        .mileage(12.0).chargePerKm(18.0).miscCharges(300.0)
                                        .status(Vehicle.VehicleStatus.AVAILABLE)
                                        .build());
                        vehicleRepository.save(Vehicle.builder().vehicleType("Mini Bus").capacity(15)
                                        .mileage(8.0).chargePerKm(25.0).miscCharges(500.0)
                                        .status(Vehicle.VehicleStatus.AVAILABLE).build());
                        vehicleRepository.save(Vehicle.builder().vehicleType("Luxury Coach").capacity(40)
                                        .mileage(6.0).chargePerKm(40.0).miscCharges(1000.0)
                                        .status(Vehicle.VehicleStatus.AVAILABLE)
                                        .build());
                        vehicleRepository.save(Vehicle.builder().vehicleType("Tempo Traveller").capacity(12)
                                        .mileage(10.0).chargePerKm(22.0).miscCharges(400.0)
                                        .status(Vehicle.VehicleStatus.AVAILABLE)
                                        .build());
                        vehicleRepository.save(Vehicle.builder().vehicleType("Double Decker Bus").capacity(60)
                                        .mileage(4.0).chargePerKm(55.0).miscCharges(1500.0)
                                        .status(Vehicle.VehicleStatus.AVAILABLE)
                                        .build());
                        vehicleRepository.save(Vehicle.builder().vehicleType("Volvo Semi-Sleeper").capacity(45)
                                        .mileage(5.0).chargePerKm(45.0).miscCharges(1200.0)
                                        .status(Vehicle.VehicleStatus.AVAILABLE)
                                        .build());
                        vehicleRepository.save(Vehicle.builder().vehicleType("Traveller Pro").capacity(20)
                                        .mileage(9.0).chargePerKm(28.0).miscCharges(600.0)
                                        .status(Vehicle.VehicleStatus.AVAILABLE)
                                        .build());
                        System.out.println("✅ Sample vehicles expanded.");
                }
        }

        private void initSamplePackages() {
                if (packageRepository.count() == 0) {
                        packageRepository.save(TourPackage.builder().destinationName("Goa")
                                        .numberOfDays(5).numberOfNights(4).packageCapacity(20).price(8500.0)
                                        .foodDetails("Breakfast & Dinner included").accommodationDetails("3-Star Hotel")
                                        .sightseeingDetails("Baga Beach, Calangute Beach, Fort Aguada, Dudhsagar Falls")
                                        .description("Enjoy the beautiful beaches of Goa with a complete holiday package.")
                                        .active(true)
                                        .build());

                        packageRepository.save(TourPackage.builder().destinationName("Kerala Backwaters")
                                        .numberOfDays(7).numberOfNights(6).packageCapacity(15).price(12000.0)
                                        .foodDetails("All Meals included").accommodationDetails("Houseboat + Hotel")
                                        .sightseeingDetails(
                                                        "Alleppey Backwaters, Munnar Tea Gardens, Kochi Fort, Thekkady")
                                        .description("Explore the God's Own Country - Kerala with houseboat experience.")
                                        .active(true)
                                        .build());

                        packageRepository.save(TourPackage.builder().destinationName("Rajasthan Desert Tour")
                                        .numberOfDays(8).numberOfNights(7).packageCapacity(25).price(15000.0)
                                        .foodDetails("Breakfast included").accommodationDetails("Heritage Hotels")
                                        .sightseeingDetails(
                                                        "Jaipur City Palace, Udaipur Lake, Jodhpur Fort, Jaisalmer Desert Safari")
                                        .description("Experience the royal heritage and desert beauty of Rajasthan.")
                                        .active(true).build());

                        packageRepository.save(TourPackage.builder().destinationName("Manali Adventure")
                                        .numberOfDays(6).numberOfNights(5).packageCapacity(20).price(9500.0)
                                        .foodDetails("Breakfast & Dinner included")
                                        .accommodationDetails("Mountain Resort")
                                        .sightseeingDetails("Solang Valley, Rohtang Pass, Hadimba Temple, Old Manali")
                                        .description("Adventure and snow at Manali - perfect for thrill seekers.")
                                        .active(true).build());

                        packageRepository.save(TourPackage.builder().destinationName("Andaman Islands")
                                        .numberOfDays(7).numberOfNights(6).packageCapacity(15).price(18000.0)
                                        .foodDetails("All Meals included").accommodationDetails("Beach Resort")
                                        .sightseeingDetails(
                                                        "Radhanagar Beach, Cellular Jail, Ross Island, Scuba Diving")
                                        .description("Paradise islands with crystal clear waters and white sandy beaches.")
                                        .active(true)
                                        .build());

                        packageRepository.save(TourPackage.builder().destinationName("Varanasi Spiritual Tour")
                                        .numberOfDays(4).numberOfNights(3).packageCapacity(50).price(5500.0)
                                        .foodDetails("Breakfast included").accommodationDetails("Heritage Guesthouse")
                                        .sightseeingDetails("Ganges Aarti, Kashi Vishwanath Temple, Sarnath, Boat Ride")
                                        .description("Discover the spiritual heart of India at the sacred Varanasi.")
                                        .active(true).build());

                        packageRepository.save(TourPackage.builder().destinationName("Corporate Shimla Retreat")
                                        .numberOfDays(5).numberOfNights(4).packageCapacity(100).price(12500.0)
                                        .foodDetails("All Inclusive").accommodationDetails("Luxury Resort")
                                        .sightseeingDetails("Mall Road, Jakhu Temple, Kufri, Ice Skating")
                                        .description("Perfect for large corporate groups and team building.")
                                        .active(true).build());

                        packageRepository.save(TourPackage.builder().destinationName("Char Dham Yatra")
                                        .numberOfDays(12).numberOfNights(11).packageCapacity(60).price(35000.0)
                                        .foodDetails("Satvik Meals").accommodationDetails("Dharamshalas & Hotels")
                                        .sightseeingDetails("Yamunotri, Gangotri, Kedarnath, Badrinath")
                                        .description("A holy pilgrimage for large families and spiritual groups.")
                                        .active(true).build());

                        packageRepository.save(TourPackage.builder().destinationName("Educational Delhi-Agra")
                                        .numberOfDays(3).numberOfNights(2).packageCapacity(120).price(4500.0)
                                        .foodDetails("Packed Meals").accommodationDetails("Group Dorms / Hotels")
                                        .sightseeingDetails("Taj Mahal, Red Fort, Qutub Minar, India Gate")
                                        .description("Ideal for school trips and large student groups.")
                                        .active(true).build());

                        System.out.println("✅ Sample travel packages expanded.");
                }
        }
}
