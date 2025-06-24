'use server'

import connectDB from "../config/database";
import Message from "../models/message";
import { getSessionUser } from "../utils/getSessionUser";
import { revalidatePath } from "next/cache";

async function deleteMessage(messageId){
     const sessionUser = await getSessionUser();

     if (!sessionUser || !sessionUser.userId){
        throw new Error ('User Id is required');
     }
      
     const {userId} = sessionUser;
     await connectDB();

     const message = await Message.findById(messageId);

     if(message.recipient.toString() !== userId){
        throw new Error ('unauthorized');
     }

     await  message.deleteOne();

      revalidatePath('/', 'layout');

}

export default deleteMessage;