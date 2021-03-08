import React, { useEffect } from 'react';
import './Comments.css';

import Popup from '../Popup';
import Loader from '../Loader';

function Comments(props) {
  const { commentsActive, setCommentsActive, setFocus } = props;
  const handleClose = () => {
    setCommentsActive(!commentsActive);
    setFocus.current.focus();
  };

  useEffect(() => {
    const init = () => {
      const js = window.document.createElement('script');
      js.id = 'facebook-jssdk';
      js.async = true;
      js.defer = true;
      js.crossOrigin = 'anonymous';
      js.src =
        'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v10.0&appId=1825083474401640';
      window.document.body.appendChild(js);
    };
    init();
  }, []);

  return (
    <Popup
      closeLabel={'Close discussion'}
      handleClose={handleClose}
      isActive={commentsActive}
    >
      <div className="Comments">
        <div className="Comments__loader">
          <Loader inverse={true} />
        </div>
        <div className="Comments__content">
          <div id="fb-root"></div>
          <div className="fb-wrapper" id="fb-main">
            <div
              className="fb-comments"
              data-href="http://www.pksubbantracker.com/"
              data-width="100%"
              data-numposts="8"
              data-order-by="reverse_time"
            ></div>
          </div>
        </div>
      </div>
    </Popup>
  );
}

export default Comments;
