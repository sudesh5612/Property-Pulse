"use client";
import Link from "next/link";
import Image from "next/image";
import deleteProperty from "../actions/deleteProperty";
import { toast } from "react-toastify";
import { useState } from "react";

const ProfileProperties = ({ properties }) => {
  const [propertyList, setProperties] = useState(properties);

  if (!Array.isArray(propertyList)) {
    console.error("Expected properties to be an array, but got:", propertyList);
    return <p>Something went wrong.</p>;
  }

  if (propertyList.length === 0) {
    return <p>No listings found.</p>;
  }

  // Helper function to get a valid image source
  const getImageSource = (property) => {
    // Check if property has images and the first image exists
    if (!property.images || !property.images[0]) {
      return "/images/no-image.jpg"; // Fallback image
    }

    const firstImage = property.images[0];
    
    // If it's already a full URL, return as is
    if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
      return firstImage;
    }
    
    // If it starts with '/', it's already a proper path
    if (firstImage.startsWith('/')) {
      return firstImage;
    }
    
    // Otherwise, it's a relative path, so prepend with '/images/'
    return `/images/${firstImage}`;
  };

  const handleDeleteProperty = async (propertyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );
    
    if (!confirmed) return;

    try {
      const deletePropertyById = deleteProperty.bind(null, propertyId);
      await deletePropertyById();
      toast.success("Property Deleted");
      
      // Update the state with filtered properties
      const updatedProperties = propertyList.filter(
        (property) => property._id !== propertyId
      );
      setProperties(updatedProperties);
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property. Please try again.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {propertyList.map((property) => (
        <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <Link href={`/properties/${property._id}`}>
            <div className="relative h-48 w-full">
              <Image
                src={getImageSource(property)}
                alt={property.name || "Property Image"}
                fill
                className="object-cover hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </Link>
          <div className="p-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {property.name || "Unnamed Property"}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {property.location && (
                  <>
                    {property.location.street} {property.location.city}{" "}
                    {property.location.state}
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/properties/${property._id}/edit`}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDeleteProperty(property._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileProperties;