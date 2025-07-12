import { useContext, useEffect, useState } from "react";
import Search from "../../../../assets/search.svg?react";
import TrippleDots from "../../../../assets/tripple-dots.svg?react";
import { formatDistanceToNow, parseISO } from "date-fns";
import AuthContext from "../../../../Context/AuthContext";

export default function ChatWindowTitle({
  contactUserDetails,
}) {
  console.log(contactUserDetails)
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="prose prose-p:text-4xl prose-p:mb-3 prose-p:font-semibold">
          <p>{contactUserDetails?.displayName}</p>
        </div>
        <div className="prose prose-p:text-sm prose-p:text-neutral-400">
          <p>
            {formatDistanceToNow(parseISO(contactUserDetails.lastSeen), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      <div className="flex gap-4 self-start">
        <button className="btn shadow-none border-none w-fit h-fit p-2.5 bg-neutral-100 rounded-full">
          <Search className="h-5 w-5" />
        </button>
        <button className="btn shadow-none border-none w-fit h-fit p-2.5 bg-neutral-100 rounded-full">
          <TrippleDots className="h-5 w-5 fill-base-content" />
        </button>
      </div>
    </div>
  );
}
