"use client";

import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function LikeButton({
  blogId,
  like,
}: {
  blogId: string;
  like: number;
}) {
  const [likes, setLikes] = useState(like);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading || liked) return;

    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/blog/${blogId}`,
      { method: "PATCH" }
    );

    const data = await res.json();
    setLikes(data.likes);
    setLiked(true);
    setLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading || liked}
      className="flex items-center gap-2 disabled:opacity-70"
    >
      {liked ? (
        <FaHeart className="text-red-500 text-xl animate-pulse" />
      ) : (
        <FaRegHeart className="text-gray-600 text-xl" />
      )}

      <span className="text-sm font-medium">
        {likes}
      </span>
    </button>
  );
}
