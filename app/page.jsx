"use client"

import React from 'react';
import Sidebar from "@/components/Sidebar";
import { ResultDataProvider } from '@/context/provider';
import Logos from './Logos';
import Message from '@/components/Message';

export default function Home() {
  return (
    <ResultDataProvider>
      <div className='h-screen grid grid-cols-5'>
        <div className='h-screen sticky top-0 col-span-2 flex flex-col pt-2 px-2 z-50'>
          <div className='overflow-auto flex-grow pb-4'>
            <Sidebar />
          </div>
        </div>
        <div className='col-span-3 mt-auto p-2'>
          <Message />
        </div>
      </div>
    </ResultDataProvider>
  );
}
