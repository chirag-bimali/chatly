import { useContext, useEffect, useState } from "react";
import APIContext from "../Context/APIContext";
import AuthContext from "../Context/AuthContext";
import AppContext from "../Context/AppContext";
import DefaultUserProfile from "../assets/default-user-profile.svg?react";

export default function ProfileImage({
  userId,
  className,
  uploadedImage = null,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const { API_ROUTE } = useContext(APIContext);
  const [loading, setLoading] = useState(true);
  // Fetch the profile image from the API
  // and set it to the imageUrl state
  const { token } = useContext(AppContext);

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

    // Reset imageUrl when uploadedImage becomes null
    setImageUrl(null);
    setLoading(true);

    // Otherwise, fetch from API if token exists
    if (!token) return;

    fetch(`${API_ROUTE}/users/profilepicture/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile image");
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token, API_ROUTE, uploadedImage, userId]);

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
