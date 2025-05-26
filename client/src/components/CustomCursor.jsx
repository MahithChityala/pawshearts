import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Pets as PetsIcon } from '@mui/icons-material';

// Remove trail constants
// const trailLength = 15; 
// const trailColors = ['#FF6B6B', '#FF8E53', '#FFC107', '#4ECDC4', '#45B7D1']; 

const Cursor = () => {
  const theme = useTheme();
  const cursorRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false); // Keep hovering state for potential future use or subtle effect
  // Remove cursorText state: const [cursorText, setCursorText] = useState(null);
   
  const springConfig = { damping: 20, stiffness: 300 };

  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Remove explicit spring declarations for trail elements
  // const springConfig = { damping: 30, stiffness: 200 };
  // ... explicit useSpring declarations for trailX0-14 and trailY0-14 ...
  // Remove trailXSprings and trailYSprings arrays

   useEffect(() => {
    // Set initial position off-screen to prevent a flash at (0,0)
    mouseX.set(-100);
    mouseY.set(-100);

     const handleMouseMove = (e) => {
       mouseX.set(e.clientX);
       mouseY.set(e.clientY);
     };

     // Simplified hover detection (optional, can be removed if no hover effect is needed)
     const handleMouseOver = (e) => {
       const target = e.target;
       const interactive = 
         target.tagName === 'BUTTON' || 
         target.tagName === 'A' || 
         target.tagName === 'INPUT' ||
         target.tagName === 'TEXTAREA' ||
         target.getAttribute('role') === 'button' ||
         target.getAttribute('role') === 'link' ||
         target.classList.contains('MuiButtonBase-root') ||
         target.classList.contains('MuiButton-root');

       setIsHovering(interactive);
       // Remove setCursorText(null); // No cursor text
     };

     const handleMouseOut = () => {
       setIsHovering(false);
       // Remove setCursorText(null); // No cursor text
     };

     // Add event listeners
     window.addEventListener('mousemove', handleMouseMove);
     document.addEventListener('mouseover', handleMouseOver);
     document.addEventListener('mouseout', handleMouseOut);

     // Cleanup
     return () => {
       window.removeEventListener('mousemove', handleMouseMove);
       document.removeEventListener('mouseover', handleMouseOver);
       document.removeEventListener('mouseout', handleMouseOut);
     };
   }, [mouseX, mouseY]); // Dependencies are the cursor position springs

  // Remove trail position update effect
  // useEffect(() => { ... }, [mouseX, mouseY]);

   return (
     <>
       {/* Regular cursor */}
       <motion.div
         ref={cursorRef}
         style={{
           position: 'fixed',
           left: cursorX,
           top: cursorY,
           translateX: '-50%',
           translateY: '-50%',
           width: '20px', // Medium size
           height: '20px', // Medium size
           backgroundColor: '#ff7a00', // Orange color
           borderRadius: '50%', // Make it a ball
           pointerEvents: 'none', // Ensure it doesn't interfere with clicks
           zIndex: 9999, // Ensure it's on top
           opacity: isHovering ? 0 : 1,
           transition: 'opacity 0.2s ease',
         }}
       />
       
       {/* Paw cursor */}
       <motion.div
         style={{
           position: 'fixed',
           left: cursorX,
           top: cursorY,
           translateX: '-50%',
           translateY: '-50%',
           pointerEvents: 'none',
           zIndex: 9999,
           opacity: isHovering ? 1 : 0,
           transition: 'opacity 0.2s ease',
         }}
       >
         <PetsIcon 
           sx={{ 
             fontSize: '28px',
             color: '#ff7a00',
             filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
           }} 
         />
       </motion.div>
     </>
   );
};

export default Cursor; 