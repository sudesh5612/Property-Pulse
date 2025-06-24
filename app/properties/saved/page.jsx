import PropertyCard from "@/app/components/PropertyCard";
import connectDB from "@/app/config/database";
import User from "@/app/models/User";
import { getSessionUser } from "@/app/utils/getSessionUser";
import { redirect } from "next/navigation";

const SavedPropertiesPage = async () => {
  await connectDB();
  
  const sessionUser = await getSessionUser();
  
  // Check if sessionUser exists BEFORE destructuring
  if (!sessionUser || !sessionUser.userId) {
    redirect('/api/auth/signin');
  }
  
  const { userId } = sessionUser; // Now safe to destructure
  
  const user = await User.findById(userId).populate('bookmarks');
  
  if (!user) {
    return (
      <section className="px-4 py-6">
        <div className="container lg:container m-auto px-4 py-6">
          <h1 className="text-2xl mb-4">Saved Properties</h1>
          <p>User not found.</p>
        </div>
      </section>
    );
  }
  
  const { bookmarks } = user;
  
  // Serialize bookmarks for client components
  const serializedBookmarks = bookmarks.map(property => ({
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
    owner: property.owner?.toString() || '',
    createdAt: property.createdAt ? property.createdAt.toString() : null,
    updatedAt: property.updatedAt ? property.updatedAt.toString() : null
  }));
  
  console.log(serializedBookmarks);
  
  return (
    <>
      <section className="px-4 py-6">
        <div className="container lg:container m-auto px-4 py-6">
          <h1 className="text-2xl mb-4">Saved Properties</h1>  
          {serializedBookmarks.length === 0 ? (
            <p>No Saved Properties</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serializedBookmarks.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default SavedPropertiesPage;