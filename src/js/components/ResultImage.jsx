import React, {PropTypes} from 'react';

const ResultImage = ({link, alt, title}) => {

  return (
      <article className={`googleImage`}>
        <img src={link} alt={alt} title={title} />
      </article>
  );

};

ResultImage.propTypes = {
  link: PropTypes.string,
  alt: PropTypes.string,
  title: PropTypes.string
};

export default ResultImage;
