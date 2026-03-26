USE tourist_planner_db;

INSERT INTO packages (
  destination_name, number_of_days, number_of_nights, package_capacity, price, 
  food_details, accommodation_details, sightseeing_details, description, image_url, 
  is_active, average_rating, total_reviews, latitude, longitude, category
) VALUES
('Goa Beach Paradise', 4, 3, 20, 15000, 
 'Breakfast included, Goan Seafood', '4-Star Beach Resort', 'Dudhsagar Trek, Baga Beach, Fort Aguada', 'Relax at the sunny beaches of Goa and enjoy vibrant nightlife.', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop', 1, 4.5, 10, 15.2993, 73.8827, 'Beach'),

('Manali Snow Adventure', 5, 4, 15, 25000, 
 'Breakfast and Dinner included', 'Cozy Mountain Cottage', 'Rohtang Pass, Solang Valley, Hidimba Temple', 'A thrilling adventure in the snow-capped mountains of Manali.', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop', 1, 4.8, 15, 32.2396, 77.1887, 'Adventure'),

('Kerala Backwaters Honeymoon', 6, 5, 2, 45000, 
 'All meals included on houseboat', 'Luxury Houseboat in Alleppey', 'Kumarakom Bird Sanctuary, Munnar Tea Gardens', 'A romantic getaway in the serene backwaters of Kerala.', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop', 1, 4.9, 8, 9.4981, 76.3388, 'Honeymoon'),

('Rajasthan Royal Heritage', 7, 6, 12, 35000, 
 'Traditional Rajasthani Thali', 'Heritage Hotel/Palace', 'Amber Fort, City Palace, Hawa Mahal', 'Experience the rich culture and royal heritage of Rajasthan.', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop', 1, 4.6, 12, 26.9124, 75.7873, 'Heritage'),

('Munnar Nature Retreat', 4, 3, 10, 18000, 
 'Breakfast, organic meals', 'Eco-friendly Treehouse', 'Tea Gardens, Eravikulam National Park, Mattupetty Dam', 'Immerse yourself in lush green tea estates and wildlife.', 'https://images.unsplash.com/photo-1593693397690-362cb9735206?w=800&auto=format&fit=crop', 1, 4.7, 5, 10.0889, 77.0595, 'Nature'),

('Andaman Luxury Cruise', 5, 4, 4, 80000, 
 'Premium All-inclusive', '5-Star Ocean View Suite', 'Radhanagar Beach, Scuba Diving, Ross Island', 'An opulent luxury trip to the pristine Andaman islands.', 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&auto=format&fit=crop', 1, 5.0, 2, 11.6234, 92.7265, 'Luxury');
