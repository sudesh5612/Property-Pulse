'use server'

import cloudinary from "../config/cloudinary";
import connectDB from "../config/database";
import Property from "../models/Property";
import { getSessionUser } from "../utils/getSessionUser";
import { revalidatePath } from "next/cache";

async function deleteProperty(propertyId){
     const sessionUser = await getSessionUser();

     if (!sessionUser || !sessionUser.userId){
        throw new Error ('User Id is required');
     }
      
     const {userId} = sessionUser;
     await connectDB();

     const property = await Property.findById(propertyId);
     if(!property) throw new Error('property not found');

     // verify ownership
     if (property.owner.toString() !== userId){
        throw new Error('unauthorized');
     }
      
     await Property.deleteOne();

     // Extract public ID from image URLs

     const publicIds = property.images.map((imageurl)=>{
         const parts = imageurl.split('/');
         return parts.at(-1).split('.').at(0);
     });
     
     // Delete images from Cloudinary
  if (publicIds.length > 0) {
    for (let publicId of publicIds) {
      await cloudinary.uploader.destroy('propertypulse/' + publicId);
    }
  }
      // Proceed with property deletion
      await property.deleteOne();

      revalidatePath('/', 'layout');

}

export default deleteProperty;