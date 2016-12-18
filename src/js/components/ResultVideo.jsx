import React, {PropTypes} from 'react';

const ResultVideo = ({contentUrl}) => {

  return (
    <article className={`googleImage`}>
      <video src={`${contentUrl}&html5=True`} width='640' height='360' type='video/youtube' className='youtube' controls='controls' ></video>
    </article>
  );

};

ResultVideo.propTypes = {
  contentUrl: PropTypes.string,
  name: PropTypes.string
};

export default ResultVideo;
