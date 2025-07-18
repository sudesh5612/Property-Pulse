"use server";

import connectDB from "../config/database";
import Property from "../models/Property";
import { getSessionUser } from "../utils/getSessionUser";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function updateProperty(propertyId, formData) {
  await connectDB();
  const sessionUser = await getSessionUser();
  if (!sessionUser || !sessionUser.userId) {
    throw new Error("User Id is required");
  }
  const { userId } = sessionUser;
  
  const existingProperty = await Property.findById(propertyId);
  
  // Add debugging logs
  console.log('Current user ID:', userId);
  console.log('Current user ID type:', typeof userId);
  console.log('Property owner:', existingProperty.owner);
  console.log('Property owner type:', typeof existingProperty.owner);
  console.log('Property owner toString():', existingProperty.owner?.toString());
  
  if (!existingProperty) {
    throw new Error(`Property with ID ${propertyId} not found`);
  }
  
  // Verify ownership
  const propertyOwnerId = existingProperty.owner?.toString() || "";
  console.log('Comparison:', propertyOwnerId, '!==', userId);
  console.log('Are they equal?:', propertyOwnerId === userId);
  
  if (propertyOwnerId !== userId) {
    throw new Error(`Current user does not own this property. User: ${userId}, Owner: ${propertyOwnerId}`);
  }
  

  const propertyData = {
    type: formData.get("type"),
    name: formData.get("name"),
    description: formData.get("description"),
    location: {
      street: formData.get("location.street"),
      city: formData.get("location.city"),
      state: formData.get("location.state"),
      zipcode: formData.get("location.zipcode"),
    },
    beds: formData.get("beds"),
    baths: formData.get("baths"),
    square_feet: formData.get("square_feet"),
    amenities: formData.getAll("amenities"),
    rates: {
      weekly: formData.get("rates.weekly"),
      monthly: formData.get("rates.monthly"),
      nightly: formData.get("rates.nightly."),
    },
    seller_info: {
      name: formData.get("seller_info.name"),
      email: formData.get("seller_info.email"),
      phone: formData.get("seller_info.phone"),
    },
    owner: userId,
  };

  const updatedProperty = await Property.findByIdAndUpdate(
    propertyId,
    propertyData
  );

  revalidatePath("/", "layout");

  redirect(`/properties/${updatedProperty._id}`);
}
