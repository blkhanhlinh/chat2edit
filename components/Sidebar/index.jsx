import React, { useState } from "react";
import SearchCard from "../SearchCard";
import { useResultData } from "@/context/provider";
import Gallery from "@/components/Gallery";

const Sidebar = () => {
  const { query } = useResultData();
  const [modalImageSrc, setModalImageSrc] = useState("");

  return (
    <aside className="z-100 h-full p-4 bg-lime-50 rounded-xl">
      <div className="flex flex-col gap-2 h-full overflow-y-auto">
        <SearchCard />
        <Gallery />
      </div>
    </aside>
  );
};

export default Sidebar;