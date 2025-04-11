import { RiSettings4Fill, RiQuestionLine } from "react-icons/ri";
import { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

type NavbarProps = {
    triggerSidebar: () => void
}

const Navbar = ({triggerSidebar}: NavbarProps) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <nav className="flex items-center justify-between mx-8 mt-6">
      <div className="flex items-center gap-2">
        <img src="logo.svg" alt="logo" width={28} className="mr-[-5px] mt-1"/>
        <h1 className="text-2xl font-semibold ml-2">ImageSearch</h1>
        <p className="text-zinc-400 text-sm">Beta</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        <RiQuestionLine 
          className="text-zinc-400 text-md text-3xl cursor-pointer hover:brightness-110" 
          onClick={openModal}
        />
        <RiSettings4Fill 
            className="text-zinc-400 text-md text-3xl cursor-pointer hover:brightness-110" 
            onClick={triggerSidebar}
        />
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="App Information"
        className="bg-zinc-800 w-[500px] max-w-[90%] rounded-md shadow-[0_5px_50px_rgba(0,0,0,0.25)] border border-zinc-700 p-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        overlayClassName="fixed inset-0 bg-black/20 z-50 flex justify-center items-center"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="logo.svg" alt="logo" width={24} className="mr-[-5px]"/>
              <h2 className="text-xl font-semibold text-zinc-200">ImageSearch</h2>
              <p className="text-zinc-400 text-xs">Beta</p>
            </div>
            <button 
              className="text-zinc-400 hover:text-zinc-200"
              onClick={closeModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="text-zinc-300 space-y-3">
            <h3 className="text-lg font-medium text-zinc-200">About ImageSearch</h3>
            <p>ImageSearch is a powerful visual search tool that helps you find similar images in your local library.</p>
            
            <h3 className="text-lg font-medium text-zinc-200 mt-4">How to use</h3>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Click the settings icon to configure your image folder</li>
              <li>Index your images to create searchable database</li>
              <li>Drop or upload an image to find similar matches</li>
              <li>Browse through results sorted by similarity</li>
            </ul>
            
            <p className="text-zinc-400 text-sm mt-4">For more information or support, visit our documentation or contact support.</p>
          </div>
        </div>
      </Modal>
    </nav>
  )
}

export default Navbar