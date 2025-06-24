import connectDB from "@/app/config/database";
import Property from "@/app/models/Property";

export const GET= async(request,{params})=>{
     try{
        await connectDB();
        const property = await Property.findById(params.id);
        if(!property) return Response('property not found',{status:404});
        return new Response(property,
      {status:200} );
     } catch(error){
        return new Response("something went wrong",{status:500});  
     }
    };