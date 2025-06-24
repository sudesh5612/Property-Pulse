import Image from "next/image";
import connectDB from "../config/database";
import { getSessionUser } from "../utils/getSessionUser";
import profileDefault from "@/public/images/profile.png";
import User from "../models/User";
import Property from "../models/Property";
import ProfileProperties from "../components/ProfileProperties";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  await connectDB();
  
  const sessionUser = await getSessionUser();
  
  // Check if sessionUser exists BEFORE destructuring
  if (!sessionUser || !sessionUser.userId) {
    redirect('/api/auth/signin');
  }
  
  const { userId } = sessionUser; // Now safe to destructure
  
  // Use parallel queries for better performance
  const [user, rawProperties] = await Promise.all([
    User.findById(userId).lean(),
    Property.find({ owner: userId }).lean(),
  ]);
  
  if (!user) {
    throw new Error("User not found in database");
  }
  
  // Serialize properties properly
  const properties = rawProperties.map(property => ({
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
    owner: property.owner.toString(),
    createdAt: property.createdAt ? property.createdAt.toString() : null,
    updatedAt: property.updatedAt ? property.updatedAt.toString() : null
  }));

  return (
    <section className="bg-blue-50">
      <div className="container m-auto py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 mx-20 mt-10">
              <div className="mb-4">
                <Image
                  className="h-32 w-32 md:h-48 md:w-48 rounded-full mx-auto md:mx-0"
                  src={user.image || profileDefault}
                  width={200}
                  height={200}
                  alt="User"
                />
              </div>
              <h2 className="text-2xl mb-4">
                <span className="font-bold block">Name: </span> {user.username}
              </h2>
              <h2 className="text-2xl">
                <span className="font-bold block">Email: </span> {user.email}
              </h2>
            </div>
            <div className="md:w-3/4 md:pl-4">
              <h2 className="text-xl font-semibold mb-4">Your Listings</h2>
              <ProfileProperties properties={properties} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;