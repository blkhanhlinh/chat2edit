import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useResultData } from '@/context/provider';
import { HOST_URL } from '@/constants/api';
import { fetchCsvData } from '@/utils/fetchCsvData';
import Video from './Video';

const Gallery = () => {
  const {
    resultData, setResultData, topK,
    relevantImages,
    irrelevantImages
  } = useResultData();
  const [clickedFrame, setClickedFrame] = useState(null);
  const [videoTime, setVideoTime] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoModalRef = useRef(null);
  const modalRef = useRef(null);

  // get frame index 
  const getFrameIndex = useCallback((frame) => parseInt(frame.split('/')[2].split('.')[0], 10), []);

  // show information like image's name,... when clicked on an image
  const handleImageClick = useCallback(async (frame) => {
    setIsModalOpen(true);
    try {
      setClickedFrame(frame);
      const frameParts = frame.split('/');
      const csvUrl = `${HOST_URL}mapframe/${frameParts[1]}.csv`;
      const csvData = await fetchCsvData(csvUrl);
      // setAllFrames(csvData.row[3]);
      const frameIdx = getFrameIndex(frame);
      const n = csvData.findIndex(row => parseInt(row[3], 10) === frameIdx);
      if (n !== -1) {
        const clickedFrameData = csvData[n];
        if (clickedFrameData) {
          setVideoTime(parseFloat(clickedFrameData[1]));
        }
      }
    } catch (err) {
      console.error('Failed to handle image click:', err);
    }
  }, [setClickedFrame, setVideoTime]);

  // handle right click to search similar image
  const handleImageContextMenu = async (e, imagePath) => {
    e.preventDefault();
    const requestBody = new FormData();
    requestBody.append("image_path", imagePath);
    requestBody.append("topk", topK);
    try {
      const response = await fetch(`${HOST_URL}image_search`, {
        method: "POST",
        body: requestBody,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch results from the API.");
      }
      const resultData = await response.json();
      setResultData(resultData);
      console.log(resultData)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Show video modal when clicked play video
  const handlePlayVideo = () => {
    setShowVideo(true);
  };

  // Close video modal when clicked play video
  const handleCloseVideo = () => {
    setShowVideo(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleClickOutside = useCallback(event => {
    if (!videoModalRef.current?.contains(event.target)) {
      setShowVideo(false);
    }
    if (!modalRef.current?.contains(event.target)) {
      setIsModalOpen(false);
    }
  }, []);

  // Function to check if the image source is base64
  const isBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  };

  // Function to return image source
  const getImageSrc = (item) => {
    if (isBase64(item)) {
      return `data:image/jpeg;base64,${item}`;
    }
    return `${HOST_URL}frame/${item.frame}`;
  };

  // Close when clicked outside video modal
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const ImageModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center bg-black/90 backdrop-blur-xl pointer-events-auto">
      <div className="relative flex h-[100dvh] w-screen justify-stretch divide-x divide-white/10 focus:outline-none pointer-events-auto" ref={modalRef}>
        <div className="flex flex-1 transition-[flex-basis] md:basis-[75vw]">
          <div className="flex flex-1 flex-col md:p-6">
            <div className="flex justify-between px-6 py-2 pt-6 text-white sm:mb-4 md:mt-2 md:px-0 md:py-2">
              <a src={`${HOST_URL}frame/${clickedFrame}`} className="relative cursor-pointer" aria-label="Download Image" download={`${clickedFrame}.jpg`}>
                <button className="flex w-full gap-2 items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clipRule="evenodd" d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929ZM5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z" fill="currentColor"></path>
                  </svg>
                </button>
              </a>
              <button aria-label="Close Modal" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.34315 6.34338L17.6569 17.6571M17.6569 6.34338L6.34315 17.6571" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
              <div className="absolute grid h-full w-full grid-rows-2 select-none touch-pan-y transform-none" draggable="false">
              <img src={`${HOST_URL}frame/${clickedFrame}`} alt="Modal Content" className="row-span-4 mx-auto h-full object-scale-down" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-grow-0">
        {resultData && resultData.map((item, index) => (
          <div key={index} className="relative">
            <img
              src={getImageSrc(item)}
              alt={`Image ${index}`}
              className={`w-full object-cover cursor-pointer box-border transform transition duration-500 group-hover:scale-105 rounded-md`}
              onClick={() => handleImageClick(item.frame)}
              onContextMenu={(event) => handleImageContextMenu(event, item.frame)}
            />
            <button className='absolute top-1 left-1 text-sm text-black bg-lime-300 rounded-md p-0.5 hover:bg-lime-400 border-2 border-black'>
              {index + 1}
            </button>
            {/* <button
              className='absolute bottom-1 right-1 text-xs text-white bg-lime-500 rounded-full hover:bg-lime-600'
              onClick={() => handlePlayVideo(item.frame)}
            >
              <PlayCircleRoundedIcon />
            </button> */}
          </div>
        ))}
      </div>
      {isModalOpen && ( <ImageModal /> )}
      {/* {clickedFrame && (
        <>
          <div className='flex flex-col bg-white rounded-t-lg rounded-r-lg'>
            <div className="flex justify-between p-2 items-center">
              <div className='flex flex-row gap-2 items-center'>
                <p className='text-base'>{clickedFrame.split('/')[1]}, {getFrameIndex(clickedFrame)}</p>
                <button onClick={handleOpenModal}>
                  <LaunchIcon className={`cursor-pointer rounded-sm text-black text-lg`} />
                </button>
              </div>
              <button
                onClick={handlePlayVideo}
                className="p-2 w-fit bg-lime-600 text-white rounded-full cursor-pointer hover:bg-lime-700 transition duration-300"
              >
                <PlayCircleRoundedIcon />
              </button>
              <div className='flex gap-4'>
                <button
                  onClick={handlePrev}
                  className="text-lime-600 hover:text-lime-700 cursor-pointer font-medium"
                >
                  <ArrowBackIosNewRoundedIcon />
                </button>
                <button
                  onClick={handleNext}
                  className="text-lime-600 hover:text-lime-700 cursor-pointer font-medium"
                >
                  <ArrowForwardIosRoundedIcon />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 p-4 bg-gray-900">
              {nearbyFrames.map((item, index) => {
                const imgSrc = `${clickedFrame.split('/')[0]}/${clickedFrame.split('/')[1]}/${(item.frameIdx).padStart(7, '0')}.jpg`;
                return (
                  <div key={index} className="relative">
                    <img
                      src={`${HOST_URL}frame/${imgSrc}`}
                      alt={`Nearby Frame ${index}`}
                      className={`w-full object-cover cursor-pointer box-border ${getFrameIndex(clickedFrame) == item.frameIdx ? 'outline outline-4 -outline-offset-4 outline-lime-600' : ''}`}
                      onClick={() => handleImageClick(imgSrc)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          {showVideo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
              <div ref={videoModalRef} className="rounded relative">
                <button onClick={handleCloseVideo} className="absolute top-2 right-2 text-xl text-white px-2.5 py-0.5 rounded-full bg-red-500">&times;</button>
                <Video path={clickedFrame.split('/')[1]} videoTime={videoTime} />
              </div>
            </div>
          )}
        </>
      )} */}
    </>
  )
};

export default Gallery;