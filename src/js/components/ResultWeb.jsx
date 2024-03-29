import React, {PropTypes} from 'react';

const ResultWeb = ({link, name}) => {

  return (
      <a className='googleLink' href={link} target='_blank'>{name}</a>
  );

};

ResultWeb.propTypes = {
  link: PropTypes.string,
  name: PropTypes.string
};

export default ResultWeb;
