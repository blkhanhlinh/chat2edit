import React, { useState, useEffect, useCallback } from "react";
import { useResultData } from "@/context/provider";
import { MESSAGE_HOST } from "@/constants/api";

const MediaModal = React.memo(({ isOpen, onClose, src }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 bg-black/90 backdrop-blur-xl radix-state-open:animate-show pointer-events-auto">
            <div className="relative flex h-[100dvh] w-screen justify-stretch divide-x divide-white/10 focus:outline-none pointer-events-auto" tabIndex={-1}>
                <div className="flex flex-1 transition-[flex-basis] md:basis-[75vw]">
                    <div className="flex flex-1 flex-col md:p-6">
                        <div className="flex justify-between px-6 py-2 pt-6 text-white sm:mb-4 md:mt-2 md:px-0 md:py-2">
                            <button className="btn relative btn-small" aria-label="Download Image" download={`${src}.jpg`}>
                                <div className="flex w-full gap-2 items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929ZM5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z" fill="currentColor"></path>
                                    </svg>
                                </div>
                            </button>
                            <button aria-label="Close Modal" onClick={onClose}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.34315 6.34338L17.6569 17.6571M17.6569 6.34338L6.34315 17.6571" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
                            <div className="absolute grid h-full w-full grid-rows-2 select-none touch-pan-y transform-none" draggable="false">
                                {
                                    src.startsWith('data:image') && <img src={src} alt="Modal Content" className="row-span-4 mx-auto h-full object-scale-down" />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const LoadingPlaceholder = ({ text, progress }) => {
    return (
        <div className="flex-shrink-0 self-start cursor-pointer group relative">
            <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-lime-500 hover:bg-lime-400 transition ease-in-out duration-150 cursor-not-allowed" disabled="">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {text} {`${progress.toFixed(0)}%`}
            </button>
        </div>
    );
};

const Message = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalSrc, setModalSrc] = useState(null);

    const { resultData } = useResultData();

    const sendMessage = async () => {
        if (resultData.length === 0) {
            setShowWarning(true);
            return;
        }
        setShowWarning(false);
        setIsLoading(true);
        setMessage("");

        const messageId = messages.length;

        setMessages(prevMessages => [
            ...prevMessages,
            { id: messageId, text: message, media: null, isLoading: true, progress: 0 }
        ]);

        progressUpdate(messageId, 100, 5000);

        const requestData = {
            instruction: message,
            images: resultData
        };

        try {
            const response = await fetch(`${MESSAGE_HOST}process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            const data = await response.json();

            setMessages(prevMessages => prevMessages.map(msg => {
                if (msg.id === messageId) {
                    const newMedia = Array.isArray(data.result) ?
                        data.result.map(base64 => `data:image/jpeg;base64,${base64}`) :
                        [`data:video/mp4;base64,${data.result}`];
                    
                    return { ...msg, media: newMedia, isLoading: false, progress: 100 };
                }
                return msg;
            }))

            setMessage("");
        } catch (error) {
            console.error('Error fetching result:', error);
            setMessages(prevMessages => prevMessages.map(msg =>
                msg.id === messageId ? { ...msg, isLoading: false, progress: 0 } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const progressUpdate = (messageId, targetProgress, duration) => {
        const increment = targetProgress / (duration / 100);
        const updateProgress = () => {
            setMessages(prevMessages => prevMessages.map(msg => {
                if (msg.id === messageId) {
                    const updatedProgress = msg.progress + increment > targetProgress ? targetProgress : msg.progress + increment;
                    return { ...msg, progress: updatedProgress };
                }
                return msg;
            }));
        };
    
        let elapsed = 0;
        const interval = setInterval(() => {
            elapsed += 100;
            if (elapsed >= duration) {
                clearInterval(interval);
            }
            updateProgress();
        }, 500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const openModal = (mediaSrc) => {
        setModalSrc(mediaSrc);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalSrc(null);
    };

    const handleMediaLoad = (messageId, newMedia) => {
        setMessages(currentMessages => currentMessages.map(msg =>
            msg.id === messageId ? { ...msg, media: newMedia, isLoading: false, progress: 100 } : msg
        ));
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 p-3 overflow-auto items-end flex-col-reverse flex gap-4">
                {messages.slice().reverse().map((msg, index) => (
                    <div key={index} className="flex flex-col items-end gap-4 w-full">
                        <div className="bg-lime-100 text-lg p-2 rounded-lg max-w-xs md:max-w-md lg:max-w-xl flex-grow self-end">
                            {msg.text}
                        </div>
                        {msg.isLoading ? (
                            <LoadingPlaceholder text="Processing..." progress={msg.progress} />
                        ) : (
                            msg.media && msg.media.map((src, idx) => (
                                <div key={idx} className="flex-shrink-0 self-start cursor-pointer group relative" onClick={() => src.startsWith('data:image') ? openModal(src) : {}}>
                                    {src.startsWith('data:image') ? (
                                        <>
                                            <img src={src} alt={`Result ${idx + 1}`} className="w-full h-72 object-cover rounded-lg box-border transform transition duration-500" />
                                            <a href={src} download={`image-${idx + 1}.jpg`} className="absolute w-fit h-fit inset-0 opacity-0 group-hover:opacity-100">
                                                <button
                                                    className="text-white p-2 rounded-lg bg-black text-xs"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" clipRule="evenodd" d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929ZM5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z" fill="currentColor"></path>
                                                    </svg>
                                                </button>
                                            </a>
                                        </>
                                    ) : (
                                        <video controls className="lg:w-[32rem] w-auto h-auto object-cover rounded-lg shadow-lg">
                                            <source src={src} type="video/mp4" />
                                            Your browser does not support HTML video.
                                        </video>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ))}
                <MediaModal isOpen={showModal} onClose={closeModal} src={modalSrc} />
            </div>
            <div className="relative flex items-center px-2 pb-6 pt-2">
                {showWarning && (
                    <div className="text-red-500 p-2 absolute top-0 text-xs">
                        Warning: No result data available.
                    </div>
                )}
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow p-4 text-gray-700 bg-white border-2 border-black rounded-xl shadow-sm focus:outline-lime-600"
                    placeholder="Add your instruction here.."
                    onKeyPress={handleKeyPress}
                />
                <div className="relative inset-y-0 right-0 px-2 flex items-center">
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || resultData.length === 0}
                        className={`p-2 focus:outline-none transition ease-in-out duration-300 rounded-full bg-lime-50`}
                    >
                        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`stroke-lime-600 hover:stroke-lime-800 ${(isLoading || resultData.length === 0) && 'cursor-not-allowed stroke-slate-300 hover:stroke-slate-300'}`}>
                            <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Message;