"use server";
import { getSessionUser } from "../utils/getSessionUser";
import connectDB from "../config/database";
import Message from "../models/message";
import { revalidatePath } from "next/cache";


export default async function markMessageAsRead(messageId) {
  await connectDB();
  const sessionUser = await getSessionUser();
  if (!sessionUser || !sessionUser.userId) {
    throw new Error("User Id is required");
  }
  const { userId } = sessionUser;
  const message = await Message.findById(messageId);
  if(!message) throw new Error('Message  not found');

  // verify ownership
  if(message.recipient.toString() !== userId){
    throw new Error('unauthrozied');
  }

  message.read=!message.read;

  revalidatePath('/messages','page');
  
  await message.save();
  return message.read; 

}

