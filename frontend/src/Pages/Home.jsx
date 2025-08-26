import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MessageContainer from '../components/MessageContainer';
import userConversation from '../Zustans/useConversation';

const Home = () => {

  const { selectedConversation, setSelectedConversation } = userConversation();
  const [isSidebarVisible , setIsSidebarVisible]= useState(true);

const handelUserSelect = (user) => {
  setSelectedConversation(user);
  if (window.innerWidth < 768) {   // sirf mobile me sidebar hide karo
    setIsSidebarVisible(false);
  }
};
  const handelShowSidebar=()=>{
    setSelectedConversation(null);
    setIsSidebarVisible(true);
  }
  return (

    <div className='flex justify-between min-w-full
     md:min-w-[550px] md:max-w-[65%]
      px-2 h-[95%] md:h-full  
      rounded-xl shadow-lg
       bg-gray-400 bg-clip-padding
        backdrop-filter backdrop-blur-lg 
        bg-opacity-0'
        >
      <div className={`w-full py-2 md:flex ${isSidebarVisible ? '' : 'hidden'}`}>
      <Sidebar onSelectUser={handelUserSelect}/>
      </div>
      <div className={`divider divider-horizontal px-1 md:flex
         ${isSidebarVisible ? '' : 'hidden'} ${selectedConversation ? 'block' : 'hidden'}`}></div>
      <div className={`flex-auto ${selectedConversation ? '' : 'hidden md:flex'}`}>
      <MessageContainer onBackUser={handelShowSidebar}/>
      </div>
    </div>
  );
};

export default Home;