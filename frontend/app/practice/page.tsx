"use client";

import useDebounce from "../../hooks/useDebounce";
import { useEffect, useState } from "react";
const page = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedValue = useDebounce(searchTerm, 5000);

  useEffect(() => {
    const callApi = (value: string) => {
      if (!value.trim()) return;
      console.log("Searching:", value);
    };

    callApi(debouncedValue);
  }, [debouncedValue]);

  return (
    <div>
      <input type="text" name="kewyord" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
    </div>
  );
};

export default page;
