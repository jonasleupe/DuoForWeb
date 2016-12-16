import React, {PropTypes} from 'react';

const Video = ({stream, muted, connected}) => {

  if (stream) stream = URL.createObjectURL(stream);
  {/* <video autoPlay src={stream} muted></video> */}

  return (
      <article className={`video ${connected}`}>

        {muted === `true` ? (
          <video autoPlay src={stream} muted></video>
        ) : (
          <video autoPlay src={stream}></video>
        )}
      </article>
  );

};

Video.propTypes = {
  stream: PropTypes.object,
  muted: PropTypes.string,
  connected: PropTypes.string
};

export default Video;
