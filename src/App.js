import React, { useState, useEffect, createRef } from 'react';
import './App.css';

import { SEASONS, LATEST_SEASON_ID } from './common/data';
import { usePrevious, getUpdateType } from './common/utilities';
import { useHistory, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';

import Stats from './components/Stats';
import Comments from './components/Comments';
import Select from './components/Select';

/* Google Analytics */
const trackingId = 'UA-86116525-1'; // tracking ID
ReactGA.initialize(trackingId);
const history = createBrowserHistory();
history.listen((location) => {
  ReactGA.set({ page: location.pathname }); // Update the user's current page
  ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

function App() {
  const [seasons, setSeasons] = useState(SEASONS);
  const [seasonId, setSeasonId] = useState();
  const [commentsActive, setCommentsActive] = useState();

  const buttonComments = createRef();

  const handleChange = (evt) => {
    setSeasonId(evt.currentTarget.value);
  };

  const handleClick = () => {
    setCommentsActive(!commentsActive);
  };

  const handleError = () => {
    const updatedSeasons = SEASONS.filter((season) => {
      return season.id !== LATEST_SEASON_ID;
    });
    setSeasons(updatedSeasons);
    setSeasonId(updatedSeasons[0]?.id);
  };

  const history = useHistory();
  const location = useLocation();
  const paramsPrevious = usePrevious(new URLSearchParams(location.search));
  const seasonIdPrevious = usePrevious(seasonId);
  const commentsActivePrevious = usePrevious(commentsActive);

  useEffect(() => {
    /* Sync seasonId with param */
    const params = new URLSearchParams(history.location.search);
    const paramCurrent = params.get('season')
      ? params.get('season')
      : LATEST_SEASON_ID;
    const paramPrevious =
      typeof paramsPrevious === 'undefined'
        ? null
        : paramsPrevious.get('season')
        ? paramsPrevious.get('season')
        : LATEST_SEASON_ID;
    const stateCurrent = seasonId;
    const statePrevious =
      typeof seasonIdPrevious === 'undefined' ? seasonId : seasonIdPrevious;
    const type = getUpdateType(
      paramPrevious,
      paramCurrent,
      statePrevious,
      stateCurrent
    );

    if (type === 'state') {
      setSeasonId(paramCurrent);
    } else if (type === 'param') {
      if (stateCurrent === LATEST_SEASON_ID) {
        params.delete('season');
      } else {
        params.set('season', stateCurrent);
      }
      history.replace({ search: params.toString() });
    }
  }, [paramsPrevious, history, seasonId, seasonIdPrevious]);

  useEffect(() => {
    /* Sync commentsActive with param */
    const params = new URLSearchParams(history.location.search);
    const paramCurrent = params.get('comments') === 'true';
    const paramPrevious = paramsPrevious
      ? paramsPrevious.get('comments') === 'true'
      : !paramCurrent;
    const stateCurrent = commentsActive;
    const statePrevious =
      typeof commentsActivePrevious === 'undefined'
        ? stateCurrent
        : commentsActivePrevious;
    const type = getUpdateType(
      paramPrevious,
      paramCurrent,
      statePrevious,
      stateCurrent
    );
    if (type === 'state') {
      setCommentsActive(paramCurrent);
    } else if (type === 'param') {
      if (stateCurrent) {
        params.set('comments', true);
        history.push({ search: params.toString() });
      } else {
        params.delete('comments');
        history.replace({ search: params.toString() });
      }
    }
  }, [paramsPrevious, history, commentsActive, commentsActivePrevious]);

  return (
    <div className="App">
      <main className="App__main">
        <Stats seasonId={seasonId} handleError={handleError} />
      </main>

      <div className="App__actions">
        <Select onChange={handleChange} value={seasonId} id="SeasonId">
          {seasons.map((season) => {
            return (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            );
          })}
        </Select>
        <label className="visually-hidden" htmlFor="SeasonId">
          Select season
        </label>
        <button
          aria-label="Open discussion"
          onClick={handleClick}
          ref={buttonComments}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.8rem"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M22 3v13h-11.643l-4.357 3.105v-3.105h-4v-13h20zm2-2h-24v16.981h4v5.019l7-5.019h13v-16.981zm-5 6h-14v-1h14v1zm0 2h-14v1h14v-1zm-6 3h-8v1h8v-1z" />
          </svg>
          <span aria-hidden="true">Discussion</span>
        </button>
      </div>
      <Comments
        commentsActive={commentsActive}
        setCommentsActive={setCommentsActive}
        setFocus={buttonComments}
      />
    </div>
  );
}

export default App;
