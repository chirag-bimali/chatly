import { useContext, useEffect, useState } from "react";
import APIContext from "../Context/APIContext";
import AuthContext from "../Context/AuthContext";
import AppContext from "../Context/AppContext";
import DefaultUserProfile from "../assets/default-user-profile.svg?react";

export default function ProfileImage({
  userId,
  className,
  uploadedImage = null,
  // imageUrl,
  // setImageUrl ,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const { API_ROUTE } = useContext(APIContext);
  const [loading, setLoading] = useState(true);
  // Fetch the profile image from the API
  // and set it to the imageUrl state
  const { token, requestImage, getCachedImage } = useContext(AppContext);

  useEffect(() => {
    // If there's an uploaded image, create a URL for it and use it immediately
    if (uploadedImage) {
      const url = URL.createObjectURL(uploadedImage);
      setImageUrl(url);
      setLoading(false);

      // Cleanup function to revoke the object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }

    // Reset for new userId or when uploadedImage becomes null
    setImageUrl(null);
    setLoading(true);

    // Check if we have cached image first
    if (userId) {
      const cachedImage = getCachedImage(userId);
      if (cachedImage !== undefined) {
        // cachedImage is either a URL string or null (image doesn't exist)
        setImageUrl(cachedImage);
        setLoading(false);
      } else {
        // undefined means not yet cached, so request the image
        requestImage(userId);
      }
    }
  }, [userId, uploadedImage, getCachedImage, requestImage]);

  // Listen for cache updates
  useEffect(() => {
    if (userId && !uploadedImage) {
      const cachedImage = getCachedImage(userId);
      if (cachedImage !== undefined && cachedImage !== imageUrl) {
        // Update with the cached result (URL or null)
        setImageUrl(cachedImage);
        setLoading(false);
      }
    }
  }, [userId, uploadedImage, getCachedImage, imageUrl]);

  // Render the image or a placeholder image if not loaded yet
  if (loading) {
    return <div className="loading loading-spinner"></div>;
  }

  if (!imageUrl) {
    return (
      <DefaultUserProfile className={`border-4 border-base-300 ${className}`} />
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Profile"
      className={`object-cover rounded-full h-full w-full ${className}`}
    />
  );
}
