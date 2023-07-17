import React, { useState } from 'react';

const BuildViewPort = (props) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleCloseClick = () => {
    setIsVisible(false);
    props.isVisible(false)
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '999',
    }}>
      <canvas style={{ width: '100%', height: '100%',background:'pink' }} />
      <button style={{ position: 'absolute', top: '0', right: '0' }} onClick={handleCloseClick}>Close</button>
    </div>
  );
}

export default BuildViewPort;
