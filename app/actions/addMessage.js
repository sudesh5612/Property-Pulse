"use server";

import { getSessionUser } from "../utils/getSessionUser";
import connectDB from "../config/database";
import Message from "../models/message";

async function addMessage(previousState, formData) {
  await connectDB();
  
  const sessionUser = await getSessionUser();
  
  if (!sessionUser || !sessionUser.userId) {
    throw new Error("User Id is required");
  }
  
  const { userId } = sessionUser;
  
  // Get recipient from formData
  const recipient = formData.get('recipient');
  
  if (userId === recipient) {
    return { error: "You cannot send a message to yourself" };
  }
  
  const newMessage = new Message({
    sender: userId,
    recipient,
    property: formData.get('property'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    body: formData.get('body'),
  });
  
  await newMessage.save();
  return { submitted: true };
}

export default addMessage;