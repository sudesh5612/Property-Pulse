import connectDB from "@/app/config/database";
import Property from "@/app/models/Property";
import Link from "next/link";
import PropertyCard from "@/app/components/PropertyCard";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import PropertySearchForm from "@/app/components/PropertySearchForm";

const SearchResultsPage = async ({searchParams}) => {
  // Await searchParams if it's a Promise (Next.js App Router)
  const params = await searchParams;
  const { location, propertyType } = params;
  await connectDB();

  const locationPattern = new RegExp(location, "i");

  let query = {
    $or: [
      { name: locationPattern },
      { description: locationPattern },
      { "location.street": locationPattern },
      { "location.city": locationPattern },
      { "location.state": locationPattern },
      { "location.zipcode": locationPattern },
    ],
  };
  if (propertyType && propertyType !== "All") {
    const typePattern = new RegExp(propertyType, "i");
    query.type = typePattern;
  }

  const propertiesQueryResults = await Property.find(query).lean();
// Serialize the data inline
  const properties = propertiesQueryResults.map(property => ({
    _id: property._id.toString(),
    name: property.name || '',
    description: property.description || '',
    type: property.type || '',
    location: {
      street: property.location?.street || '',
      city: property.location?.city || '',
      state: property.location?.state || '',
      zipcode: property.location?.zipcode || ''
    },
    beds: property.beds || 0,
    baths: property.baths || 0,
    square_feet: property.square_feet || 0,
    amenities: property.amenities || [],
    rates: {
      nightly: property.rates?.nightly || 0,
      weekly: property.rates?.weekly || 0,
      monthly: property.rates?.monthly || 0
    },
    seller_info: {
      name: property.seller_info?.name || '',
      email: property.seller_info?.email || '',
      phone: property.seller_info?.phone || ''
    },
    images: property.images || [],
    is_featured: property.is_featured || false,
    createdAt: property.createdAt ? property.createdAt.toString() : null,
    updatedAt: property.updatedAt ? property.updatedAt.toString() : null
  }));
  console.log(properties);
  return (
    <>
      <section className="bg-blue-700 py-4">
        <div className="max-width-7xl mx-auto px-4 flex flex-col items-start sm:px-6 lg:px-8">
          <PropertySearchForm />
        </div>
      </section>
      <section className="px-4 py-6">
        <div className="container-xl lg:container m-auto px-4 py-6">
          <Link  href='/properties' className="flex items-center text-blue-500 hover:underline mb-3">
          <FaArrowAltCircleLeft  className="mr-2 mb-1"/> Back To Properties
          </Link>
          <h1 className="text-2xl mb-4"> Search Results </h1>
          {properties.length === 0 ?(<p>No search results</p>):(
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map((property)=>(
              <PropertyCard key={property._id} property={property}  />
            ))}

            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default SearchResultsPage;
