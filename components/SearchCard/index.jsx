import React, { useState, useCallback, useEffect, useRef } from "react";
import { useResultData } from "@/context/provider";
import { HOST_URL } from "@/constants/api";

const SearchCard = () => {
  // State for clicked methods
  const [activeButtons, setActiveButtons] = useState(new Set(["semantic"]));

  // State for storing user input with type and value
  const [inputValues, setInputValues] = useState([
    { type: "semantic", value: "" },
  ]);

  const { resultData, setResultData, setQuery, topK, setTopK } = useResultData();

  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleTopKChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      setTopK(newValue);
    }
  };

  const handleTypeChange = (event, newTypes) => {
    if (newTypes.length) {
      setActiveButtons(new Set(newTypes));

      setInputValues(prevInputValues => {
        // Remove types that are no longer selected
        let filteredValues = prevInputValues.filter(input => newTypes.includes(input.type));

        // Add new types that were selected
        newTypes.forEach(type => {
          if (!filteredValues.some(input => input.type === type)) {
            filteredValues.push({ type: type, value: "" });
          }
        });

        return filteredValues;
      });
    }
  };

  // Close an input query
  const handleCloseClick = useCallback((type) => {
    setInputValues(prevInputValues => prevInputValues.filter(input => input.type !== type));
    setActiveButtons(prevActiveButtons => new Set([...prevActiveButtons].filter(activeType => activeType !== type)));
    if (type === "semantic") {
      setQuery("")
    }
  }, []);

  // Update value when changed an input query 
  const handleInputChange = useCallback((index, e) => {
    setInputValues((prevInputValues) => {
      const newInputValues = [...prevInputValues];
      newInputValues[index].value = e.target.value;

      if (newInputValues[index].type === "query") {
        setQuery(e.target.value);
      }

      return newInputValues;
    });
  }, [inputValues, setQuery]);

  // Logic to fetch result from API
  const fetchResults = async (queryValues) => {
    // Construct the API endpoint based on the type of query
    let apiEndpoint = `${HOST_URL}`;
    let requestBody = null;
    let headers = {};

    // Single search type handling
    if (queryValues.length === 1) {
      const { type, value } = queryValues[0];
      apiEndpoint += `${type}_search`;
      requestBody = new FormData();
      requestBody.append("query", value);
      requestBody.append("topk", topK);
    } else {
      apiEndpoint += "combine_search";
      requestBody = JSON.stringify({
        query: queryValues.map(q => q.value),
        methods: queryValues.map(q => q.type),
        topk: topK,
      });
      headers = { "Content-Type": "application/json" };
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: requestBody,
        headers: headers
      });

      if (!response.ok) {
        throw new Error("Failed to fetch results from the API.");
      }

      const resultData = await response.json();
      setResultData(resultData)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle when clicked submit button
  const handleSubmit = async () => {
    const queryValues = inputValues.filter(obj => obj.value !== "");

    // Proceed with the search if there are valid query values
    if (queryValues.some(data => data.value !== "")) {
      await fetchResults(queryValues);
    }
  };

  const ButtonToggle = ({ type, isActive, onClick }) => {
    return (
      <button
        className={`px-2 py-1 rounded-full text-sm uppercase ${isActive ? "bg-lime-600 text-white" : "bg-white text-lime-600"} border-2 border-black hover:bg-lime-600 hover:text-white`}
        onClick={onClick}
      >
        {type}
      </button>
    )
  }

  // Function to adjust textarea height
  const adjustTextAreaHeight = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextAreaHeight();
  }, [inputValues]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 relative">
          <div className="flex mb-1 justify-between">
            <div className="flex space-x-1">
              {["semantic", "ocr", "asr"].map((type) => (
                <ButtonToggle
                  key={type}
                  type={type}
                  isActive={activeButtons.has(type)}
                  onClick={() => handleTypeChange(null, activeButtons.has(type) ? [] : [type])}
                />
              ))}
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label
                htmlFor="topk"
                className="block text-sm font-medium text-gray-900"
              >
                Top K
              </label>
              <input
                id="topk"
                type="number"
                value={topK}
                onChange={handleTopKChange}
                min="1"
                max="100"
                className="border-2 border-black rounded-md px-1 py-1 text-gray-900 text-xs focus:outline-lime-600"
              />
            </div>
          </div>
          {inputValues.map((input, index) => (
            <div key={index}>
              <div className="flex relative items-center text-lg mb-2">
                <textarea
                  rows={1}
                  ref={textAreaRef}
                  type="text"
                  value={input.value}
                  onChange={(e) => { handleInputChange(index, e) }}
                  placeholder={input.type}
                  style={{ maxHeight: "200px", height: "56px", overflowY: "hidden" }}
                  className="flex-grow resize-none pl-4 pr-12 py-4 text-gray-700 bg-white border-2 border-black rounded-lg shadow-sm focus:outline-lime-600"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                {/* <button onClick={() => handleCloseClick(input.type)} className="absolute top-0 right-0 mt-1 mr-2 text-sm">
                  &times;
                </button> */}
                <button onClick={handleSubmit} className="absolute p-2 my-1 mx-2 right-0 fill-lime-600 bg-lime-50 hover:bg-lime-200 hover:fill-lime-800 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 30 30">
                    <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {/* <button onClick={handleSubmit} className="bg-lime-500 text-white p-3 rounded-full my-2 hover:bg-lime-600">Search</button> */}
        </div>
      </div>
    </>
  );
};

export default SearchCard;