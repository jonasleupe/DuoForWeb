import React, {PropTypes} from 'react';

const Video = ({stream}) => {

  if (stream) stream = URL.createObjectURL(stream);

  return (
    <article className='video'>
      {/* <video autoPlay src={stream}></video> */}
      <audio autoPlay src={stream}></audio>
    </article>
  );
};

Video.propTypes = {
  meta: PropTypes.string,
  stream: PropTypes.object
};

export default Video;
