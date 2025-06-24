import PropertyHeaderImage from "@/app/components/PropertyHeaderImage";
import PropertyDetails from "@/app/components/PropertyDetails";
import connectDB from "@/app/config/database";
import Property from "@/app/models/Property";
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import PropertyImages from "@/app/components/PropertyImages";
import BookmarkButton from "@/app/components/BookmarkButton";
import ShareButtons from "@/app/components/ShareButtons";
import PropertyContactForm from "@/app/components/PropertyContactForm";

const PropertyPage = async ({params}) => {
  await connectDB();
  const property = await Property.findById(params.id).lean();
 
  if (!property) {
    return (
      <div className="container m-auto py-10 px-6">
        <p className="text-red-500">Property not found.</p>
        <Link href="/properties" className="text-blue-500 underline">
          <FaArrowLeft className="inline-block mr-1" /> Back to Properties
        </Link>
      </div>
    );
  }

  // Serialize the property object
  const serializedProperty = {
    _id: property._id.toString(), // ✅ Fixed
    owner: property.owner?.toString(),
    name: property.name,
    type: property.type,
    description: property.description,
    location: {
      street: property.location?.street,
      city: property.location?.city,
      state: property.location?.state,
      zipcode: property.location?.zipcode,
    },
    beds: property.beds,
    baths: property.baths,
    square_feet: property.square_feet,
    amenities: property.amenities || [],
    rates: {
      nightly: property.rates?.nightly,
      weekly: property.rates?.weekly,
      monthly: property.rates?.monthly,
    },
    seller_info: {
      name: property.seller_info?.name,
      email: property.seller_info?.email,
      phone: property.seller_info?.phone,
    },
    images: property.images || [],
    is_featured: property.is_featured,
    createdAt: property.createdAt?.toString(),
    updatedAt: property.updatedAt?.toString(),
  };
     
  return (  
    <>
      <PropertyHeaderImage image={serializedProperty.images[0]}/>
      
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            href="/properties"
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <FaArrowLeft className="mr-2"/> Back to Properties
          </Link>
        </div>
      </section>
      
      <section className="bg-blue-50">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <PropertyDetails property={serializedProperty} />
            
            <aside className='space-y-4'>
              <BookmarkButton property={serializedProperty} />
              <ShareButtons property={serializedProperty} />
              <PropertyContactForm property={serializedProperty} />
            </aside>
          </div>
        </div>
      </section>
      
      <PropertyImages images={serializedProperty.images}/>
    </>
  );
};
 
export default PropertyPage;