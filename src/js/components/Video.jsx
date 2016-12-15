import React, {PropTypes} from 'react';

const Video = ({stream, muted}) => {

  if (stream) stream = URL.createObjectURL(stream);

  return (
    <article className='video'>
      <video autoPlay src={stream}></video>
      <audio autoPlay src={stream} muted={muted}></audio>
    </article>
  );
};

Video.propTypes = {
  stream: PropTypes.object,
  muted: PropTypes.string
};

export default Video;
