/**
 * Route optimization utilities for FetchRoute
 * Implements the Nearest Neighbor algorithm for route optimization
 */

// Calculate distance between two coordinates using the Haversine formula
// This calculates the "as the crow flies" distance between two lat/lng points
export const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return 0;
  
  const toRadians = (degree) => degree * Math.PI / 180;
  
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLng = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance; // Distance in kilometers
};

// Nearest Neighbor algorithm implementation
// Starting from a given point, always visit the nearest unvisited point next
export const nearestNeighbor = (startingPoint, destinations) => {
  if (!startingPoint || !destinations || destinations.length === 0) {
    return { route: [], totalDistance: 0 };
  }

  // Clone the destinations array to avoid modifying the original
  let unvisited = [...destinations];
  
  // Initialize variables
  let currentPoint = startingPoint;
  let route = [];
  let totalDistance = 0;
  
  // Keep finding the nearest point until all points are visited
  while (unvisited.length > 0) {
    // Find the nearest unvisited point
    let nearestPointIndex = -1;
    let shortestDistance = Infinity;
    
    for (let i = 0; i < unvisited.length; i++) {
      const point = unvisited[i];
      const distance = calculateDistance(
        currentPoint.coordinates,
        point.coordinates
      );
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestPointIndex = i;
      }
    }
    
    // Add the nearest point to the route
    const nearestPoint = unvisited[nearestPointIndex];
    route.push(nearestPoint);
    
    // Update total distance
    totalDistance += shortestDistance;
    
    // Set the current point to the nearest point
    currentPoint = nearestPoint;
    
    // Remove the visited point from the unvisited points
    unvisited.splice(nearestPointIndex, 1);
  }
  
  return { route, totalDistance };
};

// Format appointments for route optimization
export const formatAppointmentsForRouting = (appointments, startingPoint) => {
  // Ensure startingPoint has the correct format
  if (!startingPoint || !startingPoint.coordinates) {
    throw new Error('Invalid starting point. Must include coordinates.');
  }
  
  // Format destinations from appointments
  const destinations = appointments.map(appointment => {
    const client = appointment.client;
    
    if (!client || !client.address || !client.address.coordinates) {
      throw new Error(`Missing coordinates for appointment at ${appointment.date}`);
    }
    
    return {
      id: appointment.id,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      clientName: client.name,
      petId: appointment.petId,
      time: appointment.date,
      address: client.address.formatted || 'Address not available',
      coordinates: client.address.coordinates,
      serviceType: appointment.serviceType,
      duration: appointment.duration || 60
    };
  });
  
  return { startingPoint, destinations };
};

// Optimize route using the nearest neighbor algorithm
export const optimizeRoute = (appointments, userStartPoint) => {
  // Format the data for routing
  const { startingPoint, destinations } = formatAppointmentsForRouting(
    appointments,
    userStartPoint
  );
  
  // Apply the nearest neighbor algorithm
  const { route, totalDistance } = nearestNeighbor(startingPoint, destinations);
  
  // Calculate estimated travel times (very rough estimation)
  // Assume average speed of 30 km/h in urban areas
  const averageSpeed = 30; // km/h
  const travelTimeInHours = totalDistance / averageSpeed;
  const travelTimeInMinutes = Math.round(travelTimeInHours * 60);
  
  // Add starting and ending waypoints
  const waypoints = [
    {
      ...startingPoint,
      type: 'start',
      arrivalTime: null,
      departureTime: route.length > 0 ? new Date(route[0].time.getTime() - (travelTimeInMinutes / route.length) * 60000) : new Date()
    },
    ...route.map((stop, index) => {
      const arrivalTime = index === 0 
        ? new Date(stop.time) // First appointment is at scheduled time
        : new Date(route[index - 1].time.getTime() + route[index - 1].duration * 60000 + (travelTimeInMinutes / route.length) * 60000);
      
      return {
        ...stop,
        type: 'appointment',
        arrivalTime,
        departureTime: new Date(arrivalTime.getTime() + stop.duration * 60000)
      };
    }),
    {
      ...startingPoint,
      type: 'end',
      arrivalTime: route.length > 0 
        ? new Date(route[route.length - 1].departureTime.getTime() + (travelTimeInMinutes / route.length) * 60000)
        : new Date(),
      departureTime: null
    }
  ];
  
  return {
    waypoints,
    optimizedRoute: route,
    appointmentIds: route.map(stop => stop.appointmentId),
    totalDistance,
    estimatedTravelTime: travelTimeInMinutes,
    startPoint: startingPoint,
    endPoint: startingPoint  // Default to returning to starting point
  };
};

export default {
  calculateDistance,
  nearestNeighbor,
  formatAppointmentsForRouting,
  optimizeRoute
};
