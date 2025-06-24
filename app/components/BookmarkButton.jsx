'use client'
import {useState,useEffect} from "react";
import bookmarkProperty from "../actions/bookmarkProperty";
import { FaBookmark } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import checkBookmarkStatus from "../actions/checkBookmarkStatus";
const BookmarkButton = ({property}) => {
  const [isBookmarked , setISBookmarked]= useState(false);
  const [loading , setLoading]= useState(true);
  const {data:session} = useSession();
  const userId = session?.user?.id;

     useEffect(()=>{
         if(!userId){
          setLoading(false);
          return;
         }
         checkBookmarkStatus(property._id).then((res)=>{
            if(res.error) toast.error(res.error);
            if(res.isBookmarked) setISBookmarked(res.isBookmarked);
            setLoading(false);
         })
     },[property._id,userId, checkBookmarkStatus])

   const handleClick = async ()=>{
        if (!userId){
          toast.error('you need to be signed in to bookmark a listing');
          return;
        }
          bookmarkProperty(property._id).then ((res)=>{
             if(res.error) return toast.error(res.error);
             setISBookmarked(res.isBookmarked);
             toast.success(res.message);
          })
   }
  return  isBookmarked ?(
    <>
      <button className="bg-red-500 hover:bg-red-600 text-white font-bold w-full py-2 px-4 rounded-full flex items-center justify-center" onClick={handleClick}>
        <FaBookmark className="mr-2"/> Remove Bookmarked
      </button>
    </>
  ):(
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-full py-2 px-4 rounded-full flex items-center justify-center" onClick={handleClick}>
        <FaBookmark className="mr-2"/> Bookmark Property
      </button>
  );
};

export default BookmarkButton;
