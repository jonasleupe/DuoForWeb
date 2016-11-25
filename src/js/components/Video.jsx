import React, {PropTypes} from 'react';

const Video = ({meta, stream}) => {

  if (stream) stream = URL.createObjectURL(stream);

  return (
    <article className='video'>
      <div className='meta'>{meta}</div>
      <video autoPlay src={stream}></video>
    </article>
  );
};

Video.propTypes = {
  meta: PropTypes.string,
  stream: PropTypes.object
};

export default Video;
