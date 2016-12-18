import React, {PropTypes} from 'react';

const ResultVideo = ({stream, muted, connected}) => {

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

ResultVideo.propTypes = {
  stream: PropTypes.object,
  muted: PropTypes.string,
  connected: PropTypes.string
};

export default ResultVideo;
