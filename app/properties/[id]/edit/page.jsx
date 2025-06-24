import PropertyEditForm from "@/app/components/PropertyEditForm";
import connectDB from "@/app/config/database";
import Property from "@/app/models/Property";

const PropertyEditPage = async ({ params }) => {
  const resolvedParams = await params;
  console.log('Full params object:', resolvedParams);
  console.log('params.id value:', resolvedParams.id);
  
  await connectDB();
  
  const propertyId = resolvedParams.id;
  
  if (!propertyId || propertyId === "id") {
    return (
      <div className="text-center mt-10">
        <h1 className="text-2xl font-bold mb-4">Invalid Property ID</h1>
        <p>Received ID: "{propertyId}"</p>
      </div>
    );
  }
  
  const propertyDoc = await Property.findById(propertyId).lean();
  
  if (!propertyDoc) {
    return (
      <h1 className="text-center text-2xl font-bold mt-10">
        Property Not Found
      </h1>
    );
  }
  
  // Convert to plain object and serialize ObjectIds
  const property = {
    ...propertyDoc,
    _id: propertyDoc._id.toString(),
    owner: propertyDoc.owner?.toString(),
    // Convert any other ObjectId fields if they exist
  };
  

  return (
    <section className="bg-blue-50">
      <div className="container m-auto max-w-2xl py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <PropertyEditForm property={property} />
        </div>
      </div>
    </section>
  );
};

export default PropertyEditPage;
